import { ref, computed } from 'vue'

// ─── Member/Socios Mock Data ─────────────────────────────
const members = ref([
  {
    id: 1,
    name: 'Carlos Martínez',
    email: 'carlos.m@asogema.com',
    membership: 'Premium',
    membershipColor: '#fdcb6e',
    initials: 'CM',
    joinDate: '2023-11-07',
    avatar: null,
    reservations: [
      { id: 101, service: 'Restaurante', date: '2026-08-05', time: '19:30', guests: 4, status: 'confirmada' },
      { id: 102, service: 'Hotel', date: '2026-08-12', time: '14:00', guests: 2, status: 'confirmada' },
      { id: 103, service: 'Cancha de Golf', date: '2026-08-18', time: '08:00', guests: 1, status: 'pendiente' },
    ],
    payments: { balance: 2_450_000, lastPayment: 850_000, lastPaymentDate: '2026-07-15', status: 'al día' },
    guests: [
      { name: 'Ana Martínez', relationship: 'Cónyuge', status: 'activo' },
      { name: 'Pedro Martínez', relationship: 'Hijo', status: 'activo' },
    ],
    events: [
      { id: 201, name: 'Cena de Gala Anual', date: '2026-09-18', time: '19:00', location: 'Salón Principal', rsvp: 'confirmado' },
      { id: 202, name: 'Torneo de Golf', date: '2026-08-25', time: '07:00', location: 'Campo de Golf', rsvp: 'pendiente' },
    ],
    history: [
      { date: '2026-07-20', action: 'Reserva de restaurante', amount: 320000 },
      { date: '2026-07-15', action: 'Pago de membresía', amount: 850000 },
      { date: '2026-07-10', action: 'Estadía en hotel', amount: 1200000 },
      { date: '2026-07-05', action: 'Torneo de Tenis', amount: 150000 },
      { date: '2026-06-28', action: 'Cena privada', amount: 580000 },
    ],
    benefits: [
      { name: 'Acceso ilimitado al spa', active: true },
      { name: 'Descuento 20% en restaurante', active: true },
      { name: 'Invitado adicional gratis', active: true },
      { name: 'Estacionamiento VIP', active: true },
      { name: 'Acceso a eventos exclusivos', active: false },
      { name: 'Clase de golf gratuita / mes', active: true },
    ],
    news: [
      { date: '2026-07-28', title: 'Nuevo chef ejecutivo en Asogema', excerpt: 'El reconocido chef internacional Juan Pablo Mercado se une a nuestro equipo.' },
      { date: '2026-07-25', title: 'Renovación de la piscina olímpica', excerpt: 'La piscina estará cerrada del 5 al 12 de agosto por mantenimiento.' },
      { date: '2026-07-20', title: 'Torneo de Bridge Anual', excerpt: 'Inscripciones abiertas para el torneo anual de bridge del club.' },
    ],
  },
  {
    id: 2,
    name: 'María López',
    email: 'maria.l@asogema.com',
    membership: 'Ejecutiva',
    membershipColor: '#00cec9',
    initials: 'ML',
    joinDate: '2024-03-22',
    avatar: null,
    reservations: [
      { id: 104, service: 'Restaurante', date: '2026-08-03', time: '20:00', guests: 6, status: 'confirmada' },
      { id: 105, service: 'Evento', date: '2026-08-15', time: '10:00', guests: 80, status: 'confirmada' },
    ],
    payments: { balance: 980000, lastPayment: 520000, lastPaymentDate: '2026-07-10', status: 'al día' },
    guests: [{ name: 'Roberto López', relationship: 'Cónyuge', status: 'activo' }],
    events: [
      { id: 203, name: 'Seminario de Marketing', date: '2026-09-05', time: '10:00', location: 'Sala de Conferencias', rsvp: 'confirmado' },
    ],
    history: [
      { date: '2026-07-10', action: 'Pago de membresía', amount: 520000 },
      { date: '2026-07-08', action: 'Evento corporativo', amount: 2100000 },
      { date: '2026-06-30', action: 'Reserva de restaurante', amount: 450000 },
    ],
    benefits: [
      { name: 'Descuento 15% en restaurante', active: true },
      { name: 'Acceso a eventos corporativos', active: true },
      { name: 'Estacionamiento preferencial', active: true },
      { name: 'Invitado gratis los fines de semana', active: false },
    ],
    news: [
      { date: '2026-07-28', title: 'Nuevo chef ejecutivo en Asogema', excerpt: 'El reconocido chef internacional Juan Pablo Mercado se une a nuestro equipo.' },
    ],
  },
  {
    id: 3,
    name: 'Juan Pérez',
    email: 'juan.p@asogema.com',
    membership: 'VIP',
    membershipColor: '#e17055',
    initials: 'JP',
    joinDate: '2023-09-30',
    avatar: null,
    reservations: [
      { id: 106, service: 'Hotel', date: '2026-08-20', time: '15:00', guests: 2, status: 'pendiente' },
    ],
    payments: { balance: 5200000, lastPayment: 1500000, lastPaymentDate: '2026-06-30', status: 'pendiente' },
    guests: [
      { name: 'Laura Pérez', relationship: 'Cónyuge', status: 'activo' },
      { name: 'Sofía Pérez', relationship: 'Hija', status: 'activo' },
      { name: 'Mateo Pérez', relationship: 'Hijo', status: 'activo' },
    ],
    events: [
      { id: 204, name: 'Cena de Gala Anual', date: '2026-09-18', time: '19:00', location: 'Salón Principal', rsvp: 'confirmado' },
      { id: 205, name: 'Torneo de Tenis', date: '2026-08-10', time: '09:00', location: 'Canchas de Tenis', rsvp: 'confirmado' },
      { id: 206, name: 'Clase de Cocina Italiana', date: '2026-08-28', time: '11:00', location: 'Cocina Central', rsvp: 'pendiente' },
    ],
    history: [
      { date: '2026-06-30', action: 'Pago de membresía', amount: 1500000 },
      { date: '2026-06-25', action: 'Reserva de hotel (3 noches)', amount: 3600000 },
      { date: '2026-06-18', action: 'Torneo de Golf', amount: 200000 },
      { date: '2026-06-10', action: 'Cena familiar', amount: 680000 },
    ],
    benefits: [
      { name: 'Acceso ilimitado al spa', active: true },
      { name: 'Descuento 30% en restaurante', active: true },
      { name: 'Hasta 3 invitados gratis', active: true },
      { name: 'Estacionamiento VIP', active: true },
      { name: 'Acceso a eventos exclusivos', active: true },
      { name: 'Clase de golf gratuita / mes', active: true },
      { name: 'Servicio de conserje 24/7', active: true },
      { name: 'Acceso a sala VIP en eventos', active: true },
    ],
    news: [
      { date: '2026-07-28', title: 'Nuevo chef ejecutivo en Asogema', excerpt: 'El reconocido chef internacional Juan Pablo Mercado se une a nuestro equipo.' },
      { date: '2026-07-25', title: 'Renovación de la piscina olímpica', excerpt: 'La piscina estará cerrada del 5 al 12 de agosto por mantenimiento.' },
    ],
  },
])

