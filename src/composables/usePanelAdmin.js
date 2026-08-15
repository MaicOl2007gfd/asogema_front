import { ref, computed, watch } from 'vue'
import api from './useApi.js'

// ─── Loading & Error ────────────────────────────────────────
const loading = ref(false)
const error = ref(null)

// ─── Members / Socios ───────────────────────────────────────
const members = ref([])
const selectedMemberId = ref(null)
const selectedMember = computed(
  () => members.value.find(m => m.id === selectedMemberId.value) || members.value[0] || null,
)

const memberColors = ['#fdcb6e', '#00cec9', '#e17055', '#6c5ce7', '#00b894', '#0984e3', '#d63031', '#e84393']

function getInitials(name) {
  return (name || '?')
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}

async function fetchMembers() {
  const { data } = await api.get('/admin/members')
  members.value = (data || []).map((m, i) => ({
    id: m.id,
    name: m.nombre,
    email: m.correo,
    telefono: m.telefono,
    membership: 'Cliente',
    membershipColor: memberColors[i % memberColors.length],
    initials: getInitials(m.nombre),
    reservations: [],
    payments: { balance: null, lastPayment: null, lastPaymentDate: null, status: '—' },
    guests: [],
    events: [],
    history: [],
    benefits: [],
    news: [],
  }))
  if (members.value.length && selectedMemberId.value == null) {
    selectedMemberId.value = members.value[0].id
  }
}

async function loadMemberDetail(id) {
  try {
    const { data } = await api.get(`/admin/members/${id}`)
    const m = members.value.find(x => x.id === id)
    if (!m || !data) return

    const reservations = []
    ;(data.reservas_hotel || []).forEach(r => reservations.push({
      id: `hotel-${r.id}`,
      service: 'Hotel',
      date: dateOf(r.entrada),
      time: '—',
      guests: r.personas,
      status: normalizeStatus(r.estado),
    }))
    ;(data.reservas_restaurante || []).forEach(r => reservations.push({
      id: `rest-${r.id}`,
      service: 'Restaurante',
      date: dateOf(r.fecha),
      time: timeOf(r.hora),
      guests: r.personas,
      status: normalizeStatus(r.estado),
    }))
    ;(data.reservas_evento || []).forEach(r => reservations.push({
      id: `evento-${r.id}`,
      service: 'Evento',
      date: dateOf(r.fecha),
      time: '—',
      guests: r.personas,
      status: normalizeStatus(r.estado),
    }))

    m.reservations = reservations
    m.events = (data.reservas_evento || []).map(r => ({
      id: `evento-${r.id}`,
      name: r.tipo,
      date: dateOf(r.fecha),
      time: '—',
      location: r.salon,
      rsvp: normalizeStatus(r.estado),
    }))
    m.history = (data.facturas || []).map(f => ({
      date: dateOf(f.fecha),
      action: `Factura Nº ${f.id}`,
      amount: f.total,
    }))
    m.payments = {
      ...m.payments,
      lastPaymentDate: m.history[0]?.date ?? null,
    }
  } catch {
    // Detalle no disponible; se conservan los datos base.
  }
}

watch(selectedMemberId, (id) => {
  if (id != null) loadMemberDetail(id)
})

// ─── Cambiar correo de un usuario (admin) ───────────────────
const emailSaving = ref(false)
const emailError = ref('')
const emailSuccess = ref('')

async function updateMemberEmail(id, correo) {
  emailSaving.value = true
  emailError.value = ''
  emailSuccess.value = ''
  try {
    const { data } = await api.patch(`/admin/members/${id}`, { correo })
    const updated = data?.correo ?? correo
    const m = members.value.find(x => x.id === id)
    if (m) m.email = updated
    emailSuccess.value = 'Correo actualizado correctamente.'
    return { ok: true, correo: updated }
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      'No se pudo actualizar el correo. Inténtalo de nuevo.'
    emailError.value = Array.isArray(msg) ? msg.join(', ') : msg
    return { ok: false, message: emailError.value }
  } finally {
    emailSaving.value = false
  }
}

// ─── Calendar Events ────────────────────────────────────────
const calendarEvents = ref([])

const calendarFilters = ref({
  torneos: true,
  eventos: true,
  reservas: true,
  mantenimiento: true,
  horarios: true,
})

