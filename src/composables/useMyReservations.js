import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'
import { useHotel } from './useHotel.js'
import { useMyRestaurantReservations } from './useMyRestaurantReservations.js'
import { useEventsApi } from './useEventsApi.js'

/**
 * Mis Reservas — Composable unificado (Hotel + Restaurante + Eventos).
 *
 * Estado singleton a nivel de módulo: reutiliza los mismos refs de
 * `useHotel` y `useMyRestaurantReservations` (que también son singletons),
 * por lo que cualquier cancelación o cambio aquí se refleja en esas vistas
 * y viceversa. Las reservas de eventos se cargan aquí (endpoint nuevo).
 *
 * Proporciona:
 *   1. Lista unificada de reservas en una sola pantalla.
 *   2. Filtros por tipo (hotel / restaurante / eventos) y por estado.
 *   3. Pantalla de confirmación de reserva (resumen + estado).
 *   4. Cancelación por tipo de reserva.
 */

const { isLoggedIn } = useAuth()
const eventsApi = useEventsApi()

const hotel = useHotel()
const restaurant = useMyRestaurantReservations()

/* ----------------------------------------------------------
   ESTADOS DE RESERVA (compartidos por los tres tipos)
   ---------------------------------------------------------- */
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  'check-in': 'Check-In',
  'check-out': 'Check-Out',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

const FINAL_STATUSES = ['cancelada', 'completada', 'check-out']

function normalizeStatus(s) {
  if (!s) return 'pendiente'
  const map = {
    PENDIENTE: 'pendiente',
    CONFIRMADA: 'confirmada',
    CONFIRMED: 'confirmada',
    CHECK_IN: 'check-in',
    CHECKIN: 'check-in',
    CHECK_OUT: 'check-out',
    CHECKOUT: 'check-out',
    CANCELADA: 'cancelada',
    CANCELLED: 'cancelada',
    COMPLETADA: 'completada',
  }
  return map[s] || String(s).toLowerCase()
}

/* ----------------------------------------------------------
   HELPERS DE FORMATO (es-CO, consistentes con el resto de la app)
   ---------------------------------------------------------- */