const selectedMemberId = ref(1)
const selectedMember = computed(() => members.value.find(m => m.id === selectedMemberId.value) || members.value[0])

// ─── Calendar Events ──────────────────────────────────────
const calendarEvents = ref([
  { id: 1, title: 'Torneo de Golf', date: '2026-08-03', time: '07:00', location: 'Campo de Golf', category: 'torneos', color: '#00cec9' },
  { id: 2, title: 'Torneo de Tenis', date: '2026-08-10', time: '09:00', location: 'Canchas de Tenis', category: 'torneos', color: '#00cec9' },
  { id: 3, title: 'Torneo de Bridge', date: '2026-08-17', time: '14:00', location: 'Sala de Juegos', category: 'torneos', color: '#00cec9' },
  { id: 4, title: 'Campeonato de Natación', date: '2026-08-24', time: '08:00', location: 'Piscina Olímpica', category: 'torneos', color: '#00cec9' },
  { id: 5, title: 'Cena de Gala Anual', date: '2026-09-18', time: '19:00', location: 'Salón Principal', category: 'eventos', color: '#6c5ce7' },
  { id: 6, title: 'Seminario de Marketing', date: '2026-09-05', time: '10:00', location: 'Sala de Conferencias', category: 'eventos', color: '#6c5ce7' },
  { id: 7, title: 'Clase de Cocina Italiana', date: '2026-08-28', time: '11:00', location: 'Cocina Central', category: 'eventos', color: '#6c5ce7' },
  { id: 8, title: 'Noche de Jazz', date: '2026-08-15', time: '20:00', location: 'Terrazas', category: 'eventos', color: '#6c5ce7' },
  { id: 9, title: 'Reserva: Carlos M. - Rest.', date: '2026-08-05', time: '19:30', location: 'Restaurante Principal', category: 'reservas', color: '#fdcb6e' },
  { id: 10, title: 'Reserva: María L. - Evento', date: '2026-08-15', time: '10:00', location: 'Salón de Eventos', category: 'reservas', color: '#fdcb6e' },
  { id: 11, title: 'Reserva: Juan P. - Hotel', date: '2026-08-20', time: '15:00', location: 'Suite 301', category: 'reservas', color: '#fdcb6e' },
  { id: 12, title: 'Reserva: Ana R. - Rest.', date: '2026-08-07', time: '20:00', location: 'Restaurante Principal', category: 'reservas', color: '#fdcb6e' },
  { id: 13, title: 'Mantenimiento Piscina', date: '2026-08-05', time: '06:00', location: 'Piscina Olímpica', category: 'mantenimiento', color: '#e17055' },
  { id: 14, title: 'Revisión Eléctrica', date: '2026-08-12', time: '08:00', location: 'Edificio Central', category: 'mantenimiento', color: '#e17055' },
  { id: 15, title: 'Mantenimiento Ascensores', date: '2026-08-19', time: '09:00', location: 'Torre Norte', category: 'mantenimiento', color: '#e17055' },
  { id: 16, title: 'Fumigación Jardines', date: '2026-08-26', time: '05:00', location: 'Jardines Exteriores', category: 'mantenimiento', color: '#e17055' },
  { id: 17, title: 'Horario Extendido Spa', date: '2026-08-06', time: '07:00-22:00', location: 'Spa', category: 'horarios', color: '#00b894' },
  { id: 18, title: 'Restaurante Cerrado', date: '2026-08-13', time: 'Todo el día', location: 'Restaurante Principal', category: 'horarios', color: '#00b894' },
  { id: 19, title: 'Gimnasio 24h', date: '2026-08-20', time: '00:00-23:59', location: 'Gimnasio', category: 'horarios', color: '#00b894' },
  { id: 20, title: 'Horario Reducido Canchas', date: '2026-08-27', time: '10:00-16:00', location: 'Canchas Deportivas', category: 'horarios', color: '#00b894' },
])

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

