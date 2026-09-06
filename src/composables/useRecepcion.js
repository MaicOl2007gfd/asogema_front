import { ref } from 'vue'
import api from './useApi.js'
import { getErrorMessage, todayIso } from './useUtils.js'

const bookings = ref([])
const fecha = ref(todayIso())
const tipo = ref('check-in') // check-in | check-out | ocupadas | todas
const loading = ref(false)
const error = ref(null)
const lastError = ref(null)
const lastSuccess = ref(null)

export function useRecepcion() {
  async function fetchDay() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/hotel/bookings/day', {
        params: { fecha: fecha.value, tipo: tipo.value }
      })
      bookings.value = data || []
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function checkIn(id) {
    loading.value = true
    lastError.value = null
    lastSuccess.value = null
    try {
      await api.patch(`/hotel/bookings/${id}/check-in`)
      lastSuccess.value = 'Check-in registrado correctamente'
      await fetchDay()
      return true
    } catch (e) {
      lastError.value = getErrorMessage(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function checkOut(id) {
    loading.value = true
    lastError.value = null
    lastSuccess.value = null
    try {
      await api.patch(`/hotel/bookings/${id}/check-out`)
      lastSuccess.value = 'Check-out registrado correctamente'
      await fetchDay()
      return true
    } catch (e) {
      lastError.value = getErrorMessage(e)
      return false
    } finally {
      loading.value = false
    }
  }

  function clearMessages() {
    lastError.value = null
    lastSuccess.value = null
  }

  return {
    bookings,
    fecha,
    tipo,
    loading,
    error,
    lastError,
    lastSuccess,
    fetchDay,
    checkIn,
    checkOut,
    clearMessages,
  }
}