function formatDate(value) {
  if (!value) return '—'
  const s = String(value).slice(0, 10)
  const d = new Date(`${s}T00:00:00`)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateLong(value) {
  if (!value) return '—'
  const s = String(value).slice(0, 10)
  const d = new Date(`${s}T00:00:00`)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(value) {
  if (!value) return '—'
  const match = String(value).match(/(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : String(value)
}

function formatCurrency(value) {
  if (value == null || isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

/* ----------------------------------------------------------
   RESERVAS DE EVENTOS (estado propio de este composable)
   ---------------------------------------------------------- */
const eventReservations = ref([])
const eventLoading = ref(false)
const eventError = ref(null)

function transformEvent(raw) {
  const salon = raw.salon || raw.salones || raw.salon_evento || null
  const tipo = raw.tipo_evento || raw.tipos_evento || null
  const salonName =
    (salon && (salon.nombre || salon.name)) ||
    raw.salon_nombre ||
    'Salón de eventos'
  const tipoName =
    (tipo && (tipo.nombre || tipo.name)) ||
    raw.tipo_evento_nombre ||
    ''
  return {
    id: raw.id,
    fecha: raw.fecha || '',
    horaInicio: formatTime(raw.hora_inicio || raw.horaInicio),
    horaFin: formatTime(raw.hora_fin || raw.horaFin),
    guests: raw.cantidad_personas || raw.personas || 1,
    observaciones: raw.observaciones || '',
    salonName,
    tipoName,
    anticipo: raw.anticipo,
    total: raw.total,
    status: normalizeStatus(raw.estado || raw.status),
    createdAt: raw.created_at || '',
  }
}

async function loadEvents() {
  if (!isLoggedIn.value) {
    eventReservations.value = []
    eventLoading.value = false
    eventError.value = null
    return
  }
  eventLoading.value = true
  eventError.value = null
  try {
    const data = await eventsApi.fetchMyBookings()
    eventReservations.value = (data || []).map(transformEvent)
  } catch (err) {
    // Si el endpoint aún no existe en el backend (404), no se rompe la
    // pantalla unificada: simplemente no se muestran reservas de eventos.
    if (err.response?.status === 404) {
      eventReservations.value = []
      eventError.value = null
    } else {
      eventReservations.value = []
      eventError.value = 'No se pudieron cargar tus reservas de eventos'
    }
  } finally {
    eventLoading.value = false
  }
}

/* ----------------------------------------------------------
   FILTROS DE LA PANTALLA UNIFICADA
   ---------------------------------------------------------- */
const typeFilter = ref('all') // 'all' | 'hotel' | 'restaurant' | 'event'
const statusFilter = ref('all') // 'all' | 'active' | 'upcoming'

function setTypeFilter(value) {
  typeFilter.value = value
}

function setStatusFilter(value) {
  statusFilter.value = value
}

/* ----------------------------------------------------------
   PANTALLA DE CONFIRMACIÓN / DETALLE
   ---------------------------------------------------------- */
const selected = ref(null)
const showConfirmation = ref(false)
const cancellingId = ref(null)
const cancelError = ref('')

function openConfirmation(reservation) {
  cancelError.value = ''
  selected.value = reservation
  showConfirmation.value = true
}

function closeConfirmation() {
  showConfirmation.value = false
  selected.value = null
  cancelError.value = ''
}

/* ----------------------------------------------------------
   NORMALIZACIÓN A FORMATO UNIFICADO
   ---------------------------------------------------------- */
function normalizeHotel(b) {
  const status = b.status
  const checkIn = b.checkIn || ''
  const checkOut = b.checkOut || ''
  const guests = b.guests || 1
  const total = Number(b.total) || 0
  return {
    key: `hotel-${b.id}`,
    type: 'hotel',
    typeLabel: 'Hotel',
    id: b.id,
    title: b.roomName || 'Habitación',
    subtitle: 'Reserva de habitación',
    status,
    statusLabel: STATUS_LABELS[status] || status,
    sortDate: checkIn,
    dateLabel: `${formatDate(checkIn)} → ${formatDate(checkOut)}`,
    timeLabel: '',
    guests,
    guestsLabel: `${guests} ${guests === 1 ? 'huésped' : 'huéspedes'}`,
    amount: total,
    amountLabel: total ? formatCurrency(total) : '',
    notes: b.observaciones || '',
    canCancel: !FINAL_STATUSES.includes(status),
    details: [
      { label: 'N.º de reserva', value: `#${b.id}`, icon: 'hash' },
      { label: 'Entrada', value: formatDateLong(checkIn), icon: 'calendar' },
      { label: 'Salida', value: formatDateLong(checkOut), icon: 'calendar' },
      { label: 'Huéspedes', value: `${guests} ${guests === 1 ? 'persona' : 'personas'}`, icon: 'users' },
      { label: 'Total de la reserva', value: formatCurrency(total), icon: 'money' },
    ],
    raw: b,
  }
}

function normalizeRestaurant(r) {
  const status = r.status
  const guests = r.guests || 1
  return {
    key: `restaurant-${r.id}`,
    type: 'restaurant',
    typeLabel: 'Restaurante',
    id: r.id,
    title: r.mesaLabel || 'Mesa',
    subtitle: 'Reserva de mesa',
    status,
    statusLabel: r.statusLabel || STATUS_LABELS[status] || status,
    sortDate: r.fecha || '',
    dateLabel: formatDate(r.fecha),
    timeLabel: `${r.hora} hrs`,
    guests,
    guestsLabel: `${guests} ${guests === 1 ? 'persona' : 'personas'}`,
    amount: 0,
    amountLabel: '',
    notes: r.observaciones || '',
    canCancel: !FINAL_STATUSES.includes(status),
    details: [
      { label: 'N.º de reserva', value: `#${r.id}`, icon: 'hash' },
      { label: 'Fecha', value: formatDateLong(r.fecha), icon: 'calendar' },
      { label: 'Hora', value: `${r.hora} hrs`, icon: 'clock' },
      { label: 'Personas', value: `${guests} ${guests === 1 ? 'persona' : 'personas'}`, icon: 'users' },
      { label: 'Mesa', value: r.mesaLabel || '—', icon: 'table' },
      ...(r.mesaCapacidad
        ? [{ label: 'Capacidad de la mesa', value: `${r.mesaCapacidad} puestos`, icon: 'users' }]
        : []),
      ...(r.motivo ? [{ label: 'Ocasión', value: r.motivo, icon: 'tag' }] : []),
    ],
    raw: r,
  }
}

function normalizeEvent(e) {
  const status = e.status
  const guests = e.guests || 1
  const anticipo = e.anticipo != null ? Number(e.anticipo) : null
  return {
    key: `event-${e.id}`,
    type: 'event',
    typeLabel: 'Eventos',
    id: e.id,
    title: e.salonName || 'Salón de eventos',
    subtitle: e.tipoName ? `Evento · ${e.tipoName}` : 'Reserva de evento',
    status,
    statusLabel: STATUS_LABELS[status] || status,
    sortDate: e.fecha || '',
    dateLabel: formatDate(e.fecha),
    timeLabel: `${e.horaInicio} – ${e.horaFin} hrs`,
    guests,
    guestsLabel: `${guests} ${guests === 1 ? 'persona' : 'personas'}`,
    amount: anticipo || 0,
    amountLabel: anticipo != null ? formatCurrency(anticipo) : '',
    notes: e.observaciones || '',
    canCancel: !FINAL_STATUSES.includes(status),
    details: [
      { label: 'N.º de reserva', value: `#${e.id}`, icon: 'hash' },
      { label: 'Fecha', value: formatDateLong(e.fecha), icon: 'calendar' },
      { label: 'Horario', value: `${e.horaInicio} – ${e.horaFin} hrs`, icon: 'clock' },
      { label: 'Personas', value: `${guests} ${guests === 1 ? 'persona' : 'personas'}`, icon: 'users' },
      { label: 'Salón', value: e.salonName || '—', icon: 'party' },
      ...(e.tipoName ? [{ label: 'Tipo de evento', value: e.tipoName, icon: 'tag' }] : []),
      ...(anticipo != null
        ? [{ label: 'Anticipo', value: formatCurrency(anticipo), icon: 'money' }]
        : []),
    ],
    raw: e,
  }
}

/* ----------------------------------------------------------
   LISTA UNIFICADA
   ---------------------------------------------------------- */
const reservations = computed(() => {
  const list = []
  for (const b of hotel.bookings.value) list.push(normalizeHotel(b))
  for (const r of restaurant.reservations.value) list.push(normalizeRestaurant(r))
  for (const e of eventReservations.value) list.push(normalizeEvent(e))

  // Orden: primero las reservas activas (próximas antes), luego el historial
  // (más recientes primero).
  list.sort((a, b) => {
    const aActive = !FINAL_STATUSES.includes(a.status)
    const bActive = !FINAL_STATUSES.includes(b.status)
    if (aActive !== bActive) return aActive ? -1 : 1
    const dA = a.sortDate || ''
    const dB = b.sortDate || ''
    if (aActive) return dA.localeCompare(dB)
    return dB.localeCompare(dA)
  })
  return list
})

const filteredReservations = computed(() => {
  let list = reservations.value
  if (typeFilter.value !== 'all') {
    list = list.filter((r) => r.type === typeFilter.value)
  }
  if (statusFilter.value === 'active') {
    list = list.filter((r) => !FINAL_STATUSES.includes(r.status))
  } else if (statusFilter.value === 'upcoming') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    list = list.filter((r) => {
      if (FINAL_STATUSES.includes(r.status)) return false
      const d = new Date(`${(r.sortDate || '').slice(0, 10)}T00:00:00`)
      return !isNaN(d.getTime()) && d >= today
    })
  }
  return list
})

/* ----------------------------------------------------------
   RESUMEN / ESTADÍSTICAS
   ---------------------------------------------------------- */
const totalCount = computed(() => reservations.value.length)

const activeCount = computed(
  () => reservations.value.filter((r) => !FINAL_STATUSES.includes(r.status)).length,
)

const upcomingCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return reservations.value.filter((r) => {
    if (FINAL_STATUSES.includes(r.status)) return false
    const d = new Date(`${(r.sortDate || '').slice(0, 10)}T00:00:00`)
    return !isNaN(d.getTime()) && d >= today
  }).length
})

const typeCounts = computed(() => ({
  hotel: reservations.value.filter((r) => r.type === 'hotel').length,
  restaurant: reservations.value.filter((r) => r.type === 'restaurant').length,
  event: reservations.value.filter((r) => r.type === 'event').length,
}))

/* ----------------------------------------------------------
   ESTADOS DE CARGA / ERROR AGREGADOS
   ---------------------------------------------------------- */
const loading = computed(
  () => hotel.bookingsLoading.value || restaurant.reservationsLoading.value || eventLoading.value,
)

// Solo se considera un error grave si fallan hotel o restaurante.
const error = computed(
  () => hotel.bookingsError.value || restaurant.reservationsError.value || null,
)

const eventsUnavailable = computed(() => eventError.value !== null)

/* ----------------------------------------------------------
   CARGA / RECARGA
   ---------------------------------------------------------- */
async function loadAll() {
  hotel.loadBookings()
  restaurant.loadReservations()
  await loadEvents()
}

/* ----------------------------------------------------------
   CANCELACIÓN POR TIPO DE RESERVA
   ---------------------------------------------------------- */
async function cancelReservation() {
  const r = selected.value
  if (!r) return
  cancellingId.value = r.key
  cancelError.value = ''
  try {
    if (r.type === 'hotel') {
      hotel.requestCancel(r.raw)
      await hotel.confirmCancel()
      const target = hotel.bookings.value.find((b) => b.id === r.id)
      if (!target || target.status !== 'cancelada') {
        cancelError.value =
          hotel.bookingsError.value || 'No se pudo cancelar la reserva. Intenta de nuevo.'
      }
    } else if (r.type === 'restaurant') {
      restaurant.requestCancel(r.raw)
      await restaurant.confirmCancel()
      const target = restaurant.reservations.value.find((x) => x.id === r.id)
      if (!target || target.status !== 'cancelada') {
        cancelError.value =
          restaurant.reservationsError.value || 'No se pudo cancelar la reserva. Intenta de nuevo.'
      }
    } else if (r.type === 'event') {
      await eventsApi.cancelBooking(r.id)
      const target = eventReservations.value.find((e) => e.id === r.id)
      if (target) target.status = 'cancelada'
    }

    if (!cancelError.value) {
      // Refrescar el objeto seleccionado para reflejar el nuevo estado.
      selected.value = reservations.value.find((x) => x.key === r.key) || null
    }
  } catch (err) {
    cancelError.value =
      err.response?.data?.message || 'No se pudo cancelar la reserva. Intenta de nuevo.'
  } finally {
    cancellingId.value = null
  }
}

/* ----------------------------------------------------------
   EXPORT
   ---------------------------------------------------------- */
export function useMyReservations() {
  return {
    // Lista unificada
    reservations,
    filteredReservations,
    totalCount,
    activeCount,
    upcomingCount,
    typeCounts,
    loading,
    error,
    eventsUnavailable,
    // Filtros
    typeFilter,
    statusFilter,
    setTypeFilter,
    setStatusFilter,
    // Confirmación / detalle
    selected,
    showConfirmation,
    openConfirmation,
    closeConfirmation,
    cancellingId,
    cancelError,
    cancelReservation,
    // Carga
    loadAll,
    loadEvents,
    // Helpers
    formatDate,
    formatDateLong,
    formatTime,
    formatCurrency,
  }
}