const filteredCalendarEvents = computed(() => {
  return calendarEvents.value.filter(ev => calendarFilters.value[ev.category])
})

const categoryLabels = { torneos: 'Torneos', eventos: 'Eventos', reservas: 'Reservas', mantenimiento: 'Mantenimiento', horarios: 'Especiales' }

async function fetchCalendarEvents() {
  const { data } = await api.get('/admin/calendar/events')
  calendarEvents.value = (data || []).map(e => ({
    id: String(e.id),
    title: e.title,
    date: e.date,
    time: e.time,
    location: e.location,
    category: e.category,
    color: e.color,
  }))
}

// ─── Today's Reservations ───────────────────────────────────
const todayReservations = ref([])

async function fetchTodayReservations() {
  const { data } = await api.get('/admin/reservations/today')
  const rows = []
  ;(data.hotel || []).forEach(r => rows.push({
    id: `hotel-${r.id}`,
    client: r.cliente,
    service: 'Hotel',
    time: '—',
    guests: r.personas,
    phone: r.telefono ?? '—',
    notes: r.habitacion ? `Hab ${r.habitacion}` : '—',
    status: normalizeStatus(r.estado),
  }))
  ;(data.restaurante || []).forEach(r => rows.push({
    id: `rest-${r.id}`,
    client: r.cliente,
    service: 'Restaurante',
    time: timeOf(r.hora),
    guests: r.personas,
    phone: r.telefono ?? '—',
    notes: r.mesa ? `Mesa ${r.mesa}` : '—',
    status: normalizeStatus(r.estado),
  }))
  ;(data.eventos || []).forEach(r => rows.push({
    id: `evento-${r.id}`,
    client: r.cliente,
    service: 'Evento',
    time: timeOf(r.hora_inicio),
    guests: r.personas,
    phone: r.telefono ?? '—',
    notes: r.salon || '—',
    status: normalizeStatus(r.estado),
  }))
  rows.sort((a, b) => a.time.localeCompare(b.time))
  todayReservations.value = rows
}

const todayReservationCount = computed(() => todayReservations.value.length)
const todayConfirmedCount = computed(() => todayReservations.value.filter(r => r.status === 'confirmada' || r.status === 'check-in').length)
const todayPendingCount = computed(() => todayReservations.value.filter(r => r.status === 'pendiente').length)

// ─── Income Data ────────────────────────────────────────────
const summary = ref(null)
const incomeSeries = ref({ diario: null, semanal: null, mensual: null })

const incomePeriodSelector = ref('mensual')

const incomeChartData = computed(() => {
  const s = incomeSeries.value[incomePeriodSelector.value]
  if (!s || !s.labels || !s.labels.length) return { labels: [], current: [], previous: [] }
  const vals = s.values || []
  const previous = vals.map((_, i) => (i === 0 ? 0 : vals[i - 1]))
  return { labels: s.labels, current: vals, previous }
})

const incomePeriods = computed(() => {
  const last = arr => (arr && arr.length ? arr[arr.length - 1] : 0)
  const pct = (a, b) => (b > 0 ? Math.round(((a - b) / b) * 1000) / 10 : 0)
  const dVals = incomeSeries.value.diario?.values || []
  const sVals = incomeSeries.value.semanal?.values || []
  const mVals = incomeSeries.value.mensual?.values || []
  return {
    daily: summary.value?.ingresos_hoy ?? last(dVals),
    weekly: last(sVals),
    monthly: last(mVals),
    dailyChange: dVals.length > 1 ? pct(dVals[dVals.length - 1], dVals[dVals.length - 2]) : 0,
    weeklyChange: sVals.length > 1 ? pct(sVals[sVals.length - 1], sVals[sVals.length - 2]) : 0,
    monthlyChange: mVals.length > 1 ? pct(mVals[mVals.length - 1], mVals[mVals.length - 2]) : 0,
  }
})

async function fetchSummary() {
  const { data } = await api.get('/admin/summary')
  summary.value = data
}

async function fetchIncome() {
  const [diario, semanal, mensual] = await Promise.all([
    api.get('/admin/income', { params: { period: 'diario' } }),
    api.get('/admin/income', { params: { period: 'semanal' } }),
    api.get('/admin/income', { params: { period: 'mensual' } }),
  ])
  incomeSeries.value = {
    diario: diario.data,
    semanal: semanal.data,
    mensual: mensual.data,
  }
}

