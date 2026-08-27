import { ref, computed, watch } from 'vue'
import { formatCop } from './useUtils.js'
import api from './useApi.js'
import { useTasks } from './useTasks.js'
import { useEmployees } from './useEmployees.js'

const {
  tasks, selectedDate, showTaskModal, editingTask,
  taskLoading, taskError, tasksForSelectedDate, tasksByDate,
  fetchTasks, createTask, updateTask, deleteTask,
  openTaskModal, openEditTaskModal, closeTaskModal,
} = useTasks()

const { employees, fetchEmployees } = useEmployees()

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
    activo: m.activo !== false,
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

// ─── Miembros: Crear / Editar / Desactivar ─────────────────
const showMemberForm = ref(false)
const editingMember = ref(null)
const newMember = ref({ nombre: '', correo: '', telefono: '', tipo_documento: 'CC', numero_documento: '', password: '' })
const memberFormError = ref('')
const memberFormSaving = ref(false)

const MEMBER_DOC_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'NIT', label: 'NIT' },
  { value: 'CD', label: 'Carné Diplomático' },
]

function openNewMember() {
  editingMember.value = null
  newMember.value = { nombre: '', correo: '', telefono: '', tipo_documento: 'CC', numero_documento: '', password: '' }
  memberFormError.value = ''
  showMemberForm.value = true
}

function openEditMember(m) {
  editingMember.value = { ...m }
  newMember.value = {
    nombre: m.nombre || '',
    correo: m.correo || '',
    telefono: m.telefono || '',
    tipo_documento: m.tipo_documento || 'CC',
    numero_documento: m.numero_documento || '',
    password: '',
  }
  memberFormError.value = ''
  showMemberForm.value = true
}

function closeMemberForm() {
  showMemberForm.value = false
  editingMember.value = null
}

async function createMember() {
  memberFormSaving.value = true
  memberFormError.value = ''
  try {
    await api.post('/admin/members', {
      nombre: newMember.value.nombre.trim(),
      correo: newMember.value.correo.trim(),
      telefono: newMember.value.telefono.trim() || null,
      tipo_documento: newMember.value.tipo_documento,
      numero_documento: newMember.value.numero_documento.trim() || null,
      password: newMember.value.password || null,
    })
    closeMemberForm()
    await fetchMembers()
  } catch (e) {
    memberFormError.value = e?.response?.data?.message || 'Error al crear el miembro.'
  } finally {
    memberFormSaving.value = false
  }
}

async function updateMember() {
  memberFormSaving.value = true
  memberFormError.value = ''
  try {
    const payload = {
      nombre: newMember.value.nombre.trim(),
      correo: newMember.value.correo.trim(),
      telefono: newMember.value.telefono.trim() || null,
      tipo_documento: newMember.value.tipo_documento,
      numero_documento: newMember.value.numero_documento.trim() || null,
    }
    if (newMember.value.password) payload.password = newMember.value.password
    await api.patch(`/admin/members/${editingMember.value.id}`, payload)
    closeMemberForm()
    await fetchMembers()
    if (selectedMemberId.value != null) await loadMemberDetail(selectedMemberId.value)
  } catch (e) {
    memberFormError.value = e?.response?.data?.message || 'Error al actualizar el miembro.'
  } finally {
    memberFormSaving.value = false
  }
}

async function toggleMemberStatus(m) {
  const action = m.activo ? 'desactivar' : 'activar'
  if (!confirm(`¿Estás seguro de ${action} a ${m.name}?`)) return
  try {
    await api.patch(`/admin/members/${m.id}/status`, { activo: !m.activo })
    m.activo = !m.activo
  } catch (e) {
    alert(e?.response?.data?.message || `No se pudo ${action} al miembro.`)
  }
}

