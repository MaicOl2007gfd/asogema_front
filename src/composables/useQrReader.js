import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { usePaymentApi } from './usePaymentApi.js'
import { formatCop, getErrorMessage, estadoLabel } from './useUtils.js'

const QR_READER_ID = 'asogema-qr-reader'

function decodeQrPayload(text) {
  try {
    const parsed = JSON.parse(text)
    if (parsed?.pedido_id) return { pedido_id: String(parsed.pedido_id) }
  } catch {
    /* no era JSON */
  }
  const clean = String(text || '').trim()
  if (/^\d+$/.test(clean)) return { pedido_id: clean }
  return null
}

export function useQrReader() {
  const { getPedidoDetalle, updatePedidoEstado } = usePaymentApi()

  const cameraActive = ref(false)
  const cameraError = ref('')
  const isReading = ref(false)
  const manualCode = ref('')
  const manualError = ref('')
  const pedido = ref(null)
  const loading = ref(false)
  const updating = ref(false)
  const updateError = ref('')
  const doneMessage = ref('')

  let scanner = null

  const SECUENCIA = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO']
  const SIGUIENTE = { PENDIENTE: 'EN_PREPARACION', EN_PREPARACION: 'ENTREGADO' }

  const siguienteEstado = () => SIGUIENTE[pedido.value?.estado] || null

  async function consultarPedido(pedidoId) {
    if (!pedidoId || loading.value) return
    loading.value = true
    updateError.value = ''
    doneMessage.value = ''
    try {
      pedido.value = await getPedidoDetalle(pedidoId)
    } catch (err) {
      pedido.value = null
      manualError.value = getErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function onScan(text) {
    if (isReading.value) return
    const decoded = decodeQrPayload(text)
    if (!decoded) {
      cameraError.value = 'El código no corresponde a un pedido Asogema'
      return
    }
    isReading.value = true
    await stopCamera()
    await consultarPedido(decoded.pedido_id)
    isReading.value = false
  }

  async function startCamera() {
    cameraError.value = ''
    manualError.value = ''
    try {
      await nextTick()
      scanner = new Html5Qrcode(QR_READER_ID)
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        onScan,
        () => {},
      )
      cameraActive.value = true
    } catch (err) {
      cameraError.value =
        'No se pudo iniciar la cámara. Revisa los permisos o usa el código manual.'
    }
  }

  async function stopCamera() {
    if (scanner && cameraActive.value) {
      try {
        await scanner.stop()
      } catch {
        /* ya estaba detenida */
      }
      try {
        scanner.clear()
      } catch {
        /* no-op */
      }
      cameraActive.value = false
    }
  }

  function submitManual() {
    const codigo = decodeQrPayload(manualCode.value)
    if (!codigo) {
      manualError.value =
        'Código inválido. Pega el contenido del QR o el id del pedido.'
      return
    }
    manualError.value = ''
    consultarPedido(codigo.pedido_id)
  }

  async function avanzarEstado() {
    const next = siguienteEstado()
    if (!next || updating.value || !pedido.value) return
    updating.value = true
    updateError.value = ''
    doneMessage.value = ''
    try {
      const result = await updatePedidoEstado(pedido.value.pedido_id, next)
      pedido.value.estado = result.estado
      doneMessage.value = `Pedido actualizado a "${estadoLabel(result.estado)}"`
    } catch (err) {
      updateError.value = getErrorMessage(err)
    } finally {
      updating.value = false
    }
  }

  function limpiar() {
    pedido.value = null
    manualCode.value = ''
    manualError.value = ''
    updateError.value = ''
    doneMessage.value = ''
    cameraError.value = ''
  }

  onMounted(() => {
    document.body.classList.add('qrreader-mounted')
  })

  onUnmounted(() => {
    if (scanner) {
      stopCamera().catch(() => {})
    }
  })

  return {
    cameraActive,
    cameraError,
    isReading,
    manualCode,
    manualError,
    pedido,
    loading,
    updating,
    updateError,
    doneMessage,
    formatCop,
    estadoLabel,
    siguienteEstado,
    startCamera,
    stopCamera,
    submitManual,
    avanzarEstado,
    limpiar,
  }
}