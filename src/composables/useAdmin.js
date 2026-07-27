import { ref, computed, onMounted } from 'vue'

/**
 * Composable for the Admin Panel — manages role editing and income overview.
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
  }
}
