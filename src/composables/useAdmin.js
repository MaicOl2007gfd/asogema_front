import { ref, computed, onMounted } from 'vue'

/**
 * Composable for the Admin Panel — manages role editing, income overview,
 * and the full admin dashboard with metrics, charts, and insights.
 */

// ─── Mock Users ──────────────────────────────────────────────
const ROLES = ['cliente', 'empleado', 'miembro']

const mockUsers = ref([
  { id: 1, name: 'Carlos Martínez', email: 'carlos@example.com', role: 'empleado', joined: '2024-01-15' },
  { id: 2, name: 'María López',     email: 'maria@example.com',  role: 'cliente',  joined: '2024-03-22' },
  { id: 3, name: 'Juan Pérez',      email: 'juan@example.com',   role: 'miembro',  joined: '2023-11-07' },
  { id: 4, name: 'Ana Rodríguez',   email: 'ana@example.com',    role: 'cliente',  joined: '2024-06-12' },
  { id: 5, name: 'Pedro Sánchez',   email: 'pedro@example.com',  role: 'miembro',  joined: '2023-09-30' },
  { id: 6, name: 'Laura García',    email: 'laura@example.com',  role: 'empleado', joined: '2024-02-18' },
  { id: 7, name: 'Diego Ramírez',   email: 'diego@example.com',  role: 'cliente',  joined: '2024-08-05' },
  { id: 8, name: 'Sofía Torres',    email: 'sofia@example.com',  role: 'miembro',  joined: '2024-04-14' },
])

// ─── Mock Income Data ────────────────────────────────────────
const incomeData = ref({
  restaurant: {
    total: 158_750_000,
    monthly: 18_250_000,
    growth: 12.5,
    transactions: 1240,
    chart: [14.2, 16.8, 15.4, 18.1, 17.3, 19.6, 18.9, 20.2, 19.4, 21.5, 20.8, 22.1],
  },
  hotel: {
    total: 342_600_000,
    monthly: 32_450_000,
    growth: 8.3,
    transactions: 680,
    chart: [28.5, 30.2, 29.1, 31.8, 33.4, 32.1, 34.6, 33.2, 35.8, 34.5, 36.2, 37.0],
  },
  events: {
    total: 96_800_000,
    monthly: 11_200_000,
    growth: 21.7,
    transactions: 185,
    chart: [6.2, 7.8, 8.4, 9.1, 10.5, 9.8, 11.2, 10.6, 12.4, 13.1, 12.8, 14.5],
  },
})

const combinedTotal = computed(() => {
  const d = incomeData.value
  return d.restaurant.total + d.hotel.total + d.events.total
})

const combinedMonthly = computed(() => {
  const d = incomeData.value
  return d.restaurant.monthly + d.hotel.monthly + d.events.monthly
})

// ─── Admin Dashboard Metrics ─────────────────────────────────

/** Today's reservations */
const todayReservations = ref([
  { id: 1, client: 'Carlos Martínez', service: 'Restaurante', time: '12:30', guests: 4, status: 'confirmada' },
  { id: 2, client: 'María López', service: 'Hotel', time: '14:00', guests: 2, status: 'check-in' },
  { id: 3, client: 'Juan Pérez', service: 'Evento', time: '16:00', guests: 50, status: 'pendiente' },
  { id: 4, client: 'Ana Rodríguez', service: 'Restaurante', time: '19:00', guests: 6, status: 'confirmada' },
  { id: 5, client: 'Pedro Sánchez', service: 'Hotel', time: '11:00', guests: 3, status: 'check-out' },
  { id: 6, client: 'Laura García', service: 'Restaurante', time: '20:30', guests: 2, status: 'confirmada' },
])

/** Daily, weekly, monthly income figures */
const incomePeriods = ref({
  daily: 4_250_000,
  weekly: 28_900_000,
  monthly: 61_900_000,
  dailyChange: 8.2,
  weeklyChange: 3.5,
  monthlyChange: 12.1,
})

/** Most used services ranking */
const topServices = ref([
  { name: 'Restaurante', bookings: 1240, percentage: 58, icon: 'restaurant' },
  { name: 'Hotel', bookings: 680, percentage: 32, icon: 'hotel' },
  { name: 'Eventos', bookings: 185, percentage: 10, icon: 'events' },
])

/** Restaurant peak hours */
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

const maxPeakCustomers = computed(() => {
  return Math.max(...peakHours.value.map(p => p.customers))
})

/** Most reserved rooms */
const topRooms = ref([
  { name: 'Suite Presidencial', code: 'SP-01', reservations: 48, revenue: 96_000_000, occupancy: 92 },
  { name: 'Habitación Deluxe', code: 'HD-12', reservations: 42, revenue: 50_400_000, occupancy: 88 },
  { name: 'Habitación Doble', code: 'HD-08', reservations: 38, revenue: 34_200_000, occupancy: 85 },
  { name: 'Habitación Individual', code: 'HI-05', reservations: 35, revenue: 21_000_000, occupancy: 78 },
  { name: 'Suite Junior', code: 'SJ-03', reservations: 30, revenue: 45_000_000, occupancy: 82 },
])

