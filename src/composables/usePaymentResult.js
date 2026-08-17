import { ref, onMounted } from 'vue'
import { usePaymentApi } from './usePaymentApi.js'

export function usePaymentResult() {
  const { getPaymentStatus } = usePaymentApi()

  const isLoading = ref(true)
  const error = ref('')
  const paymentData = ref(null)
  const facturaId = ref(null)
  const wompiStatus = ref(null)
  const wompiTransactionId = ref(null)
  const isVisible = ref(false)

  function formatCurrency(amount) {
    const num = Number(amount)
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  function mapWompiStatus(status) {
    const map = {
      APPROVED: 'PAGADO',
      PENDING: 'PENDIENTE',
      DECLINED: 'RECHAZADO',
      ERROR: 'ERROR',
      VOIDED: 'ANULADO',
    }
    return map[status] || status
  }

  function getDisplayStatus() {
    if (paymentData.value?.estado === 'PAGADA') return 'APPROVED'
    if (wompiStatus.value) return wompiStatus.value
    return paymentData.value?.pagos?.[0]?.estado || 'PENDIENTE'
  }

  async function loadPaymentStatus() {
    if (!facturaId.value) {
      isLoading.value = false
      return
    }

    try {
      const data = await getPaymentStatus(facturaId.value)
      paymentData.value = data
    } catch (err) {
      if (err.response?.status === 401) {
        paymentData.value = null
      } else if (err.response?.status === 404) {
        error.value = 'Factura no encontrada. Verifica el enlace.'
      } else {
        error.value = 'No se pudo verificar el estado del pago. Intenta de nuevo.'
      }
    } finally {
      isLoading.value = false
    }
  }

  function readUrlParams() {
    const params = new URLSearchParams(window.location.search)
    facturaId.value = params.get('factura_id')
    wompiStatus.value = params.get('status')
    wompiTransactionId.value = params.get('id')
  }

  onMounted(async () => {
    readUrlParams()

    requestAnimationFrame(() => {
      isVisible.value = true
    })

    await loadPaymentStatus()
  })

  return {
    isLoading,
    error,
    paymentData,
    facturaId,
    wompiStatus,
    wompiTransactionId,
    isVisible,
    formatCurrency,
    getDisplayStatus,
    mapWompiStatus,
  }
}
