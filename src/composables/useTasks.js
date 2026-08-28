import { ref, computed } from 'vue'
import api from './useApi.js'
import { useEmployees } from './useEmployees.js'

// ─── Shared employee state ─────────────────────────────────
const { employees } = useEmployees()

// ─── State ──────────────────────────────────────────────────
const tasks = ref([])
const selectedDate = ref(null)
const showTaskModal = ref(false)
const editingTask = ref(null)
const taskLoading = ref(false)
const taskError = ref(null)

// ─── Computed ───────────────────────────────────────────────
const tasksForSelectedDate = computed(() => {
  if (!selectedDate.value) return []
  return tasks.value.filter(t => t.fecha === selectedDate.value)
})

const tasksByDate = computed(() => {
  const map = {}
  tasks.value.forEach(t => {
    if (!map[t.fecha]) map[t.fecha] = []
    map[t.fecha].push(t)
  })
  return map
})

// ─── API Calls ──────────────────────────────────────────────
async function fetchTasks(filters = {}) {
  taskLoading.value = true
  taskError.value = null
  try {
    const params = {}
    if (filters.fecha) params.fecha = filters.fecha
    if (filters.empleado_id) params.empleado_id = filters.empleado_id
    if (filters.estado) params.estado = filters.estado
    if (filters.mes) params.mes = filters.mes

    const { data } = await api.get('/admin/tasks', { params })
    tasks.value = (data || []).map(t => ({
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
      asignado_a: t.asignado_a,
      asignado_por: t.asignado_por,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }))
  } catch {
    taskError.value = 'No se pudieron cargar las tareas.'
  } finally {
    taskLoading.value = false
  }
}

async function createTask(taskData) {
  const { data } = await api.post('/admin/tasks', taskData)
  const newTask = {
    id: data.id,
    titulo: data.titulo,
    descripcion: data.descripcion,
    fecha: data.fecha,
    hora_inicio: data.hora_inicio,
    hora_fin: data.hora_fin,
    estado: data.estado,
    prioridad: data.prioridad,
    reporte: data.reporte,
    reporte_imagen_url: data.reporte_imagen_url,
    reporte_at: data.reporte_at,
    asignado_a: data.asignado_a,
    asignado_por: data.asignado_por,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
  tasks.value.push(newTask)
  return newTask
}

async function updateTask(id, taskData) {
  const { data } = await api.patch(`/admin/tasks/${id}`, taskData)
  const idx = tasks.value.findIndex(t => t.id === id)
  if (idx !== -1) {
    tasks.value[idx] = {
      id: data.id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha: data.fecha,
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      estado: data.estado,
      prioridad: data.prioridad,
      reporte: data.reporte,
      reporte_imagen_url: data.reporte_imagen_url,
      reporte_at: data.reporte_at,
      asignado_a: data.asignado_a,
      asignado_por: data.asignado_por,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  }
  return data
}

async function deleteTask(id) {
  await api.delete(`/admin/tasks/${id}`)
  tasks.value = tasks.value.filter(t => t.id !== id)
}

// ─── UI Helpers ─────────────────────────────────────────────
function openTaskModal(date) {
  editingTask.value = null
  selectedDate.value = date
  showTaskModal.value = true
}

function openEditTaskModal(task) {
  editingTask.value = { ...task }
  selectedDate.value = task.fecha
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
  editingTask.value = null
}

// ─── Exports ────────────────────────────────────────────────
export function useTasks() {
  return {
    tasks,
    employees,
    selectedDate,
    showTaskModal,
    editingTask,
    taskLoading,
    taskError,
    tasksForSelectedDate,
    tasksByDate,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    openTaskModal,
    openEditTaskModal,
    closeTaskModal,
  }
}