// ─── Today's Reservations ─────────────────────────────────
const todayReservations = ref([
  { id: 1, client: 'Carlos Martínez', service: 'Restaurante', time: '12:30', guests: 4, status: 'confirmada', phone: '+57 300 111 2233', notes: 'Mesa cerca de la ventana' },
  { id: 2, client: 'María López', service: 'Hotel', time: '14:00', guests: 2, status: 'check-in', phone: '+57 310 444 5566', notes: 'Habitación doble, piso alto' },
  { id: 3, client: 'Juan Pérez', service: 'Evento', time: '16:00', guests: 50, status: 'pendiente', phone: '+57 320 777 8899', notes: 'Salón de conferencias' },
  { id: 4, client: 'Ana Rodríguez', service: 'Restaurante', time: '19:00', guests: 6, status: 'confirmada', phone: '+57 301 222 3344', notes: 'Celebración familiar' },
  { id: 5, client: 'Pedro Sánchez', service: 'Hotel', time: '11:00', guests: 3, status: 'check-out', phone: '+57 315 555 6677', notes: '' },
  { id: 6, client: 'Laura García', service: 'Restaurante', time: '20:30', guests: 2, status: 'confirmada', phone: '+57 305 888 9900', notes: 'Aniversario' },
  { id: 7, client: 'Diego Ramírez', service: 'Spa', time: '15:00', guests: 1, status: 'pendiente', phone: '+57 318 123 4567', notes: 'Masaje relajante' },
  { id: 8, client: 'Sofía Torres', service: 'Golf', time: '07:00', guests: 4, status: 'confirmada', phone: '+57 311 987 6543', notes: '4 personas, 18 hoyos' },
])

