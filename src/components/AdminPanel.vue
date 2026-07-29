<script setup>
import { computed } from 'vue'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const props = defineProps({
  admin: { type: Object, required: true },
})

const {
  loading,
  todayReservations,
  todayReservationsCount,
  todayCheckIns,
  todayCheckOuts,
  dailyIncome,
  weeklyIncome,
  monthlyIncome,
  yearlyIncome,
  topServices,
  peakHours,
  topRooms,
  upcomingEvents,
  occupancyRate,
  incomeChartData,
  occupancyChartData,
  servicesChartData,
  roomsChartData,
  peakHoursChartData,
  comparativeChartData,
  chartOptions,
  formatCurrency,
  formatDate,
  getDaysUntil,
  statusBadgeClass,
  statusLabel,
} = props.admin

// ── Chart options override para Doughnut ──
const doughnutOptions = computed(() => ({
  ...chartOptions,
  cutout: '65%',
  plugins: {
    ...chartOptions.plugins,
    legend: {
      ...chartOptions.plugins.legend,
      position: 'bottom',
    },
  },
}))

// ── Badge de estado para eventos ──
function eventTypeLabel(type) {
  const map = {
    wedding: 'Boda',
    conference: 'Conferencia',
    wellness: 'Bienestar',
    gala: 'Gala',
    adventure: 'Aventura',
    party: 'Fiesta',
  }
  return map[type] || type
}

function eventTypeIcon(type) {
  const icons = {
    wedding: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    conference: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    wellness: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    gala: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    adventure: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 6.9 8 11.7z"/></svg>',
    party: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  }
  return icons[type] || ''
}
</script>

