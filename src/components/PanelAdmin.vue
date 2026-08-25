<script setup>
import { computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { getUserInitials as utilsGetUserInitials } from '../composables/useUtils.js'
import { usePanelAdmin } from '../composables/usePanelAdmin.js'

const emit = defineEmits(['navigate'])

const { user, isAdmin, logout } = useAuth()

const {
  activeModule, activeSubTab, contextMessage,
  loading, error, retry,
  members, selectedMemberId, selectedMember,
  calendarFilters, categoryLabels, calendarGrid, calendarTitle,
  prevMonth, nextMonth, selectedCalendarEvent, openCalendarEvent, closeCalendarEvent,
  todayReservations, todayReservationCount, todayConfirmedCount, todayPendingCount,
  incomePeriods, incomePeriodSelector, incomeChartData,
  topServices, peakHours, maxPeakCustomers,
  topRooms, maxRoomReservations,
  upcomingEvents, monthNames,
  hotelOccupancy,
  comparativeIncome, maxComparIncome,
  formatCurrency, statusBadgeClass, eventTypeBadgeClass,
  getBarHeight, getComparBarHeight,
} = usePanelAdmin()

const subTabs = [
  { id: 'resumen', label: 'Resumen', icon: 'layout-dashboard' },
  { id: 'reservas', label: 'Reservas del Día', icon: 'calendar-check' },
  { id: 'ingresos', label: 'Ingresos', icon: 'chart-line' },
  { id: 'servicios', label: 'Servicios', icon: 'bars' },
  { id: 'horaspico', label: 'Horas Pico', icon: 'trending-up' },
  { id: 'habitaciones', label: 'Habitaciones', icon: 'building' },
  { id: 'eventos', label: 'Eventos', icon: 'calendar' },
  { id: 'ocupacion', label: 'Ocupación', icon: 'pie-chart' },
  { id: 'comparativas', label: 'Comparativas', icon: 'bar-chart' },
]

const todayDate = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

function getUserInitials() {
  return utilsGetUserInitials(user.value)
}

function setModule(mod) {
  activeModule.value = mod
  if (mod === 'panel') activeSubTab.value = 'resumen'
}

const filterColors = {
  torneos: '#00cec9',
  eventos: '#6c5ce7',
  reservas: '#fdcb6e',
  mantenimiento: '#e17055',
  horarios: '#00b894',
}

function getFilterColor(cat) {
  return filterColors[cat] || '#00cec9'
}

onMounted(() => {
  window.scrollTo(0, 0)
  if (!isAdmin.value) {
    emit('navigate', 'index')
  }
  retry()
})
</script>

<template>
  <div class="lux-page">
    <!-- ══════════════════════════════════════════════════════
         HEADER — Dark ink navbar with module pills
         ══════════════════════════════════════════════════════ -->
    <header class="lux-header">
      <div class="lux-header-inner">
        <!-- Left: Back arrow + Brand / Logo -->
        <div class="lux-header-left">
          <button
            type="button"
            class="lux-back-btn"
            @click="emit('navigate', 'index')"
            aria-label="Volver al inicio"
            title="Volver al inicio"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>

          <div class="lux-brand" @click="emit('navigate', 'dashboard')">
            <img src="/imagenes/Logo.png" alt="Asogema" class="lux-logo" />
            <span class="lux-brand-text">Asogema</span>
            <span class="lux-brand-club">Club Privado</span>
          </div>
        </div>

        <!-- Module Pills -->
        <nav class="lux-module-nav">
          <button
            class="lux-module-pill"
            :class="{ active: activeModule === 'panel' }"
            @click="setModule('panel')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Panel General</span>
          </button>
          <button
            class="lux-module-pill"
            :class="{ active: activeModule === 'calendario' }"
            @click="setModule('calendario')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Calendario</span>
          </button>
          <button
            class="lux-module-pill"
            :class="{ active: activeModule === 'socio' }"
            @click="setModule('socio')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            <span>Panel del Socio</span>
          </button>
        </nav>

        <!-- Right section: Notifications + User -->
        <div class="lux-header-right">
          <button class="lux-notif-btn" title="Notificaciones">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 01-3.46 0"></path>
            </svg>
            <span class="lux-notif-dot"></span>
          </button>
          <div class="lux-user-mini">
            <span class="lux-user-name">{{ user?.name || 'Admin' }}</span>
            <div class="lux-user-avatar">{{ getUserInitials() }}</div>
          </div>
          <button class="lux-header-btn" @click="logout(); emit('navigate', 'index')">Salir</button>
        </div>
      </div>
    </header>

    <!-- ══════════════════════════════════════════════════════
         CONTEXTUAL MESSAGE STRIP
         ══════════════════════════════════════════════════════ -->
    <div class="lux-context-strip">
      <div class="lux-context-inner">
        <span class="lux-context-dot"></span>
        <p>{{ contextMessage }}</p>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MAIN CONTENT
         ══════════════════════════════════════════════════════ -->
    <main class="lux-main">

      <!-- Loading state -->
      <div v-if="loading" class="lux-panel-state">
        <div class="lux-panel-spinner" aria-hidden="true"></div>
        <p>Cargando panel…</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="lux-panel-state lux-panel-error" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error }}</p>
        <button type="button" @click="retry" class="lux-panel-retry">Reintentar</button>
      </div>

      <template v-else>
      <!-- ===================================================
           MODULE 1: PANEL GENERAL
           =================================================== -->
      <template v-if="activeModule === 'panel'">
        <!-- Sub-tab navigation -->
        <div class="lux-subtabs">
          <button
            v-for="tab in subTabs"
            :key="tab.id"
            class="lux-subtab"
            :class="{ active: activeSubTab === tab.id }"
            @click="activeSubTab = tab.id"
          >
            <svg v-if="tab.icon === 'layout-dashboard'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <svg v-else-if="tab.icon === 'calendar-check'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><polyline points="9 14 12 17 15 11"></polyline></svg>
            <svg v-else-if="tab.icon === 'chart-line'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <svg v-else-if="tab.icon === 'bars'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <svg v-else-if="tab.icon === 'trending-up'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <svg v-else-if="tab.icon === 'building'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><line x1="8" y1="6" x2="10" y2="6"></line><line x1="14" y1="6" x2="16" y2="6"></line></svg>
            <svg v-else-if="tab.icon === 'calendar'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
            <svg v-else-if="tab.icon === 'pie-chart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83"></path><path d="M22 12A10 10 0 0012 2v10z"></path></svg>
            <svg v-else-if="tab.icon === 'bar-chart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- ─── TAB: Resumen ─────────────────────────────── -->
        <section v-if="activeSubTab === 'resumen'" class="lux-section">
          <div class="lux-section-header">
            <h2>Resumen Ejecutivo</h2>
            <p class="lux-section-desc">{{ todayDate }}</p>
          </div>

          <!-- KPI Banner -->
          <div class="lux-kpi-banner">
            <div class="lux-kpi-card lux-kpi-green" @click="activeSubTab = 'reservas'">
              <div class="lux-kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg></div>
              <div class="lux-kpi-body">
                <span class="lux-kpi-label">Reservas del Día</span>
                <div class="lux-kpi-value-row">
                  <span class="lux-kpi-value">{{ todayReservationCount }}</span>
                  <span class="lux-kpi-trend positive">+12%</span>
                </div>
                <span class="lux-kpi-sub">{{ todayConfirmedCount }} confirmadas · {{ todayPendingCount }} pendientes</span>
              </div>
            </div>
            <div class="lux-kpi-card lux-kpi-teal" @click="activeSubTab = 'ingresos'">
              <div class="lux-kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path></svg></div>
              <div class="lux-kpi-body">
                <span class="lux-kpi-label">Ingresos Hoy</span>
                <div class="lux-kpi-value-row">
                  <span class="lux-kpi-value">{{ formatCurrency(incomePeriods.daily) }}</span>
                  <span class="lux-kpi-trend positive">+{{ incomePeriods.dailyChange }}%</span>
                </div>
                <span class="lux-kpi-sub">vs. ayer</span>
              </div>
            </div>
            <div class="lux-kpi-card lux-kpi-purple" @click="activeSubTab = 'ocupacion'">
              <div class="lux-kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path></svg></div>
              <div class="lux-kpi-body">
                <span class="lux-kpi-label">Ocupación</span>
                <div class="lux-kpi-value-row">
                  <span class="lux-kpi-value">{{ hotelOccupancy.current }}%</span>
                  <span class="lux-kpi-trend positive">+{{ hotelOccupancy.changeFromLastWeek }}%</span>
                </div>
                <span class="lux-kpi-sub">{{ hotelOccupancy.occupiedRooms }}/{{ hotelOccupancy.totalRooms }} habitaciones</span>
              </div>
            </div>
            <div class="lux-kpi-card lux-kpi-amber" @click="activeSubTab = 'ingresos'">
              <div class="lux-kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
              <div class="lux-kpi-body">
                <span class="lux-kpi-label">Ingresos Mensuales</span>
                <div class="lux-kpi-value-row">
                  <span class="lux-kpi-value">{{ formatCurrency(incomePeriods.monthly) }}</span>
                  <span class="lux-kpi-trend positive">+{{ incomePeriods.monthlyChange }}%</span>
                </div>
                <span class="lux-kpi-sub">vs. mes anterior</span>
              </div>
            </div>
          </div>

          <!-- Quick Access Cards -->
          <div class="lux-quick-grid">
            <button class="lux-quick-card" @click="activeSubTab = 'reservas'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><polyline points="9 14 12 17 15 11"></polyline></svg>
              <span>Reservas del Día</span>
            </button>
            <button class="lux-quick-card" @click="activeSubTab = 'ingresos'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <span>Ingresos</span>
            </button>
            <button class="lux-quick-card" @click="activeSubTab = 'servicios'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <span>Servicios</span>
            </button>
            <button class="lux-quick-card" @click="activeSubTab = 'horaspico'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              <span>Horas Pico</span>
            </button>
            <button class="lux-quick-card" @click="activeSubTab = 'habitaciones'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path></svg>
              <span>Habitaciones</span>
            </button>
            <button class="lux-quick-card" @click="activeSubTab = 'eventos'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
              <span>Eventos</span>
            </button>
            <button class="lux-quick-card" @click="activeSubTab = 'ocupacion'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83"></path><path d="M22 12A10 10 0 0012 2v10z"></path></svg>
              <span>Ocupación</span>
            </button>
            <button class="lux-quick-card" @click="activeSubTab = 'comparativas'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <span>Comparativas</span>
            </button>
          </div>
        </section>

        <!-- ─── TAB: Reservas del Día ────────────────────── -->
        <section v-if="activeSubTab === 'reservas'" class="lux-section">
          <div class="lux-section-header">
            <h2>Reservas del Día</h2>
            <p class="lux-section-desc">Todas las reservas programadas para hoy — {{ todayDate }}</p>
          </div>
          <div class="lux-card lux-card-table">
            <table class="lux-table">
              <thead>
                <tr>
                  <th>Hora</th><th>Cliente</th><th>Servicio</th><th>Personas</th><th>Contacto</th><th>Notas</th><th>Estado</th>
                </tr>
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
              </tbody>
            </table>
          </div>
        </section>

        <!-- ─── TAB: Ingresos ────────────────────────────── -->
        <section v-if="activeSubTab === 'ingresos'" class="lux-section">
          <div class="lux-section-header">
            <h2>Ingresos</h2>
            <div class="lux-period-selector">
              <button :class="{ active: incomePeriodSelector === 'diario' }" @click="incomePeriodSelector = 'diario'">Diario</button>
              <button :class="{ active: incomePeriodSelector === 'semanal' }" @click="incomePeriodSelector = 'semanal'">Semanal</button>
              <button :class="{ active: incomePeriodSelector === 'mensual' }" @click="incomePeriodSelector = 'mensual'">Mensual</button>
            </div>
          </div>
          <div class="lux-grid-2col">
            <div class="lux-card">
              <div class="lux-card-header">
                <h3>Evolución de Ingresos</h3>
                <span class="lux-badge">COP</span>
              </div>
              <div class="lux-compar-chart">
                <div class="lux-compar-legend">
                  <span class="lux-legend-item"><span class="lux-legend-dot current"></span> {{ new Date().getFullYear() }}</span>
                  <span class="lux-legend-item"><span class="lux-legend-dot previous"></span> {{ new Date().getFullYear() - 1 }}</span>
                </div>
                <div class="lux-compar-bars">
                  <div v-for="(label, idx) in incomeChartData.labels" :key="label" class="lux-compar-col">
                    <div class="lux-compar-bars-group">
                      <div class="lux-compar-bar current-year" :style="{ height: getComparBarHeight(incomeChartData.current[idx], Math.max(...incomeChartData.current, ...incomeChartData.previous)) + '%' }"></div>
                      <div class="lux-compar-bar previous-year" :style="{ height: getComparBarHeight(incomeChartData.previous[idx], Math.max(...incomeChartData.current, ...incomeChartData.previous)) + '%' }"></div>
                    </div>
                    <span class="lux-compar-label">{{ label }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="lux-card">
              <div class="lux-card-header">
                <h3>Resumen por Periodo</h3>
              </div>
              <div class="lux-periods-grid">
                <div class="lux-period-item">
                  <div class="lux-period-icon daily"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                  <span class="lux-period-label">Diario</span>
                  <span class="lux-period-value">{{ formatCurrency(incomePeriods.daily) }}</span>
                  <span class="lux-period-change positive">+{{ incomePeriods.dailyChange }}%</span>
                </div>
                <div class="lux-period-item">
                  <div class="lux-period-icon weekly"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg></div>
                  <span class="lux-period-label">Semanal</span>
                  <span class="lux-period-value">{{ formatCurrency(incomePeriods.weekly) }}</span>
                  <span class="lux-period-change positive">+{{ incomePeriods.weeklyChange }}%</span>
                </div>
                <div class="lux-period-item">
                  <div class="lux-period-icon monthly"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
                  <span class="lux-period-label">Mensual</span>
                  <span class="lux-period-value">{{ formatCurrency(incomePeriods.monthly) }}</span>
                  <span class="lux-period-change positive">+{{ incomePeriods.monthlyChange }}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── TAB: Servicios ───────────────────────────── -->
        <section v-if="activeSubTab === 'servicios'" class="lux-section">
          <div class="lux-section-header">
            <h2>Servicios Más Utilizados</h2>
            <p class="lux-section-desc">Ranking de servicios por volumen de reservas e ingresos</p>
          </div>
          <div class="lux-card">
            <div class="lux-services-list">
              <div v-for="s in topServices" :key="s.name" class="lux-service-item">
                <div class="lux-service-left">
                  <div class="lux-service-rank">{{ topServices.indexOf(s) + 1 }}</div>
                  <div class="lux-service-info">
                    <strong>{{ s.name }}</strong>
                    <span>{{ s.bookings }} reservas</span>
                  </div>
                </div>
                <div class="lux-service-bar-track">
                  <div class="lux-service-bar-fill" :style="{ width: Math.min(s.percentage, 100) + '%' }"></div>
                  <span class="lux-service-pct">{{ s.percentage }}%</span>
                </div>
                <span class="lux-service-change" :class="(s.change || '').startsWith('+') ? 'positive' : ''">{{ s.change || '—' }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── TAB: Horas Pico ──────────────────────────── -->
        <section v-if="activeSubTab === 'horaspico'" class="lux-section">
          <div class="lux-section-header">
            <h2>Horas Pico — Restaurante</h2>
            <p class="lux-section-desc">Afluencia de clientes por franja horaria (promedio diario)</p>
          </div>
          <div class="lux-card">
            <div class="lux-peak-chart">
              <div v-for="p in peakHours" :key="p.hour" class="lux-peak-bar-col">
                <div class="lux-peak-bar-wrap">
                  <div
                    class="lux-peak-bar"
                    :class="{ 'lux-peak-bar-high': p.customers > 40 }"
                    :style="{ height: getBarHeight(p.customers, maxPeakCustomers) + '%' }"
                  >
                    <span v-if="p.customers > 40" class="lux-peak-val">{{ p.customers }}</span>
                  </div>
                </div>
                <span class="lux-peak-label">{{ p.label }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── TAB: Habitaciones ─────────────────────────── -->
        <section v-if="activeSubTab === 'habitaciones'" class="lux-section">
          <div class="lux-section-header">
            <h2>Habitaciones Más Reservadas</h2>
            <p class="lux-section-desc">Ranking de habitaciones por número de reservas</p>
          </div>
          <div class="lux-card">
            <div class="lux-rooms-chart">
              <div v-for="(rm, i) in topRooms" :key="rm.code" class="lux-room-bar-item">
                <div class="lux-room-bar-left">
                  <span class="lux-room-rank-badge" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
                  <div class="lux-room-bar-info">
                    <strong>{{ rm.name }}</strong>
                    <span>{{ rm.code }} · {{ rm.type }}</span>
                  </div>
                </div>
                <div class="lux-room-bar-track">
                  <div class="lux-room-bar-fill" :style="{ width: getBarHeight(rm.reservations, maxRoomReservations) + '%' }">
                    <span class="lux-room-bar-count">{{ rm.reservations }}</span>
                  </div>
                </div>
                <div class="lux-room-bar-meta">
                  <span>{{ formatCurrency(rm.revenue) }}</span>
                  <span class="lux-room-occ" :class="{ high: rm.occupancy >= 85 }">{{ rm.occupancy }}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── TAB: Eventos ─────────────────────────────── -->
        <section v-if="activeSubTab === 'eventos'" class="lux-section">
          <div class="lux-section-header">
            <h2>Eventos Próximos</h2>
            <p class="lux-section-desc">Eventos programados en el club</p>
          </div>
          <div class="lux-events-grid">
            <div v-for="ev in upcomingEvents" :key="ev.id" class="lux-event-card">
              <div class="lux-event-date-box">
                <span class="lux-event-day">{{ new Date(ev.date).getDate() }}</span>
                <span class="lux-event-month">{{ monthNames[new Date(ev.date).getMonth()].slice(0, 3) }}</span>
              </div>
              <div class="lux-event-card-body">
                <h3>{{ ev.name }}</h3>
                <div class="lux-event-meta">
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> {{ ev.time }}</span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> {{ ev.location }}</span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg> {{ ev.attendees }} asistentes</span>
                </div>
                <div class="lux-event-card-footer">
                  <span class="lux-event-type-badge" :class="eventTypeBadgeClass(ev.type)">{{ ev.type }}</span>
                  <span class="lux-event-organizer">{{ ev.organizer }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── TAB: Ocupación ───────────────────────────── -->
        <section v-if="activeSubTab === 'ocupacion'" class="lux-section">
          <div class="lux-section-header">
            <h2>Porcentaje de Ocupación</h2>
            <p class="lux-section-desc">Nivel de ocupación actual del hotel</p>
          </div>
          <div class="lux-grid-2col">
            <div class="lux-card lux-card-center">
              <div class="lux-occupancy-ring">
                <svg viewBox="0 0 120 120" class="lux-ring-svg">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(19,50,21,0.06)" stroke-width="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="url(#occGradient)" stroke-width="10" stroke-linecap="round" :stroke-dasharray="`${(hotelOccupancy.current / 100) * 326.73} 326.73`" transform="rotate(-90 60 60)" class="lux-ring-progress" />
                  <defs>
                    <linearGradient id="occGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#00cec9" />
                      <stop offset="100%" stop-color="#133215" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="lux-ring-center">
                  <span class="lux-ring-pct">{{ hotelOccupancy.current }}%</span>
                  <span class="lux-ring-label">Ocupado</span>
                </div>
              </div>
              <div class="lux-occupancy-stats">
                <div class="lux-occ-stat-row">
                  <div class="lux-occ-stat"><span class="lux-occ-dot occupied"></span><span>Ocupadas</span><strong>{{ hotelOccupancy.occupiedRooms }}</strong></div>
                  <div class="lux-occ-stat"><span class="lux-occ-dot available"></span><span>Disponibles</span><strong>{{ hotelOccupancy.available }}</strong></div>
                </div>
                <div class="lux-occ-bar-track"><div class="lux-occ-bar-fill" :style="{ width: hotelOccupancy.current + '%' }"></div></div>
                <span class="lux-occ-growth"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> +{{ hotelOccupancy.changeFromLastWeek }}% vs. semana anterior</span>
              </div>
            </div>

            <!-- Historical mini chart -->
            <div class="lux-card">
              <div class="lux-card-header"><h3>Tendencia de Ocupación</h3><span class="lux-badge">Últimos 14 días</span></div>
              <div class="lux-hist-chart">
                <div v-for="(val, i) in hotelOccupancy.historical" :key="i" class="lux-hist-bar" :style="{ height: (val / 100) * 100 + '%' }" :title="val + '%'"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── TAB: Comparativas ────────────────────────── -->
        <section v-if="activeSubTab === 'comparativas'" class="lux-section">
          <div class="lux-section-header">
            <h2>Gráficas Comparativas</h2>
            <p class="lux-section-desc">Comparativa de ingresos año contra año y reservas por área</p>
          </div>
          <div class="lux-grid-2col">
            <div class="lux-card">
              <div class="lux-card-header"><h3>Ingresos Mensuales</h3><span class="lux-badge">{{ new Date().getFullYear() }} vs {{ new Date().getFullYear() - 1 }}</span></div>
              <div class="lux-compar-chart">
                <div class="lux-compar-legend">
                  <span class="lux-legend-item"><span class="lux-legend-dot current"></span> {{ new Date().getFullYear() }}</span>
                  <span class="lux-legend-item"><span class="lux-legend-dot previous"></span> {{ new Date().getFullYear() - 1 }}</span>
                </div>
                <div class="lux-compar-bars">
                  <div v-for="(label, idx) in comparativeIncome.labels" :key="label" class="lux-compar-col">
                    <div class="lux-compar-bars-group">
                      <div class="lux-compar-bar current-year" :style="{ height: getComparBarHeight(comparativeIncome.currentYear[idx], maxComparIncome) + '%' }" :title="comparativeIncome.currentYear[idx] + 'M'"></div>
                      <div class="lux-compar-bar previous-year" :style="{ height: getComparBarHeight(comparativeIncome.previousYear[idx], maxComparIncome) + '%' }" :title="comparativeIncome.previousYear[idx] + 'M'"></div>
                    </div>
                    <span class="lux-compar-label">{{ label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- ===================================================
           MODULE 2: CALENDARIO
           =================================================== -->
      <template v-if="activeModule === 'calendario'">
        <div class="lux-calendar-page">
          <!-- Filter chips -->
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

          <!-- Calendar header -->
          <div class="lux-cal-header">
            <button class="lux-cal-nav" @click="prevMonth">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <h2 class="lux-cal-title">{{ calendarTitle }}</h2>
            <button class="lux-cal-nav" @click="nextMonth">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <!-- Calendar grid -->
          <div class="lux-cal-grid">
            <div class="lux-cal-weekdays">
              <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
            </div>
            <div class="lux-cal-days">
              <div
                v-for="(cell, idx) in calendarGrid"
                :key="idx"
                class="lux-cal-day"
                :class="{ 'lux-cal-day-empty': !cell.day, 'lux-cal-day-today': cell.isToday, 'lux-cal-day-has-events': cell.events.length > 0 }"
              >
                <span v-if="cell.day" class="lux-cal-day-num">{{ cell.day }}</span>
                <div v-if="cell.events.length > 0" class="lux-cal-events-dots">
                  <span
                    v-for="ev in cell.events.slice(0, 3)"
                    :key="ev.id"
                    class="lux-cal-event-dot"
                    :style="{ background: ev.color }"
                    :title="ev.title"
                    @click="openCalendarEvent(ev)"
                  ></span>
                  <span v-if="cell.events.length > 3" class="lux-cal-event-more">+{{ cell.events.length - 3 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event detail modal -->
        <Teleport to="body">
          <div class="lux-modal-overlay" :class="{ active: selectedCalendarEvent }" @click.self="closeCalendarEvent">
            <div class="lux-modal" v-if="selectedCalendarEvent">
              <button class="lux-modal-close" @click="closeCalendarEvent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div class="lux-modal-body">
                <span class="lux-modal-cat-badge" :style="{ background: selectedCalendarEvent.color + '20', color: selectedCalendarEvent.color, borderColor: selectedCalendarEvent.color + '40' }">{{ categoryLabels[selectedCalendarEvent.category] }}</span>
                <h2 class="lux-modal-title">{{ selectedCalendarEvent.title }}</h2>
                <div class="lux-modal-meta">
                  <div class="lux-modal-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
                    <span>{{ selectedCalendarEvent.date }}</span>
                  </div>
                  <div class="lux-modal-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>{{ selectedCalendarEvent.time }}</span>
                  </div>
                  <div class="lux-modal-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{{ selectedCalendarEvent.location }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </template>

      <!-- ===================================================
           MODULE 3: PANEL DEL SOCIO
           =================================================== -->
      <template v-if="activeModule === 'socio' && selectedMember">
        <div class="lux-socio-page">
          <!-- Member selector -->
          <div class="lux-socio-selector">
            <button
              v-for="m in members"
              :key="m.id"
              class="lux-socio-pill"
              :class="{ active: selectedMemberId === m.id }"
              @click="selectedMemberId = m.id"
            >
              <div class="lux-socio-pill-avatar" :style="{ background: m.membershipColor }">{{ m.initials }}</div>
              <span>{{ m.name }}</span>
            </button>
          </div>

          <!-- Welcome header -->
          <div class="lux-socio-header">
            <div class="lux-socio-avatar" :style="{ background: selectedMember.membershipColor }">
              {{ selectedMember.initials }}
            </div>
            <div class="lux-socio-hello">
              <h2>Bienvenido, {{ selectedMember.name }}</h2>
              <p>
                <span class="lux-socio-badge" :style="{ background: selectedMember.membershipColor + '20', color: selectedMember.membershipColor }">
                  Membresía {{ selectedMember.membership }}
                </span>
                · {{ selectedMember.email }}
              </p>
            </div>
          </div>

          <!-- Dashboard grid -->
          <div class="lux-socio-grid">
            <!-- Mis Reservas -->
            <div class="lux-card">
              <div class="lux-card-header"><h3>Mis Reservas</h3><span class="lux-badge">{{ selectedMember.reservations.length }} activas</span></div>
              <div class="lux-socio-list">
                <div v-for="res in selectedMember.reservations" :key="res.id" class="lux-socio-list-item">
                  <div class="lux-socio-list-left">
                    <strong>{{ res.service }}</strong>
                    <span>{{ res.date }} · {{ res.time }} · {{ res.guests }} pers.</span>
                  </div>
                  <span class="lux-status-badge" :class="statusBadgeClass(res.status)">{{ res.status }}</span>
                </div>
              </div>
            </div>

            <!-- Mis Pagos -->
            <div class="lux-card">
              <div class="lux-card-header"><h3>Mis Pagos</h3></div>
              <div class="lux-socio-payments">
                <div class="lux-payment-big">
                  <span class="lux-payment-label">Saldo Actual</span>
                  <span class="lux-payment-value">{{ formatCurrency(selectedMember.payments.balance) }}</span>
                  <span class="lux-payment-status" :class="selectedMember.payments.status === 'al día' ? 'positive' : 'warning'">{{ selectedMember.payments.status }}</span>
                </div>
                <div class="lux-payment-last">
                  <span class="lux-payment-label">Último Pago</span>
                  <span class="lux-payment-amount">{{ formatCurrency(selectedMember.payments.lastPayment) }}</span>
                  <span class="lux-payment-date">{{ selectedMember.payments.lastPaymentDate }}</span>
                </div>
              </div>
            </div>

            <!-- Mis Invitados -->
            <div class="lux-card">
              <div class="lux-card-header"><h3>Mis Invitados</h3><span class="lux-badge">{{ selectedMember.guests.length }}</span></div>
              <div class="lux-socio-list">
                <div v-for="g in selectedMember.guests" :key="g.name" class="lux-socio-list-item">
                  <div class="lux-socio-list-left">
                    <strong>{{ g.name }}</strong>
                    <span>{{ g.relationship }}</span>
                  </div>
                  <span class="lux-guest-status" :class="g.status">{{ g.status }}</span>
                </div>
              </div>
            </div>

            <!-- Mis Eventos -->
            <div class="lux-card">
              <div class="lux-card-header"><h3>Mis Eventos</h3></div>
              <div class="lux-socio-list">
                <div v-for="ev in selectedMember.events" :key="ev.id" class="lux-socio-list-item">
                  <div class="lux-socio-list-left">
                    <strong>{{ ev.name }}</strong>
                    <span>{{ ev.date }} · {{ ev.time }} · {{ ev.location }}</span>
                  </div>
                  <span class="lux-rsvp-badge" :class="ev.rsvp">{{ ev.rsvp }}</span>
                </div>
              </div>
            </div>

            <!-- Mi Historial -->
            <div class="lux-card">
              <div class="lux-card-header"><h3>Mi Historial</h3><span class="lux-badge">Últimos movimientos</span></div>
              <div class="lux-socio-list">
                <div v-for="h in selectedMember.history" :key="h.date + h.action" class="lux-socio-list-item">
                  <div class="lux-socio-list-left">
                    <strong>{{ h.action }}</strong>
                    <span>{{ h.date }}</span>
                  </div>
                  <span class="lux-history-amount">{{ formatCurrency(h.amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Mis Beneficios -->
            <div class="lux-card">
              <div class="lux-card-header"><h3>Mis Beneficios</h3><span class="lux-badge">{{ selectedMember.benefits.filter(b => b.active).length }}/{{ selectedMember.benefits.length }} activos</span></div>
              <div class="lux-benefits-grid">
                <div v-for="b in selectedMember.benefits" :key="b.name" class="lux-benefit-item" :class="{ inactive: !b.active }">
                  <svg v-if="b.active" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  <span>{{ b.name }}</span>
                </div>
              </div>
            </div>

            <!-- Noticias del Club -->
            <div class="lux-card lux-card-wide">
              <div class="lux-card-header"><h3>Noticias del Club</h3></div>
              <div class="lux-news-list">
                <div v-for="n in selectedMember.news" :key="n.date + n.title" class="lux-news-item">
                  <div class="lux-news-date">
                    <span class="lux-news-day">{{ new Date(n.date).getDate() }}</span>
                    <span class="lux-news-month">{{ monthNames[new Date(n.date).getMonth()].slice(0, 3) }}</span>
                  </div>
                  <div class="lux-news-body">
                    <h4>{{ n.title }}</h4>
                    <p>{{ n.excerpt }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty members state -->
      <div v-else-if="activeModule === 'socio'" class="lux-panel-state">
        <p>No hay socios registrados para mostrar.</p>
      </div>
      </template>
    </main>
  </div>
</template>

<style>
@import url('../PanelAdmin.css');
</style>