// ─── Reservas: listado completo + gestión ────────────────────
const allReservations = ref([])
const reservationsLoading = ref(false)
const reservationsError = ref(null)
const reservationTypeFilter = ref('all')
const reservationStatusFilter = ref('all')
const reservationSearch = ref('')
const reservationPage = ref(1)
const RESERVATIONS_PER_PAGE = 15
const changingReservationId = ref(null)
const reservationActionError = ref('')

const RESERVATION_STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'check-in', label: 'Check-In' },
  { value: 'check-out', label: 'Check-Out' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
]

const reservationStatusOptions = computed(() => {
  const known = new Set(RESERVATION_STATUS_OPTIONS.map(o => o.value))
  const extra = []
  allReservations.value.forEach(r => {
    if (r.estado && r.estado !== '—' && !known.has(r.estado)) {
      known.add(r.estado)
      extra.push({ value: r.estado, label: r.estado.charAt(0).toUpperCase() + r.estado.slice(1) })
    }
  })
  return [...RESERVATION_STATUS_OPTIONS, ...extra]
})

function normalizeAdminReservation(tipo, r) {
  const base = {
    id: r.id,
    cliente: r.cliente || r.nombre || '—',
    telefono: r.telefono ?? '—',
    personas: r.personas ?? r.cantidad_personas ?? r.cantidad_huespedes ?? 1,
    estadoRaw: r.estado,
    estado: normalizeStatus(r.estado),
  }
  if (tipo === 'hotel') {
    return {
      ...base,
      key: `hotel-${r.id}`,
      tipoKey: 'hotel',
      tipo: 'Hotel',
      fecha: dateOf(r.entrada || r.fecha_entrada),
      fechaFin: dateOf(r.salida || r.fecha_salida),
      hora: '—',
      detalle: r.habitacion ? `Hab ${r.habitacion}` : (r.tipo_habitacion ? r.tipo_habitacion : '—'),
    }
  }
  if (tipo === 'restaurante') {
    return {
      ...base,
      key: `rest-${r.id}`,
      tipoKey: 'restaurante',
      tipo: 'Restaurante',
      fecha: dateOf(r.fecha),
      fechaFin: '',
      hora: timeOf(r.hora),
      detalle: r.mesa ? `Mesa ${r.mesa}` : '—',
    }
  }
  return {
    ...base,
    key: `evento-${r.id}`,
    tipoKey: 'eventos',
    tipo: 'Evento',
    fecha: dateOf(r.fecha),
    fechaFin: '',
    hora: timeOf(r.hora_inicio),
    detalle: r.salon || '—',
  }
}

async function fetchAllReservations() {
  reservationsLoading.value = true
  reservationsError.value = null
  try {
    const { data } = await api.get('/admin/reservations')
    const rows = []
    ;(data.hotel || []).forEach(r => rows.push(normalizeAdminReservation('hotel', r)))
    ;(data.restaurante || []).forEach(r => rows.push(normalizeAdminReservation('restaurante', r)))
    ;(data.eventos || []).forEach(r => rows.push(normalizeAdminReservation('eventos', r)))
    rows.sort((a, b) => {
      if (a.estado === 'cancelada' && b.estado !== 'cancelada') return 1
      if (a.estado !== 'cancelada' && b.estado === 'cancelada') return -1
      const d = (b.fecha || '').localeCompare(a.fecha || '')
      return d || (b.hora || '').localeCompare(a.hora || '')
    })
    allReservations.value = rows
  } catch {
    reservationsError.value = 'No se pudieron cargar las reservas.'
  } finally {
    reservationsLoading.value = false
  }
}

const filteredReservations = computed(() => {
  let list = allReservations.value
  if (reservationTypeFilter.value !== 'all') {
    list = list.filter(r => r.tipoKey === reservationTypeFilter.value)
  }
  if (reservationStatusFilter.value !== 'all') {
    list = list.filter(r => r.estado === reservationStatusFilter.value)
  }
  const q = reservationSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter(r =>
      (r.cliente || '').toLowerCase().includes(q) ||
      (r.detalle || '').toLowerCase().includes(q) ||
      String(r.id).includes(q)
    )
  }
  return list
})

