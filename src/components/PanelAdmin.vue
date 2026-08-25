<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { getUserInitials as utilsGetUserInitials } from '../composables/useUtils.js'
import { usePanelAdmin } from '../composables/usePanelAdmin.js'

const emit = defineEmits(['navigate'])
const { user, isAdmin, logout } = useAuth()

const {
  activeModule, contextMessage,
  loading, error, retry,
  calendarFilters, categoryLabels, filterColors, getFilterColor, calendarGrid, calendarTitle,
  prevMonth, nextMonth,
  todayReservations, todayReservationCount, todayConfirmedCount, todayPendingCount,
  incomePeriods, incomePeriodSelector, incomeChartData,
  topServices,
  hotelOccupancy,
  formatCurrency, statusBadgeClass, normalizeStatus, getBarHeight,
  showDayOverview, selectedDayDate, dayOverviewLoading, dayOverviewData,
  openDayOverview, closeDayOverview,
  tasks, employees, selectedDate, showTaskModal, editingTask,
  taskLoading, taskError,
  fetchTasks, createTask, updateTask, deleteTask,
  openTaskModal, openEditTaskModal, closeTaskModal,
  taskFilterEstado, taskFilterPrioridad, taskFilterEmpleado,
  filteredTasks, priorityLabel, priorityColor, estadoLabel, estadoColor,
  openNewTaskFromModule,
  members, selectedMemberId, selectedMember,
  memberSearch, memberPage, memberTotalPages, filteredMembers, paginatedMembers, MEMBERS_PER_PAGE,
  showMemberModal, openMemberModal, closeMemberModal,
  // Habitaciones
  rooms, roomTypes, roomsLoading, roomsError,
  showRoomForm, editingRoom, newRoom, roomFormError, roomFormSaving,
  fetchRooms, createRoom, updateRoom, deleteRoom, resetRoomForm, openEditRoom, onTipoChange,
  // Subida de imágenes
  imageUploading, formGallery,
  onSalonGalleryChange, onProductGalleryChange, onRoomGalleryChange,
  markGalleryPrincipal, removeGalleryImage,
  // Menú
  products, menuCategories, productsLoading, productsError,
  showProductForm, editingProduct, newProduct, productFormError, productFormSaving,
  fetchProducts, createProduct, updateProduct, deleteProduct, resetProductForm, openEditProduct,
  // Salones
  salons, salonsLoading, salonsError,
  showSalonForm, editingSalon, newSalon, salonFormError, salonFormSaving,
  fetchSalons, createSalon, updateSalon, deleteSalon, resetSalonForm, openEditSalon,
} = usePanelAdmin()

const todayDate = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

function getUserInitials() {
  return utilsGetUserInitials(user.value)
}

function setModule(mod) {
  activeModule.value = mod
}

// ─── Task Form ──────────────────────────────────────────────
const taskForm = ref({
  titulo: '',
  descripcion: '',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  prioridad: 'MEDIA',
  estado: 'PENDIENTE',
  asignado_a: '',
})

const taskFormError = ref('')
const taskFormSaving = ref(false)

watch(showTaskModal, (open) => {
  if (open) {
    taskFormError.value = ''
    if (editingTask.value) {
      taskForm.value = {
        titulo: editingTask.value.titulo,
        descripcion: editingTask.value.descripcion || '',
        fecha: editingTask.value.fecha,
        hora_inicio: editingTask.value.hora_inicio || '',
        hora_fin: editingTask.value.hora_fin || '',
        prioridad: editingTask.value.prioridad,
        estado: editingTask.value.estado,
        asignado_a: editingTask.value.asignado_a?.id || '',
      }
    } else {
      taskForm.value = {
        titulo: '',
        descripcion: '',
        fecha: selectedDate.value || new Date().toISOString().slice(0, 10),
        hora_inicio: '',
        hora_fin: '',
        prioridad: 'MEDIA',
        estado: 'PENDIENTE',
        asignado_a: '',
      }
    }
  }
})

async function handleSaveTask() {
  taskFormError.value = ''
  if (!taskForm.value.titulo.trim()) {
    taskFormError.value = 'El título es obligatorio.'
    return
  }
  if (!taskForm.value.fecha) {
    taskFormError.value = 'La fecha es obligatoria.'
    return
  }
  if (!taskForm.value.asignado_a) {
    taskFormError.value = 'Debes asignar la tarea a un empleado.'
    return
  }

  taskFormSaving.value = true
  try {
    const payload = {
      titulo: taskForm.value.titulo.trim(),
      descripcion: taskForm.value.descripcion.trim() || null,
      fecha: taskForm.value.fecha,
      hora_inicio: taskForm.value.hora_inicio || null,
      hora_fin: taskForm.value.hora_fin || null,
      prioridad: taskForm.value.prioridad,
      asignado_a: Number(taskForm.value.asignado_a),
    }

    if (editingTask.value) {
      payload.estado = taskForm.value.estado
      await updateTask(editingTask.value.id, payload)
    } else {
      await createTask(payload)
    }

    closeTaskModal()
    await fetchTasks()
  } catch (e) {
    taskFormError.value = e?.response?.data?.message || 'Error al guardar la tarea.'
  } finally {
    taskFormSaving.value = false
  }
}

async function handleDeleteTask() {
  if (!editingTask.value) return
  if (!confirm('¿Estás seguro de eliminar esta tarea?')) return
  taskFormSaving.value = true
  try {
    await deleteTask(editingTask.value.id)
    closeTaskModal()
    await fetchTasks()
  } catch {
    taskFormError.value = 'Error al eliminar la tarea.'
  } finally {
    taskFormSaving.value = false
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
  if (!isAdmin.value) emit('navigate', 'index')
  retry()
})
</script>

