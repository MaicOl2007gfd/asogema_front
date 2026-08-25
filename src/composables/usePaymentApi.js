import api from './useApi.js'

export function usePaymentApi() {
  async function getPaymentStatus(facturaId) {
    const { data } = await api.get(`/payments/status/${facturaId}`)
    return data
  }

  async function downloadPdf(facturaId) {
    const { data } = await api.get(`/payments/${facturaId}/pdf`)
    return data
  }

  async function verifyPayment(transactionId) {
    const { data } = await api.post('/payments/verify', {
      transaction_id: transactionId,
    })
    return data
  }

  async function createPayment(payload) {
    const { data } = await api.post('/payments', payload)
    return data
  }

  async function validateCoupon(codigo, monto) {
    const { data } = await api.get(`/payments/cupones/${codigo}`, {
      params: monto ? { monto } : {},
    })
    return data
  }

  async function createOrder(items, tipo) {
    const { data } = await api.post('/restaurant/orders', { items, tipo })
    return data
  }

  async function createRecharge(monto, metodoPago = 'TARJETA', tipoTarjeta, paymentData) {
    const { data } = await api.post('/wallet/recharges', {
      monto,
      metodo_pago: metodoPago,
      tipo_tarjeta: tipoTarjeta || undefined,
      payment_data: paymentData || undefined,
    })
    return data
  }

  async function getWallet() {
    const { data } = await api.get('/wallet/balance')
    return data
  }

  async function getPedidoDetalle(pedidoId) {
    const { data } = await api.get(`/restaurant/pedidos/${pedidoId}`)
    return data
  }

  async function updatePedidoEstado(pedidoId, estado) {
    const { data } = await api.patch(`/restaurant/pedidos/${pedidoId}/estado`, {
      estado,
    })
    return data
  }

  async function getFinancialInstitutions() {
    const { data } = await api.get('/payments/pse/financial-institutions')
    return data
  }

  return {
    getPaymentStatus,
    downloadPdf,
    verifyPayment,
    createPayment,
    validateCoupon,
    createOrder,
    createRecharge,
    getWallet,
    getPedidoDetalle,
    updatePedidoEstado,
    getFinancialInstitutions,
  }
}