const reservationTotalPages = computed(() => Math.max(1, Math.ceil(filteredReservations.value.length / RESERVATIONS_PER_PAGE)))

const paginatedReservations = computed(() => {
  const start = (reservationPage.value - 1) * RESERVATIONS_PER_PAGE
  return filteredReservations.value.slice(start, start + RESERVATIONS_PER_PAGE)
})

vueWatch(reservationSearch, () => { reservationPage.value = 1 })

async function changeReservationStatus(r, estado) {
  if (estado === r.estado) return
  changingReservationId.value = r.key
  reservationActionError.value = ''
  try {
    const { data } = await api.patch(`/admin/reservations/${r.tipoKey}/${r.id}/status`, { estado: String(estado).toUpperCase() })
    r.estado = normalizeStatus(data?.estado ?? estado)
  } catch (e) {
    reservationActionError.value = e?.response?.data?.message || 'No se pudo cambiar el estado de la reserva.'
  } finally {
    changingReservationId.value = null
  }
}

async function cancelAdminReservation(r) {
  if (!confirm(`¿Cancelar la reserva de ${r.cliente} (${r.tipo})?`)) return
  changingReservationId.value = r.key
  reservationActionError.value = ''
  try {
    await api.patch(`/admin/reservations/${r.tipoKey}/${r.id}/cancel`)
    r.estado = 'cancelada'
  } catch (e) {
    reservationActionError.value = e?.response?.data?.message || 'No se pudo cancelar la reserva.'
  } finally {
    changingReservationId.value = null
  }
}

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
  return formatCop(value)
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

// ─── Habitaciones ────────────────────────────────────────────
const rooms = ref([])
const roomTypes = ref([])
const roomsLoading = ref(false)
const roomsError = ref(null)
const showRoomForm = ref(false)
const editingRoom = ref(null)
const newRoom = ref({ numero: '', tipo_id: '', piso: '', capacidad: '', precio_noche: '', imagen_url: '' })
const roomFormError = ref('')
const roomFormSaving = ref(false)

async function fetchRooms() {
  roomsLoading.value = true
  roomsError.value = null
  try {
    const [roomsRes, typesRes] = await Promise.all([
      api.get('/admin/rooms'),
      api.get('/admin/room-types'),
    ])
    rooms.value = roomsRes.data || []
    roomTypes.value = typesRes.data || []
  } catch {
    roomsError.value = 'No se pudieron cargar las habitaciones.'
  } finally {
    roomsLoading.value = false
  }
}

function onTipoChange() {
  const tipo = roomTypes.value.find((t) => String(t.id) === String(newRoom.value.tipo_id))
  newRoom.value.capacidad = tipo?.capacidad ?? ''
  newRoom.value.precio_noche = tipo?.precio_noche ?? ''
}

async function syncRoomTypeData() {
  const tipo = roomTypes.value.find((t) => String(t.id) === String(newRoom.value.tipo_id))
  if (!tipo) return
  const data = {}
  if (newRoom.value.precio_noche !== '' && Number(newRoom.value.precio_noche) !== Number(tipo.precio_noche)) {
    data.precio_noche = Number(newRoom.value.precio_noche)
  }
  if (newRoom.value.capacidad !== '' && Number(newRoom.value.capacidad) !== Number(tipo.capacidad)) {
    data.capacidad = Number(newRoom.value.capacidad)
  }
  if (Object.keys(data).length === 0) return
  await api.patch(`/admin/room-types/${tipo.id}`, data)
}

async function createRoom() {
  roomFormSaving.value = true
  roomFormError.value = ''
  try {
    const { data: created } = await api.post('/admin/rooms', {
      numero: newRoom.value.numero,
      piso: Number(newRoom.value.piso),
      tipo_id: Number(newRoom.value.tipo_id),
      imagen_url: newRoom.value.imagen_url || null,
    })
    await syncRoomTypeData()
    await persistPendingGallery('habitacion', created?.id)
    showRoomForm.value = false
    resetRoomForm()
    await fetchRooms()
  } catch (e) {
    roomFormError.value = e?.response?.data?.message || 'Error al crear la habitación.'
  } finally {
    roomFormSaving.value = false
  }
}

