import { ref, computed } from 'vue'
import api from './useApi.js'

// ─── State ──────────────────────────────────────────────────
const tasks = ref([])
const profile = ref(null)
const loading = ref(false)
const error = ref(null)
const activeTab = ref('all')
const updatingTaskId = ref(null)
const actionError = ref(null)

// Historial (completadas/canceladas, paginado)
const historyTasks = ref([])
const historyPage = ref(0)
const historyTotalPages = ref(0)
const historyLoading = ref(false)

// Conteos reales por estado (desde el backend)
const summary = ref(null)

// Transiciones permitidas para el empleado (espejo del backend)
const EMPLOYEE_TRANSITIONS = {
  PENDIENTE: ['EN_PROGRESO'],
  EN_PROGRESO: ['PENDIENTE', 'COMPLETADA'],
  COMPLETADA: ['EN_PROGRESO'],
  CANCELADA: [],
}

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
  if (activeTab.value === 'history') return historyTasks.value
  return tasks.value
})

// Stat cards: usa el summary real del backend cuando está disponible
const stats = computed(() => {
  if (summary.value) {
    return {
      total: summary.value.total,
      pending: summary.value.pendientes,
      inProgress: summary.value.en_progreso,
      completed: summary.value.completadas,
    }
  }
  return {
    total: tasks.value.length,
    pending: pendingTasks.value.length,
    inProgress: inProgressTasks.value.length,
    completed: completedTasks.value.length,
  }
})

const todayTasks = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.value.filter(t => t.fecha === today)
})

const hasMoreHistory = computed(
  () => historyPage.value < historyTotalPages.value
)

// ─── Mappers ────────────────────────────────────────────────
function mapTask(t) {
  return {
    id: t.id,
    titulo: t.titulo,
    descripcion: t.descripcion,
    fecha: t.fecha,
    hora_inicio: t.hora_inicio,
    hora_fin: t.hora_fin,
    estado: t.estado,
    prioridad: t.prioridad,
    reporte: t.reporte,
    reporte_imagen_url: t.reporte_imagen_url,
    reporte_at: t.reporte_at,
    asignado_por: t.asignado_por,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }
}

// ─── API Calls ──────────────────────────────────────────────
async function fetchMyTasks() {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get('/employee/tasks/mine')
    tasks.value = (data || []).map(mapTask)
  } catch {
    error.value = 'No se pudieron cargar las tareas.'
  } finally {
    loading.value = false
  }
}

async function fetchSummary() {
  try {
    const { data } = await api.get('/employee/tasks/summary')
    summary.value = data
  } catch {
    // Silencioso — las cards caen al conteo local
  }
}

async function fetchHistory() {
  if (historyLoading.value || !hasMoreHistory.value && historyPage.value > 0) return
  historyLoading.value = true
  try {
    const nextPage = historyPage.value + 1
    const { data } = await api.get('/employee/tasks/history', {
      params: { page: nextPage, limit: 15 },
    })
    historyTasks.value = [...historyTasks.value, ...(data.data || []).map(mapTask)]
    historyPage.value = data.page
    historyTotalPages.value = data.totalPages
  } finally {
    historyLoading.value = false
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

function showActionError(message) {
  actionError.value = message
  setTimeout(() => { actionError.value = null }, 4000)
}

async function updateTaskStatus(taskId, newStatus) {
  updatingTaskId.value = taskId
  actionError.value = null
  try {
    const { data } = await api.patch(`/employee/tasks/${taskId}/status`, {
      estado: newStatus,
    })
    const updated = mapTask(data)
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...updated }
    }
    const hIdx = historyTasks.value.findIndex(t => t.id === taskId)
    if (hIdx !== -1) {
      historyTasks.value[hIdx] = { ...historyTasks.value[hIdx], ...updated }
    }
    fetchSummary()
    return data
  } catch (err) {
    showActionError(err.response?.data?.message || 'No se pudo actualizar la tarea.')
    return null
  } finally {
    updatingTaskId.value = null
  }
}

async function completeTask(taskId, reporte, file) {
  updatingTaskId.value = taskId
  actionError.value = null
  try {
    const form = new FormData()
    form.append('reporte', reporte)
    if (file) form.append('file', file)

    const { data } = await api.post(`/employee/tasks/${taskId}/complete`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const updated = mapTask(data)
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...updated }
    }
    fetchSummary()
    return updated
  } catch (err) {
    showActionError(err.response?.data?.message || 'No se pudo completar la tarea.')
    return null
  } finally {
    updatingTaskId.value = null
  }
}

function retry() {
  fetchMyTasks()
  fetchSummary()
  fetchProfile()
}

// ─── Helpers ────────────────────────────────────────────────
function allowedTransitions(estado) {
  return EMPLOYEE_TRANSITIONS[estado] || []
}

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
    tasks, profile, loading, error, activeTab, updatingTaskId, actionError,
    historyTasks, historyLoading, hasMoreHistory,
    summary,
    pendingTasks, inProgressTasks, completedTasks,
    filteredTasks, stats, todayTasks,
    fetchMyTasks, fetchSummary, fetchHistory, fetchProfile, updateTaskStatus, completeTask, retry,
    allowedTransitions,
    priorityLabel, priorityColor, estadoLabel, estadoColor, isOverdue,
  }
}
