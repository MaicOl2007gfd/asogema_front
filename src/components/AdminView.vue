<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useAdmin } from '../composables/useAdmin.js'

const emit = defineEmits(['navigate'])

const { user, isAdmin, logout } = useAuth()

// ─── Admin guard: redirect if not admin ──────────────────────
onMounted(() => {
  if (!isAdmin.value) {
    emit('navigate', 'dashboard')
  }
})

const {
  ROLES,
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
} = useAdmin()

// ─── Tab state ───────────────────────────────────────────────
const activeTab = ref('income') // 'income' | 'roles'

// ─── Role filter ─────────────────────────────────────────────
const roleFilter = ref('todos')

const filteredByRole = computed(() => {
  if (roleFilter.value === 'todos') return filteredUsers.value
  return filteredUsers.value.filter(u => u.role === roleFilter.value)
})

// ─── Scroll to top on mount ──────────────────────────────────
onMounted(() => {
  window.scrollTo(0, 0)
})

// ─── Helpers ─────────────────────────────────────────────────
function getUserInitials() {
  if (!user.value) return '?'
  return user.value.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const activeRoleFilter = (role) => roleFilter.value === role
const setRoleFilter = (role) => { roleFilter.value = role }
</script>

<template>
  <div class="admin-page">
    <!-- ======================================================
         NAVBAR
         ====================================================== -->
    <nav class="admin-nav">
      <div class="nav-brand" @click="emit('navigate', 'index')">
        <img src="/imagenes/Logo.png" alt="Asogema" class="nav-logo" />
        <span class="nav-brand-text">Asogema</span>
        <span class="nav-admin-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
          </svg>
          Admin
        </span>
      </div>

      <div class="nav-user">
        <div class="nav-user-greeting" v-if="user">
          <small>Administrador</small>
          <strong>{{ user.name }}</strong>
        </div>
        <div class="nav-user-avatar">{{ getUserInitials() }}</div>
        <div class="nav-btn-group">
          <button class="nav-btn nav-btn-outline" @click="emit('navigate', 'dashboard')">
            Volver al Panel
          </button>
          <button class="nav-btn nav-btn-primary" @click="logout() && emit('navigate', 'index')">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

    <!-- ======================================================
         CONTENT
         ====================================================== -->
    <main class="admin-content">
      <!-- Page Header -->
      <div class="admin-page-header">
        <span class="admin-page-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
          </svg>
          Panel de Administración
        </span>
        <h1>Gestión del Sistema</h1>
        <p>Administra los roles de usuario y consulta los ingresos generados por cada área del club.</p>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button
          class="admin-tab"
          :class="{ active: activeTab === 'income' }"
          @click="activeTab = 'income'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
          </svg>
          Ingresos
        </button>
        <button
          class="admin-tab"
          :class="{ active: activeTab === 'roles' }"
          @click="activeTab = 'roles'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
            <path d="M16 3.13a4 4 0 010 7.75"></path>
          </svg>
          Roles de Usuario
        </button>
      </div>

      <!-- ====================================================
           TAB: INGRESOS
           ==================================================== -->
      <div v-if="activeTab === 'income'" class="admin-income-section">
        <h2>Resumen de Ingresos</h2>
        <p>Visualiza los ingresos generados por las diferentes áreas del club Asogema.</p>

        <!-- Summary Cards -->
        <div class="admin-income-summary">
          <div class="admin-income-card">
            <div class="income-card-icon icon-total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
              </svg>
            </div>
            <div class="income-card-label">Ingresos Totales</div>
            <div class="income-card-value">{{ formatCurrency(combinedTotal) }}</div>
            <div class="income-card-meta">
              <span>{{ formatCurrency(combinedMonthly) }} / mes</span>
            </div>
          </div>

          <div class="admin-income-card">
            <div class="income-card-icon icon-restaurant">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            </div>
            <div class="income-card-label">Restaurante</div>
            <div class="income-card-value">{{ formatCurrency(incomeData.restaurant.total) }}</div>
            <div class="income-card-meta">
              <span class="income-card-growth positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                {{ incomeData.restaurant.growth }}%
              </span>
              <span>{{ incomeData.restaurant.transactions }} transacciones</span>
            </div>
          </div>

          <div class="admin-income-card">
            <div class="income-card-icon icon-hotel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18"></path>
                <path d="M3 10h18"></path>
                <path d="M5 6l7-3 7 3"></path>
                <path d="M4 10v11"></path>
                <path d="M20 10v11"></path>
              </svg>
            </div>
            <div class="income-card-label">Hotel</div>
            <div class="income-card-value">{{ formatCurrency(incomeData.hotel.total) }}</div>
            <div class="income-card-meta">
              <span class="income-card-growth positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                {{ incomeData.hotel.growth }}%
              </span>
              <span>{{ incomeData.hotel.transactions }} reservas</span>
            </div>
          </div>

          <div class="admin-income-card">
            <div class="income-card-icon icon-events">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
              </svg>
            </div>
            <div class="income-card-label">Eventos</div>
            <div class="income-card-value">{{ formatCurrency(incomeData.events.total) }}</div>
            <div class="income-card-meta">
              <span class="income-card-growth positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                {{ incomeData.events.growth }}%
              </span>
              <span>{{ incomeData.events.transactions }} eventos</span>
            </div>
          </div>
        </div>

        <!-- Detail Cards -->
        <div class="admin-income-details">
          <!-- Restaurante -->
          <div class="admin-income-detail-card">
            <div class="detail-header">
              <div class="detail-header-left">
                <div class="detail-icon icon-restaurant">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8h1a4 4 0 010 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </div>
                <h3>Restaurante</h3>
              </div>
              <span class="detail-growth positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                {{ incomeData.restaurant.growth }}%
              </span>
            </div>

            <div class="detail-stats">
              <div class="detail-stat">
                <span class="stat-label">Ingresos Mensuales</span>
                <span class="stat-value">{{ formatCurrency(incomeData.restaurant.monthly) }}</span>
              </div>
              <div class="detail-stat">
                <span class="stat-label">Transacciones</span>
                <span class="stat-value">{{ incomeData.restaurant.transactions }}</span>
                <span class="stat-sub">este mes</span>
              </div>
            </div>

            <div class="detail-chart">
              <div
                v-for="(val, i) in incomeData.restaurant.chart"
                :key="i"
                class="chart-bar bar-restaurant"
                :class="{ highlight: i === 11 }"
                :style="{ height: (val / 25) * 100 + '%' }"
              ></div>
            </div>
          </div>

          <!-- Hotel -->
          <div class="admin-income-detail-card">
            <div class="detail-header">
              <div class="detail-header-left">
                <div class="detail-icon icon-hotel">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21h18"></path>
                    <path d="M3 10h18"></path>
                    <path d="M5 6l7-3 7 3"></path>
                    <path d="M4 10v11"></path>
                    <path d="M20 10v11"></path>
                  </svg>
                </div>
                <h3>Hotel</h3>
              </div>
              <span class="detail-growth positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                {{ incomeData.hotel.growth }}%
              </span>
            </div>

            <div class="detail-stats">
              <div class="detail-stat">
                <span class="stat-label">Ingresos Mensuales</span>
                <span class="stat-value">{{ formatCurrency(incomeData.hotel.monthly) }}</span>
              </div>
              <div class="detail-stat">
                <span class="stat-label">Reservas</span>
                <span class="stat-value">{{ incomeData.hotel.transactions }}</span>
                <span class="stat-sub">este mes</span>
              </div>
            </div>

            <div class="detail-chart">
              <div
                v-for="(val, i) in incomeData.hotel.chart"
                :key="i"
                class="chart-bar bar-hotel"
                :class="{ highlight: i === 11 }"
                :style="{ height: (val / 40) * 100 + '%' }"
              ></div>
            </div>
          </div>

          <!-- Eventos -->
          <div class="admin-income-detail-card">
            <div class="detail-header">
              <div class="detail-header-left">
                <div class="detail-icon icon-events">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                  </svg>
                </div>
                <h3>Eventos</h3>
              </div>
              <span class="detail-growth positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                {{ incomeData.events.growth }}%
              </span>
            </div>

            <div class="detail-stats">
              <div class="detail-stat">
                <span class="stat-label">Ingresos Mensuales</span>
                <span class="stat-value">{{ formatCurrency(incomeData.events.monthly) }}</span>
              </div>
              <div class="detail-stat">
                <span class="stat-label">Eventos Realizados</span>
                <span class="stat-value">{{ incomeData.events.transactions }}</span>
                <span class="stat-sub">este mes</span>
              </div>
            </div>

            <div class="detail-chart">
              <div
                v-for="(val, i) in incomeData.events.chart"
                :key="i"
                class="chart-bar bar-events"
                :class="{ highlight: i === 11 }"
                :style="{ height: (val / 16) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ====================================================
           TAB: ROLES DE USUARIO
           ==================================================== -->
      <div v-if="activeTab === 'roles'" class="admin-users-section">
        <h2>Gestión de Roles</h2>
        <p>Administra los roles de los usuarios registrados: <strong>cliente</strong>, <strong>empleado</strong> o <strong>miembro</strong>.</p>

        <!-- Search -->
        <div class="admin-search-bar">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            v-model="userSearch"
            type="text"
            placeholder="Buscar por nombre, correo o rol…"
          />
          <button v-if="userSearch" class="search-clear" @click="userSearch = ''" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Role filter pills -->
        <div class="admin-role-filters">
          <button
            class="admin-role-filter-pill"
            :class="{ active: roleFilter === 'todos' }"
            @click="setRoleFilter('todos')"
          >
            Todos
          </button>
          <button
            class="admin-role-filter-pill"
            :class="{ active: roleFilter === 'empleado' }"
            @click="setRoleFilter('empleado')"
          >
            Empleados
          </button>
          <button
            class="admin-role-filter-pill"
            :class="{ active: roleFilter === 'cliente' }"
            @click="setRoleFilter('cliente')"
          >
            Clientes
          </button>
          <button
            class="admin-role-filter-pill"
            :class="{ active: roleFilter === 'miembro' }"
            @click="setRoleFilter('miembro')"
          >
            Miembros
          </button>
        </div>

        <!-- Users table -->
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo Electrónico</th>
                <th>Fecha de Registro</th>
                <th>Rol Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in filteredByRole" :key="u.id">
                <!-- User -->
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
                    <div class="user-info">
                      <span class="user-name">{{ u.name }}</span>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td>
                  <span style="font-size: 13px; color: var(--admin-text-muted);">{{ u.email }}</span>
                </td>

                <!-- Joined date -->
                <td>
                  <span style="font-size: 13px; color: var(--admin-text-muted);">{{ u.joined }}</span>
                </td>

                <!-- Role -->
                <td>
                  <template v-if="editingUserId === u.id">
                    <div class="admin-role-edit">
                      <select
                        :value="editingRole"
                        @change="handleRoleChange($event.target.value)"
                        class="admin-role-select"
                      >
                        <option v-for="role in ROLES" :key="role" :value="role">
                          {{ role.charAt(0).toUpperCase() + role.slice(1) }}
                        </option>
                      </select>
                      <div class="admin-edit-actions">
                        <button class="admin-edit-btn admin-edit-btn-save" @click="saveEdit(u)" title="Guardar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button class="admin-edit-btn admin-edit-btn-cancel" @click="cancelEdit" title="Cancelar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <span class="admin-role-badge" :class="roleBadgeClass(u.role)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      {{ u.role }}
                    </span>
                  </template>
                </td>

                <!-- Actions -->
                <td>
                  <template v-if="editingUserId !== u.id">
                    <button class="admin-action-btn" @click="startEdit(u)" title="Editar rol">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </template>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="filteredByRole.length === 0">
                <td colspan="5">
                  <div class="admin-table-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <h3>Sin resultados</h3>
                    <p>No se encontraron usuarios con los filtros seleccionados.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import url('../Admin.css');
</style>
