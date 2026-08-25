import { ref, computed, onMounted } from 'vue'
import { usePaymentApi } from './usePaymentApi.js'
import { getErrorMessage, formatCop } from './useUtils.js'

const STATUS_MAP = {
  APPROVED: 'PAGADO',
  PENDING: 'PENDIENTE',
  DECLINED: 'RECHAZADO',
  ERROR: 'ERROR',
  VOIDED: 'ANULADO',
}

export function usePaymentResult() {
  const { getPaymentStatus, downloadPdf, verifyPayment } = usePaymentApi()

  const isLoading = ref(true)
  const error = ref('')
  const unauthorized = ref(false)
  const paymentData = ref(null)
  const facturaId = ref(null)
  const wompiStatus = ref(null)
  const wompiTransactionId = ref(null)
  const isVisible = ref(false)
  const downloadingPdf = ref(false)
  const pdfError = ref('')
  const isVerifying = ref(false)

  const status = computed(() => {
    if (paymentData.value?.estado === 'PAGADA') return 'APPROVED'
    if (wompiStatus.value) return wompiStatus.value
    return paymentData.value?.pagos?.[0]?.estado || 'PENDIENTE'
  })

  const displayStatus = computed(() => STATUS_MAP[status.value] || status.value)

  /** Etiqueta del concepto según el tipo de pago (recarga, pedido o reserva). */
  const conceptoLabel = computed(() => {
    const t = paymentData.value?.tipo_reserva
    if (t === 'RECARGA') return 'saldo'
    if (t === 'RESTAURANTE') return 'pedido'
    return 'reserva'
  })

  function formatCurrency(amount) {
    return formatCop(amount)
  }

  async function loadPaymentStatus() {
    if (!facturaId.value) {
      isLoading.value = false
      return
    }

    try {
      const data = await getPaymentStatus(facturaId.value)
      paymentData.value = data
      error.value = ''
    } catch (err) {
      if (err.response?.status === 401) {
        unauthorized.value = true
        paymentData.value = null
      } else if (err.response?.status === 404) {
        error.value = 'Factura no encontrada. Verifica el enlace.'
      } else {
        error.value = getErrorMessage(err)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function verifyWithWompi() {
    if (!wompiTransactionId.value || unauthorized.value || isVerifying.value) {
      return false
    }
    isVerifying.value = true
    try {
      await verifyPayment(wompiTransactionId.value)
      await loadPaymentStatus()
      return true
    } catch (err) {
      if (err.response?.status === 401) {
        unauthorized.value = true
        paymentData.value = null
      }
      return false
    } finally {
      isVerifying.value = false
    }
  }

  async function downloadInvoicePdf() {
    if (!facturaId.value || downloadingPdf.value) return
    downloadingPdf.value = true
    pdfError.value = ''
    try {
      const base64 = await downloadPdf(facturaId.value)
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: 'application/pdf',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factura-${paymentData.value?.numero_factura ?? facturaId.value}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      pdfError.value = getErrorMessage(err)
    } finally {
      downloadingPdf.value = false
    }
  }

  function readUrlParams() {
    const params = new URLSearchParams(window.location.search)
    const rawFacturaId = params.get('factura_id')
    facturaId.value = rawFacturaId && /^\d+$/.test(rawFacturaId) ? rawFacturaId : null
    const rawStatus = params.get('status')
    wompiStatus.value = rawStatus?.toUpperCase() ?? null
    wompiTransactionId.value = params.get('id') || params.get('transaction_id') || null
  }

  onMounted(async () => {
    readUrlParams()

    requestAnimationFrame(() => {
      isVisible.value = true
    })

    if (!facturaId.value) {
      isLoading.value = false
      error.value = 'Enlace de pago inválido: falta el identificador de la factura.'
      return
    }

    await loadPaymentStatus()

    let attempts = 0
    while (
      attempts < 3 &&
      !unauthorized.value &&
      paymentData.value?.estado !== 'PAGADA' &&
      wompiTransactionId.value
    ) {
      await verifyWithWompi()
      if (paymentData.value?.estado === 'PAGADA') break
      await new Promise((resolve) => setTimeout(resolve, 3000))
      attempts += 1
    }

    if (
      !unauthorized.value &&
      paymentData.value?.estado !== 'PAGADA' &&
      wompiTransactionId.value &&
      attempts >= 3
    ) {
      error.value =
        'No se pudo confirmar el pago con el proveedor. Intenta recargar la página en unos segundos.'
    }

    attempts = 0
    while (
      attempts < 15 &&
      paymentData.value?.estado === 'PAGADA' &&
      !paymentData.value?.cufe
    ) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await loadPaymentStatus()
      attempts += 1
    }
  })

  return {
    isLoading,
    error,
    paymentData,
    unauthorized,
    facturaId,
    wompiTransactionId,
    isVisible,
    isVerifying,
    downloadingPdf,
    pdfError,
    status,
    displayStatus,
    conceptoLabel,
    formatCurrency,
    downloadInvoicePdf,
  }
}