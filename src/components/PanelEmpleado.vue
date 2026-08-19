<script setup>
import { computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useEmployee } from '../composables/useEmployee.js'

const emit = defineEmits(['navigate'])
const { user, logout } = useAuth()

const {
  loading, error, activeTab, updatingTaskId,
  pendingTasks, inProgressTasks, completedTasks,
  filteredTasks, stats, todayTasks,
  fetchMyTasks, fetchProfile, updateTaskStatus, retry,
  priorityLabel, priorityColor, estadoLabel, estadoColor, isOverdue,
} = useEmployee()

const tabs = [
  { id: 'all', label: 'Todas', icon: 'list' },
  { id: 'pending', label: 'Pendientes', icon: 'clock' },
  { id: 'in_progress', label: 'En Progreso', icon: 'loader' },
  { id: 'completed', label: 'Completadas', icon: 'check-circle' },
]

function getUserInitials() {
  if (!user.value) return '?'
  return user.value.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function handleLogout() {
  logout()
  emit('navigate', 'index')
}

function nextStatus(current) {
  const flow = { PENDIENTE: 'EN_PROGRESO', EN_PROGRESO: 'COMPLETADA' }
  return flow[current] || null
}

function nextStatusLabel(current) {
  const map = { PENDIENTE: 'Iniciar', EN_PROGRESO: 'Completar' }
  return map[current] || null
}

async function advanceTask(task) {
  const next = nextStatus(task.estado)
  if (!next) return
  await updateTaskStatus(task.id, next)
}

onMounted(() => {
  window.scrollTo(0, 0)
  fetchMyTasks()
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
          <div class="emp-user-pill">
            <div class="emp-user-avatar">{{ getUserInitials() }}</div>
            <div class="emp-user-info">
              <span class="emp-user-name">{{ user?.name }}</span>
              <span class="emp-user-role">Empleado</span>
            </div>
          </div>
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

        <!-- ─── Tab Filters ─────────────────────────────── -->
        <div class="emp-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="emp-tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
            <span v-if="tab.id === 'pending' && stats.pending > 0" class="emp-tab-badge">{{ stats.pending }}</span>
            <span v-if="tab.id === 'in_progress' && stats.inProgress > 0" class="emp-tab-badge emp-tab-badge-blue">{{ stats.inProgress }}</span>
          </button>
        </div>

        <!-- ─── Tasks List ──────────────────────────────── -->
        <div v-if="filteredTasks.length === 0" class="emp-state emp-empty">
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
            class="emp-task-card"
            :class="{
              'emp-task-completed': task.estado === 'COMPLETADA',
              'emp-task-overdue': task.estado !== 'COMPLETADA' && isOverdue(task.fecha)
            }"
          >
            <div class="emp-task-left">
              <span class="emp-task-priority" :style="{ background: priorityColor(task.prioridad) }" :title="priorityLabel(task.prioridad)"></span>
              <div class="emp-task-body">
                <h3 class="emp-task-title">{{ task.titulo }}</h3>
                <p v-if="task.descripcion" class="emp-task-desc">{{ task.descripcion }}</p>
                <div class="emp-task-meta">
                  <span class="emp-task-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
                    {{ new Date(task.fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }) }}
                  </span>
                  <span v-if="task.hora_inicio" class="emp-task-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {{ task.hora_inicio }}{{ task.hora_fin ? ' - ' + task.hora_fin : '' }}
                  </span>
                  <span class="emp-task-meta-item emp-task-assigner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    {{ task.asignado_por?.nombre || '—' }}
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
                v-if="nextStatus(task.estado)"
                class="emp-task-action"
                :class="{ 'emp-task-action-blue': task.estado === 'PENDIENTE', 'emp-task-action-green': task.estado === 'EN_PROGRESO' }"
                :disabled="updatingTaskId === task.id"
                @click="advanceTask(task)"
              >
                <svg v-if="updatingTaskId === task.id" class="emp-btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path></svg>
                <template v-else>{{ nextStatusLabel(task.estado) }}</template>
              </button>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style>
@import url('../PanelEmpleado.css');
</style>
