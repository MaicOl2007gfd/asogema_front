import { ref, onMounted, onUnmounted } from 'vue'
import api from './useApi.js'
import { io } from 'socket.io-client'
import { WS_URL } from '../config.js'

/**
 * useComanda.js — Comanda del restaurante (Mesero / Comanda)
 * --------------------------------------------------------------
 * Gestiona los pedidos de la comanda: listado vía GraphQL, cambio de
 * estado (RECIBIDO → LISTO → ENTREGADO) y la notificación en tiempo
 * real por WebSocket.
 *
 * Estrategia de actualización (profesional):
 *  - WebSocket: push inmediato (tiempo real).
 *  - Polling de respaldo: cada POLL_INTERVAL_MS refresca los pedidos en
 *    silencio. Garantiza que, aunque el socket caiga o el evento se pierda,
 *    la vista se mantenga al día sin depender de recargar la página.
 */
const POLL_INTERVAL_MS = 3000

export function useComanda() {
  const pedidos = ref([])
  const loading = ref(false)
  const error = ref('')
  const listaCount = ref(0)
  const socketConnected = ref(false)
  let socket = null
  let pollTimer = null

  /** Lista los pedidos según el rol (GraphQL).
   *  `silent = true` evita el spinner (usado por el polling de respaldo). */
  async function listarPedidos(silent = false) {
    if (!silent) loading.value = true
    if (silent) error.value = ''
    try {
      const { data } = await api.post('/graphql', {
        query: `{ pedidosComanda { id estado tipo incluye_mesa total mesero created_at items { nombre imagen cantidad precio_unitario } } }`,
      })
      pedidos.value = data.data?.pedidosComanda || []
      listaCount.value = pedidos.value.filter((p) => p.estado === 'LISTO').length
    } catch {
      if (!silent) error.value = 'No se pudieron cargar los pedidos'
    } finally {
      if (!silent) loading.value = false
    }
  }

  /** Avanza un pedido a un estado válido de la secuencia. */
  async function cambiarEstado(pedidoId, estado) {
    error.value = ''
    try {
      await api.patch(`/restaurant/pedidos/${pedidoId}/estado`, { estado })
      await listarPedidos(true)
    } catch {
      error.value = 'No se pudo actualizar el estado del pedido'
    }
  }

  /** Conecta el socket. Ambos roles se unen a la sala comanda (refresco global);
   *  el mesero además se une a su sala mesero:<id> para la notificación dirigida. */
  function conectarSocket(rol, meseroId) {
    if (socket) return
    socket = io(`${WS_URL}/comanda`, { transports: ['websocket'] })
    socket.on('connect', () => {
      socketConnected.value = true
      socket.emit('unirse_comanda')
      if ((rol === 'Mesero' || rol === 'Empleado') && meseroId) {
        socket.emit('unirse_mesero', { mesero_id: meseroId })
      }
    })
    socket.on('pedido_listo', () => {
      listarPedidos(true)
    })
    socket.on('pedidos_actualizados', () => {
      listarPedidos(true)
    })
    socket.on('disconnect', () => {
      socketConnected.value = false
    })
    socket.on('connect_error', () => {
      socketConnected.value = false
    })
  }

  function desconectarSocket() {
    if (socket) {
      socket.disconnect()
      socket = null
      socketConnected.value = false
    }
  }

  /** Inicia el socket + el polling de respaldo. */
  function iniciarComanda(rol, meseroId) {
    listarPedidos()
    conectarSocket(rol, meseroId)
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = setInterval(() => {
      listarPedidos(true)
    }, POLL_INTERVAL_MS)
  }

  onMounted(() => listarPedidos())
  onUnmounted(() => {
    desconectarSocket()
    if (pollTimer) clearInterval(pollTimer)
  })

  return {
    pedidos,
    loading,
    error,
    listaCount,
    socketConnected,
    listarPedidos,
    cambiarEstado,
    conectarSocket,
    desconectarSocket,
    iniciarComanda,
  }
}