// ─── Services Ranking ───────────────────────────────────────
const topServices = ref([])

async function fetchTopServices() {
  const { data } = await api.get('/admin/services/top')
  const icons = { Hotel: 'hotel', Restaurante: 'restaurant', Eventos: 'events' }
  topServices.value = (data || []).map(s => ({
    name: s.name,
    bookings: s.bookings,
    percentage: s.percentage,
    icon: icons[s.name] || 'bars',
    revenue: null,
    change: '',
  }))
}

// ─── Peak Hours ─────────────────────────────────────────────
const peakHours = ref([])

const maxPeakCustomers = computed(() => Math.max(...peakHours.value.map(p => p.customers), 0))

async function fetchPeakHours() {
  const { data } = await api.get('/admin/restaurant/peak-hours')
  peakHours.value = (data.labels || []).map((h, i) => ({
    hour: h,
    label: h.slice(0, 2),
    customers: data.values?.[i] ?? 0,
  }))
}

// ─── Top Rooms ──────────────────────────────────────────────
const topRooms = ref([])

const maxRoomReservations = computed(() => Math.max(...topRooms.value.map(r => r.reservations), 0))

async function fetchTopRooms() {
  const { data } = await api.get('/admin/rooms/top')
  topRooms.value = (data || []).map(r => ({
    name: r.nombre,
    code: r.nombre,
    reservations: r.reservas,
    revenue: r.ingresos,
    occupancy: r.ocupacion_porcentaje,
    type: r.tipo || '—',
  }))
}

// ─── Upcoming Events ────────────────────────────────────────
const upcomingEvents = ref([])

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

async function fetchUpcomingEvents() {
  const { data } = await api.get('/admin/events/upcoming')
  upcomingEvents.value = (data || []).map(e => ({
    id: e.id,
    name: e.nombre,
    date: dateOf(e.fecha),
    time: timeOf(e.hora_inicio),
    attendees: e.asistentes,
    location: e.salon,
    organizer: e.cliente,
    type: normalizeStatus(e.estado),
  }))
}

// ─── Hotel Occupancy ────────────────────────────────────────
const hotelOccupancy = ref({
  current: 0,
  available: 0,
  totalRooms: 0,
  occupiedRooms: 0,
  changeFromLastWeek: 0,
  historical: [],
})

async function fetchOccupancy() {
  const { data } = await api.get('/admin/hotel/occupancy')
  const hist = data.historico_14_dias || []
  let change = 0
  if (hist.length >= 2 && hist[0] > 0) {
    change = Math.round(((hist[hist.length - 1] - hist[0]) / hist[0]) * 1000) / 10
  }
  hotelOccupancy.value = {
    current: data.actual,
    occupiedRooms: data.ocupadas,
    totalRooms: data.totales,
    available: data.disponibles,
    changeFromLastWeek: change,
    historical: hist,
  }
}

// ─── Comparative Data ───────────────────────────────────────
const comparativeIncome = ref({
  currentYear: [],
  previousYear: [],
  labels: [],
})

const maxComparIncome = computed(() => {
  const all = [...comparativeIncome.value.currentYear, ...comparativeIncome.value.previousYear]
  return Math.max(...all, 0)
})

async function fetchComparativeIncome() {
  const { data } = await api.get('/admin/comparative/income')
  comparativeIncome.value = {
    labels: data.labels || [],
    currentYear: data.year_actual || [],
    previousYear: data.year_anterior || [],
  }
}

// ─── Helpers ────────────────────────────────────────────────
function normalizeStatus(s) {
  if (!s) return '—'
  const map = {
    CONFIRMADA: 'confirmada',
    CONFIRMED: 'confirmada',
    CHECK_IN: 'check-in',
    CHECKIN: 'check-in',
    CHECK_OUT: 'check-out',
    CHECKOUT: 'check-out',
    PENDIENTE: 'pendiente',
    CANCELADA: 'cancelada',
    COMPLETADA: 'completada',
  }
  return map[s] || String(s).toLowerCase()
}

function dateOf(v) {
  if (!v) return '—'
  const s = String(v)
  return s.length >= 10 ? s.slice(0, 10) : s
}