async function updateRoom() {
  roomFormSaving.value = true
  roomFormError.value = ''
  try {
    await api.patch(`/admin/rooms/${editingRoom.value.id}`, {
      numero: newRoom.value.numero,
      piso: Number(newRoom.value.piso),
      tipo_id: Number(newRoom.value.tipo_id),
      imagen_url: newRoom.value.imagen_url || null,
    })
    await syncRoomTypeData()
    showRoomForm.value = false
    resetRoomForm()
    await fetchRooms()
  } catch (e) {
    roomFormError.value = e?.response?.data?.message || 'Error al actualizar la habitación.'
  } finally {
    roomFormSaving.value = false
  }
}

async function deleteRoom(id) {
  if (!confirm('¿Eliminar esta habitación?')) return
  try {
    await api.delete(`/admin/rooms/${id}`)
    await fetchRooms()
  } catch (e) {
    roomsError.value = e?.response?.data?.message || 'Error al eliminar la habitación.'
  }
}

function resetRoomForm() {
  newRoom.value = { numero: '', tipo_id: '', piso: '', capacidad: '', precio_noche: '', imagen_url: '' }
  roomFormError.value = ''
  editingRoom.value = null
  formGallery.value = []
}

function openEditRoom(room) {
  editingRoom.value = { ...room }
  newRoom.value = {
    numero: room.numero,
    tipo_id: room.tipo_habitacion_id,
    piso: room.piso,
    capacidad: room.tipos_habitacion?.capacidad ?? '',
    precio_noche: room.tipos_habitacion?.precio_noche ?? '',
    imagen_url: room.imagen_url ?? '',
  }
  loadGalleryFromItem(room)
  showRoomForm.value = true
}

// ─── Menú / Productos ────────────────────────────────────────
const products = ref([])
const menuCategories = ref([])
const productsLoading = ref(false)
const productsError = ref(null)
const showProductForm = ref(false)
const editingProduct = ref(null)
const newProduct = ref({ nombre: '', categoria_id: '', precio: '', stock: '', descripcion: '', imagen_url: '' })
const productFormError = ref('')
const productFormSaving = ref(false)

async function fetchProducts() {
  productsLoading.value = true
  productsError.value = null
  try {
    const [productsRes, catsRes] = await Promise.all([
      api.get('/admin/menu/products'),
      api.get('/admin/menu/categories'),
    ])
    products.value = productsRes.data || []
    menuCategories.value = catsRes.data || []
  } catch {
    productsError.value = 'No se pudieron cargar los productos del menú.'
  } finally {
    productsLoading.value = false
  }
}

async function createProduct() {
  productFormSaving.value = true
  productFormError.value = ''
  try {
    const { data: created } = await api.post('/admin/menu/products', {
      nombre: newProduct.value.nombre,
      categoria_id: Number(newProduct.value.categoria_id),
      precio: Number(newProduct.value.precio),
      stock: Number(newProduct.value.stock),
      descripcion: newProduct.value.descripcion || null,
      imagen_url: newProduct.value.imagen_url || null,
    })
    await persistPendingGallery('producto', created?.id)
    showProductForm.value = false
    resetProductForm()
    await fetchProducts()
  } catch (e) {
    productFormError.value = e?.response?.data?.message || 'Error al crear el producto.'
  } finally {
    productFormSaving.value = false
  }
}

