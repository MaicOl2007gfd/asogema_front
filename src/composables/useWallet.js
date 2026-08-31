import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePaymentApi } from './usePaymentApi.js'
import { setCheckoutRequest, clearCheckoutRequest } from './useCheckout.js'
import { formatCop, getErrorMessage, estadoLabel } from './useUtils.js'

const MIN_MONTO = 10000
const MAX_MONTO = 2000000

export function useWallet(emit) {
  const { getWallet, createRecharge, verifyPayment, getFinancialInstitutions } =
    usePaymentApi()

  const saldo = ref(0)
  const recargas = ref([])
  const loading = ref(true)
  const error = ref('')

  const monto = ref('')
  const isRecargando = ref(false)

  const quickAmounts = [50000, 100000, 200000]

  const METODOS_RECARGA = [
    { value: 'TARJETA', label: 'Tarjeta', hint: 'Crédito o débito' },
    { value: 'NEQUI', label: 'Nequi', hint: 'Transferencia' },
    { value: 'DAVIPLATA', label: 'Daviplata', hint: 'Transferencia' },
    { value: 'PSE', label: 'PSE', hint: 'Débito bancario' },
  ]

  const metodoRecarga = ref('TARJETA')

  // Datos de pago para métodos directos
  const phoneNumber = ref('')
  const financialInstitutions = ref([])
  const financialInstitutionCode = ref('')
  const userLegalIdType = ref('CC')
  const userLegalId = ref('')

  // Datos de tarjeta (TARJETA directa)
  const cardNumber = ref('')
  const cardExpMonth = ref('')
  const cardExpYear = ref('')
  const cardCvc = ref('')
  const cardHolder = ref('')

  // Espera de confirmación
  const waitingConfirmation = ref(false)
  let pollTimer = null

  const esMetodoDirecto = computed(() =>
    ['NEQUI', 'DAVIPLATA', 'PSE', 'TARJETA'].includes(metodoRecarga.value),
  )

  const datosIncompletos = computed(() => {
    if (metodoRecarga.value === 'NEQUI' || metodoRecarga.value === 'DAVIPLATA') {
      return (
        !/^\d{10}$/.test(phoneNumber.value) ||
        !userLegalIdType.value ||
        !/^\d{6,12}$/.test(userLegalId.value)
      )
    }
    if (metodoRecarga.value === 'PSE') {
      return (
        !financialInstitutionCode.value ||
        !userLegalIdType.value ||
        !/^\d{6,12}$/.test(userLegalId.value)
      )
    }
    if (metodoRecarga.value === 'TARJETA') {
      return (
        !/^\d{14,16}$/.test(cardNumber.value.replace(/\s/g, '')) ||
        !/^\d{2}$/.test(cardExpMonth.value) ||
        !/^\d{2}$/.test(cardExpYear.value) ||
        !/^\d{3,4}$/.test(cardCvc.value) ||
        cardHolder.value.trim().length < 5
      )
    }
    return false
  })

  const paymentData = computed(() => {
    if (metodoRecarga.value === 'NEQUI' || metodoRecarga.value === 'DAVIPLATA') {
      return {
        phone_number: phoneNumber.value,
        user_legal_id_type: userLegalIdType.value,
        user_legal_id: userLegalId.value,
      }
    }
    if (metodoRecarga.value === 'PSE') {
      return {
        financial_institution_code: financialInstitutionCode.value,
        user_type: 0,
        user_legal_id_type: userLegalIdType.value,
        user_legal_id: userLegalId.value,
      }
    }
    if (metodoRecarga.value === 'TARJETA') {
      return {
        card_number: cardNumber.value.replace(/\s/g, ''),
        card_exp_month: cardExpMonth.value,
        card_exp_year: cardExpYear.value,
        card_cvc: cardCvc.value,
        card_holder: cardHolder.value.trim(),
      }
    }
    return undefined
  })

  const montoError = computed(() => {
    const value = Number(monto.value)
    if (!monto.value) return ''
    if (!Number.isFinite(value) || value <= 0) return 'Ingresa un monto válido'
    if (value < MIN_MONTO) return 'El monto mínimo es $10.000'
    if (value > MAX_MONTO) return 'El monto máximo es $2.000.000'
    return ''
  })

  function selectQuickAmount(amount) {
    monto.value = String(amount)
  }

  async function loadBalance() {
    loading.value = true
    error.value = ''
    try {
      const wallet = await getWallet()
      saldo.value = Number(wallet.saldo) || 0
      recargas.value = wallet.recargas || []
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function loadInstitutions() {
    if (financialInstitutions.value.length > 0) return
    try {
      financialInstitutions.value = await getFinancialInstitutions()
    } catch {
      financialInstitutions.value = []
    }
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function startConfirmationPoll(transactionId, facturaId) {
    waitingConfirmation.value = true
    let attempts = 0
    const MAX_ATTEMPTS = 20
    pollTimer = setInterval(async () => {
      attempts += 1
      try {
        const result = await verifyPayment(transactionId)
        if (result.estado === 'PAGADA') {
          stopPolling()
          clearCheckoutRequest()
          window.location.href = `/payment/result?factura_id=${result.factura_id ?? facturaId}&status=APPROVED`
          return
        }
        if (['RECHAZADO', 'ANULADO', 'ERROR'].includes(result.estado)) {
          stopPolling()
          waitingConfirmation.value = false
          error.value = 'El pago fue rechazado. Intenta con otro método.'
          return
        }
      } catch {
        /* se reintenta */
      }
      if (attempts >= MAX_ATTEMPTS) {
        stopPolling()
        waitingConfirmation.value = false
        window.location.href = `/payment/result?factura_id=${facturaId}`
      }
    }, 4000)
  }

  async function recargar() {
    if (montoError.value || isRecargando.value) return
    if (esMetodoDirecto.value && datosIncompletos.value) {
      error.value =
        metodoRecarga.value === 'PSE'
          ? 'Completa el banco y el documento para continuar'
          : metodoRecarga.value === 'TARJETA'
            ? 'Completa los datos de la tarjeta'
            : 'Ingresa un celular válido (10 dígitos)'
      return
    }
    isRecargando.value = true
    error.value = ''
    try {
      const result = await createRecharge(
        Number(monto.value),
        metodoRecarga.value,
        undefined,
        paymentData.value,
      )

      if (result.checkout_url) {
        window.location.href = result.checkout_url
      } else if (result.async_payment_url) {
        window.location.href = result.async_payment_url
      } else if (result.transaction_id) {
        startConfirmationPoll(result.transaction_id, result.factura_id)
      } else if (result.estado === 'PAGADA') {
        clearCheckoutRequest()
        window.location.href = `/payment/result?factura_id=${result.factura_id}&status=APPROVED`
      } else if (emit) {
        emit('navigate', 'checkout')
      }
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      isRecargando.value = false
    }
  }

  onMounted(loadBalance)
  onUnmounted(stopPolling)

  return {
    saldo,
    recargas,
    loading,
    error,
    monto,
    montoError,
    quickAmounts,
    isRecargando,
    METODOS_RECARGA,
    metodoRecarga,
    esMetodoDirecto,
    datosIncompletos,
    phoneNumber,
    financialInstitutions,
    financialInstitutionCode,
    userLegalIdType,
    userLegalId,
    cardNumber,
    cardExpMonth,
    cardExpYear,
    cardCvc,
    cardHolder,
    waitingConfirmation,
    loadInstitutions,
    selectQuickAmount,
    recargar,
    formatCop,
    estadoLabel,
    loadBalance,
  }
}