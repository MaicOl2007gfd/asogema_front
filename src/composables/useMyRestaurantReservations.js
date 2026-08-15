import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'
import { useRestaurantApi } from './useRestaurantApi.js'

/**
 * Restaurante — Mis Reservas (estado singleton a nivel de módulo).
 *
 * Controla la experiencia "Mis reservas de restaurante":
 *  1. Historial de reservas de mesa del usuario autenticado.
 *  2. Cancelación de una reserva con confirmación.
 *
 * El estado vive a nivel de módulo (igual que useHotel), de modo que al
 * navegar entre vistas se conservan los datos ya cargados.
 */

const { isLoggedIn } = useAuth()
const restaurantApi = useRestaurantApi()

/* ----------------------------------------------------------
   STATUS HELPERS
   ---------------------------------------------------------- */
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

const FINAL_STATUSES = ['cancelada', 'completada']

function normalizeStatus(s) {
  if (!s) return 'pendiente'
  const map = {
    PENDIENTE: 'pendiente',
    CONFIRMADA: 'confirmada',
    CONFIRMED: 'confirmada',
    CANCELADA: 'cancelada',
    CANCELLED: 'cancelada',
    COMPLETADA: 'completada',
  }
  return map[s] || String(s).toLowerCase()
}

function formatDate(value) {
  if (!value) return '—'
  const s = String(value).slice(0, 10)
  const d = new Date(`${s}T00:00:00`)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(value) {
  if (!value) return '—'
  const s = String(value)
  // '19:30:00' → '19:30' | '2026-08-15T19:30:00.000Z' → '19:30'
  const match = s.match(/(\d{2}):(\d{2})/)
  if (match) return `${match[1]}:${match[2]}`
  return s
}

function formatDateLong(value) {
  if (!value) return '—'
  const s = String(value).slice(0, 10)
  const d = new Date(`${s}T00:00:00`)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/* ----------------------------------------------------------
   STATE
   ---------------------------------------------------------- */
const reservations = ref([])
const reservationsLoading = ref(false)
const reservationsError = ref(null)
const reservationToCancel = ref(null)
const showCancelConfirm = ref(false)
const isCancelling = ref(false)

/* ----------------------------------------------------------
   COMPUTED
   ---------------------------------------------------------- */
const activeCount = computed(
  () => reservations.value.filter((r) => !FINAL_STATUSES.includes(r.status)).length,
)

const upcomingCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return reservations.value.filter((r) => {
    if (FINAL_STATUSES.includes(r.status)) return false
    const d = new Date(`${String(r.fecha).slice(0, 10)}T00:00:00`)
    return !isNaN(d.getTime()) && d >= today
  }).length
})

/* ----------------------------------------------------------
   TRANSFORM
   ---------------------------------------------------------- */
function transformReservation(raw) {
  const mesa = raw.mesas || null
  return {
    id: raw.id,
    fecha: raw.fecha || '',
    hora: formatTime(raw.hora),
    horaRaw: raw.hora,
    guests: raw.cantidad_personas || 1,
    motivo: raw.motivo || '',
    observaciones: raw.observaciones || '',
    status: normalizeStatus(raw.estado),
    statusLabel: STATUS_LABELS[normalizeStatus(raw.estado)] || raw.estado || '—',
    mesaLabel: mesa ? `Mesa ${mesa.numero}` : '—',
    mesaCapacidad: mesa?.capacidad ?? null,
    mesaUbicacion: mesa?.ubicacion || '',
    createdAt: raw.created_at || '',
  }
}

/* ----------------------------------------------------------
   METHODS
   ---------------------------------------------------------- */
async function loadReservations() {
  // El endpoint es privado: si no hay sesión se evita disparar un 401.
  if (!isLoggedIn.value) {
    reservations.value = []
    reservationsLoading.value = false
    reservationsError.value = null
    return
  }
  reservationsLoading.value = true
  reservationsError.value = null
  try {
    const data = await restaurantApi.fetchMyReservations()
    reservations.value = (data || []).map(transformReservation)
  } catch (err) {
    reservationsError.value = 'No se pudieron cargar tus reservas de restaurante'
    console.error('Error loading restaurant reservations:', err)
  } finally {
    reservationsLoading.value = false
  }
}

function requestCancel(reservation) {
  reservationToCancel.value = reservation
  showCancelConfirm.value = true
}

function closeCancelConfirm() {
  showCancelConfirm.value = false
  reservationToCancel.value = null
}

async function confirmCancel() {
  if (!reservationToCancel.value) return
  isCancelling.value = true
  try {
    await restaurantApi.cancelReservation(reservationToCancel.value.id)
    const target = reservations.value.find((r) => r.id === reservationToCancel.value.id)
    if (target) {
      target.status = 'cancelada'
      target.statusLabel = STATUS_LABELS.cancelada
    }
    closeCancelConfirm()
  } catch (err) {
    reservationsError.value =
      err.response?.data?.message || 'No se pudo cancelar la reserva. Intenta de nuevo.'
    closeCancelConfirm()
  } finally {
    isCancelling.value = false
  }
}

function canCancel(reservation) {
  return reservation && !FINAL_STATUSES.includes(reservation.status)
}

function goToRestaurant(emit) {
  if (emit) emit('navigate', 'restaurant')
}

function goToNewReservation(emit) {
  if (emit) emit('navigate', 'table-reservation')
}

/* ----------------------------------------------------------
   EXPORT
   ---------------------------------------------------------- */
export function useMyRestaurantReservations(emit) {
  return {
    reservations,
    reservationsLoading,
    reservationsError,
    reservationToCancel,
    showCancelConfirm,
    isCancelling,
    activeCount,
    upcomingCount,
    loadReservations,
    requestCancel,
    closeCancelConfirm,
    confirmCancel,
    canCancel,
    formatDate,
    formatDateLong,
    formatTime,
    goToRestaurant,
    goToNewReservation,
  }
}