<template>
  <section class="admin-panel" v-if="!loading">
    <!-- ==========================================
         HEADER
         ========================================== -->
    <div class="admin-panel-header">
      <div class="admin-panel-title-group">
        <div class="admin-panel-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <div>
          <h2 class="admin-panel-title">Panel de Administración</h2>
          <p class="admin-panel-subtitle">Resumen completo del Hotel Asogema</p>
        </div>
      </div>
      <div class="admin-panel-occupancy">
        <div class="occupancy-ring">
          <svg viewBox="0 0 100 100">
            <circle class="occ-ring-bg" cx="50" cy="50" r="42" />
            <circle
              class="occ-ring-fill"
              cx="50" cy="50" r="42"
              :style="{ strokeDashoffset: 264 - (264 * occupancyRate) / 100 }"
            />
            <text x="50" y="48" text-anchor="middle" class="occ-value">{{ occupancyRate }}%</text>
            <text x="50" y="62" text-anchor="middle" class="occ-label">Ocupación</text>
          </svg>
        </div>
      </div>
    </div>

    <!-- ==========================================
         STATS CARDS ROW
         ========================================== -->
    <div class="admin-stats-grid">
      <!-- Reservas del día -->
      <div class="admin-stat-card">
        <div class="stat-card-icon stat-icon-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div class="stat-card-body">
          <span class="stat-card-value">{{ todayReservationsCount }}</span>
          <span class="stat-card-label">Reservas Hoy</span>
          <div class="stat-card-detail">
            <span class="stat-detail-check">✔ {{ todayCheckIns }} Check-in</span>
            <span class="stat-detail-check">✘ {{ todayCheckOuts }} Check-out</span>
          </div>
        </div>
      </div>

      <!-- Ingresos del día -->
      <div class="admin-stat-card">
        <div class="stat-card-icon stat-icon-green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        </div>
        <div class="stat-card-body">
          <span class="stat-card-value">{{ formatCurrency(dailyIncome) }}</span>
          <span class="stat-card-label">Ingresos Hoy</span>
          <div class="stat-card-periods">
            <span class="period-tag">Sem: {{ formatCurrency(weeklyIncome) }}</span>
            <span class="period-tag">Mes: {{ formatCurrency(monthlyIncome) }}</span>
          </div>
        </div>
      </div>

      <!-- Ocupación -->
      <div class="admin-stat-card">
        <div class="stat-card-icon stat-icon-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div class="stat-card-body">
          <span class="stat-card-value">{{ occupancyRate }}%</span>
          <span class="stat-card-label">Ocupación Hotel</span>
          <div class="stat-card-bar">
            <div class="stat-bar-track">
              <div class="stat-bar-fill" :style="{ width: occupancyRate + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ingresos Anuales -->
      <div class="admin-stat-card">
        <div class="stat-card-icon stat-icon-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div class="stat-card-body">
          <span class="stat-card-value">{{ formatCurrency(yearlyIncome) }}</span>
          <span class="stat-card-label">Ingresos Anuales</span>
          <span class="stat-card-trend trend-up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            +18.3% vs año anterior
          </span>
        </div>
      </div>
    </div>

    <!-- ==========================================
         TWO-COLUMN LAYOUT
         ========================================== -->
    <div class="admin-columns">

      <!-- LEFT COLUMN -->
      <div class="admin-col admin-col-left">

        <!-- Gráfica de Ingresos -->
        <div class="admin-chart-card">
          <div class="chart-card-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Ingresos Semanales
            </h3>
          </div>
          <div class="chart-card-body">
            <div class="chart-container" v-if="incomeChartData">
              <Line :data="incomeChartData" :options="chartOptions" />
            </div>
            <div v-else class="chart-empty">Cargando...</div>
          </div>
        </div>

        <!-- Horas Pico Restaurante -->
        <div class="admin-chart-card">
          <div class="chart-card-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              Horas Pico — Restaurante
            </h3>
          </div>
          <div class="chart-card-body">
            <div class="chart-container" v-if="peakHoursChartData">
              <Bar :data="peakHoursChartData" :options="chartOptions" />
            </div>
            <div v-else class="chart-empty">Cargando...</div>
          </div>
        </div>

        <!-- Habitaciones más reservadas -->
        <div class="admin-chart-card">
          <div class="chart-card-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Habitaciones Más Reservadas
            </h3>
          </div>
          <div class="chart-card-body">
            <div class="chart-container" v-if="roomsChartData">
              <Bar :data="roomsChartData" :options="chartOptions" />
            </div>
            <div v-else class="chart-empty">Cargando...</div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN -->
      <div class="admin-col admin-col-right">

        <!-- Ocupación Mensual -->
        <div class="admin-chart-card">
          <div class="chart-card-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              Ocupación Mensual
            </h3>
          </div>
          <div class="chart-card-body">
            <div class="chart-container" v-if="occupancyChartData">
              <Line :data="occupancyChartData" :options="chartOptions" />
            </div>
            <div v-else class="chart-empty">Cargando...</div>
          </div>
        </div>

        <!-- Servicios más utilizados (Doughnut) -->
        <div class="admin-chart-card">
          <div class="chart-card-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76A6 6 0 0012 6v6l-4.24 4.24a6 6 0 108.48-8.48z"/></svg>
              Servicios Más Utilizados
            </h3>
          </div>
          <div class="chart-card-body chart-card-body-doughnut">
            <div class="doughnut-container" v-if="servicesChartData">
              <Doughnut :data="servicesChartData" :options="doughnutOptions" />
            </div>
            <div v-else class="chart-empty">Cargando...</div>
          </div>
        </div>

        <!-- Comparativa de Ingresos -->
        <div class="admin-chart-card admin-chart-card-wide">
          <div class="chart-card-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Comparativa Ingresos: 2026 vs 2025
            </h3>
          </div>
          <div class="chart-card-body">
            <div class="chart-container" v-if="comparativeChartData">
              <Line :data="comparativeChartData" :options="chartOptions" />
            </div>
            <div v-else class="chart-empty">Cargando...</div>
          </div>
        </div>

      </div>
    </div>

    <!-- ==========================================
         RESERVAS DEL DÍA — TABLE
         ========================================== -->
    <div class="admin-table-card">
      <div class="table-card-header">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Reservas del Día
          <span class="table-card-count">{{ todayReservations.length }}</span>
        </h3>
      </div>
      <div class="table-card-body">
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Huésped</th>
                <th>Habitación</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Estado</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="res in todayReservations" :key="res.id">
                <td class="td-guest">
                  <div class="td-avatar">{{ res.guest.split(' ').map(w => w[0]).join('').slice(0, 2) }}</div>
                  <span>{{ res.guest }}</span>
                </td>
                <td>{{ res.room }}</td>
                <td>{{ res.checkIn }}</td>
                <td>{{ res.checkOut }}</td>
                <td>
                  <span class="admin-badge" :class="statusBadgeClass(res.status)">{{ statusLabel(res.status) }}</span>
                </td>
                <td class="td-amount">{{ formatCurrency(res.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==========================================
         EVENTOS PRÓXIMOS
         ========================================== -->
    <div class="admin-events-card">
      <div class="table-card-header">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Eventos Próximos
          <span class="table-card-count">{{ upcomingEvents.length }}</span>
        </h3>
      </div>
      <div class="events-grid">
        <div
          v-for="ev in upcomingEvents"
          :key="ev.id"
          class="event-card"
          :class="'event-' + ev.type"
        >
          <div class="event-card-icon" v-html="eventTypeIcon(ev.type)"></div>
          <div class="event-card-body">
            <h4 class="event-card-title">{{ ev.title }}</h4>
            <div class="event-card-meta">
              <span class="event-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ formatDate(ev.date) }}
              </span>
              <span class="event-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ ev.time }}
              </span>
              <span class="event-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                {{ ev.guests }} invitados
              </span>
            </div>
            <div class="event-card-footer">
              <span class="event-type-tag">{{ eventTypeLabel(ev.type) }}</span>
              <span class="event-countdown" v-if="getDaysUntil(ev.date) > 0">
                En {{ getDaysUntil(ev.date) }} día(s)
              </span>
              <span class="event-countdown event-today" v-else>Hoy</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         SERVICIOS POPULARES — Lista horizontal
         ========================================== -->
    <div class="admin-services-card">
      <div class="table-card-header">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76A6 6 0 0012 6v6l-4.24 4.24a6 6 0 108.48-8.48z"/></svg>
          Ranking de Servicios
        </h3>
      </div>
      <div class="services-ranking">
        <div
          v-for="(svc, idx) in topServices"
          :key="svc.name"
          class="service-rank-item"
        >
          <div class="service-rank-pos">
            <span class="rank-num" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
          </div>
          <div class="service-rank-info">
            <span class="service-rank-name">{{ svc.name }}</span>
            <div class="service-rank-bar-track">
              <div
                class="service-rank-bar-fill"
                :style="{ width: svc.percentage + '%' }"
              ></div>
            </div>
          </div>
          <span class="service-rank-count">{{ svc.count }} usos</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Loading state -->
  <section class="admin-panel admin-panel-loading" v-else>
    <div class="admin-loading-content">
      <svg class="admin-spinner" viewBox="0 0 50 50">
        <circle class="admin-spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
      </svg>
      <p>Cargando datos del panel...</p>
    </div>
  </section>
</template>

<style scoped>
/* ============================================================
   ADMIN PANEL — Dark elegant theme (extends dashboard)
   ============================================================ */

/* ── CSS Variables ── */
.admin-panel {
  --admin-bg: #1a2e1c;
  --admin-card-bg: rgba(26, 46, 28, 0.85);
  --admin-card-border: rgba(0, 206, 201, 0.08);
  --admin-text: #F3E8D3;
  --admin-text-muted: #7a9a7a;
  --admin-text-dim: #4a6b4a;
  --admin-accent: #00cec9;
  --admin-gold: #d4a843;
  --admin-green: #2d5a2e;
  --admin-teal: #00cec9;
  --admin-radius: 16px;
  --admin-transition: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  --admin-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);

  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 48px 80px;
  position: relative;
}

/* ── Header ── */
.admin-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
  gap: 24px;
  flex-wrap: wrap;
}

.admin-panel-title-group {
  display: flex;
  align-items: center;
  gap: 18px;
}

.admin-panel-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--admin-accent), #00b894);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 206, 201, 0.25);
}

