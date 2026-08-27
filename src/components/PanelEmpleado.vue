<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useEmployee } from '../composables/useEmployee.js'

const emit = defineEmits(['navigate'])
const { user, logout } = useAuth()

const {
  tasks, profile, loading, error, activeTab, updatingTaskId, actionError,
  historyLoading, hasMoreHistory,
  filteredTasks, stats, todayTasks,
  fetchMyTasks, fetchSummary, fetchHistory, fetchProfile, updateTaskStatus, completeTask, retry,
  allowedTransitions,
  priorityLabel, priorityColor, estadoLabel, estadoColor, isOverdue,
} = useEmployee()

const tabs = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'in_progress', label: 'En Progreso' },
  { id: 'completed', label: 'Completadas' },
  { id: 'history', label: 'Historial' },
]

const selectedTask = ref(null)
const showProfile = ref(false)

function getUserInitials() {
  if (!user.value) return '?'
  return user.value.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function handleLogout() {
  logout()
  emit('navigate', 'index')
}

function selectTab(tabId) {
  activeTab.value = tabId
  if (tabId === 'history') fetchHistory()
}

function openTask(task) {
  selectedTask.value = task
}

function closeTask() {
  selectedTask.value = null
}

// Acciones instantáneas (sin modal)
const ACTION_META = {
  'PENDIENTE>EN_PROGRESO': { label: 'Iniciar', cls: 'emp-task-action-blue' },
  'EN_PROGRESO>PENDIENTE': { label: 'Devolver', cls: 'emp-task-action-ghost' },
  'COMPLETADA>EN_PROGRESO': { label: 'Reabrir', cls: 'emp-task-action-ghost' },
}

function taskActions(task) {
  return allowedTransitions(task.estado)
    .filter(to => ACTION_META[`${task.estado}>${to}`])
    .map(to => ({ estado: to, ...ACTION_META[`${task.estado}>${to}`] }))
}

// Modal de completado (EN_PROGRESO → COMPLETADA requiere reporte)
const showCompleteModal = ref(false)
const completingTask = ref(null)
const reporteText = ref('')
const reporteFile = ref(null)
const reportePreview = ref(null)

function openCompleteModal(task) {
  completingTask.value = task
  reporteText.value = ''
  reporteFile.value = null
  reportePreview.value = null
  showCompleteModal.value = true
}

function onReporteFileChange(e) {
  const file = e.target.files?.[0] || null
  reporteFile.value = file
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { reportePreview.value = ev.target.result }
    reader.readAsDataURL(file)
  } else {
    reportePreview.value = null
  }
}

async function submitComplete() {
  if (!completingTask.value || !reporteText.value.trim()) return
  const result = await completeTask(completingTask.value.id, reporteText.value.trim(), reporteFile.value)
  if (result) {
    showCompleteModal.value = false
    selectedTask.value = null
  }
}

async function applyTransition(task, to) {
  const result = await updateTaskStatus(task.id, to)
  if (result && selectedTask.value?.id === task.id) {
    selectedTask.value = { ...selectedTask.value, estado: result.estado, updated_at: result.updated_at }
  }
}

function formatProfileDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTaskDate(fecha) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

onMounted(() => {
  window.scrollTo(0, 0)
  fetchMyTasks()
  fetchSummary()
  fetchProfile()
})
</script>