<template>
  <div class="lux-page">
    <!-- ═══════════════════ HEADER ═══════════════════ -->
    <header class="lux-header">
      <div class="lux-header-inner">
        <div class="lux-header-left">
          <button type="button" class="lux-back-btn" @click="emit('navigate', 'index')" aria-label="Volver al inicio" title="Volver al inicio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div class="lux-brand" @click="setModule('panel')">
            <img src="/imagenes/Logo.png" alt="Asogema" class="lux-logo" />
            <span class="lux-brand-text">Asogema</span>
            <span class="lux-brand-club">Club Privado</span>
          </div>
        </div>

        <nav class="lux-module-nav">
          <button class="lux-module-pill" :class="{ active: activeModule === 'panel' }" @click="setModule('panel')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Panel General</span>
          </button>
          <button class="lux-module-pill" :class="{ active: activeModule === 'calendario' }" @click="setModule('calendario')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Calendario</span>
          </button>
          <button class="lux-module-pill" :class="{ active: activeModule === 'tareas' }" @click="setModule('tareas')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path></svg>
            <span>Tareas</span>
          </button>
          <button class="lux-module-pill" :class="{ active: activeModule === 'socio' }" @click="setModule('socio')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            <span>Socios</span>
          </button>
          <button class="lux-module-pill" :class="{ active: activeModule === 'habitaciones' }" @click="setModule('habitaciones')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
            <span>Habitaciones</span>
          </button>
          <button class="lux-module-pill" :class="{ active: activeModule === 'menu' }" @click="setModule('menu')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-4l-2-2L2 12l10-8 8 8-2-2v4"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>Menú</span>
          </button>
          <button class="lux-module-pill" :class="{ active: activeModule === 'salones' }" @click="setModule('salones')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11m2.66-1.66a2.83 2.83 0 114 4L15 11.66l-3.08 3.08a2.83 2.83 0 01-4-4l3.08-3.08z"></path><line x1="16" y1="8" x2="21" y2="13"></line><line x1="21" y1="16" x2="16" y2="21"></line></svg>
            <span>Salones</span>
          </button>
        </nav>

        <div class="lux-header-right">
          <div class="lux-user-mini">
            <span class="lux-user-name">{{ user?.name || 'Admin' }}</span>
            <div class="lux-user-avatar">{{ getUserInitials() }}</div>
          </div>
          <button class="lux-header-btn" @click="logout(); emit('navigate', 'index')">Salir</button>
        </div>
      </div>
    </header>

    <!-- ═══════════════════ CONTEXT STRIP ═══════════════════ -->
    <div class="lux-context-strip">
      <div class="lux-context-inner">
        <span class="lux-context-dot"></span>
        <p>{{ contextMessage }}</p>
      </div>
    </div>

    <!-- ═══════════════════ MAIN ═══════════════════ -->
    <main class="lux-main">
      <div v-if="loading" class="lux-panel-state">
        <div class="lux-panel-spinner" aria-hidden="true"></div>
        <p>Cargando panel…</p>
      </div>

      <div v-else-if="error" class="lux-panel-state lux-panel-error" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p>{{ error }}</p>
        <button type="button" @click="retry" class="lux-panel-retry">Reintentar</button>
      </div>

      <template v-else>

        <!-- ═══════════════════════════════════════════════
             MODULE 1: PANEL GENERAL
             ═══════════════════════════════════════════════ -->
        <template v-if="activeModule === 'panel'">
          <section class="lux-section">
            <div class="lux-section-header">
              <h2>Resumen Ejecutivo</h2>
              <p class="lux-section-desc">{{ todayDate }}</p>
            </div>

            <div class="lux-kpi-banner">
              <div class="lux-kpi-card lux-kpi-green">
                <div class="lux-kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg></div>
                <div class="lux-kpi-body">
                  <span class="lux-kpi-label">Reservas del Día</span>
                  <div class="lux-kpi-value-row">
                    <span class="lux-kpi-value">{{ todayReservationCount }}</span>
                  </div>
                  <span class="lux-kpi-sub">{{ todayConfirmedCount }} confirmadas · {{ todayPendingCount }} pendientes</span>
                </div>
              </div>
              <div class="lux-kpi-card lux-kpi-teal">
                <div class="lux-kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path></svg></div>
                <div class="lux-kpi-body">
                  <span class="lux-kpi-label">Ingresos Hoy</span>
                  <div class="lux-kpi-value-row">
                    <span class="lux-kpi-value">{{ formatCurrency(incomePeriods.daily) }}</span>
                    <span v-if="incomePeriods.dailyChange" class="lux-kpi-trend positive">+{{ incomePeriods.dailyChange }}%</span>
                  </div>
                </div>
              </div>
              <div class="lux-kpi-card lux-kpi-purple">
                <div class="lux-kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path></svg></div>
                <div class="lux-kpi-body">
                  <span class="lux-kpi-label">Ocupación</span>
                  <div class="lux-kpi-value-row">
                    <span class="lux-kpi-value">{{ hotelOccupancy.current }}%</span>
                  </div>
                  <span class="lux-kpi-sub">{{ hotelOccupancy.occupiedRooms }}/{{ hotelOccupancy.totalRooms }} hab.</span>
                </div>
              </div>
              <div class="lux-kpi-card lux-kpi-amber">
                <div class="lux-kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
                <div class="lux-kpi-body">
                  <span class="lux-kpi-label">Ingresos Mensuales</span>
                  <div class="lux-kpi-value-row">
                    <span class="lux-kpi-value">{{ formatCurrency(incomePeriods.monthly) }}</span>
                    <span v-if="incomePeriods.monthlyChange" class="lux-kpi-trend positive">+{{ incomePeriods.monthlyChange }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="lux-section">
            <div class="lux-section-header">
              <h2>Reservas del Día</h2>
            </div>
            <div class="lux-card lux-card-table">
              <table class="lux-table">
                <thead>
                  <tr><th>Hora</th><th>Cliente</th><th>Servicio</th><th>Personas</th><th>Contacto</th><th>Notas</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  <tr v-for="r in todayReservations" :key="r.id">
                    <td><span class="lux-time-badge">{{ r.time }}</span></td>
                    <td><strong>{{ r.client }}</strong></td>
                    <td>{{ r.service }}</td>
                    <td>{{ r.guests }}</td>
                    <td class="lux-text-muted">{{ r.phone }}</td>
                    <td class="lux-text-muted">{{ r.notes || '—' }}</td>
                    <td><span class="lux-status-badge" :class="statusBadgeClass(r.status)">{{ r.status }}</span></td>
                  </tr>
                  <tr v-if="!todayReservations.length">
                    <td colspan="7" class="lux-empty-row">No hay reservas para hoy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>

        <!-- ═══════════════════════════════════════════════
             MODULE 2: CALENDARIO
             ═══════════════════════════════════════════════ -->
        <template v-if="activeModule === 'calendario'">
          <div class="lux-calendar-page">
            <div class="lux-cal-filters">
              <button
                v-for="(active, cat) in calendarFilters"
                :key="cat"
                class="lux-cal-filter-chip"
                :class="{ active: active }"
                :style="{ '--chip-color': getFilterColor(cat) }"
                @click="calendarFilters[cat] = !calendarFilters[cat]"
              >
                <span class="lux-chip-dot" :style="{ background: getFilterColor(cat) }"></span>
                {{ categoryLabels[cat] }}
              </button>
            </div>

            <div class="lux-cal-header">
              <button class="lux-cal-nav" @click="prevMonth">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <h2 class="lux-cal-title">{{ calendarTitle }}</h2>
              <button class="lux-cal-nav" @click="nextMonth">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>

            <div class="lux-cal-grid">
              <div class="lux-cal-weekdays">
                <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
              </div>
              <div class="lux-cal-days">
                <div
                  v-for="(cell, idx) in calendarGrid"
                  :key="idx"
                  class="lux-cal-day"
                  :class="{
                    'lux-cal-day-empty': !cell.day,
                    'lux-cal-day-today': cell.isToday,
                    'lux-cal-day-has-events': cell.events.length > 0 || cell.hasTasks,
                    'lux-cal-day-clickable': cell.day
                  }"
                  @click="cell.day && openDayOverview(cell.date)"
                >
                  <span v-if="cell.day" class="lux-cal-day-num">{{ cell.day }}</span>
                  <div v-if="cell.events.length > 0 || cell.hasTasks" class="lux-cal-events-dots">
                    <span v-for="ev in cell.events.slice(0, 2)" :key="ev.id" class="lux-cal-event-dot" :style="{ background: ev.color }" :title="ev.title"></span>
                    <span v-if="cell.hasTasks" class="lux-cal-event-dot lux-cal-task-dot" :style="{ background: '#e84393' }" :title="cell.tasks.length + ' tarea(s)'"></span>
                    <span v-if="cell.events.length + (cell.hasTasks ? 1 : 0) > 3" class="lux-cal-event-more">+{{ cell.events.length + cell.tasks.length - 3 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ═══════════════════════════════════════════════
             MODULE 3: TAREAS
             ═══════════════════════════════════════════════ -->
        <template v-if="activeModule === 'tareas'">
          <section class="lux-section">
            <div class="lux-section-header">
              <h2>Gestión de Tareas</h2>
              <button class="lux-btn-primary" @click="openNewTaskFromModule">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nueva Tarea
              </button>
            </div>

            <div class="lux-task-filters">
              <select v-model="taskFilterEstado" class="lux-task-filter-select">
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
              <select v-model="taskFilterPrioridad" class="lux-task-filter-select">
                <option value="">Todas las prioridades</option>
                <option value="URGENTE">Urgente</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
              <select v-model="taskFilterEmpleado" class="lux-task-filter-select">
                <option value="">Todos los empleados</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.nombre }}</option>
              </select>
            </div>

            <div v-if="taskLoading" class="lux-panel-state">
              <div class="lux-panel-spinner"></div>
              <p>Cargando tareas…</p>
            </div>

            <div v-else class="lux-card lux-card-table">
              <table class="lux-table">
                <thead>
                  <tr><th>Título</th><th>Fecha</th><th>Horario</th><th>Prioridad</th><th>Estado</th><th>Asignada a</th><th></th></tr>
                </thead>
                <tbody>
                  <tr v-for="t in filteredTasks" :key="t.id" class="lux-task-row" @click="openEditTaskModal(t)">
                    <td><strong>{{ t.titulo }}</strong></td>
                    <td>{{ t.fecha }}</td>
                    <td class="lux-text-muted">{{ t.hora_inicio || '—' }}{{ t.hora_fin ? ' - ' + t.hora_fin : '' }}</td>
                    <td><span class="lux-task-priority-badge" :style="{ background: priorityColor(t.prioridad) + '20', color: priorityColor(t.prioridad) }">{{ priorityLabel(t.prioridad) }}</span></td>
                    <td><span class="lux-task-estado-badge" :style="{ background: estadoColor(t.estado) + '20', color: estadoColor(t.estado) }">{{ estadoLabel(t.estado) }}</span></td>
                    <td class="lux-text-muted">{{ t.asignado_a?.nombre || '—' }}</td>
                    <td>
                      <button class="lux-task-edit-btn" @click.stop="openEditTaskModal(t)" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!filteredTasks.length && !taskLoading">
                    <td colspan="7" class="lux-empty-row">No hay tareas que coincidan con los filtros</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>

        <!-- ═══════════════════════════════════════════════
             MODULE 4: PANEL DEL SOCIO
             ═══════════════════════════════════════════════ -->
        <template v-if="activeModule === 'socio'">
          <div class="lux-socio-page">
            <div class="lux-socio-search">
              <svg class="lux-socio-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input v-model="memberSearch" type="text" class="lux-socio-search-input" placeholder="Buscar por nombre, email o teléfono..." />
              <span v-if="memberSearch" class="lux-socio-search-clear" @click="memberSearch = ''">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </span>
            </div>

            <div class="lux-card lux-card-table">
              <table class="lux-table">
                <thead>
                  <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Membresía</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  <tr v-for="m in paginatedMembers" :key="m.id" class="lux-socio-table-row" :class="{ active: selectedMemberId === m.id }" @click="openMemberModal(m.id)">
                    <td>
                      <div class="lux-socio-name-cell">
                        <div class="lux-socio-cell-avatar" :style="{ background: m.membershipColor }">{{ m.initials }}</div>
                        <strong>{{ m.name }}</strong>
                      </div>
                    </td>
                    <td class="lux-text-muted">{{ m.email }}</td>
                    <td class="lux-text-muted">{{ m.telefono || '—' }}</td>
                    <td>
                      <span class="lux-socio-membership-badge" :style="{ background: m.membershipColor + '20', color: m.membershipColor }">{{ m.membership }}</span>
                    </td>
                    <td><span class="lux-status-badge lux-status-confirmed">Activo</span></td>
                  </tr>
                  <tr v-if="paginatedMembers.length === 0">
                    <td colspan="5" class="lux-empty-row">No se encontraron socios</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="lux-socio-pagination">
              <span class="lux-socio-pagination-info">
                Mostrando {{ filteredMembers.length === 0 ? 0 : (memberPage - 1) * MEMBERS_PER_PAGE + 1 }}–{{ Math.min(memberPage * MEMBERS_PER_PAGE, filteredMembers.length) }} de {{ filteredMembers.length }}
              </span>
              <div class="lux-socio-pagination-btns">
                <button class="lux-socio-page-btn" :disabled="memberPage <= 1" @click="memberPage--">← Anterior</button>
                <span class="lux-socio-page-num">{{ memberPage }} / {{ memberTotalPages }}</span>
                <button class="lux-socio-page-btn" :disabled="memberPage >= memberTotalPages" @click="memberPage++">Siguiente →</button>
              </div>
            </div>
          </div>
        </template>

        <!-- ═══════════════════════════════════════════════
             MODULE 5: HABITACIONES
             ═══════════════════════════════════════════════ -->
        <template v-if="activeModule === 'habitaciones'">
          <div class="lux-section-header">
            <h2 class="lux-section-title">Habitaciones</h2>
            <button class="lux-btn-primary" @click="showRoomForm = true; editingRoom = null; resetRoomForm()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Nueva Habitación
            </button>
          </div>

          <div v-if="roomsLoading" class="lux-panel-state"><div class="lux-panel-spinner"></div><p>Cargando habitaciones...</p></div>
          <div v-else-if="roomsError" class="lux-panel-state lux-panel-error"><p>{{ roomsError }}</p><button class="lux-btn-secondary" @click="fetchRooms">Reintentar</button></div>
          <template v-else>
            <div class="lux-card lux-card-table">
              <table class="lux-table">
                <thead>
                  <tr><th>#</th><th>Piso</th><th>Tipo</th><th>Capacidad</th><th>Precio / Noche</th><th>Estado</th><th></th></tr>
                </thead>
                <tbody>
                  <tr v-for="room in rooms" :key="room.id">
                    <td><strong>{{ room.numero }}</strong></td>
                    <td>{{ room.piso }}</td>
                    <td>{{ room.tipos_habitacion?.nombre || '—' }}</td>
                    <td>{{ room.tipos_habitacion?.capacidad || '—' }}</td>
                    <td>{{ formatCurrency(room.tipos_habitacion?.precio_noche) }}</td>
                    <td><span class="lux-status-badge" :class="room.disponible ? 'lux-status-confirmed' : 'lux-status-cancelled'">{{ room.disponible ? 'Disponible' : 'Ocupada' }}</span></td>
                    <td class="lux-table-actions">
                      <button class="lux-icon-btn" @click="openEditRoom(room)" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button class="lux-icon-btn lux-icon-btn-danger" @click="deleteRoom(room.id)" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5-3h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"></path></svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="rooms.length === 0"><td colspan="7" class="lux-empty-row">No hay habitaciones registradas</td></tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- Room Form Modal -->
          <Teleport to="body">
            <div class="lux-modal-overlay" :class="{ active: showRoomForm }" @click.self="showRoomForm = false">
              <div class="lux-modal" v-if="showRoomForm">
                <button class="lux-modal-close" @click="showRoomForm = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div class="lux-modal-body">
                  <h2 class="lux-modal-title">{{ editingRoom ? 'Editar Habitación' : 'Nueva Habitación' }}</h2>
                  <div v-if="roomFormError" class="lux-task-form-error">{{ roomFormError }}</div>
                  <form class="lux-task-form" @submit.prevent="editingRoom ? updateRoom() : createRoom()">
                    <div class="lux-task-form-group">
                      <label>Número *</label>
                      <input v-model="newRoom.numero" type="text" placeholder="Ej: 101" required />
                    </div>
                    <div class="lux-task-form-row">
                      <div class="lux-task-form-group">
                        <label>Piso *</label>
                        <input v-model="newRoom.piso" type="number" min="1" placeholder="Ej: 1" required />
                      </div>
                      <div class="lux-task-form-group">
                        <label>Tipo *</label>
                        <select v-model="newRoom.tipo_id" required @change="onTipoChange">
                          <option value="" disabled>Seleccionar tipo...</option>
                          <option v-for="t in roomTypes" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="lux-task-form-row">
                      <div class="lux-task-form-group">
                        <label>Capacidad *</label>
                        <input v-model="newRoom.capacidad" type="number" min="1" placeholder="Ej: 2" required />
                      </div>
                      <div class="lux-task-form-group">
                        <label>Precio por noche *</label>
                        <input v-model="newRoom.precio_noche" type="number" min="0" step="1000" placeholder="Ej: 150000" required />
                      </div>
                    </div>
                    <div class="lux-task-form-group">
                      <label>Imágenes</label>
                      <div v-if="formGallery.length" class="lux-gallery-grid">
                        <div v-for="(img, i) in formGallery" :key="img.id ?? img.url" class="lux-gallery-item" :class="{ 'lux-gallery-item--principal': img.es_principal }">
                          <img :src="img.url" alt="Imagen de la galería" class="lux-gallery-thumb" />
                          <span v-if="img.es_principal" class="lux-gallery-badge">Principal</span>
                          <div class="lux-gallery-actions">
                            <button type="button" class="lux-gallery-btn" :disabled="img.es_principal || imageUploading" title="Marcar como principal" @click="markGalleryPrincipal(i, 'habitacion')">★</button>
                            <button type="button" class="lux-gallery-btn lux-gallery-btn-danger" title="Eliminar imagen" @click="removeGalleryImage(i, 'habitacion')">✕</button>
                          </div>
                        </div>
                      </div>
                      <input
                        class="lux-form-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        :disabled="imageUploading"
                        @change="onRoomGalleryChange"
                      />
                      <p v-if="imageUploading" class="lux-image-uploading">Subiendo imagen...</p>
                      <p v-else class="lux-text-muted" style="font-size: 11px; margin: 0">Puedes agregar varias imágenes. La marcada como principal será la portada.</p>
                    </div>
                    <p class="lux-text-muted" style="font-size: 11px; margin: -6px 0 0">El precio y la capacidad pertenecen al tipo de habitación y afectan a todas las habitaciones de ese tipo.</p>
                    <div class="lux-task-form-actions">
                      <div class="lux-task-form-actions-right">
                        <button type="button" class="lux-btn-secondary" @click="showRoomForm = false" :disabled="roomFormSaving">Cancelar</button>
                        <button type="submit" class="lux-btn-primary" :disabled="roomFormSaving">{{ roomFormSaving ? 'Guardando...' : (editingRoom ? 'Actualizar' : 'Crear') }}</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Teleport>
        </template>

        <!-- ═══════════════════════════════════════════════
             MODULE 6: MENÚ
             ═══════════════════════════════════════════════ -->
        <template v-if="activeModule === 'menu'">
          <div class="lux-section-header">
            <h2 class="lux-section-title">Menú</h2>
            <button class="lux-btn-primary" @click="showProductForm = true; editingProduct = null; resetProductForm()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Nuevo Producto
            </button>
          </div>

          <div v-if="productsLoading" class="lux-panel-state"><div class="lux-panel-spinner"></div><p>Cargando productos...</p></div>
          <div v-else-if="productsError" class="lux-panel-state lux-panel-error"><p>{{ productsError }}</p><button class="lux-btn-secondary" @click="fetchProducts">Reintentar</button></div>
          <template v-else>
            <div class="lux-card lux-card-table">
              <table class="lux-table">
                <thead>
                  <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th></th></tr>
                </thead>
                <tbody>
                  <tr v-for="p in products" :key="p.id">
                    <td><strong>{{ p.nombre }}</strong></td>
                    <td>{{ p.categorias_menu?.nombre || '—' }}</td>
                    <td>{{ formatCurrency(p.precio) }}</td>
                    <td :class="{ 'lux-text-muted': p.stock === 0 }">{{ p.stock }}</td>
                    <td class="lux-table-actions">
                      <button class="lux-icon-btn" @click="openEditProduct(p)" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button class="lux-icon-btn lux-icon-btn-danger" @click="deleteProduct(p.id)" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5-3h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"></path></svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="products.length === 0"><td colspan="5" class="lux-empty-row">No hay productos en el menú</td></tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- Product Form Modal -->
          <Teleport to="body">
            <div class="lux-modal-overlay" :class="{ active: showProductForm }" @click.self="showProductForm = false">
              <div class="lux-modal" v-if="showProductForm">
                <button class="lux-modal-close" @click="showProductForm = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div class="lux-modal-body">
                  <h2 class="lux-modal-title">{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
                  <div v-if="productFormError" class="lux-task-form-error">{{ productFormError }}</div>
                  <form class="lux-task-form" @submit.prevent="editingProduct ? updateProduct() : createProduct()">
                    <div class="lux-task-form-group">
                      <label>Nombre *</label>
                      <input v-model="newProduct.nombre" type="text" placeholder="Ej: Arroz con coco" required />
                    </div>
                    <div class="lux-task-form-row">
                      <div class="lux-task-form-group">
                        <label>Categoría *</label>
                        <select v-model="newProduct.categoria_id" required>
                          <option value="" disabled>Seleccionar categoría...</option>
                          <option v-for="c in menuCategories" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                        </select>
                      </div>
                      <div class="lux-task-form-group">
                        <label>Precio *</label>
                        <input v-model="newProduct.precio" type="number" min="0" step="100" placeholder="Ej: 25000" required />
                      </div>
                      <div class="lux-task-form-group">
                        <label>Stock *</label>
                        <input v-model="newProduct.stock" type="number" min="0" placeholder="Ej: 50" required />
                      </div>
                    </div>
                    <div class="lux-task-form-group">
                      <label>Descripción</label>
                      <textarea v-model="newProduct.descripcion" rows="2" placeholder="Descripción del plato..."></textarea>
                    </div>
                    <div class="lux-task-form-group">
                      <label>Imágenes</label>
                      <div v-if="formGallery.length" class="lux-gallery-grid">
                        <div v-for="(img, i) in formGallery" :key="img.id ?? img.url" class="lux-gallery-item" :class="{ 'lux-gallery-item--principal': img.es_principal }">
                          <img :src="img.url" alt="Imagen de la galería" class="lux-gallery-thumb" />
                          <span v-if="img.es_principal" class="lux-gallery-badge">Principal</span>
                          <div class="lux-gallery-actions">
                            <button type="button" class="lux-gallery-btn" :disabled="img.es_principal || imageUploading" title="Marcar como principal" @click="markGalleryPrincipal(i, 'producto')">★</button>
                            <button type="button" class="lux-gallery-btn lux-gallery-btn-danger" title="Eliminar imagen" @click="removeGalleryImage(i, 'producto')">✕</button>
                          </div>
                        </div>
                      </div>
                      <input
                        class="lux-form-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        :disabled="imageUploading"
                        @change="onProductGalleryChange"
                      />
                      <p v-if="imageUploading" class="lux-image-uploading">Subiendo imagen...</p>
                      <p v-else class="lux-text-muted" style="font-size: 11px; margin: 0">Puedes agregar varias imágenes. La marcada como principal será la portada.</p>
                    </div>
                    <div class="lux-task-form-actions">
                      <div class="lux-task-form-actions-right">
                        <button type="button" class="lux-btn-secondary" @click="showProductForm = false" :disabled="productFormSaving">Cancelar</button>
                        <button type="submit" class="lux-btn-primary" :disabled="productFormSaving">{{ productFormSaving ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear') }}</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Teleport>
        </template>

        <!-- ═══════════════════════════════════════════════
             MODULE 7: SALONES
             ═══════════════════════════════════════════════ -->
        <template v-if="activeModule === 'salones'">
          <div class="lux-section-header">
            <h2 class="lux-section-title">Salones de Eventos</h2>
            <button class="lux-btn-primary" @click="showSalonForm = true; editingSalon = null; resetSalonForm()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Nuevo Salón
            </button>
          </div>

          <div v-if="salonsLoading" class="lux-panel-state"><div class="lux-panel-spinner"></div><p>Cargando salones...</p></div>
          <div v-else-if="salonsError" class="lux-panel-state lux-panel-error"><p>{{ salonsError }}</p><button class="lux-btn-secondary" @click="fetchSalons">Reintentar</button></div>
          <template v-else>
            <div class="lux-salones-grid">
              <div v-for="s in salons" :key="s.id" class="lux-card lux-salon-card">
                <div class="lux-salon-card-header">
                  <h3>{{ s.nombre }}</h3>
                  <div class="lux-salon-card-actions">
                    <button class="lux-icon-btn" @click="openEditSalon(s)" title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="lux-icon-btn lux-icon-btn-danger" @click="deleteSalon(s.id)" title="Eliminar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5-3h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"></path></svg>
                    </button>
                  </div>
                </div>
                <div class="lux-salon-card-body">
                  <div class="lux-salon-stat"><span class="lux-salon-stat-label">Capacidad</span><span class="lux-salon-stat-value">{{ s.capacidad }} personas</span></div>
                  <div class="lux-salon-stat"><span class="lux-salon-stat-label">Precio Base</span><span class="lux-salon-stat-value">{{ formatCurrency(s.precio_base) }}</span></div>
                  <div v-if="s.ubicacion" class="lux-salon-stat"><span class="lux-salon-stat-label">Ubicación</span><span class="lux-salon-stat-value">{{ s.ubicacion }}</span></div>
                </div>
              </div>
              <div v-if="salons.length === 0" class="lux-panel-state"><p>No hay salones de eventos registrados</p></div>
            </div>
          </template>

          <!-- Salon Form Modal -->
          <Teleport to="body">
            <div class="lux-modal-overlay" :class="{ active: showSalonForm }" @click.self="showSalonForm = false">
              <div class="lux-modal" v-if="showSalonForm">
                <button class="lux-modal-close" @click="showSalonForm = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div class="lux-modal-body">
                  <h2 class="lux-modal-title">{{ editingSalon ? 'Editar Salón' : 'Nuevo Salón' }}</h2>
                  <div v-if="salonFormError" class="lux-task-form-error">{{ salonFormError }}</div>
                  <form class="lux-task-form" @submit.prevent="editingSalon ? updateSalon() : createSalon()">
                    <div class="lux-task-form-group">
                      <label>Nombre *</label>
                      <input v-model="newSalon.nombre" type="text" placeholder="Ej: Salón Principal" required />
                    </div>
                    <div class="lux-task-form-row">
                      <div class="lux-task-form-group">
                        <label>Capacidad *</label>
                        <input v-model="newSalon.capacidad" type="number" min="1" placeholder="Ej: 100" required />
                      </div>
                      <div class="lux-task-form-group">
                        <label>Precio Base *</label>
                        <input v-model="newSalon.precio_base" type="number" min="0" step="10000" placeholder="Ej: 500000" required />
                      </div>
                    </div>
                    <div class="lux-task-form-group">
                      <label>Ubicación</label>
                      <input v-model="newSalon.ubicacion" type="text" placeholder="Ej: Planta baja, ala este" />
                    </div>
                    <div class="lux-task-form-group">
                      <label>Imágenes</label>
                      <div v-if="formGallery.length" class="lux-gallery-grid">
                        <div v-for="(img, i) in formGallery" :key="img.id ?? img.url" class="lux-gallery-item" :class="{ 'lux-gallery-item--principal': img.es_principal }">
                          <img :src="img.url" alt="Imagen de la galería" class="lux-gallery-thumb" />
                          <span v-if="img.es_principal" class="lux-gallery-badge">Principal</span>
                          <div class="lux-gallery-actions">
                            <button type="button" class="lux-gallery-btn" :disabled="img.es_principal || imageUploading" title="Marcar como principal" @click="markGalleryPrincipal(i, 'salon')">★</button>
                            <button type="button" class="lux-gallery-btn lux-gallery-btn-danger" title="Eliminar imagen" @click="removeGalleryImage(i, 'salon')">✕</button>
                          </div>
                        </div>
                      </div>
                      <input
                        class="lux-form-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        :disabled="imageUploading"
                        @change="onSalonGalleryChange"
                      />
                      <p v-if="imageUploading" class="lux-image-uploading">Subiendo imagen...</p>
                      <p v-else class="lux-text-muted" style="font-size: 11px; margin: 0">Puedes agregar varias imágenes. La marcada como principal será la portada.</p>
                    </div>
                    <div class="lux-task-form-actions">
                      <div class="lux-task-form-actions-right">
                        <button type="button" class="lux-btn-secondary" @click="showSalonForm = false" :disabled="salonFormSaving">Cancelar</button>
                        <button type="submit" class="lux-btn-primary" :disabled="salonFormSaving">{{ salonFormSaving ? 'Guardando...' : (editingSalon ? 'Actualizar' : 'Crear') }}</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Teleport>
        </template>

      </template>
    </main>

    <!-- ═══════════════════ DAY OVERVIEW DRAWER ═══════════════════ -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="showDayOverview" class="lux-drawer-overlay" @click.self="closeDayOverview">
          <div class="lux-drawer" :class="{ open: showDayOverview }">
            <div class="lux-drawer-header">
              <div>
                <h2>{{ selectedDayDate ? new Date(selectedDayDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '' }}</h2>
                <span class="lux-drawer-subtitle">Resumen completo del día</span>
              </div>
              <button class="lux-drawer-close" @click="closeDayOverview">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div class="lux-drawer-body">
              <div v-if="dayOverviewLoading" class="lux-panel-state">
                <div class="lux-panel-spinner"></div>
                <p>Cargando…</p>
              </div>

              <template v-else>
                <!-- Tasks section -->
                <div class="lux-drawer-section">
                  <h3><span class="lux-drawer-section-dot" style="background:#e84393"></span> Tareas <span class="lux-drawer-count">{{ dayOverviewData.tasks.length }}</span></h3>
                  <div v-if="dayOverviewData.tasks.length === 0" class="lux-drawer-empty">Sin tareas para este día</div>
                  <div v-else class="lux-drawer-list">
                    <div v-for="t in dayOverviewData.tasks" :key="t.id" class="lux-drawer-item lux-drawer-task" @click="closeDayOverview(); openEditTaskModal(t)">
                      <div class="lux-drawer-item-left">
                        <span class="lux-drawer-task-priority" :style="{ background: priorityColor(t.prioridad) }"></span>
                        <div>
                          <strong>{{ t.titulo }}</strong>
                          <span v-if="t.descripcion" class="lux-drawer-item-desc">{{ t.descripcion }}</span>
                        </div>
                      </div>
                      <div class="lux-drawer-item-right">
                        <span v-if="t.hora_inicio" class="lux-drawer-item-time">{{ t.hora_inicio }}{{ t.hora_fin ? ' - ' + t.hora_fin : '' }}</span>
                        <span class="lux-task-estado-badge" :style="{ background: estadoColor(t.estado) + '20', color: estadoColor(t.estado) }">{{ estadoLabel(t.estado) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Reservations section -->
                <div class="lux-drawer-section">
                  <h3><span class="lux-drawer-section-dot" style="background:#0984e3"></span> Reservas <span class="lux-drawer-count">{{ dayOverviewData.reservations.length }}</span></h3>
                  <div v-if="dayOverviewData.reservations.length === 0" class="lux-drawer-empty">Sin reservas para este día</div>
                  <div v-else class="lux-drawer-list">
                    <div v-for="r in dayOverviewData.reservations" :key="r.id" class="lux-drawer-item">
                      <div class="lux-drawer-item-left">
                        <span class="lux-drawer-item-type" :class="'type-' + r.tipo.toLowerCase()">{{ r.tipo }}</span>
                        <div>
                          <strong>{{ r.cliente }}</strong>
                          <span class="lux-drawer-item-desc">{{ r.hora }} · {{ r.personas }} pers.</span>
                        </div>
                      </div>
                      <span class="lux-status-badge" :class="statusBadgeClass(normalizeStatus(r.estado))">{{ normalizeStatus(r.estado) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Events section -->
                <div class="lux-drawer-section">
                  <h3><span class="lux-drawer-section-dot" style="background:#6c5ce7"></span> Eventos <span class="lux-drawer-count">{{ dayOverviewData.events.length }}</span></h3>
                  <div v-if="dayOverviewData.events.length === 0" class="lux-drawer-empty">Sin eventos para este día</div>
                  <div v-else class="lux-drawer-list">
                    <div v-for="ev in dayOverviewData.events" :key="ev.id" class="lux-drawer-item">
                      <div class="lux-drawer-item-left">
                        <span class="lux-drawer-item-dot" :style="{ background: ev.color }"></span>
                        <div>
                          <strong>{{ ev.titulo }}</strong>
                          <span class="lux-drawer-item-desc">{{ ev.hora }} · {{ ev.ubicacion }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══════════════════ TASK CREATE/EDIT MODAL ═══════════════════ -->
    <Teleport to="body">
      <div class="lux-modal-overlay" :class="{ active: showTaskModal }" @click.self="closeTaskModal">
        <div class="lux-modal lux-modal-task" v-if="showTaskModal">
          <button class="lux-modal-close" @click="closeTaskModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="lux-modal-body">
            <h2 class="lux-modal-title">{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
            <div v-if="taskFormError" class="lux-task-form-error">{{ taskFormError }}</div>
            <form class="lux-task-form" @submit.prevent="handleSaveTask">
              <div class="lux-task-form-group">
                <label>Título *</label>
                <input v-model="taskForm.titulo" type="text" maxlength="150" placeholder="Ej: Limpiar salón principal" required />
              </div>
              <div class="lux-task-form-group">
                <label>Descripción</label>
                <textarea v-model="taskForm.descripcion" rows="3" placeholder="Detalles de la tarea..."></textarea>
              </div>
              <div class="lux-task-form-row">
                <div class="lux-task-form-group">
                  <label>Fecha *</label>
                  <input v-model="taskForm.fecha" type="date" required />
                </div>
                <div class="lux-task-form-group">
                  <label>Hora Inicio</label>
                  <input v-model="taskForm.hora_inicio" type="time" />
                </div>
                <div class="lux-task-form-group">
                  <label>Hora Fin</label>
                  <input v-model="taskForm.hora_fin" type="time" />
                </div>
              </div>
              <div class="lux-task-form-row">
                <div class="lux-task-form-group">
                  <label>Prioridad</label>
                  <select v-model="taskForm.prioridad">
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
                <div v-if="editingTask" class="lux-task-form-group">
                  <label>Estado</label>
                  <select v-model="taskForm.estado">
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROGRESO">En Progreso</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>
              <div class="lux-task-form-group">
                <label>Asignar a (Empleado) *</label>
                <select v-model="taskForm.asignado_a" required>
                  <option value="" disabled>Seleccionar empleado...</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.nombre }}</option>
                </select>
              </div>
              <div class="lux-task-form-actions">
                <button v-if="editingTask" type="button" class="lux-btn-danger" @click="handleDeleteTask" :disabled="taskFormSaving">Eliminar</button>
                <div class="lux-task-form-actions-right">
                  <button type="button" class="lux-btn-secondary" @click="closeTaskModal" :disabled="taskFormSaving">Cancelar</button>
                  <button type="submit" class="lux-btn-primary" :disabled="taskFormSaving">{{ taskFormSaving ? 'Guardando...' : (editingTask ? 'Actualizar' : 'Crear') }}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════════════ MEMBER DETAIL MODAL ═══════════════════ -->
    <Teleport to="body">
      <div class="lux-modal-overlay" :class="{ active: showMemberModal }" @click.self="closeMemberModal">
        <div class="lux-modal lux-modal-member" v-if="showMemberModal && selectedMember">
          <button class="lux-modal-close" @click="closeMemberModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="lux-modal-member-body">
            <div class="lux-socio-header">
              <div class="lux-socio-avatar" :style="{ background: selectedMember.membershipColor }">{{ selectedMember.initials }}</div>
              <div class="lux-socio-hello">
                <h2>{{ selectedMember.name }}</h2>
                <p>
                  <span class="lux-socio-badge" :style="{ background: selectedMember.membershipColor + '20', color: selectedMember.membershipColor }">Membresía {{ selectedMember.membership }}</span>
                  · {{ selectedMember.email }}
                </p>
              </div>
            </div>

            <div class="lux-socio-grid">
              <div class="lux-card">
                <div class="lux-card-header"><h3>Reservas</h3><span class="lux-badge">{{ selectedMember.reservations.length }}</span></div>
                <div class="lux-socio-list">
                  <div v-for="res in selectedMember.reservations" :key="res.id" class="lux-socio-list-item">
                    <div class="lux-socio-list-left">
                      <strong>{{ res.service }}</strong>
                      <span>{{ res.date }} · {{ res.guests }} pers.</span>
                    </div>
                    <span class="lux-status-badge" :class="statusBadgeClass(res.status)">{{ res.status }}</span>
                  </div>
                  <p v-if="!selectedMember.reservations.length" class="lux-socio-no-data">Sin reservas registradas</p>
                </div>
              </div>

              <div class="lux-card">
                <div class="lux-card-header"><h3>Pagos</h3><span class="lux-badge">{{ selectedMember.payments.invoices.length }} facturas</span></div>
                <div class="lux-payment-summary">
                  <span class="lux-payment-label">Total Facturado</span>
                  <span class="lux-payment-value">{{ formatCurrency(selectedMember.payments.totalFacturado) }}</span>
                </div>
                <div class="lux-socio-list" v-if="selectedMember.payments.invoices.length">
                  <div v-for="inv in selectedMember.payments.invoices" :key="inv.id" class="lux-socio-list-item">
                    <div class="lux-socio-list-left">
                      <strong>Factura Nº {{ inv.id }}</strong>
                      <span>{{ inv.date }}</span>
                    </div>
                    <span class="lux-history-amount">{{ formatCurrency(inv.amount) }}</span>
                  </div>
                </div>
                <p v-else class="lux-socio-no-data">Sin facturas registradas</p>
              </div>

              <div class="lux-card lux-card-wide">
                <div class="lux-card-header"><h3>Reservas de Eventos</h3><span class="lux-badge">{{ selectedMember.events.length }}</span></div>
                <div class="lux-socio-list">
                  <div v-for="ev in selectedMember.events" :key="ev.id" class="lux-socio-list-item">
                    <div class="lux-socio-list-left">
                      <strong>{{ ev.name }}</strong>
                      <span>{{ ev.date }} · {{ ev.location }}</span>
                    </div>
                    <span class="lux-rsvp-badge" :class="ev.rsvp">{{ ev.rsvp }}</span>
                  </div>
                  <p v-if="!selectedMember.events.length" class="lux-socio-no-data">Sin reservas de eventos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
@import url('../PanelAdmin.css');
</style>
