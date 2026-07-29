import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from './useApi.js'

/**
 * Composable para el panel de administración.
 * Proporciona estadísticas simuladas (o conectadas a API) para:
 *   - Reservas del día
 *   - Ingresos diarios, semanales y mensuales
 *   - Servicios más utilizados
 *   - Horas pico del restaurante
 *   - Habitaciones más reservadas
 *   - Eventos próximos
 *   - Porcentaje de ocupación del hotel
 *   - Gráficas comparativas
 */
export function useAdminDashboard() {
  /* ----------------------------------------------------------
     LOADING & ERROR
     ---------------------------------------------------------- */
  const loading = ref(true)
  const error = ref(null)

  /* ----------------------------------------------------------
     PERIOD FILTER
     ---------------------------------------------------------- */
  const selectedPeriod = ref('month') // 'day' | 'week' | 'month' | 'year'

  /* ----------------------------------------------------------
     MOCK / REAL DATA
     ---------------------------------------------------------- */
  const todayReservations = ref([])
  const todayReservationsCount = ref(0)
  const todayCheckIns = ref(0)
  const todayCheckOuts = ref(0)

  const dailyIncome = ref(0)
  const weeklyIncome = ref(0)
  const monthlyIncome = ref(0)
  const yearlyIncome = ref(0)

  const topServices = ref([])
  const peakHours = ref([])
  const topRooms = ref([])
  const upcomingEvents = ref([])
  const occupancyRate = ref(0)

  // Chart data
  const incomeChartData = ref(null)
  const occupancyChartData = ref(null)
  let servicesChartData = ref(null)
  let roomsChartData = ref(null)
  let peakHoursChartData = ref(null)
  let comparativeChartData = ref(null)

  /* ----------------------------------------------------------
     CHART OPTIONS (reusable themes)
     ---------------------------------------------------------- */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#d4d4c8',
          font: { family: 'Inter, system-ui, sans-serif', size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(19, 50, 21, 0.95)',
        titleColor: '#F3E8D3',
        bodyColor: '#d4d4c8',
        borderColor: 'rgba(0, 206, 201, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'Inter, sans-serif', size: 13, weight: '600' },
        bodyFont: { family: 'Inter, sans-serif', size: 12 },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(243, 232, 211, 0.06)', drawBorder: false },
        ticks: { color: '#7a9a7a', font: { family: 'Inter, sans-serif', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(243, 232, 211, 0.06)', drawBorder: false },
        ticks: { color: '#7a9a7a', font: { family: 'Inter, sans-serif', size: 11 } },
        beginAtZero: true,
      },
    },
  }

  /* ----------------------------------------------------------
     PALETTE
     ---------------------------------------------------------- */
  const colors = {
    teal: '#00cec9',
    green: '#2d5a2e',
    gold: '#d4a843',
    cream: '#F3E8D3',
    coral: '#e17055',
    purple: '#6c5ce7',
    blue: '#0984e3',
    red: '#d63031',
    white: '#ffffff',
  }

  const chartColors = [
    '#00cec9', '#2d5a2e', '#d4a843', '#e17055',
    '#6c5ce7', '#0984e3', '#d63031', '#00b894',
    '#fdcb6e', '#e84393', '#55efc4', '#74b9ff',
  ]

  /* ----------------------------------------------------------
     GENERATE MOCK DATA
     ---------------------------------------------------------- */
  function generateMockData() {
    // ── Reservas del día ──
    const mockReservations = [
      { id: 1, guest: 'Carlos García', room: 'Suite Ejecutiva', checkIn: '2026-07-27', checkOut: '2026-07-29', status: 'checked-in', amount: 500 },
      { id: 2, guest: 'María López', room: 'Habitación Doble', checkIn: '2026-07-27', checkOut: '2026-07-28', status: 'pending', amount: 160 },
      { id: 3, guest: 'Juan Rodríguez', room: 'Habitación Estándar', checkIn: '2026-07-27', checkOut: '2026-07-30', status: 'confirmed', amount: 360 },
      { id: 4, guest: 'Ana Martínez', room: 'Suite Premium', checkIn: '2026-07-27', checkOut: '2026-07-28', status: 'checked-in', amount: 380 },
      { id: 5, guest: 'Pedro Sánchez', room: 'Habitación Doble', checkIn: '2026-07-27', checkOut: '2026-07-31', status: 'confirmed', amount: 640 },
      { id: 6, guest: 'Laura Fernández', room: 'Suite Master', checkIn: '2026-07-27', checkOut: '2026-08-01', status: 'pending', amount: 2600 },
      { id: 7, guest: 'Diego Ramírez', room: 'Habitación Estándar', checkIn: '2026-07-27', checkOut: '2026-07-28', status: 'checked-in', amount: 120 },
    ]
    todayReservations.value = mockReservations
    todayReservationsCount.value = mockReservations.length
    todayCheckIns.value = mockReservations.filter(r => r.status === 'checked-in' || r.status === 'confirmed').length
    todayCheckOuts.value = 3

    // ── Ingresos ──
    dailyIncome.value = 4760
    weeklyIncome.value = 28450
    monthlyIncome.value = 124800
    yearlyIncome.value = 1580000

    // ── Servicios más utilizados ──
    topServices.value = [
      { name: 'Restaurante', count: 342, icon: 'restaurant', percentage: 100 },
      { name: 'Spa & Bienestar', count: 187, icon: 'spa', percentage: 55 },
      { name: 'Piscina', count: 165, icon: 'pool', percentage: 48 },
      { name: 'Gimnasio', count: 124, icon: 'gym', percentage: 36 },
      { name: 'Tour Guiado', count: 98, icon: 'tour', percentage: 29 },
      { name: 'Bar', count: 76, icon: 'bar', percentage: 22 },
    ]

    // ── Horas pico del restaurante ──
    peakHours.value = [
      { hour: '07:00', label: '7 AM', reservations: 12 },
      { hour: '08:00', label: '8 AM', reservations: 28 },
      { hour: '09:00', label: '9 AM', reservations: 22 },
      { hour: '12:00', label: '12 PM', reservations: 35 },
      { hour: '13:00', label: '1 PM', reservations: 42 },
      { hour: '14:00', label: '2 PM', reservations: 18 },
      { hour: '19:00', label: '7 PM', reservations: 30 },
      { hour: '20:00', label: '8 PM', reservations: 45 },
      { hour: '21:00', label: '9 PM', reservations: 38 },
      { hour: '22:00', label: '10 PM', reservations: 15 },
    ]

    // ── Habitaciones más reservadas ──
    topRooms.value = [
      { type: 'Habitación Estándar', reservations: 128, revenue: 15360, percentage: 100 },
      { type: 'Habitación Doble', reservations: 96, revenue: 15360, percentage: 75 },
      { type: 'Suite Ejecutiva', reservations: 72, revenue: 18000, percentage: 56 },
      { type: 'Suite Premium', reservations: 48, revenue: 18240, percentage: 38 },
      { type: 'Suite Master', reservations: 24, revenue: 12480, percentage: 19 },
    ]

    // ── Eventos próximos ──
    upcomingEvents.value = [
      { id: 1, title: 'Boda González-Pérez', date: '2026-08-05', time: '15:00', guests: 120, type: 'wedding' },
      { id: 2, title: 'Conferencia Empresarial', date: '2026-08-10', time: '09:00', guests: 200, type: 'conference' },
      { id: 3, title: 'Taller de Yoga al Amanecer', date: '2026-08-12', time: '06:00', guests: 30, type: 'wellness' },
      { id: 4, title: 'Cena de Gala Anual', date: '2026-08-20', time: '19:00', guests: 150, type: 'gala' },
      { id: 5, title: 'Tour de Aventura: Cañón', date: '2026-08-25', time: '07:00', guests: 25, type: 'adventure' },
      { id: 6, title: 'Fiesta de la Cosecha', date: '2026-09-01', time: '18:00', guests: 80, type: 'party' },
    ]

    // ── Ocupación ──
    occupancyRate.value = 72

    // ── Gráficas ──

    // Ingresos diarios de la semana
    incomeChartData.value = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Ingresos ($)',
          data: [3200, 4100, 3850, 4760, 5200, 6800, 4500],
          backgroundColor: 'rgba(0, 206, 201, 0.2)',
          borderColor: colors.teal,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.teal,
          pointBorderColor: '#F3E8D3',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }

    // Ocupación por mes
    occupancyChartData.value = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'Ocupación (%)',
          data: [55, 60, 68, 72, 70, 78, 82, 85, 75, 65, 58, 52],
          backgroundColor: 'rgba(45, 90, 46, 0.3)',
          borderColor: colors.green,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.green,
          pointBorderColor: '#F3E8D3',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    }

    // Servicios - gráfico de pastel/dona
    servicesChartData = {
      labels: topServices.value.map(s => s.name),
      datasets: [
        {
          data: topServices.value.map(s => s.count),
          backgroundColor: chartColors.slice(0, topServices.value.length),
          borderColor: 'rgba(19, 50, 21, 0.8)',
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    }

    // Habitaciones más reservadas - barra
    roomsChartData = {
      labels: topRooms.value.map(r => r.type),
      datasets: [
        {
          label: 'Reservas',
          data: topRooms.value.map(r => r.reservations),
          backgroundColor: chartColors.slice(0, topRooms.value.length).map(c => c + 'CC'),
          borderColor: chartColors.slice(0, topRooms.value.length),
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 40,
        },
      ],
    }

    // Horas pico - barra
    peakHoursChartData = {
      labels: peakHours.value.map(h => h.label),
      datasets: [
        {
          label: 'Reservaciones',
          data: peakHours.value.map(h => h.reservations),
          backgroundColor: 'rgba(212, 168, 67, 0.5)',
          borderColor: colors.gold,
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: 30,
        },
      ],
    }

    // Comparativa mensual: año vs año anterior
    comparativeChartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: '2026',
          data: [28000, 32000, 38000, 42000, 45000, 51000, 55000, 58000, 48000, 40000, 35000, 30000],
          backgroundColor: 'rgba(0, 206, 201, 0.15)',
          borderColor: colors.teal,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.teal,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: '2025',
          data: [22000, 25000, 30000, 33000, 35000, 40000, 42000, 45000, 37000, 32000, 28000, 24000],
          backgroundColor: 'rgba(212, 168, 67, 0.1)',
          borderColor: colors.gold,
          borderWidth: 2,
          borderDash: [6, 3],
          fill: false,
          tension: 0.4,
          pointBackgroundColor: colors.gold,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    }
  }

  /* ----------------------------------------------------------
     FORMAT HELPERS
     ---------------------------------------------------------- */
  function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function getDaysUntil(dateStr) {
    const now = new Date()
    const target = new Date(dateStr)
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
    return diff
  }

  function statusBadgeClass(status) {
    const map = {
      'checked-in': 'badge-success',
      'confirmed': 'badge-primary',
      'pending': 'badge-warning',
      'cancelled': 'badge-danger',
    }
    return map[status] || 'badge-default'
  }

  function statusLabel(status) {
    const map = {
      'checked-in': 'Check-in',
      'confirmed': 'Confirmada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada',
    }
    return map[status] || status
  }

  /* ----------------------------------------------------------
     PERIOD FILTER ACTIONS
     ---------------------------------------------------------- */
  function setPeriod(period) {
    selectedPeriod.value = period
  }

  /* ----------------------------------------------------------
     INIT
     ---------------------------------------------------------- */
  async function init() {
    loading.value = true
    error.value = null
    try {
      // Intenta obtener datos reales de la API
      const { data } = await api.get('/admin/dashboard')
      // Si la respuesta existe, mapeamos los campos...
      // Por ahora usamos datos simulados
      generateMockData()
    } catch {
      // Si falla la API, usamos datos simulados
      generateMockData()
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    init()
  })

  /* ----------------------------------------------------------
     RETURN
     ---------------------------------------------------------- */
  return {
    // State
    loading,
    error,
    selectedPeriod,

    // Today
    todayReservations,
    todayReservationsCount,
    todayCheckIns,
    todayCheckOuts,

    // Income
    dailyIncome,
    weeklyIncome,
    monthlyIncome,
    yearlyIncome,

    // Services & Peaks
    topServices,
    peakHours,
    topRooms,
    upcomingEvents,
    occupancyRate,

    // Chart data
    incomeChartData,
    occupancyChartData,
    servicesChartData,
    roomsChartData,
    peakHoursChartData,
    comparativeChartData,

    // Options
    chartOptions,

    // Helpers
    formatCurrency,
    formatDate,
    getDaysUntil,
    statusBadgeClass,
    statusLabel,

    // Actions
    setPeriod,
    init,
  }
}
