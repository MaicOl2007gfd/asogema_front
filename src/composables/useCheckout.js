import { ref } from 'vue'

/**
 * Estado compartido del checkout (sin vue-router, App.vue cambia de vista).
 * setCheckoutRequest prepara el pago; PaymentCheckoutView lo consume una vez.
 */
const checkoutRequest = ref(null)

export function setCheckoutRequest(request) {
  checkoutRequest.value = { ...request }
}

export function clearCheckoutRequest() {
  checkoutRequest.value = null
}

export function useCheckout() {
  return {
    checkoutRequest,
    setCheckoutRequest,
    clearCheckoutRequest,
  }
}