async function updateProduct() {
  productFormSaving.value = true
  productFormError.value = ''
  try {
    await api.patch(`/admin/menu/products/${editingProduct.value.id}`, {
      nombre: newProduct.value.nombre,
      precio: Number(newProduct.value.precio),
      stock: Number(newProduct.value.stock),
      descripcion: newProduct.value.descripcion || null,
      imagen_url: newProduct.value.imagen_url || null,
    })
    showProductForm.value = false
    resetProductForm()
    await fetchProducts()
  } catch (e) {
    productFormError.value = e?.response?.data?.message || 'Error al actualizar el producto.'
  } finally {
    productFormSaving.value = false
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return
  try {
    await api.delete(`/admin/menu/products/${id}`)
    await fetchProducts()
  } catch (e) {
    productsError.value = e?.response?.data?.message || 'Error al eliminar el producto.'
  }
}

function resetProductForm() {
  newProduct.value = { nombre: '', categoria_id: '', precio: '', stock: '', descripcion: '', imagen_url: '' }
  productFormError.value = ''
  editingProduct.value = null
  formGallery.value = []
}

function openEditProduct(p) {
  editingProduct.value = { ...p }
  newProduct.value = {
    nombre: p.nombre,
    categoria_id: p.categoria_id,
    precio: p.precio,
    stock: p.stock,
    descripcion: p.descripcion || '',
    imagen_url: p.imagen_url || '',
  }
  loadGalleryFromItem(p)
  showProductForm.value = true
}

// ─── Salones ─────────────────────────────────────────────────
const salons = ref([])
const salonsLoading = ref(false)
const salonsError = ref(null)
const showSalonForm = ref(false)
const editingSalon = ref(null)
const newSalon = ref({ nombre: '', capacidad: '', precio_base: '', ubicacion: '', imagen_url: '' })
const salonFormError = ref('')
const salonFormSaving = ref(false)

async function fetchSalons() {
  salonsLoading.value = true
  salonsError.value = null
  try {
    const { data } = await api.get('/admin/events/salons')
    salons.value = data || []
  } catch {
    salonsError.value = 'No se pudieron cargar los salones de eventos.'
  } finally {
    salonsLoading.value = false
  }
}

async function createSalon() {
  salonFormSaving.value = true
  salonFormError.value = ''
  try {
    const { data: created } = await api.post('/admin/events/salons', {
      nombre: newSalon.value.nombre,
      capacidad: Number(newSalon.value.capacidad),
      precio_base: Number(newSalon.value.precio_base),
      ubicacion: newSalon.value.ubicacion || null,
      imagen_url: newSalon.value.imagen_url || null,
    })
    await persistPendingGallery('salon', created?.id)
    showSalonForm.value = false
    resetSalonForm()
    await fetchSalons()
  } catch (e) {
    salonFormError.value = e?.response?.data?.message || 'Error al crear el salón.'
  } finally {
    salonFormSaving.value = false
  }
}

async function updateSalon() {
  salonFormSaving.value = true
  salonFormError.value = ''
  try {
    await api.patch(`/admin/events/salons/${editingSalon.value.id}`, {
      nombre: newSalon.value.nombre,
      capacidad: Number(newSalon.value.capacidad),
      precio_base: Number(newSalon.value.precio_base),
      ubicacion: newSalon.value.ubicacion || null,
      imagen_url: newSalon.value.imagen_url || null,
    })
    showSalonForm.value = false
    resetSalonForm()
    await fetchSalons()
  } catch (e) {
    salonFormError.value = e?.response?.data?.message || 'Error al actualizar el salón.'
  } finally {
    salonFormSaving.value = false
  }
}

async function deleteSalon(id) {
  if (!confirm('¿Eliminar este salón?')) return
  try {
    await api.delete(`/admin/events/salons/${id}`)
    await fetchSalons()
  } catch (e) {
    salonsError.value = e?.response?.data?.message || 'Error al eliminar el salón.'
  }
}

function resetSalonForm() {
  newSalon.value = { nombre: '', capacidad: '', precio_base: '', ubicacion: '', imagen_url: '' }
  salonFormError.value = ''
  editingSalon.value = null
  formGallery.value = []
}

function openEditSalon(s) {
  editingSalon.value = { ...s }
  newSalon.value = {
    nombre: s.nombre,
    capacidad: s.capacidad,
    precio_base: s.precio_base,
    ubicacion: s.ubicacion || '',
    imagen_url: s.imagen_url || '',
  }
  loadGalleryFromItem(s)
  showSalonForm.value = true
}

// ─── Subida de imágenes (S3) ─────────────────────────────────
const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const imageUploading = ref(false)

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Formato no permitido. Usa JPG, PNG o WebP.'
  if (file.size > IMAGE_MAX_SIZE_BYTES) return 'La imagen supera el máximo de 5MB.'
  return ''
}