// ─── Income Data ──────────────────────────────────────────
const incomePeriods = ref({
  daily: 4_250_000,
  weekly: 28_900_000,
  monthly: 61_900_000,
  dailyChange: 8.2,
  weeklyChange: 3.5,
  monthlyChange: 12.1,
})

const incomePeriodSelector = ref('mensual')

const incomeChartData = computed(() => {
  const data = {
    diario: {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      current: [3.2, 4.1, 3.8, 4.5, 5.2, 6.8, 4.2],
      previous: [2.8, 3.6, 3.4, 4.0, 4.8, 6.1, 3.9],
    },
    semanal: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      current: [14.2, 15.8, 16.5, 18.1],
      previous: [12.5, 14.1, 14.8, 16.2],
    },
    mensual: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      current: [18.2, 16.8, 19.4, 21.1, 20.3, 22.6, 24.1, 23.5, 22.8, 25.2, 24.6, 26.1],
      previous: [15.1, 14.3, 16.2, 18.4, 17.6, 19.2, 20.8, 19.5, 20.1, 22.3, 21.7, 23.0],
    },
  }
  return data[incomePeriodSelector.value]
})

// ─── Services Ranking ─────────────────────────────────────
const topServices = ref([
  { name: 'Restaurante', bookings: 1240, percentage: 58, icon: 'restaurant', revenue: 158_750_000, change: '+12.5%' },
  { name: 'Hotel', bookings: 680, percentage: 32, icon: 'hotel', revenue: 342_600_000, change: '+8.3%' },
  { name: 'Eventos', bookings: 185, percentage: 10, icon: 'events', revenue: 96_800_000, change: '+21.7%' },
  { name: 'Spa', bookings: 420, percentage: 22, icon: 'spa', revenue: 52_000_000, change: '+15.2%' },
  { name: 'Golf', bookings: 310, percentage: 16, icon: 'golf', revenue: 78_500_000, change: '+6.8%' },
])

// ─── Peak Hours ───────────────────────────────────────────
const peakHours = ref([
  { hour: '08:00', label: '08', customers: 12 },
  { hour: '09:00', label: '09', customers: 18 },
  { hour: '10:00', label: '10', customers: 8 },
  { hour: '11:00', label: '11', customers: 22 },
  { hour: '12:00', label: '12', customers: 48 },
  { hour: '13:00', label: '13', customers: 52 },
  { hour: '14:00', label: '14', customers: 35 },
  { hour: '15:00', label: '15', customers: 14 },
  { hour: '16:00', label: '16', customers: 10 },
  { hour: '17:00', label: '17', customers: 16 },
  { hour: '18:00', label: '18', customers: 38 },
  { hour: '19:00', label: '19', customers: 56 },
  { hour: '20:00', label: '20', customers: 62 },
  { hour: '21:00', label: '21', customers: 44 },
  { hour: '22:00', label: '22', customers: 20 },
])

const maxPeakCustomers = computed(() => Math.max(...peakHours.value.map(p => p.customers)))

// ─── Top Rooms ────────────────────────────────────────────
const topRooms = ref([
  { name: 'Suite Presidencial', code: 'SP-01', reservations: 48, revenue: 96_000_000, occupancy: 92, type: 'Suite' },
  { name: 'Habitación Deluxe', code: 'HD-12', reservations: 42, revenue: 50_400_000, occupancy: 88, type: 'Deluxe' },
  { name: 'Habitación Doble', code: 'HD-08', reservations: 38, revenue: 34_200_000, occupancy: 85, type: 'Doble' },
  { name: 'Habitación Individual', code: 'HI-05', reservations: 35, revenue: 21_000_000, occupancy: 78, type: 'Individual' },
  { name: 'Suite Junior', code: 'SJ-03', reservations: 30, revenue: 45_000_000, occupancy: 82, type: 'Suite' },
])

const maxRoomReservations = computed(() => Math.max(...topRooms.value.map(r => r.reservations)))

