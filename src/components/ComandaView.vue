<script setup>
/**
 * ComandaView.vue — Comanda del restaurante (Mesero / Comanda)
 * --------------------------------------------------------------
 * Vista exclusiva para los roles Mesero y Comanda.
 * - Mesero: crea pedidos, ve y entrega los suyos, historial del día.
 * - Comanda: ve los pedidos por atender y los marca como LISTO.
 * Sin navegación a secciones de cliente (solo su trabajo).
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useComanda } from '../composables/useComanda.js'
import { useRestaurant } from '../composables/useRestaurant.js'

const emit = defineEmits(['navigate'])
const { user, logout } = useAuth()
const { pedidos, loading, error, iniciarComanda, listarPedidos, cambiarEstado } = useComanda()
const {
  menuItems, menuLoading, loadMenu,
  formatPrice,
} = useRestaurant(emit)

const showNewOrder = ref(false)
const carrito = ref([])
const ordenando = ref(false)
const ordenError = ref('')
const now = ref(Date.now())
const historialAbierto = ref(false)

const esMesero = computed(() => user.value?.rol_nombre === 'Mesero')
const esComanda = computed(() => user.value?.rol_nombre === 'Comanda')
const meseroId = computed(() => Number(user.value?.id) || null)

// Secciones por rol
const ordenarFifo = (lista) =>
  [...lista].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

const esDeHoy = (createdAt) =>
  new Date(createdAt).toDateString() === new Date().toDateString()

const meseroActivos = computed(() =>
  ordenarFifo(pedidos.value.filter((p) => p.estado === 'RECIBIDO' || p.estado === 'LISTO')),
)
const tieneActivosMesero = computed(() => meseroActivos.value.length > 0)
const meseroEntregadosHoy = computed(() =>
  ordenarFifo(pedidos.value.filter((p) => p.estado === 'ENTREGADO' && esDeHoy(p.created_at))),
)

const seccionPorAtender = computed(() =>
  ordenarFifo(pedidos.value.filter((p) => p.estado === 'RECIBIDO')),
)
const seccionListos = computed(() =>
  ordenarFifo(pedidos.value.filter((p) => p.estado === 'LISTO')),
)
const seccionEntregadosHoy = computed(() =>
  ordenarFifo(pedidos.value.filter((p) => p.estado === 'ENTREGADO' && esDeHoy(p.created_at))),
)

const totalEntregadosHoy = computed(() =>
  esMesero.value ? meseroEntregadosHoy.value.length : seccionEntregadosHoy.value.length,
)

// --- Helpers visuales ---
function getUserInitials() {
  if (!user.value) return '?'
  return user.value.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function estadoLabel(estado) {
  return (
    {
      RECIBIDO: 'Recibido',
      LISTO: 'Listo',
      ENTREGADO: 'Entregado',
    }[estado] || estado
  )
}

function estadoClass(estado) {
  return estado === 'LISTO' ? 'ok' : estado === 'ENTREGADO' ? 'entregado' : 'pend'
}

function tipoLabel(tipo) {
  return tipo === 'EN_MESA' ? 'En Mesa' : 'Para Llevar'
}

function horaPedido(createdAt) {
  return new Date(createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function tiempoEspera(createdAt) {
  void now.value
  const minutos = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (minutos < 1) return 'recién'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  return `hace ${horas} h ${minutos % 60} min`
}

function urgenciaClass(pedido) {
  void now.value
  if (pedido.estado !== 'RECIBIDO') return ''
  const minutos = (Date.now() - new Date(pedido.created_at).getTime()) / 60000
  if (minutos > 10) return 'urgente'
  if (minutos > 5) return 'atencion'
  return ''
}

function itemImagen(item) {
  return (
    item.imagen ||
    `https://picsum.photos/seed/${encodeURIComponent(item.nombre)}/120/120`
  )
}

// --- Acciones ---
function handleLogout() {
  logout()
  emit('navigate', 'index')
}

function abrirNuevoPedido() {
  carrito.value = []
  ordenError.value = ''
  showNewOrder.value = true
  if (menuItems.value.length === 0) loadMenu()
}

function cerrarNuevoPedido() {
  showNewOrder.value = false
  carrito.value = []
}

function agregarAlCarrito(item) {
  const existente = carrito.value.find((c) => c.producto_id === item.id)
  if (existente) {
    existente.cantidad += 1
  } else {
    carrito.value.push({
      producto_id: item.id,
      nombre: item.name,
      precio: Number(String(item.price).replace(/[^\d]/g, '')),
      imagen: item.image,
      cantidad: 1,
    })
  }
}

function quitarDelCarrito(index) {
  carrito.value.splice(index, 1)
}

function cambiarCantidad(index, delta) {
  const item = carrito.value[index]
  item.cantidad = Math.max(1, item.cantidad + delta)
}

const carritoTotal = computed(() =>
  carrito.value.reduce((acc, c) => acc + Number(c.precio) * c.cantidad, 0),
)

async function crearPedido() {
  if (carrito.value.length === 0) return
  ordenando.value = true
  ordenError.value = ''
  try {
    const api = (await import('../composables/useApi.js')).default
    await api.post('/restaurant/orders', {
      items: carrito.value.map((c) => ({ producto_id: c.producto_id, cantidad: c.cantidad })),
      tipo: 'PARA_LLEVAR',
    })
    cerrarNuevoPedido()
    await listarPedidos(true)
  } catch {
    ordenError.value = 'No se pudo crear el pedido'
  } finally {
    ordenando.value = false
  }
}

function marcarListo(pedido) {
  cambiarEstado(pedido.id, 'LISTO')
}

function marcarEntregado(pedido) {
  cambiarEstado(pedido.id, 'ENTREGADO')
}

let clockTimer = null

onMounted(() => {
  iniciarComanda(user.value?.rol_nombre, meseroId.value)
  clockTimer = setInterval(() => {
    now.value = Date.now()
  }, 30000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<template>
  <div class="cda-page">
    <!-- Header solo con lo del rol (sin links de cliente) -->
    <header class="cda-header">
      <div class="cda-header-inner">
        <div class="cda-brand">
          <img src="/imagenes/Logo.png" alt="Asogema" class="cda-logo" />
          <div class="cda-brand-text">
            <span class="cda-brand-name">Asogema</span>
            <span class="cda-brand-sub">{{ esComanda ? 'Comanda · Cocina' : 'Comanda · Mesero' }}</span>
          </div>
        </div>
        <div class="cda-user">
          <div class="cda-user-avatar">{{ getUserInitials() }}</div>
          <div class="cda-user-info">
            <span class="cda-user-name">{{ user?.name }}</span>
            <span class="cda-user-role">{{ esComanda ? 'Comanda' : 'Mesero' }}</span>
          </div>
          <button class="cda-logout" @click="handleLogout" title="Cerrar sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="cda-main">
      <div class="cda-container">
        <div v-if="error" class="cda-alert">{{ error }}</div>

        <div v-if="loading" class="cda-loading">
          <div class="cda-spinner"></div>
          <p>Cargando pedidos...</p>
        </div>

        <!-- ══════════ MESERO ══════════ -->
        <template v-else-if="esMesero">
          <div class="cda-toolbar">
            <h1 class="cda-title">Mis Pedidos</h1>
            <span class="cda-count">{{ meseroActivos.length }}</span>
          </div>

          <div v-if="!tieneActivosMesero" class="cda-empty">
            <p>No tienes pedidos activos.</p>
            <button class="cda-btn cda-btn--primary" @click="abrirNuevoPedido">+ Nuevo Pedido</button>
          </div>

          <div v-else class="cda-grid">
            <article
              v-for="pedido in meseroActivos"
              :key="pedido.id"
              class="cda-card"
              :class="{ 'cda-card--listo': pedido.estado === 'LISTO' }"
            >
              <header class="cda-card-head">
                <div class="cda-card-id">
                  <span class="cda-numero">#{{ pedido.id }}</span>
                  <span class="cda-badge" :class="estadoClass(pedido.estado)">{{ estadoLabel(pedido.estado) }}</span>
                  <span class="cda-tipo">{{ tipoLabel(pedido.tipo) }}</span>
                </div>
                <span class="cda-wait">{{ tiempoEspera(pedido.created_at) }}</span>
              </header>

              <ul class="cda-items">
                <li v-for="(item, i) in pedido.items" :key="i" class="cda-item">
                  <img :src="itemImagen(item)" :alt="item.nombre" class="cda-item-img" loading="lazy" />
                  <div class="cda-item-body">
                    <span class="cda-item-name">{{ item.nombre }}</span>
                    <span class="cda-item-price">{{ formatPrice(item.precio_unitario) }}</span>
                  </div>
                  <span class="cda-item-qty">×{{ item.cantidad }}</span>
                </li>
              </ul>

              <footer class="cda-card-foot">
                <strong class="cda-total">Total: {{ formatPrice(pedido.total) }}</strong>
                <button
                  v-if="pedido.estado === 'LISTO'"
                  type="button"
                  class="cda-btn cda-btn--entregar"
                  @click="marcarEntregado(pedido)"
                >
                  Entregar
                </button>
                <span v-else class="cda-en-cocina">En preparación…</span>
              </footer>
            </article>
          </div>

          <!-- Historial mesero -->
          <section class="cda-history">
            <header class="cda-history-head" @click="historialAbierto = !historialAbierto">
              <div class="cda-history-title">
                <h2>Historial del día</h2>
                <span class="cda-count">{{ totalEntregadosHoy }}</span>
              </div>
              <span class="cda-history-toggle" :class="{ open: historialAbierto }">▾</span>
            </header>
            <div v-if="historialAbierto" class="cda-history-body">
              <p v-if="meseroEntregadosHoy.length === 0" class="cda-history-empty">
                Aún no hay pedidos entregados hoy.
              </p>
              <div v-else class="cda-list">
                <article v-for="pedido in meseroEntregadosHoy" :key="pedido.id" class="cda-row">
                  <span class="cda-row-num">#{{ pedido.id }}</span>
                  <span class="cda-row-tipo">{{ tipoLabel(pedido.tipo) }}</span>
                  <span class="cda-row-time">{{ horaPedido(pedido.created_at) }}</span>
                  <span class="cda-row-total">{{ formatPrice(pedido.total) }}</span>
                </article>
              </div>
            </div>
          </section>
        </template>

        <!-- ══════════ COMANDA ══════════ -->
        <template v-else-if="esComanda">
          <!-- Por Atender -->
          <div class="cda-toolbar">
            <h1 class="cda-title">Por Atender</h1>
            <span class="cda-count">{{ seccionPorAtender.length }}</span>
          </div>

          <div v-if="seccionPorAtender.length === 0" class="cda-empty">
            <p>No hay pedidos por atender.</p>
          </div>

          <div v-else class="cda-grid">
            <article
              v-for="(pedido, idx) in seccionPorAtender"
              :key="pedido.id"
              class="cda-card"
              :class="urgenciaClass(pedido)"
            >
              <span v-if="idx === 0" class="cda-next">◀ Siguiente</span>
              <header class="cda-card-head">
                <div class="cda-card-id">
                  <span class="cda-numero">#{{ pedido.id }}</span>
                  <span class="cda-badge" :class="estadoClass(pedido.estado)">{{ estadoLabel(pedido.estado) }}</span>
                  <span class="cda-tipo">{{ tipoLabel(pedido.tipo) }}</span>
                </div>
                <span class="cda-mesero">{{ pedido.mesero }}</span>
              </header>

              <ul class="cda-items">
                <li v-for="(item, i) in pedido.items" :key="i" class="cda-item">
                  <img :src="itemImagen(item)" :alt="item.nombre" class="cda-item-img" loading="lazy" />
                  <div class="cda-item-body">
                    <span class="cda-item-name">{{ item.nombre }}</span>
                  </div>
                  <span class="cda-item-qty">×{{ item.cantidad }}</span>
                </li>
              </ul>

              <footer class="cda-card-foot">
                <span class="cda-wait">{{ tiempoEspera(pedido.created_at) }}</span>
                <strong class="cda-total">Total: {{ formatPrice(pedido.total) }}</strong>
                <button type="button" class="cda-btn cda-btn--listo" @click="marcarListo(pedido)">
                  Marcar Listo
                </button>
              </footer>
            </article>
          </div>

          <!-- Listos (comanda los ve, no los entrega) -->
          <div v-if="seccionListos.length > 0" class="cda-block">
            <div class="cda-toolbar">
              <h1 class="cda-title cda-title--sm">Listos para Entregar</h1>
              <span class="cda-count">{{ seccionListos.length }}</span>
            </div>
            <div class="cda-list">
              <article v-for="pedido in seccionListos" :key="pedido.id" class="cda-row">
                <span class="cda-row-num">#{{ pedido.id }}</span>
                <span class="cda-row-tipo">{{ tipoLabel(pedido.tipo) }}</span>
                <span class="cda-row-time">{{ horaPedido(pedido.created_at) }}</span>
              </article>
            </div>
          </div>

          <!-- Historial comanda -->
          <section class="cda-history">
            <header class="cda-history-head" @click="historialAbierto = !historialAbierto">
              <div class="cda-history-title">
                <h2>Historial del día</h2>
                <span class="cda-count">{{ totalEntregadosHoy }}</span>
              </div>
              <span class="cda-history-toggle" :class="{ open: historialAbierto }">▾</span>
            </header>
            <div v-if="historialAbierto" class="cda-history-body">
              <p v-if="seccionEntregadosHoy.length === 0" class="cda-history-empty">
                Aún no hay pedidos entregados hoy.
              </p>
              <div v-else class="cda-list">
                <article v-for="pedido in seccionEntregadosHoy" :key="pedido.id" class="cda-row">
                  <span class="cda-row-num">#{{ pedido.id }}</span>
                  <span class="cda-row-tipo">{{ tipoLabel(pedido.tipo) }}</span>
                  <span class="cda-row-mesero">{{ pedido.mesero }}</span>
                  <span class="cda-row-time">{{ horaPedido(pedido.created_at) }}</span>
                </article>
              </div>
            </div>
          </section>
        </template>
      </div>
    </main>

    <!-- FAB nuevo pedido (mesero) -->
    <button v-if="esMesero" type="button" class="cda-fab" @click="abrirNuevoPedido" title="Nuevo pedido">
      <span class="cda-fab-icon">+</span>
    </button>

    <!-- Modal: Nuevo Pedido -->
    <div v-if="showNewOrder" class="cda-modal">
      <div class="cda-modal-card">
        <header class="cda-modal-head">
          <h2>Nuevo Pedido</h2>
          <button type="button" class="cda-modal-close" @click="cerrarNuevoPedido">×</button>
        </header>

        <div class="cda-modal-body">
          <p v-if="ordenError" class="cda-alert">{{ ordenError }}</p>

          <div v-if="menuLoading" class="cda-loading">
            <div class="cda-spinner"></div>
            <p>Cargando menú...</p>
          </div>

          <div v-else class="cda-menu">
            <button
              v-for="item in menuItems"
              :key="item.id"
              type="button"
              class="cda-menu-item"
              @click="agregarAlCarrito(item)"
            >
              <img :src="item.image" :alt="item.name" class="cda-menu-img" loading="lazy" />
              <div class="cda-menu-body">
                <span class="cda-menu-name">{{ item.name }}</span>
                <span class="cda-menu-price">{{ item.price }}</span>
              </div>
              <span class="cda-menu-add">+</span>
            </button>
          </div>
        </div>

        <footer v-if="carrito.length > 0" class="cda-modal-foot">
          <div class="cda-cart">
            <div v-for="(c, i) in carrito" :key="c.producto_id" class="cda-cart-item">
              <img :src="c.imagen" :alt="c.nombre" class="cda-cart-img" />
              <span class="cda-cart-name">{{ c.nombre }}</span>
              <div class="cda-cart-ctrl">
                <button type="button" @click="cambiarCantidad(i, -1)">−</button>
                <span>{{ c.cantidad }}</span>
                <button type="button" @click="cambiarCantidad(i, 1)">+</button>
              </div>
              <span class="cda-cart-price">{{ formatPrice(c.precio * c.cantidad) }}</span>
              <button type="button" class="cda-cart-remove" @click="quitarDelCarrito(i)">×</button>
            </div>
          </div>
          <div class="cda-modal-total">
            <strong>Total: {{ formatPrice(carritoTotal) }}</strong>
            <button
              type="button"
              class="cda-btn cda-btn--primary"
              :disabled="ordenando"
              @click="crearPedido"
            >
              {{ ordenando ? 'Creando...' : 'Crear Pedido' }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<style>
@import url('../PanelEmpleado.css');
@import url('../Comanda.css');
</style>
