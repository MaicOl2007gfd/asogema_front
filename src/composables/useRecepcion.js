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
const counts = ref({ 'check-in': 0, 'check-out': 0, 'ocupadas': 0, 'todas': 0 })

const TIPOS = ['check-in', 'check-out', 'ocupadas', 'todas']

const ESTADO_LABELS = {
  CONFIRMADA: 'Confirmada',
  CHECK_IN: 'Check-in',
  CHECK_OUT: 'Check-out',
  PENDIENTE: 'Pendiente',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
  FINALIZADA: 'Finalizada',
}

const ESTADO_CLASSES = {
  CONFIRMADA: 'confirmada',
  CHECK_IN: 'check-in',
  CHECK_OUT: 'check-out',
  PENDIENTE: 'pendiente',
  CANCELADA: 'cancelada',
  COMPLETADA: 'completada',
  FINALIZADA: 'finalizada',
}

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
    fetchCounts()
  }

  async function fetchCounts() {
    const results = await Promise.all(
      TIPOS.map(async (t) => {
        try {
          const { data } = await api.get('/hotel/bookings/day', {
            params: { fecha: fecha.value, tipo: t }
          })
          return { t, n: (data || []).length }
        } catch {
          return { t, n: 0 }
        }
      })
    )
    const next = { 'check-in': 0, 'check-out': 0, 'ocupadas': 0, 'todas': 0 }
    results.forEach(({ t, n }) => { next[t] = n })
    counts.value = next
  }

  function estadoLabel(e) { return ESTADO_LABELS[e] || e || '—' }
  function estadoClass(e) { return ESTADO_CLASSES[e] || '' }

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
    counts,
    fetchDay,
    fetchCounts,
    checkIn,
    checkOut,
    clearMessages,
    estadoLabel,
    estadoClass,
  }
}