// ─── Upcoming Events ──────────────────────────────────────
const upcomingEvents = ref([
  { id: 1, name: 'Conferencia de Tecnología', date: '2026-08-15', time: '09:00', attendees: 120, organizer: 'TechCorp', type: 'conferencia', location: 'Salón Principal' },
  { id: 2, name: 'Boda García-Mendoza', date: '2026-08-22', time: '16:00', attendees: 200, organizer: 'Familia García', type: 'boda', location: 'Jardines' },
  { id: 3, name: 'Seminario de Marketing', date: '2026-09-05', time: '10:00', attendees: 80, organizer: 'MKT Academy', type: 'seminario', location: 'Sala de Conferencias' },
  { id: 4, name: 'Cena de Gala Anual', date: '2026-09-18', time: '19:00', attendees: 150, organizer: 'Asogema', type: 'gala', location: 'Salón Principal' },
  { id: 5, name: 'Taller de Cocina', date: '2026-09-25', time: '11:00', attendees: 25, organizer: 'Chef Ana', type: 'taller', location: 'Cocina Central' },
  { id: 6, name: 'Noche de Jazz', date: '2026-08-15', time: '20:00', attendees: 60, organizer: 'Club Musical', type: 'concierto', location: 'Terrazas' },
])

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// ─── Hotel Occupancy ──────────────────────────────────────
const hotelOccupancy = ref({
  current: 78,
  available: 22,
  totalRooms: 45,
  occupiedRooms: 35,
  changeFromLastWeek: 5.2,
  historical: [72, 75, 74, 78, 80, 76, 78, 82, 79, 81, 78, 76, 74, 78],
})

// ─── Comparative Data ─────────────────────────────────────
const comparativeIncome = ref({
  currentYear: [18.2, 16.8, 19.4, 21.1, 20.3, 22.6, 24.1, 23.5, 22.8, 25.2, 24.6, 26.1],
  previousYear: [15.1, 14.3, 16.2, 18.4, 17.6, 19.2, 20.8, 19.5, 20.1, 22.3, 21.7, 23.0],
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
})

const comparativeReservations = ref({
  restaurant: [180, 195, 210, 198, 220, 205, 230],
  hotel: [85, 92, 78, 95, 88, 102, 96],
  events: [12, 8, 15, 10, 18, 14, 20],
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
})

const maxComparIncome = computed(() => {
  const all = [...comparativeIncome.value.currentYear, ...comparativeIncome.value.previousYear]
  return Math.max(...all)
})

const maxComparReserv = computed(() => {
  const r = comparativeReservations.value
  const all = [...r.restaurant, ...r.hotel, ...r.events]
  return Math.max(...all)
})

// ─── Helpers ──────────────────────────────────────────────
function formatCurrency(value) {
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

// ─── Calendar helpers ─────────────────────────────────────
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

// ─── Module tab state ─────────────────────────────────────
const activeModule = ref('panel')
const activeSubTab = ref('resumen')

const moduleContextMessages = {
  panel: 'Panel General — Visualiza todas las métricas y estadísticas del club en un solo lugar.',
  calendario: 'Calendario Integral — Gestión de eventos, torneos, reservas y mantenimiento.',
  socio: 'Panel del Socio — Información personalizada y detallada de cada miembro del club.',
}

const contextMessage = computed(() => moduleContextMessages[activeModule.value])

const todayReservationCount = computed(() => todayReservations.value.length)
const todayConfirmedCount = computed(() => todayReservations.value.filter(r => r.status === 'confirmada' || r.status === 'check-in').length)
const todayPendingCount = computed(() => todayReservations.value.filter(r => r.status === 'pendiente').length)

function getBarHeight(val, max) {
  if (!max) return 0
  return (val / max) * 100
}

function getComparBarHeight(val, max) {
  return (val / max) * 100
}

export function usePanelAdmin() {
  return {
    activeModule, activeSubTab, contextMessage,
    members, selectedMemberId, selectedMember,
    calendarEvents, calendarFilters, filteredCalendarEvents, categoryLabels,
    calendarMonth, calendarYear, calendarGrid, calendarTitle,
    prevMonth, nextMonth, selectedCalendarEvent, openCalendarEvent, closeCalendarEvent,
    todayReservations, todayReservationCount, todayConfirmedCount, todayPendingCount,
    incomePeriods, incomePeriodSelector, incomeChartData,
    topServices, peakHours, maxPeakCustomers,
    topRooms, maxRoomReservations,
    upcomingEvents, monthNames,
    hotelOccupancy,
    comparativeIncome, comparativeReservations, maxComparIncome, maxComparReserv,
    formatCurrency, statusBadgeClass, eventTypeBadgeClass,
    getBarHeight, getComparBarHeight,
  }
}