async function uploadImage(file, folder) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/admin/uploads', formData, {
    params: { folder },
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
  return data.url
}

// ─── Galería de imágenes por ítem ────────────────────────────
// Ítems: { id: number|null, url: string, es_principal: boolean, orden: number }
const formGallery = ref([])

const GALLERY_CFG = {
  habitacion: { entidad: 'habitacion', folder: 'habitaciones', form: newRoom, error: roomFormError, editing: editingRoom },
  producto: { entidad: 'producto', folder: 'productos', form: newProduct, error: productFormError, editing: editingProduct },
  salon: { entidad: 'salon', folder: 'salones', form: newSalon, error: salonFormError, editing: editingSalon },
}

function loadGalleryFromItem(item) {
  const fromApi = Array.isArray(item?.imagenes) ? item.imagenes : []
  const base = fromApi.length
    ? fromApi
    : item?.imagen_url
      ? [{ id: null, url: item.imagen_url, es_principal: true, orden: 0 }]
      : []
  formGallery.value = base
    .map((img) => ({
      id: img.id ?? null,
      url: img.url,
      es_principal: !!img.es_principal,
      orden: img.orden ?? 0,
    }))
    .sort((a, b) => a.orden - b.orden)
}

function syncFormCover(kind) {
  const cfg = GALLERY_CFG[kind]
  const principal = formGallery.value.find((i) => i.es_principal)
  cfg.form.value.imagen_url = principal?.url || ''
}

async function onGalleryImageChange(event, kind) {
  const cfg = GALLERY_CFG[kind]
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const validationError = validateImageFile(file)
  if (validationError) {
    cfg.error.value = validationError
    return
  }
  cfg.error.value = ''
  imageUploading.value = true
  try {
    const url = await uploadImage(file, cfg.folder)
    const editingId = cfg.editing.value?.id
    if (editingId != null) {
      // Modo edición: la referencia se guarda de inmediato en el back
      const { data } = await api.post('/admin/imagenes', {
        entidad: cfg.entidad,
        entidad_id: Number(editingId),
        url,
        es_principal: formGallery.value.length === 0,
        orden: formGallery.value.length,
      })
      formGallery.value.push({
        id: data.id,
        url: data.url,
        es_principal: !!data.es_principal,
        orden: data.orden,
      })
    } else {
      // Modo creación: se encolá y se registra al guardar el ítem
      formGallery.value.push({
        id: null,
        url,
        es_principal: formGallery.value.length === 0,
        orden: formGallery.value.length,
      })
    }
    syncFormCover(kind)
  } catch {
    cfg.error.value = 'No se pudo subir la imagen. Inténtalo de nuevo.'
  } finally {
    imageUploading.value = false
  }
}

async function markGalleryPrincipal(index, kind) {
  const item = formGallery.value[index]
  if (!item || item.es_principal) return
  formGallery.value.forEach((img, i) => { img.es_principal = i === index })
  syncFormCover(kind)
  if (item.id != null) {
    try {
      await api.patch(`/admin/imagenes/${item.id}`, { es_principal: true })
    } catch {
      GALLERY_CFG[kind].error.value = 'No se pudo marcar como principal.'
    }
  }
}

