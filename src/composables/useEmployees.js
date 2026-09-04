import { ref, computed } from 'vue'
import api from './useApi.js'

const employees = ref([])
const loading = ref(false)
const error = ref(null)
const showForm = ref(false)
const editingEmployee = ref(null)
const formError = ref(null)
const formLoading = ref(false)

// Vista de la tabla: 'activos' | 'eliminados' (nunca mezcladas).
// GET /admin/employees ya devuelve activos e inactivos: se parte en cliente,
// igual que productos (productView) y salones (salonView).
const employeeView = ref('activos')

const activeEmployees = computed(() => employees.value.filter(e => e.estado !== false))

const inactiveEmployees = computed(() => employees.value.filter(e => e.estado === false))

const inactiveEmployeesCount = computed(() => inactiveEmployees.value.length)

const visibleEmployees = computed(() => employeeView.value === 'eliminados' ? inactiveEmployees.value : activeEmployees.value)

function toggleEmployeeView() {
  employeeView.value = employeeView.value === 'activos' ? 'eliminados' : 'activos'
}

function mapEmployee(e) {
  return {
    id: e.id,
    nombre: e.nombre,
    correo: e.correo,
    telefono: e.telefono,
    estado: e.estado,
    apellido: e.apellido,
    tipo_documento_id: e.tipo_documento_id,
    numero_documento: e.numero_documento,
  }
}

async function fetchEmployees() {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get('/admin/employees')
    employees.value = (data || []).map(mapEmployee)
  } catch {
    error.value = 'No se pudieron cargar los empleados.'
  } finally {
    loading.value = false
  }
}

async function fetchEmployeeDetail(id) {
  const { data } = await api.get(`/admin/employees/${id}`)
  return mapEmployee(data)
}

async function createEmployee(employeeData) {
  formLoading.value = true
  formError.value = null
  try {
    const { data } = await api.post('/admin/employees', employeeData)
    employees.value.push(mapEmployee(data))
    showForm.value = false
    return data
  } catch (err) {
    formError.value = extractError(err)
    throw err
  } finally {
    formLoading.value = false
  }
}

async function updateEmployee(id, employeeData) {
  formLoading.value = true
  formError.value = null
  try {
    const { data } = await api.patch(`/admin/employees/${id}`, employeeData)
    const idx = employees.value.findIndex(e => e.id === id)
    if (idx !== -1) {
      employees.value[idx] = mapEmployee({ ...employees.value[idx], ...data })
    }
    showForm.value = false
    return data
  } catch (err) {
    formError.value = extractError(err)
    throw err
  } finally {
    formLoading.value = false
  }
}

async function deactivateEmployee(id) {
  await api.delete(`/admin/employees/${id}`)
  const emp = employees.value.find(e => e.id === id)
  if (emp) emp.estado = false
}

async function reactivateEmployee(id) {
  await api.patch(`/admin/employees/${id}/reactivate`)
  const emp = employees.value.find(e => e.id === id)
  if (emp) emp.estado = true
}

function openCreateForm() {
  editingEmployee.value = null
  formError.value = null
  showForm.value = true
}

async function openEditForm(id) {
  formError.value = null
  const detail = await fetchEmployeeDetail(id)
  editingEmployee.value = detail
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingEmployee.value = null
  formError.value = null
}

function extractError(err) {
  if (err.response?.status === 409) {
    return err.response?.data?.message || 'El correo o documento ya está registrado'
  }
  if (err.response?.data?.message) {
    const msg = err.response.data.message
    return Array.isArray(msg) ? msg[0] : msg
  }
  return 'Error de conexión. Intenta de nuevo.'
}

export function useEmployees() {
  return {
    employees,
    activeEmployees,
    inactiveEmployees,
    inactiveEmployeesCount,
    visibleEmployees,
    employeeView,
    toggleEmployeeView,
    loading,
    error,
    showForm,
    editingEmployee,
    formError,
    formLoading,
    fetchEmployees,
    fetchEmployeeDetail,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    reactivateEmployee,
    openCreateForm,
    openEditForm,
    closeForm,
  }
}
