import api from './useApi.js'

export function usePaymentApi() {
  async function getPaymentStatus(facturaId) {
    const { data } = await api.get(`/payments/status/${facturaId}`)
    return data
  }

  return { getPaymentStatus }
}
