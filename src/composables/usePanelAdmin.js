import { ref, computed } from 'vue'
import api from './useApi.js'
import { useTasks } from './useTasks.js'

const {
  tasks, employees, selectedDate, showTaskModal, editingTask,
  taskLoading, taskError, tasksForSelectedDate, tasksByDate,
  fetchTasks, fetchEmployees, createTask, updateTask, deleteTask,
  openTaskModal, openEditTaskModal, closeTaskModal,
} = useTasks()

// ─── Loading & Error ────────────────────────────────────────
const loading = ref(false)
const error = ref(null)

// ─── Task Filters (Admin module) ───────────────────────────
const taskFilterEstado = ref('')
const taskFilterPrioridad = ref('')
const taskFilterEmpleado = ref(null)

const filteredTasks = computed(() => {
  let list = tasks.value.filter(t => {
    if (taskFilterEstado.value && t.estado !== taskFilterEstado.value) return false
    if (taskFilterPrioridad.value && t.prioridad !== taskFilterPrioridad.value) return false
    if (taskFilterEmpleado.value && String(t.asignado_a?.id) !== String(taskFilterEmpleado.value)) return false
    return true
  })
  list.sort((a, b) => {
    const estadoOrder = { PENDIENTE: 0, EN_PROGRESO: 1, COMPLETADA: 2, CANCELADA: 3 }
    const prioridadOrder = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAJA: 3 }
    const eo = (estadoOrder[a.estado] ?? 4) - (estadoOrder[b.estado] ?? 4)
    if (eo !== 0) return eo
    return (prioridadOrder[a.prioridad] ?? 4) - (prioridadOrder[b.prioridad] ?? 4)
  })
  return list
})

function priorityLabel(p) {
  const map = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', URGENTE: 'Urgente' }
  return map[p] || p
}

function priorityColor(p) {
  const map = { BAJA: '#00b894', MEDIA: '#fdcb6e', ALTA: '#e17055', URGENTE: '#d63031' }
  return map[p] || '#fdcb6e'
}

function estadoLabel(e) {
  const map = { PENDIENTE: 'Pendiente', EN_PROGRESO: 'En Progreso', COMPLETADA: 'Completada', CANCELADA: 'Cancelada' }
  return map[e] || e
}

function estadoColor(e) {
  const map = { PENDIENTE: '#fdcb6e', EN_PROGRESO: '#0984e3', COMPLETADA: '#00b894', CANCELADA: '#d63031' }
  return map[e] || '#fdcb6e'
}

function openNewTaskFromModule() {
  editingTask.value = null
  selectedDate.value = new Date().toISOString().slice(0, 10)
  showTaskModal.value = true
}

// ─── Members / Socios ───────────────────────────────────────
const members = ref([])
const selectedMemberId = ref(null)
const selectedMember = computed(
  () => members.value.find(m => m.id === selectedMemberId.value) || null,
)
const memberSearch = ref('')
const memberPage = ref(1)
const MEMBERS_PER_PAGE = 10
const showMemberModal = ref(false)

function openMemberModal(id) {
  selectedMemberId.value = id
  showMemberModal.value = true
}

function closeMemberModal() {
  showMemberModal.value = false
}

const filteredMembers = computed(() => {
  const q = memberSearch.value.trim().toLowerCase()
  if (!q) return members.value
  return members.value.filter(m =>
    (m.name || '').toLowerCase().includes(q) ||
    (m.email || '').toLowerCase().includes(q) ||
    (m.telefono || '').toLowerCase().includes(q)
  )
})

const memberTotalPages = computed(() => Math.max(1, Math.ceil(filteredMembers.value.length / MEMBERS_PER_PAGE)))

const paginatedMembers = computed(() => {
  const start = (memberPage.value - 1) * MEMBERS_PER_PAGE
  return filteredMembers.value.slice(start, start + MEMBERS_PER_PAGE)
})

import { watch as vueWatch } from 'vue'
vueWatch(memberSearch, () => { memberPage.value = 1 })

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
    payments: { totalFacturado: 0, invoices: [] },
    events: [],
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
      location: r.salon,
      rsvp: normalizeStatus(r.estado),
    }))
    const totalFacturado = (data.facturas || []).reduce((sum, f) => sum + (Number(f.total) || 0), 0)
    m.payments = {
      totalFacturado,
      invoices: (data.facturas || []).map(f => ({
        id: f.id,
        date: dateOf(f.fecha),
        amount: f.total,
        status: normalizeStatus(f.estado),
      })),
    }
  } catch {
    // Detalle no disponible
  }
}

vueWatch(selectedMemberId, (id) => {
  if (id != null) loadMemberDetail(id)
})

// ─── Day Overview (Calendar click → emergent screen) ────────
const showDayOverview = ref(false)
const selectedDayDate = ref(null)
const dayOverviewLoading = ref(false)
const dayOverviewData = ref({ tasks: [], reservations: [], events: [] })

function openDayOverview(dateStr) {
  selectedDayDate.value = dateStr
  showDayOverview.value = true
  fetchDayOverview(dateStr)
}

function closeDayOverview() {
  showDayOverview.value = false
  selectedDayDate.value = null
  dayOverviewData.value = { tasks: [], reservations: [], events: [] }
}