.admin-panel-icon svg {
  width: 26px;
  height: 26px;
  color: #0b1f0d;
}

.admin-panel-title {
  font-size: clamp(22px, 2.2vw, 28px);
  font-weight: 800;
  color: var(--admin-text);
  letter-spacing: -0.5px;
  margin: 0;
}

.admin-panel-subtitle {
  font-size: 14px;
  color: var(--admin-text-muted);
  margin: 4px 0 0;
}

/* ── Occupancy Ring ── */
.admin-panel-occupancy {
  flex-shrink: 0;
}

.occupancy-ring {
  width: 92px;
  height: 92px;
}

.occupancy-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.occ-ring-bg {
  fill: none;
  stroke: rgba(0, 206, 201, 0.1);
  stroke-width: 6;
}

.occ-ring-fill {
  fill: none;
  stroke: var(--admin-accent);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 264;
  stroke-dashoffset: 264;
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.occ-value {
  fill: var(--admin-text);
  font-size: 18px;
  font-weight: 800;
  font-family: 'Inter', system-ui, sans-serif;
  transform: rotate(90deg);
}

.occ-label {
  fill: var(--admin-text-muted);
  font-size: 7px;
  font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  transform: rotate(90deg);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ── Stats Grid ── */
.admin-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.admin-stat-card {
  background: var(--admin-card-bg);
  border: 1px solid var(--admin-card-border);
  border-radius: var(--admin-radius);
  padding: 24px 22px;
  display: flex;
  gap: 18px;
  align-items: flex-start;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform var(--admin-transition), box-shadow var(--admin-transition);
}

.admin-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--admin-shadow);
}