function timeOf(v) {
  if (!v) return '—'
  const s = String(v)
  if (s.length === 8 && s[2] === ':') return s.slice(0, 5)
  return s.length >= 16 ? s.slice(11, 16) : s
}

function formatCurrency(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function statusBadgeClass(status) {
  const map = {
    'confirmada': 'lux-status-confirmed',
    'check-in': 'lux-status-checkin',
    'check-out': 'lux-status-checkout',
    'pendiente': 'lux-status-pending',
    'cancelada': 'lux-status-cancelled',
  }
  return map[status] || ''
}

function eventTypeBadgeClass(type) {
  const map = {
    'conferencia': 'lux-event-conferencia',
    'boda': 'lux-event-boda',
    'seminario': 'lux-event-seminario',
    'gala': 'lux-event-gala',
    'taller': 'lux-event-taller',
    'concierto': 'lux-event-concierto',
  }
  return map[type] || ''
}

function getBarHeight(val, max) {
  if (!max) return 0
  return (val / max) * 100
}

function getComparBarHeight(val, max) {
  return (val / max) * 100
}

// ─── Calendar helpers ───────────────────────────────────────
const calendarMonth = ref(new Date().getMonth())
const calendarYear = ref(new Date().getFullYear())

const calendarGrid = computed(() => {
  const firstDay = new Date(calendarYear.value, calendarMonth.value, 1)
  const lastDay = new Date(calendarYear.value, calendarMonth.value + 1, 0)
  const startPad = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const cells = []
  for (let i = 0; i < startPad; i++) cells.push({ day: null, events: [] })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayEvents = filteredCalendarEvents.value.filter(e => e.date === dateStr)
    cells.push({ day: d, date: dateStr, events: dayEvents, isToday: isToday(dateStr) })
  }
  return cells
})

function isToday(dateStr) {
  const t = new Date()
  const today = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  return dateStr === today
}

function prevMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

const calendarTitle = computed(() => `${monthNames[calendarMonth.value]} ${calendarYear.value}`)

const selectedCalendarEvent = ref(null)
function openCalendarEvent(ev) { selectedCalendarEvent.value = ev }
function closeCalendarEvent() { selectedCalendarEvent.value = null }

// ─── Module tab state ───────────────────────────────────────
const activeModule = ref('panel')
const activeSubTab = ref('resumen')

const moduleContextMessages = {
  panel: 'Panel General — Visualiza todas las métricas y estadísticas del club en un solo lugar.',
  calendario: 'Calendario Integral — Gestión de eventos, torneos, reservas y mantenimiento.',
  socio: 'Panel del Socio — Información personalizada y detallada de cada miembro del club.',
}

const contextMessage = computed(() => moduleContextMessages[activeModule.value])

// ─── Data loading ───────────────────────────────────────────
async function loadAll() {
  loading.value = true
  error.value = null
  const results = await Promise.allSettled([
    fetchSummary(),
    fetchTodayReservations(),
    fetchIncome(),
    fetchTopServices(),
    fetchPeakHours(),
    fetchTopRooms(),
    fetchUpcomingEvents(),
    fetchOccupancy(),
    fetchComparativeIncome(),
    fetchCalendarEvents(),
    fetchMembers(),
  ])
  if (results.some(r => r.status === 'rejected')) {
    error.value = 'No se pudieron cargar algunos datos del panel. Revisa tu conexión e inténtalo de nuevo.'
  }
  loading.value = false
}

function retry() {
  loadAll()
}

export function usePanelAdmin() {
  return {
    activeModule, activeSubTab, contextMessage,
    loading, error, retry,
    members, selectedMemberId, selectedMember,
    emailSaving, emailError, emailSuccess, updateMemberEmail,
    calendarFilters, categoryLabels, calendarGrid, calendarTitle,
    prevMonth, nextMonth, selectedCalendarEvent, openCalendarEvent, closeCalendarEvent,
    todayReservations, todayReservationCount, todayConfirmedCount, todayPendingCount,
    incomePeriods, incomePeriodSelector, incomeChartData,
    topServices, peakHours, maxPeakCustomers,
    topRooms, maxRoomReservations,
    upcomingEvents, monthNames,
    hotelOccupancy,
    comparativeIncome, maxComparIncome,
    formatCurrency, statusBadgeClass, eventTypeBadgeClass,
    getBarHeight, getComparBarHeight,
  }
}