/** Upcoming events */
const upcomingEvents = ref([
  { id: 1, name: 'Conferencia de Tecnología', date: '2026-08-15', time: '09:00', attendees: 120, organizer: 'TechCorp', type: 'conferencia' },
  { id: 2, name: 'Boda García-Mendoza', date: '2026-08-22', time: '16:00', attendees: 200, organizer: 'Familia García', type: 'boda' },
  { id: 3, name: 'Seminario de Marketing', date: '2026-09-05', time: '10:00', attendees: 80, organizer: 'MKT Academy', type: 'seminario' },
  { id: 4, name: 'Cena de Gala Anual', date: '2026-09-18', time: '19:00', attendees: 150, organizer: 'Asogema', type: 'gala' },
  { id: 5, name: 'Taller de Cocina', date: '2026-09-25', time: '11:00', attendees: 25, organizer: 'Chef Ana', type: 'taller' },
])

/** Hotel occupancy */
const hotelOccupancy = ref({
  current: 78,
  available: 22,
  totalRooms: 45,
  occupiedRooms: 35,
  changeFromLastWeek: 5.2,
})

/** Comparative charts - monthly income comparison (current vs previous year) */
const comparativeIncome = ref({
  currentYear: [18.2, 16.8, 19.4, 21.1, 20.3, 22.6, 24.1, 23.5, 22.8, 25.2, 24.6, 26.1],
  previousYear: [15.1, 14.3, 16.2, 18.4, 17.6, 19.2, 20.8, 19.5, 20.1, 22.3, 21.7, 23.0],
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
})

/** Comparative - reservations by area (weekly) */
const comparativeReservations = ref({
  restaurant: [180, 195, 210, 198, 220, 205, 230],
  hotel: [85, 92, 78, 95, 88, 102, 96],
  events: [12, 8, 15, 10, 18, 14, 20],
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
})

// ─── Search & Filter ─────────────────────────────────────────
const userSearch = ref('')

const filteredUsers = computed(() => {
  const q = userSearch.value.toLowerCase().trim()
  if (!q) return mockUsers.value
  return mockUsers.value.filter(
    u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q),
  )
})

// ─── Editing state ───────────────────────────────────────────
const editingUserId = ref(null)
const editingRole = ref('')

function startEdit(user) {
  editingUserId.value = user.id
  editingRole.value = user.role
}

function cancelEdit() {
  editingUserId.value = null
  editingRole.value = ''
}

function saveEdit(user) {
  if (ROLES.includes(editingRole.value)) {
    user.role = editingRole.value
  }
  cancelEdit()
}

function handleRoleChange(newRole) {
  editingRole.value = newRole
}

// ─── Role badge styling helper ───────────────────────────────
function roleBadgeClass(role) {
  switch (role) {
    case 'empleado': return 'admin-role-badge-empleado'
    case 'cliente':  return 'admin-role-badge-cliente'
    case 'miembro':  return 'admin-role-badge-miembro'
    default:         return ''
  }
}

// ─── Format currency ─────────────────────────────────────────
function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// ─── Helpers for status badges ───────────────────────────────
function statusBadgeClass(status) {
  const map = {
    'confirmada': 'admin-status-confirmed',
    'check-in': 'admin-status-checkin',
    'check-out': 'admin-status-checkout',
    'pendiente': 'admin-status-pending',
    'cancelada': 'admin-status-cancelled',
  }
  return map[status] || ''
}

function eventTypeBadgeClass(type) {
  const map = {
    'conferencia': 'admin-event-conferencia',
    'boda': 'admin-event-boda',
    'seminario': 'admin-event-seminario',
    'gala': 'admin-event-gala',
    'taller': 'admin-event-taller',
  }
  return map[type] || ''
}

// ─── Month names ─────────────────────────────────────────────
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function useAdmin() {
  return {
    ROLES,
    mockUsers,
    incomeData,
    combinedTotal,
    combinedMonthly,
    userSearch,
    filteredUsers,
    editingUserId,
    editingRole,
    startEdit,
    cancelEdit,
    saveEdit,
    handleRoleChange,
    roleBadgeClass,
    formatCurrency,
    // Dashboard metrics
    todayReservations,
    incomePeriods,
    topServices,
    peakHours,
    maxPeakCustomers,
    topRooms,
    upcomingEvents,
    hotelOccupancy,
    comparativeIncome,
    comparativeReservations,
    monthNames,
    statusBadgeClass,
    eventTypeBadgeClass,
  }
}