.stat-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card-icon svg {
  width: 22px;
  height: 22px;
}

.stat-icon-blue { background: rgba(0, 206, 201, 0.12); color: var(--admin-accent); }
.stat-icon-green { background: rgba(0, 184, 148, 0.12); color: #00b894; }
.stat-icon-gold { background: rgba(212, 168, 67, 0.12); color: var(--admin-gold); }
.stat-icon-purple { background: rgba(108, 92, 231, 0.12); color: #6c5ce7; }

.stat-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-card-value {
  font-size: clamp(22px, 1.8vw, 28px);
  font-weight: 800;
  color: var(--admin-text);
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.stat-card-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--admin-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.stat-card-detail {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 11px;
  color: var(--admin-text-dim);
}

.stat-detail-check {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-card-periods {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.period-tag {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(0, 206, 201, 0.08);
  color: var(--admin-accent);
  font-weight: 500;
  white-space: nowrap;
}

.stat-card-bar {
  margin-top: 8px;
}

.stat-bar-track {
  width: 100%;
  height: 4px;
  background: rgba(212, 168, 67, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--admin-gold), #f0c75e);
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 500;
}

.trend-up { color: #00b894; }
.trend-up svg { width: 14px; height: 14px; }

/* ── Columns ── */
.admin-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}

.admin-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Chart Cards ── */
.admin-chart-card {
  background: var(--admin-card-bg);
  border: 1px solid var(--admin-card-border);
  border-radius: var(--admin-radius);
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform var(--admin-transition), box-shadow var(--admin-transition);
}

.admin-chart-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--admin-shadow);
}

.chart-card-header {
  padding: 18px 22px 0;
}

.chart-card-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--admin-text);
  margin: 0;
}

.chart-card-header h3 svg {
  width: 18px;
  height: 18px;
  color: var(--admin-accent);
  flex-shrink: 0;
}

.chart-card-body {
  padding: 16px 22px 22px;
}

.chart-card-body-doughnut {
  display: flex;
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 240px;
  position: relative;
}

.doughnut-container {
  width: 260px;
  height: 260px;
  position: relative;
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 240px;
  color: var(--admin-text-dim);
  font-size: 13px;
}

/* ── Reservas Table ── */
.admin-table-card {
  background: var(--admin-card-bg);
  border: 1px solid var(--admin-card-border);
  border-radius: var(--admin-radius);
  overflow: hidden;
  margin-bottom: 20px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.table-card-header {
  padding: 18px 24px;
  border-bottom: 1px solid rgba(0, 206, 201, 0.06);
}

.table-card-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--admin-text);
  margin: 0;
}

.table-card-header h3 svg {
  width: 18px;
  height: 18px;
  color: var(--admin-accent);
  flex-shrink: 0;
}

.table-card-count {
  margin-left: auto;
  background: rgba(0, 206, 201, 0.1);
  color: var(--admin-accent);
  font-size: 13px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
}

.table-card-body {
  overflow-x: auto;
}

.admin-table-wrapper {
  min-width: 700px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.admin-table thead {
  background: rgba(0, 0, 0, 0.15);
}

.admin-table th {
  text-align: left;
  padding: 12px 20px;
  font-weight: 600;
  color: var(--admin-text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
}

.admin-table td {
  padding: 14px 20px;
  color: var(--admin-text);
  border-bottom: 1px solid rgba(0, 206, 201, 0.04);
  white-space: nowrap;
}

.admin-table tbody tr:hover {
  background: rgba(0, 206, 201, 0.03);
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.td-guest {
  display: flex;
  align-items: center;
  gap: 10px;
}

.td-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--admin-accent), #00b894);
  color: #0b1f0d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.td-amount {
  font-weight: 700;
  color: var(--admin-accent);
}

/* Badges */
.admin-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-success {
  background: rgba(0, 184, 148, 0.15);
  color: #00b894;
}

.badge-primary {
  background: rgba(0, 206, 201, 0.12);
  color: var(--admin-accent);
}

.badge-warning {
  background: rgba(212, 168, 67, 0.15);
  color: var(--admin-gold);
}

.badge-danger {
  background: rgba(214, 48, 49, 0.15);
  color: #d63031;
}

.badge-default {
  background: rgba(122, 154, 122, 0.15);
  color: var(--admin-text-muted);
}

/* ── Events Grid ── */
.admin-events-card {
  background: var(--admin-card-bg);
  border: 1px solid var(--admin-card-border);
  border-radius: var(--admin-radius);
  overflow: hidden;
  margin-bottom: 20px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  padding: 20px 24px 24px;
}

.event-card {
  display: flex;
  gap: 16px;
  padding: 18px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 206, 201, 0.04);
  transition: transform var(--admin-transition), background var(--admin-transition);
}

