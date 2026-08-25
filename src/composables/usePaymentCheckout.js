import { ref, computed, onUnmounted } from 'vue'
import { usePaymentApi } from './usePaymentApi.js'
import { useCheckout, clearCheckoutRequest } from './useCheckout.js'
import { formatCop, getErrorMessage } from './useUtils.js'

const IVA_RATE = 0.19

export function usePaymentCheckout() {
  const { createPayment, createOrder, validateCoupon, getWallet, verifyPayment, getFinancialInstitutions } =
    usePaymentApi()
  const { checkoutRequest } = useCheckout()

  const couponCode = ref('')
  const couponInfo = ref(null)
  const couponError = ref('')
  const couponLoading = ref(false)
  const metodoPago = ref('TARJETA')
  const saldoDisponible = ref(null)
  const isSubmitting = ref(false)
  const submitError = ref('')

  // Datos de pago para métodos directos (NEQUI/DAVIPLATA/PSE)
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

  // Espera de confirmación (Nequi/Daviplata: push al celular)
  const waitingConfirmation = ref(false)
  const waitingTransactionId = ref(null)
  let pollTimer = null

  const request = computed(() => checkoutRequest.value)

  const items = computed(() => request.value?.items || [])

  const subtotal = computed(() => {
    if (request.value?.montoReferencia != null) return request.value.montoReferencia
    if (request.value?.tipo === 'RECARGA' && request.value?.monto != null) {
      return Number(request.value.monto)
    }
    return items.value.length > 0
      ? items.value.reduce(
          (acc, item) => acc + Number(item.precio ?? item.price) * item.quantity,
          0,
        )
      : 0
  })

  const descuento = computed(() => couponInfo.value?.descuento ?? 0)

  const baseGravable = computed(() => subtotal.value - descuento.value)

  /** Base gravada con IVA: solo items con aplicaIva (restaurante) o el subtotal completo. */
  const baseGravada = computed(() => {
    if (request.value?.tipo !== 'RESTAURANTE' || items.value.length === 0) {
      return subtotal.value
    }
    return items.value.reduce(
      (acc, item) =>
        item.aplicaIva !== false
          ? acc + Number(item.precio ?? item.price) * item.quantity
          : acc,
      0,
    )
  })

  const impuestos = computed(() => {
    if (request.value?.tipo === 'RECARGA') return 0
    // IVA del origen escalado por el descuento (baseGravable / subtotal).
    const factor = subtotal.value > 0 ? baseGravable.value / subtotal.value : 0
    return Math.round(baseGravada.value * IVA_RATE * factor)
  })

  const total = computed(() => baseGravable.value + impuestos.value)

  const conSaldo = computed(() => metodoPago.value === 'SALDO')

  const saldoInsuficiente = computed(
    () => conSaldo.value && saldoDisponible.value != null && saldoDisponible.value < total.value,
  )

  const esMetodoDirecto = computed(() =>
    ['NEQUI', 'DAVIPLATA', 'PSE', 'TARJETA'].includes(metodoPago.value),
  )

  const datosIncompletos = computed(() => {
    if (metodoPago.value === 'NEQUI' || metodoPago.value === 'DAVIPLATA') {
      return (
        !/^\d{10}$/.test(phoneNumber.value) ||
        !userLegalIdType.value ||
        !/^\d{6,12}$/.test(userLegalId.value)
      )
    }
    if (metodoPago.value === 'PSE') {
      return (
        !financialInstitutionCode.value ||
        !userLegalIdType.value ||
        !/^\d{6,12}$/.test(userLegalId.value)
      )
    }
    if (metodoPago.value === 'TARJETA') {
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
    if (metodoPago.value === 'NEQUI' || metodoPago.value === 'DAVIPLATA') {
      return {
        phone_number: phoneNumber.value,
        user_legal_id_type: userLegalIdType.value,
        user_legal_id: userLegalId.value,
      }
    }
    if (metodoPago.value === 'PSE') {
      return {
        financial_institution_code: financialInstitutionCode.value,
        user_type: 0,
        user_legal_id_type: userLegalIdType.value,
        user_legal_id: userLegalId.value,
      }
    }
    if (metodoPago.value === 'TARJETA') {
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

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  async function loadSaldo() {
    try {
      const wallet = await getWallet()
      saldoDisponible.value = Number(wallet.saldo) || 0
    } catch {
      saldoDisponible.value = null
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

  async function validarCupon() {
    const codigo = couponCode.value.trim().toUpperCase()
    couponInfo.value = null
    couponError.value = ''
    if (!codigo) return

    couponLoading.value = true
    try {
      couponInfo.value = await validateCoupon(codigo, subtotal.value)
    } catch (err) {
      couponError.value = getErrorMessage(err)
    } finally {
      couponLoading.value = false
    }
  }

  function quitarCupon() {
    couponCode.value = ''
    couponInfo.value = null
    couponError.value = ''
  }

  function startConfirmationPoll(transactionId, facturaId) {
    waitingConfirmation.value = true
    waitingTransactionId.value = transactionId
    let attempts = 0
    const MAX_ATTEMPTS = 20
    pollTimer = setInterval(async () => {
      attempts += 1
      try {
        const result = await verifyPayment(transactionId)
        if (result.estado === 'PAGADA') {
          stopPolling()
          clearCheckoutRequest()
          window.location.href = `/payment/result?factura_id=${result.factura_id ?? facturaId}&transaction_id=${transactionId}&status=APPROVED`
          return
        }
        if (['RECHAZADO', 'ANULADO', 'ERROR'].includes(result.estado)) {
          stopPolling()
          waitingConfirmation.value = false
          submitError.value = 'El pago fue rechazado. Intenta con otro método.'
          return
        }
      } catch {
        /* se reintenta en el siguiente tick */
      }
      if (attempts >= MAX_ATTEMPTS) {
        stopPolling()
        waitingConfirmation.value = false
        window.location.href = `/payment/result?factura_id=${facturaId}&transaction_id=${transactionId}`
      }
    }, 4000)
  }

  async function pagar() {
    if (!request.value || isSubmitting.value) return
    if (esMetodoDirecto.value && datosIncompletos.value) {
      submitError.value =
        metodoPago.value === 'PSE'
          ? 'Completa el banco y el documento para continuar'
          : metodoPago.value === 'TARJETA'
            ? 'Completa los datos de la tarjeta'
            : 'Ingresa un celular válido (10 dígitos)'
      return
    }
    isSubmitting.value = true
    submitError.value = ''

    try {
      const base = request.value
      let reservaId = base.reserva_id

      if (base.tipo === 'RESTAURANTE' && items.value.length > 0) {
        const pedido = await createOrder(
          items.value.map((item) => ({
            producto_id: item.id,
            cantidad: item.quantity,
          })),
          base.tipoPedido || 'PARA_LLEVAR',
        )
        reservaId = pedido.pedido_id
      }

      const payment = await createPayment({
        reserva_id: reservaId,
        tipo_reserva: base.tipo,
        metodo_pago: metodoPago.value,
        codigo_descuento: couponInfo.value ? couponCode.value.trim().toUpperCase() : undefined,
        monto: base.tipo === 'RECARGA' ? Number(base.monto) : undefined,
        payment_data: paymentData.value,
      })

      if (payment.checkout_url) {
        window.location.href = payment.checkout_url
        return
      }

      if (payment.async_payment_url) {
        window.location.href = payment.async_payment_url
        return
      }

      if (payment.estado === 'PAGADA') {
        clearCheckoutRequest()
        window.location.href = `/payment/result?factura_id=${payment.factura_id}&status=APPROVED`
        return
      }

      if (payment.transaction_id) {
        startConfirmationPoll(payment.transaction_id, payment.factura_id)
        return
      }

      submitError.value = 'No se pudo iniciar el pago. Intenta de nuevo.'
    } catch (err) {
      submitError.value = getErrorMessage(err)
    } finally {
      isSubmitting.value = false
    }
  }

  onUnmounted(stopPolling)

  return {
    request,
    items,
    subtotal,
    descuento,
    baseGravable,
    impuestos,
    total,
    conSaldo,
    saldoDisponible,
    saldoInsuficiente,
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
    waitingTransactionId,
    couponCode,
    couponInfo,
    couponError,
    couponLoading,
    metodoPago,
    isSubmitting,
    submitError,
    formatCop,
    loadSaldo,
    loadInstitutions,
    validarCupon,
    quitarCupon,
    pagar,
  }
}
