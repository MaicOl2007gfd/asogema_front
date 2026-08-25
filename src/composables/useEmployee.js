import { ref, computed } from 'vue'
import api from './useApi.js'

// ─── State ──────────────────────────────────────────────────
const tasks = ref([])
const profile = ref(null)
const loading = ref(false)
const error = ref(null)
const activeTab = ref('all')
const updatingTaskId = ref(null)

// ─── Computed ───────────────────────────────────────────────
const pendingTasks = computed(() =>
  tasks.value.filter(t => t.estado === 'PENDIENTE')
)

const inProgressTasks = computed(() =>
  tasks.value.filter(t => t.estado === 'EN_PROGRESO')
)

const completedTasks = computed(() =>
  tasks.value.filter(t => t.estado === 'COMPLETADA')
)

const filteredTasks = computed(() => {
  if (activeTab.value === 'all') return tasks.value
  if (activeTab.value === 'pending') return pendingTasks.value
  if (activeTab.value === 'in_progress') return inProgressTasks.value
  if (activeTab.value === 'completed') return completedTasks.value
  return tasks.value
})

const stats = computed(() => ({
  total: tasks.value.length,
  pending: pendingTasks.value.length,
  inProgress: inProgressTasks.value.length,
  completed: completedTasks.value.length,
}))

const todayTasks = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.value.filter(t => t.fecha === today)
})

// ─── API Calls ──────────────────────────────────────────────
async function fetchMyTasks() {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get('/employee/tasks/mine')
    tasks.value = (data || []).map(t => ({
      id: t.id,
      titulo: t.titulo,
      descripcion: t.descripcion,
      fecha: t.fecha,
      hora_inicio: t.hora_inicio,
      hora_fin: t.hora_fin,
      estado: t.estado,
      prioridad: t.prioridad,
      asignado_por: t.asignado_por,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }))
  } catch {
    error.value = 'No se pudieron cargar las tareas.'
  } finally {
    loading.value = false
  }
}

async function fetchProfile() {
  try {
    const { data } = await api.get('/employee/profile')
    profile.value = data
  } catch {
    // Silencioso
  }
}

async function updateTaskStatus(taskId, newStatus) {
  updatingTaskId.value = taskId
  try {
    const { data } = await api.patch(`/employee/tasks/${taskId}/status`, {
      estado: newStatus,
    })
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) {
      tasks.value[idx] = {
        ...tasks.value[idx],
        estado: data.estado,
        updated_at: data.updated_at,
      }
    }
    return data
  } finally {
    updatingTaskId.value = null
  }
}

function retry() {
  fetchMyTasks()
  fetchProfile()
}

// ─── Helpers ────────────────────────────────────────────────
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

function isOverdue(fecha) {
  const today = new Date().toISOString().slice(0, 10)
  return fecha < today
}

// ─── Exports ────────────────────────────────────────────────
export function useEmployee() {
  return {
    tasks, profile, loading, error, activeTab, updatingTaskId,
    pendingTasks, inProgressTasks, completedTasks,
    filteredTasks, stats, todayTasks,
    fetchMyTasks, fetchProfile, updateTaskStatus, retry,
    priorityLabel, priorityColor, estadoLabel, estadoColor, isOverdue,
  }
}