async function fetchDayOverview(dateStr) {
  dayOverviewLoading.value = true
  try {
    const [tasksRes, reservationsRes, eventsRes] = await Promise.allSettled([
      api.get('/admin/tasks', { params: { fecha: dateStr } }),
      api.get('/admin/reservations/today', { params: { fecha: dateStr } }),
      api.get('/admin/calendar/events'),
    ])

    const dayTasks = tasksRes.status === 'fulfilled'
      ? (tasksRes.value.data || []).map(t => ({
          id: t.id,
          titulo: t.titulo,
          descripcion: t.descripcion,
          hora_inicio: t.hora_inicio,
          hora_fin: t.hora_fin,
          estado: t.estado,
          prioridad: t.prioridad,
          asignado_a: t.asignado_a,
        }))
      : []

    const reservations = []
    if (reservationsRes.status === 'fulfilled') {
      const data = reservationsRes.value.data
      ;(data.hotel || []).forEach(r => reservations.push({
        id: `hotel-${r.id}`,
        tipo: 'Hotel',
        cliente: r.cliente,
        hora: r.habitacion ? `Hab ${r.habitacion}` : '—',
        personas: r.personas,
        estado: r.estado,
      }))
      ;(data.restaurante || []).forEach(r => reservations.push({
        id: `rest-${r.id}`,
        tipo: 'Restaurante',
        cliente: r.cliente,
        hora: r.hora || '—',
        personas: r.personas,
        estado: r.estado,
      }))
      ;(data.eventos || []).forEach(r => reservations.push({
        id: `evento-${r.id}`,
        tipo: 'Evento',
        cliente: r.cliente,
        hora: r.hora_inicio || '—',
        personas: r.personas,
        estado: r.estado,
      }))
    }

    const dayEvents = eventsRes.status === 'fulfilled'
      ? (eventsRes.value.data || []).filter(e => e.date === dateStr && e.category === 'eventos').map(e => ({
          id: String(e.id),
          titulo: e.title,
          hora: e.time,
          ubicacion: e.location,
          categoria: e.category,
          color: e.color,
        }))
      : []

    dayOverviewData.value = { tasks: dayTasks, reservations, events: dayEvents }
  } catch {
    dayOverviewData.value = { tasks: [], reservations: [], events: [] }
  } finally {
    dayOverviewLoading.value = false
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

const filterColors = {
  torneos: '#00cec9',
  eventos: '#6c5ce7',
  reservas: '#fdcb6e',
  mantenimiento: '#e17055',
  horarios: '#00b894',
}

function getFilterColor(cat) {
  return filterColors[cat] || '#00cec9'
}

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
  topServices.value = (data || []).map(s => ({
    name: s.name,
    bookings: s.bookings,
    percentage: s.percentage,
    change: '',
  }))
}

// ─── Hotel Occupancy ────────────────────────────────────────
const hotelOccupancy = ref({
  current: 0,
  available: 0,
  totalRooms: 0,
  occupiedRooms: 0,
  changeFromLastWeek: 0,
})

async function fetchOccupancy() {
  const { data } = await api.get('/admin/hotel/occupancy')
  let change = 0
  if (data.historico_14_dias?.length >= 2 && data.historico_14_dias[0] > 0) {
    const hist = data.historico_14_dias
    change = Math.round(((hist[hist.length - 1] - hist[0]) / hist[0]) * 1000) / 10
  }
  hotelOccupancy.value = {
    current: data.actual,
    occupiedRooms: data.ocupadas,
    totalRooms: data.totales,
    available: data.disponibles,
    changeFromLastWeek: change,
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
    EN_PROGRESO: 'en progreso',
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

function getBarHeight(val, max) {
  if (!max) return 0
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
  for (let i = 0; i < startPad; i++) cells.push({ day: null, events: [], hasTasks: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayEvents = filteredCalendarEvents.value.filter(e => e.date === dateStr)
    const dayTasks = tasksByDate.value[dateStr] || []
    cells.push({ day: d, date: dateStr, events: dayEvents, tasks: dayTasks, hasTasks: dayTasks.length > 0, isToday: isToday(dateStr) })
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

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const calendarTitle = computed(() => `${monthNames[calendarMonth.value]} ${calendarYear.value}`)

// ─── Module tab state ───────────────────────────────────────
const activeModule = ref('panel')

const moduleContextMessages = {
  panel: 'Panel General — Visualiza las métricas y reservas del día en un solo lugar.',
  calendario: 'Calendario — Visualiza la agenda del club. Haz clic en un día para ver todos los eventos.',
  tareas: 'Tareas — Gestiona y asigna tareas a los empleados del club.',
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
    fetchOccupancy(),
    fetchCalendarEvents(),
    fetchTasks(),
    fetchEmployees(),
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
    activeModule, contextMessage,
    loading, error, retry,
    calendarFilters, categoryLabels, filterColors, getFilterColor, calendarGrid, calendarTitle,
    prevMonth, nextMonth,
    todayReservations, todayReservationCount, todayConfirmedCount, todayPendingCount,
    incomePeriods, incomePeriodSelector, incomeChartData,
    topServices,
    hotelOccupancy,
    monthNames,
    formatCurrency, statusBadgeClass, normalizeStatus, getBarHeight,
    showDayOverview, selectedDayDate, dayOverviewLoading, dayOverviewData,
    openDayOverview, closeDayOverview, fetchDayOverview,
    tasks, employees, selectedDate, showTaskModal, editingTask,
    taskLoading, taskError, tasksForSelectedDate, tasksByDate,
    fetchTasks, createTask, updateTask, deleteTask,
    openTaskModal, openEditTaskModal, closeTaskModal,
    taskFilterEstado, taskFilterPrioridad, taskFilterEmpleado,
    filteredTasks, priorityLabel, priorityColor, estadoLabel, estadoColor,
    openNewTaskFromModule,
    members, selectedMemberId, selectedMember,
    memberSearch, memberPage, memberTotalPages, filteredMembers, paginatedMembers, MEMBERS_PER_PAGE,
    showMemberModal, openMemberModal, closeMemberModal,
  }
}