<template>
  <div class="emp-page">
    <!-- ══════════════════════════════════════════════════════
         HEADER
         ══════════════════════════════════════════════════════ -->
    <header class="emp-header">
      <div class="emp-header-inner">
        <div class="emp-header-left">
          <button
            type="button"
            class="emp-back-btn"
            @click="emit('navigate', 'index')"
            title="Volver al inicio"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div class="emp-brand">
            <img src="/imagenes/Logo.png" alt="Asogema" class="emp-logo" />
            <div class="emp-brand-text">
              <span class="emp-brand-name">Panel Empleado</span>
              <span class="emp-brand-sub">Gestión de Tareas</span>
            </div>
          </div>
        </div>
        <div class="emp-header-right">
          <button type="button" class="emp-user-pill emp-user-pill-btn" @click="showProfile = true" title="Ver mi perfil">
            <div class="emp-user-avatar">{{ getUserInitials() }}</div>
            <div class="emp-user-info">
              <span class="emp-user-name">{{ user?.name }}</span>
              <span class="emp-user-role">Empleado</span>
            </div>
          </button>
          <button class="emp-logout-btn" @click="handleLogout" title="Cerrar sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- ══════════════════════════════════════════════════════
         MAIN CONTENT
         ══════════════════════════════════════════════════════ -->
    <main class="emp-main">
      <!-- Loading State -->
      <div v-if="loading && tasks.length === 0" class="emp-state">
        <div class="emp-spinner"></div>
        <p>Cargando tus tareas...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error && tasks.length === 0" class="emp-state emp-state-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error }}</p>
        <button class="emp-btn-primary" @click="retry">Reintentar</button>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- ─── Stats Cards ──────────────────────────────── -->
        <div class="emp-stats-row">
          <div class="emp-stat-card">
            <div class="emp-stat-icon" style="background: rgba(0,206,201,0.1); color: #00cec9;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <div class="emp-stat-info">
              <span class="emp-stat-value">{{ stats.total }}</span>
              <span class="emp-stat-label">Total</span>
            </div>
          </div>
          <div class="emp-stat-card">
            <div class="emp-stat-icon" style="background: rgba(253,203,110,0.15); color: #fdcb6e;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="emp-stat-info">
              <span class="emp-stat-value">{{ stats.pending }}</span>
              <span class="emp-stat-label">Pendientes</span>
            </div>
          </div>
          <div class="emp-stat-card">
            <div class="emp-stat-icon" style="background: rgba(9,132,227,0.1); color: #0984e3;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path></svg>
            </div>
            <div class="emp-stat-info">
              <span class="emp-stat-value">{{ stats.inProgress }}</span>
              <span class="emp-stat-label">En Progreso</span>
            </div>
          </div>
          <div class="emp-stat-card">
            <div class="emp-stat-icon" style="background: rgba(0,184,148,0.1); color: #00b894;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="emp-stat-info">
              <span class="emp-stat-value">{{ stats.completed }}</span>
              <span class="emp-stat-label">Completadas</span>
            </div>
          </div>
        </div>

        <!-- ─── Today's Tasks Banner ────────────────────── -->
        <div v-if="todayTasks.length > 0" class="emp-today-banner">
          <div class="emp-today-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="emp-today-text">
            <strong>Tienes {{ todayTasks.length }} tarea{{ todayTasks.length > 1 ? 's' : '' }} hoy</strong>
            <span>{{ todayTasks.filter(t => t.estado !== 'COMPLETADA').length }} pendiente{{ todayTasks.filter(t => t.estado !== 'COMPLETADA').length !== 1 ? 's' : '' }} de completar</span>
          </div>
        </div>

        <!-- ─── Action Error Toast ───────────────────────── -->
        <div v-if="actionError" class="emp-action-error">
          {{ actionError }}
        </div>

        <!-- ─── Tab Filters ─────────────────────────────── -->
        <div class="emp-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="emp-tab"
            :class="{ active: activeTab === tab.id }"
            @click="selectTab(tab.id)"
          >
            {{ tab.label }}
            <span v-if="tab.id === 'pending' && stats.pending > 0" class="emp-tab-badge">{{ stats.pending }}</span>
            <span v-if="tab.id === 'in_progress' && stats.inProgress > 0" class="emp-tab-badge emp-tab-badge-blue">{{ stats.inProgress }}</span>
          </button>
        </div>

        <!-- ─── Tasks List ──────────────────────────────── -->
        <div v-if="filteredTasks.length === 0 && !historyLoading" class="emp-state emp-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px;color:var(--emp-text-light)">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <p>No hay tareas en esta categoría</p>
        </div>

        <div v-else class="emp-tasks-list">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="emp-task-card emp-task-clickable"
            :class="{
              'emp-task-completed': task.estado === 'COMPLETADA',
              'emp-task-overdue': (task.estado === 'PENDIENTE' || task.estado === 'EN_PROGRESO') && isOverdue(task.fecha)
            }"
            @click="openTask(task)"
          >
            <div class="emp-task-left">
              <span class="emp-task-priority" :style="{ background: priorityColor(task.prioridad) }" :title="priorityLabel(task.prioridad)"></span>
              <div class="emp-task-body">
                <h3 class="emp-task-title">{{ task.titulo }}</h3>
                <p v-if="task.descripcion" class="emp-task-desc">{{ task.descripcion }}</p>
                <div class="emp-task-meta">
                  <span class="emp-task-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
                    {{ formatTaskDate(task.fecha) }}
                  </span>
                  <span v-if="task.hora_inicio" class="emp-task-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {{ task.hora_inicio }}{{ task.hora_fin ? ' - ' + task.hora_fin : '' }}
                  </span>
                  <span class="emp-task-meta-item emp-task-assigner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    {{ task.asignado_por?.nombre || '—' }}
                  </span>
                  <span v-if="task.reporte" class="emp-task-meta-item emp-task-evidence">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    Con evidencia
                  </span>
                </div>
              </div>
            </div>
            <div class="emp-task-right">
              <span class="emp-task-badge" :style="{ background: priorityColor(task.prioridad) + '18', color: priorityColor(task.prioridad) }">
                {{ priorityLabel(task.prioridad) }}
              </span>
              <span class="emp-task-badge" :style="{ background: estadoColor(task.estado) + '18', color: estadoColor(task.estado) }">
                {{ estadoLabel(task.estado) }}
              </span>
              <button
                v-for="action in taskActions(task)"
                :key="action.estado"
                class="emp-task-action"
                :class="action.cls"
                :disabled="updatingTaskId === task.id"
                @click.stop="applyTransition(task, action.estado)"
              >
                <svg v-if="updatingTaskId === task.id" class="emp-btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path></svg>
                <template v-else>{{ action.label }}</template>
              </button>
              <button
                v-if="task.estado === 'EN_PROGRESO'"
                class="emp-task-action emp-task-action-green"
                :disabled="updatingTaskId === task.id"
                @click.stop="openCompleteModal(task)"
              >
                Completar
              </button>
            </div>
          </div>
        </div>

        <!-- ─── History: Load More ────────────────────────── -->
        <div v-if="activeTab === 'history'" class="emp-history-footer">
          <div v-if="historyLoading" class="emp-spinner"></div>
          <button
            v-else-if="hasMoreHistory"
            class="emp-btn-primary"
            @click="fetchHistory"
          >
            Cargar más
          </button>
        </div>
      </template>
    </main>

    <!-- ══════════════════════════════════════════════════════
         MODAL: DETALLE DE TAREA
         ══════════════════════════════════════════════════════ -->
    <div v-if="selectedTask" class="emp-modal-overlay" @click.self="closeTask">
      <div class="emp-modal">
        <div class="emp-modal-header">
          <h2 class="emp-modal-title">{{ selectedTask.titulo }}</h2>
          <button class="emp-modal-close" @click="closeTask" title="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="emp-modal-body">
          <div class="emp-modal-badges">
            <span class="emp-task-badge" :style="{ background: priorityColor(selectedTask.prioridad) + '18', color: priorityColor(selectedTask.prioridad) }">
              {{ priorityLabel(selectedTask.prioridad) }}
            </span>
            <span class="emp-task-badge" :style="{ background: estadoColor(selectedTask.estado) + '18', color: estadoColor(selectedTask.estado) }">
              {{ estadoLabel(selectedTask.estado) }}
            </span>
          </div>
          <p v-if="selectedTask.descripcion" class="emp-modal-desc">{{ selectedTask.descripcion }}</p>
          <p v-else class="emp-modal-desc emp-modal-desc-empty">Sin descripción.</p>
          <div v-if="selectedTask.reporte" class="emp-evidence-block">
            <h4 class="emp-evidence-title">Evidencia de cumplimiento</h4>
            <p class="emp-evidence-text">{{ selectedTask.reporte }}</p>
            <img v-if="selectedTask.reporte_imagen_url" :src="selectedTask.reporte_imagen_url" alt="Evidencia" class="emp-evidence-img" />
            <span v-if="selectedTask.reporte_at" class="emp-evidence-date">
              {{ new Date(selectedTask.reporte_at).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
          <dl class="emp-modal-detail">
            <div class="emp-modal-row">
              <dt>Fecha</dt>
              <dd>{{ formatTaskDate(selectedTask.fecha) }}</dd>
            </div>
            <div class="emp-modal-row" v-if="selectedTask.hora_inicio">
              <dt>Horario</dt>
              <dd>{{ selectedTask.hora_inicio }}{{ selectedTask.hora_fin ? ' - ' + selectedTask.hora_fin : '' }}</dd>
            </div>
            <div class="emp-modal-row">
              <dt>Asignada por</dt>
              <dd>{{ selectedTask.asignado_por?.nombre || '—' }}</dd>
            </div>
            <div class="emp-modal-row">
              <dt>Última actualización</dt>
              <dd>{{ new Date(selectedTask.updated_at).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</dd>
            </div>
          </dl>
        </div>
        <div class="emp-modal-footer">
          <button
            v-for="action in taskActions(selectedTask)"
            :key="action.estado"
            class="emp-task-action"
            :class="action.cls"
            :disabled="updatingTaskId === selectedTask.id"
            @click="applyTransition(selectedTask, action.estado)"
          >
            <svg v-if="updatingTaskId === selectedTask.id" class="emp-btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path></svg>
            <template v-else>{{ action.label }}</template>
          </button>
          <button
            v-if="selectedTask.estado === 'EN_PROGRESO'"
            class="emp-task-action emp-task-action-green"
            :disabled="updatingTaskId === selectedTask.id"
            @click="openCompleteModal(selectedTask)"
          >
            Completar
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MODAL: COMPLETAR TAREA
         ══════════════════════════════════════════════════════ -->
    <div v-if="showCompleteModal" class="emp-modal-overlay" @click.self="showCompleteModal = false">
      <div class="emp-modal">
        <div class="emp-modal-header">
          <h2 class="emp-modal-title">Completar tarea</h2>
          <button class="emp-modal-close" @click="showCompleteModal = false" title="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="emp-modal-body">
          <p class="emp-complete-task-name">{{ completingTask?.titulo }}</p>
          <label class="emp-form-label">Describe lo que realizaste *<span class="emp-form-hint">{{ reporteText.length }}/1000</span></label>
          <textarea
            v-model="reporteText"
            class="emp-form-textarea"
            placeholder="Ejemplo: Se revisó el sistema de riego, se reemplazó el filtro y se verificó la presión..."
            rows="4"
            maxlength="1000"
          ></textarea>
          <label class="emp-form-label">Foto de evidencia <span class="emp-form-hint">(opcional, máx 5MB)</span></label>
          <div class="emp-file-upload">
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="onReporteFileChange" class="emp-file-input" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>{{ reporteFile ? reporteFile.name : 'Seleccionar imagen...' }}</span>
          </div>
          <div v-if="reportePreview" class="emp-file-preview">
            <img :src="reportePreview" alt="Preview" />
            <button type="button" class="emp-file-remove" @click="reporteFile = null; reportePreview = null" title="Quitar imagen">✕</button>
          </div>
        </div>
        <div class="emp-modal-footer">
          <button class="emp-task-action emp-task-action-ghost" @click="showCompleteModal = false">Cancelar</button>
          <button
            class="emp-task-action emp-task-action-green"
            :disabled="updatingTaskId === completingTask?.id || !reporteText.trim()"
            @click="submitComplete"
          >
            <svg v-if="updatingTaskId === completingTask?.id" class="emp-btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path></svg>
            <template v-else>Marcar completada</template>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MODAL: PERFIL
         ══════════════════════════════════════════════════════ -->
    <div v-if="showProfile" class="emp-modal-overlay" @click.self="showProfile = false">
      <div class="emp-modal">
        <div class="emp-modal-header">
          <h2 class="emp-modal-title">Mi Perfil</h2>
          <button class="emp-modal-close" @click="showProfile = false" title="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="emp-modal-body">
          <div class="emp-profile-head">
            <div class="emp-user-avatar emp-profile-avatar">{{ getUserInitials() }}</div>
            <div>
              <strong class="emp-profile-name">{{ profile ? profile.nombre + ' ' + profile.apellido : user?.name }}</strong>
              <span class="emp-profile-role">{{ profile?.rol || 'Empleado' }}</span>
            </div>
          </div>
          <dl v-if="profile" class="emp-modal-detail">
            <div class="emp-modal-row">
              <dt>Correo</dt>
              <dd>{{ profile.correo }}</dd>
            </div>
            <div class="emp-modal-row">
              <dt>Teléfono</dt>
              <dd>{{ profile.telefono || '—' }}</dd>
            </div>
            <div class="emp-modal-row">
              <dt>Fecha de nacimiento</dt>
              <dd>{{ formatProfileDate(profile.fecha_nacimiento) }}</dd>
            </div>
            <div class="emp-modal-row">
              <dt>Dirección</dt>
              <dd>{{ profile.direccion || '—' }}</dd>
            </div>
          </dl>
          <div v-else class="emp-state emp-empty">
            <div class="emp-spinner" style="width:24px;height:24px;border-width:2px"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import url('../PanelEmpleado.css');
</style>