.event-card:hover {
  transform: translateY(-3px);
  background: rgba(0, 0, 0, 0.2);
}

.event-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(0, 206, 201, 0.1);
}

.event-card-icon svg {
  width: 22px;
  height: 22px;
  color: var(--admin-accent);
}

.event-wedding .event-card-icon { background: rgba(255, 118, 117, 0.15); }
.event-wedding .event-card-icon svg { color: #ff7675; }
.event-conference .event-card-icon { background: rgba(116, 185, 255, 0.15); }
.event-conference .event-card-icon svg { color: #74b9ff; }
.event-wellness .event-card-icon { background: rgba(85, 239, 196, 0.15); }
.event-wellness .event-card-icon svg { color: #55efc4; }
.event-gala .event-card-icon { background: rgba(253, 203, 110, 0.15); }
.event-gala .event-card-icon svg { color: #fdcb6e; }
.event-adventure .event-card-icon { background: rgba(255, 118, 117, 0.15); }
.event-adventure .event-card-icon svg { color: #e17055; }
.event-party .event-card-icon { background: rgba(232, 67, 147, 0.15); }
.event-party .event-card-icon svg { color: #e84393; }

.event-card-body {
  flex: 1;
  min-width: 0;
}

.event-card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--admin-text);
  margin: 0 0 8px;
}

.event-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.event-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--admin-text-muted);
}

.event-meta-item svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.event-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.event-type-tag {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(0, 206, 201, 0.08);
  color: var(--admin-accent);
}

.event-countdown {
  font-size: 11px;
  color: var(--admin-text-dim);
  font-weight: 500;
}

.event-today {
  color: var(--admin-accent);
  font-weight: 700;
}

/* ── Services Ranking ── */
.admin-services-card {
  background: var(--admin-card-bg);
  border: 1px solid var(--admin-card-border);
  border-radius: var(--admin-radius);
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.services-ranking {
  padding: 8px 24px 20px;
  display: grid;
  gap: 10px;
}

.service-rank-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.08);
  transition: background var(--admin-transition);
}

.service-rank-item:hover {
  background: rgba(0, 0, 0, 0.15);
}

.service-rank-pos {
  flex-shrink: 0;
}

.rank-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(122, 154, 122, 0.15);
  color: var(--admin-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.rank-top {
  background: linear-gradient(135deg, var(--admin-gold), #f0c75e);
  color: #0b1f0d;
}

.service-rank-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.service-rank-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--admin-text);
}

.service-rank-bar-track {
  width: 100%;
  height: 4px;
  background: rgba(122, 154, 122, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.service-rank-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--admin-accent), #00b894);
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.service-rank-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--admin-accent);
  white-space: nowrap;
}

/* ── Loading ── */
.admin-panel-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.admin-loading-content {
  text-align: center;
  color: var(--admin-text-muted);
}

.admin-loading-content p {
  margin-top: 16px;
  font-size: 14px;
}

.admin-spinner {
  width: 40px;
  height: 40px;
  animation: admin-spin 1s linear infinite;
}

.admin-spinner-path {
  stroke: var(--admin-accent);
}

@keyframes admin-spin {
  100% { transform: rotate(360deg); }
}

/* ── Nav Admin Badge ── */
:deep(.nav-admin-badge) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 20px;
  background: rgba(0, 206, 201, 0.1);
  border: 1px solid rgba(0, 206, 201, 0.2);
  color: var(--admin-accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

:deep(.nav-admin-badge svg) {
  width: 16px;
  height: 16px;
}

/* ── Responsive ── */
@media (max-width: 1200px) {
  .admin-panel { padding: 32px 28px 60px; }
  .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .admin-columns { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .admin-panel { padding: 24px 16px 48px; }
  .admin-stats-grid { grid-template-columns: 1fr; }
  .admin-panel-header { flex-direction: column; align-items: flex-start; }
  .events-grid { grid-template-columns: 1fr; padding: 16px; }
  .admin-stat-card { padding: 18px 16px; }
}
</style>