async function removeGalleryImage(index, kind) {
  const item = formGallery.value[index]
  if (!item) return
  if (item.id != null) {
    if (!confirm('¿Eliminar esta imagen de la galería?')) return
    try {
      await api.delete(`/admin/imagenes/${item.id}`)
    } catch {
      GALLERY_CFG[kind].error.value = 'No se pudo eliminar la imagen.'
      return
    }
  }
  const wasPrincipal = item.es_principal
  formGallery.value.splice(index, 1)
  if (wasPrincipal && formGallery.value.length > 0) {
    // El back ya reasigna la principal en DELETE; en creación se marca local
    const next = formGallery.value[0]
    next.es_principal = true
    if (next.id != null) {
      api.patch(`/admin/imagenes/${next.id}`, { es_principal: true }).catch(() => {})
    }
  }
  syncFormCover(kind)
}

// Registra en el back las imágenes encoladas durante la creación del ítem
async function persistPendingGallery(kind, entityId) {
  if (entityId == null) return
  const cfg = GALLERY_CFG[kind]
  const pendientes = formGallery.value.filter((img) => img.id == null)
  for (const img of pendientes) {
    await api.post('/admin/imagenes', {
      entidad: cfg.entidad,
      entidad_id: Number(entityId),
      url: img.url,
      es_principal: img.es_principal,
      orden: img.orden,
    })
  }
}

const onSalonGalleryChange = (e) => onGalleryImageChange(e, 'salon')
const onProductGalleryChange = (e) => onGalleryImageChange(e, 'producto')
const onRoomGalleryChange = (e) => onGalleryImageChange(e, 'habitacion')

// ─── Module tab state ───────────────────────────────────────
const activeModule = ref('panel')

const moduleContextMessages = {
  panel: 'Panel General — Visualiza las métricas y reservas del día en un solo lugar.',
  calendario: 'Calendario — Visualiza la agenda del club. Haz clic en un día para ver todos los eventos.',
  tareas: 'Tareas — Gestiona y asigna tareas a los empleados del club.',
  socio: 'Panel del Socio — Información personalizada y detallada de cada miembro del club.',
  habitaciones: 'Habitaciones — Gestiona las habitaciones individuales del hotel.',
  menu: 'Menú — Administra las categorías y productos del restaurante.',
  salones: 'Salones — Gestiona los salones de eventos disponibles para reservar.',
  reservas: 'Reservas — Gestiona el listado completo de reservas del club, cambia estados y cancela.',
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
    fetchRooms(),
    fetchProducts(),
    fetchSalons(),
    fetchAllReservations(),
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
    showMemberForm, editingMember, newMember, memberFormError, memberFormSaving,
    MEMBER_DOC_TYPES, openNewMember, openEditMember, closeMemberForm, createMember, updateMember, toggleMemberStatus,
    allReservations, reservationsLoading, reservationsError,
    reservationTypeFilter, reservationStatusFilter, reservationSearch, reservationPage,
    RESERVATIONS_PER_PAGE, RESERVATION_STATUS_OPTIONS, reservationStatusOptions,
    filteredReservations, paginatedReservations, reservationTotalPages,
    changingReservationId, reservationActionError,
    fetchAllReservations, changeReservationStatus, cancelAdminReservation,
    rooms, roomTypes, roomsLoading, roomsError,
    showRoomForm, editingRoom, newRoom, roomFormError, roomFormSaving,
    fetchRooms, createRoom, updateRoom, deleteRoom, resetRoomForm, openEditRoom, onTipoChange,
    imageUploading, formGallery,
    onSalonGalleryChange, onProductGalleryChange, onRoomGalleryChange,
    markGalleryPrincipal, removeGalleryImage,
    products, menuCategories, productsLoading, productsError,
    showProductForm, editingProduct, newProduct, productFormError, productFormSaving,
    fetchProducts, createProduct, updateProduct, deleteProduct, resetProductForm, openEditProduct,
    salons, salonsLoading, salonsError,
    showSalonForm, editingSalon, newSalon, salonFormError, salonFormSaving,
    fetchSalons, createSalon, updateSalon, deleteSalon, resetSalonForm, openEditSalon,
  }
}
