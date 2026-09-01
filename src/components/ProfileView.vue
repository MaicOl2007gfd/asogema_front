
<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useProfile } from '../composables/useProfile.js'
import { useMyReservations } from '../composables/useMyReservations.js'
import '../Profile.css'

const emit = defineEmits(['navigate'])

const {
  user,
  getUserInitials,
  handleLogout,
  goBack,
  activeTab,
  isVisible,
  // Ajustes de cuenta
  firstName,
  lastName,
  phone,
  birthDate,
  email,
  typingFirstName,
  typingLastName,
  typingPhone,
  profileSaving,
  profileSuccess,
  profileError,
  saveProfile,
  hasProfileChanges,
  // Cambiar contraseña
  currentPassword,
  newPassword,
  confirmNewPassword,
  showCurrentPassword,
  showNewPassword,
  showConfirmNewPassword,
  passwordSaving,
  passwordSuccess,
  passwordError,
  passwordStrength,
  togglePasswordVisibility,
  submitChangePassword,
} = useProfile(emit)

/* ── Mis Reservas unificadas (Hotel + Restaurante + Eventos) ──
   Pantalla única que reúne todas las reservas del usuario con
   filtros por tipo y por estado, más la pantalla de confirmación
   (resumen y estado) de cada reserva. */
const {
  reservations,
  filteredReservations,
  totalCount,
  activeCount,
  upcomingCount,
  typeCounts,
  loading: reservationsLoading,
  error: reservationsError,
  typeFilter,
  statusFilter,
  setTypeFilter,
  setStatusFilter,
  selected,
  showConfirmation,
  openConfirmation,
  closeConfirmation,
  cancellingId,
  cancelError,
  cancelReservation,
  loadAll,
  formatDate,
  formatTime,
  formatCurrency,
} = useMyReservations()

const typeFilters = computed(() => [
  { value: 'all', label: 'Todas', count: totalCount.value },
  { value: 'hotel', label: 'Hotel', count: typeCounts.value.hotel },
  { value: 'restaurant', label: 'Restaurante', count: typeCounts.value.restaurant },
  { value: 'event', label: 'Eventos', count: typeCounts.value.event },
])

const statusFilters = computed(() => [
  { value: 'all', label: 'Todas', count: totalCount.value },
  { value: 'active', label: 'Activas', count: activeCount.value },
  { value: 'upcoming', label: 'Próximas', count: upcomingCount.value },
])

const emptyTypeLabel = computed(() => {
  const map = { hotel: 'de hotel', restaurant: 'de restaurante', event: 'de eventos' }
  return map[typeFilter.value] || ''
})

const isUserAdmin = computed(
  () => user.value?.rol_nombre === 'Administrador' || user.value?.rol_id === 1
)

/* ── Toast / notificación de feedback ──────────────────────────── */
const toast = ref(null)
let toastTimer = null

function showToast(type, message) {
  toast.value = { type, message }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 4200)
}

watch(
  [profileSuccess, profileError],
  () => {
    if (profileSuccess.value) showToast('success', profileSuccess.value)
    else if (profileError.value) showToast('error', profileError.value)
  }
)

// Cargar todas las reservas (hotel, mesa y eventos) al abrir el perfil.
onMounted(() => {
  loadAll()
})
</script>

<template>
  <div class="profile-container">
    <!-- Premium Diagonal Crosshatch Pattern overlay -->
    <div class="pattern-overlay" aria-hidden="true"></div>

    <!-- Atmospheric light overlay -->
    <div class="light-overlay" aria-hidden="true"></div>

    <!-- Back arrow -->
    <button type="button" class="back-arrow" @click="goBack" aria-label="Volver al inicio">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </button>

    <!-- Shell: sidebar + content -->
    <div class="profile-shell" :class="{ visible: isVisible }">
      <!-- ═══════════════ SIDEBAR ═══════════════ -->
      <aside class="profile-sidebar">
        <div class="sidebar-top">
          <div class="avatar-wrap">
            <div class="avatar-glow" aria-hidden="true"></div>
            <div class="profile-avatar">{{ getUserInitials() }}</div>
          </div>
          <h2 class="sidebar-name">{{ user?.name }}</h2>
          <p class="sidebar-email">{{ email }}</p>

          <div class="badge-row">
            <!-- Badge informativo: rol -->
            <span class="role-badge" :class="{ admin: isUserAdmin }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              {{ user?.rol_nombre || (isUserAdmin ? 'Administrador' : 'Miembro') }}
            </span>
          </div>
        </div>

        <nav class="sidebar-nav" aria-label="Secciones del perfil">
          <button
            type="button"
            class="sidebar-nav-item"
            :class="{ active: activeTab === 'cuenta' }"
            @click="activeTab = 'cuenta'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Ajustes de cuenta
          </button>
          <button
            type="button"
            class="sidebar-nav-item"
            :class="{ active: activeTab === 'seguridad' }"
            @click="activeTab = 'seguridad'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>
            Cambiar contraseña
          </button>
          <button
            type="button"
            class="sidebar-nav-item"
            :class="{ active: activeTab === 'reservas' }"
            @click="activeTab = 'reservas'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Mis Reservas
            <span v-if="reservations.length" class="sidebar-nav-badge">{{ reservations.length }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <button type="button" class="logout-btn" @click="handleLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- ═══════════════ CONTENIDO ═══════════════ -->
      <main class="profile-content">
        <Transition name="panel-fade" mode="out-in">
          <!-- ── Ajustes de cuenta ── -->
          <section v-if="activeTab === 'cuenta'" key="cuenta" class="panel">
            <header class="panel-header">
              <div class="panel-title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h1 class="panel-title">Ajustes de cuenta</h1>
                <p class="panel-subtitle">Actualiza tu información personal</p>
              </div>
            </header>

            <form class="profile-form" @submit.prevent="saveProfile" novalidate>
              <div class="profile-card">
                <div class="profile-card-head">
                  <div class="card-title-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <h2 class="card-title">Datos de la cuenta</h2>
                    <p class="card-subtitle">Tu información personal y de contacto</p>
                  </div>
                </div>

                <div class="profile-card-body">
                  <div class="field-grid">
                    <div class="input-group static-label" :class="{ filled: firstName, error: profileError && !firstName }">
                      <label class="field-label" for="profile-first-name">Nombre</label>
                      <div class="input-control">
                        <div class="input-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <input
                          id="profile-first-name"
                          v-model="firstName"
                          type="text"
                          autocomplete="given-name"
                          @focus="typingFirstName = true"
                          @blur="typingFirstName = false"
                          placeholder=" "
                        />
                      </div>
                    </div>

                    <div class="input-group static-label" :class="{ filled: lastName }">
                      <label class="field-label" for="profile-last-name">Apellido</label>
                      <div class="input-control">
                        <div class="input-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <input
                          id="profile-last-name"
                          v-model="lastName"
                          type="text"
                          autocomplete="family-name"
                          @focus="typingLastName = true"
                          @blur="typingLastName = false"
                          placeholder=" "
                        />
                      </div>
                    </div>

                    <div class="input-group static-label" :class="{ filled: phone }">
                      <label class="field-label" for="profile-phone">Teléfono</label>
                      <div class="input-control">
                        <div class="input-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                          </svg>
                        </div>
                        <input
                          id="profile-phone"
                          v-model="phone"
                          type="tel"
                          autocomplete="tel"
                          @focus="typingPhone = true"
                          @blur="typingPhone = false"
                          placeholder=" "
                        />
                      </div>
                    </div>

                    <div class="input-group static-label" :class="{ filled: birthDate }">
                      <label class="field-label" for="profile-birth-date">Fecha de nacimiento</label>
                      <div class="input-control">
                        <div class="input-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <input
                          id="profile-birth-date"
                          v-model="birthDate"
                          type="date"
                          :max="new Date().toISOString().split('T')[0]"
                          autocomplete="bday"
                          placeholder=" "
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Correo (solo lectura: PENDIENTE BACKEND edición de correo) -->
                  <div class="input-group static-label input-group-readonly filled">
                    <label class="field-label" for="profile-email">Correo electrónico</label>
                    <div class="input-control">
                      <div class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <path d="M22 4L12 13L2 4"></path>
                        </svg>
                      </div>
                      <input
                        id="profile-email"
                        :value="email"
                        type="email"
                        autocomplete="email"
                        readonly
                        placeholder=" "
                      />
                      <button
                        type="button"
                        class="readonly-lock"
                        aria-describedby="profile-email-tooltip"
                        aria-label="El cambio de correo electrónico estará disponible próximamente"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0110 0v4"></path>
                        </svg>
                        <span class="tooltip" id="profile-email-tooltip" role="tooltip">Disponible próximamente</span>
                      </button>
                    </div>
                  </div>
                  <p class="profile-note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    El cambio de correo electrónico estará disponible próximamente.
                  </p>
                </div>

                <div class="profile-card-foot">
                  <!-- Mensajes -->
                  <div v-if="profileSuccess" class="form-feedback form-feedback-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{{ profileSuccess }}</span>
                  </div>
                  <div v-if="profileError" class="form-feedback form-feedback-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>{{ profileError }}</span>
                  </div>

                  <button
                    type="submit"
                    class="primary-btn"
                    :class="{ loading: profileSaving, 'is-disabled': !hasProfileChanges }"
                    :disabled="profileSaving || !hasProfileChanges"
                  >
                    <span class="btn-label" v-if="!profileSaving">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      {{ hasProfileChanges ? 'Guardar cambios' : 'Sin cambios' }}
                    </span>
                    <span class="btn-loader" v-else>
                      <svg class="spinner" viewBox="0 0 50 50">
                        <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round"></circle>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </section>

          <!-- ── Cambiar contraseña ── -->
          <section v-else-if="activeTab === 'seguridad'" key="seguridad" class="panel">
            <header class="panel-header">
              <div class="panel-title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
              </div>
              <div>
                <h1 class="panel-title">Cambiar contraseña</h1>
                <p class="panel-subtitle">Mantén tu cuenta segura con una contraseña sólida</p>
              </div>
            </header>

            <form class="profile-form" @submit.prevent="submitChangePassword" novalidate>
              <div class="profile-card">
                <div class="profile-card-head">
                  <div class="card-title-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0110 0v4"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 class="card-title">Nueva contraseña</h2>
                    <p class="card-subtitle">Elige una contraseña segura que no uses en otros sitios</p>
                  </div>
                </div>

                <div class="profile-card-body">
                  <div class="input-group" :class="{ focused: currentPassword, filled: currentPassword }">
                    <div class="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0110 0v4"></path>
                      </svg>
                    </div>
                    <input
                      id="profile-current-password"
                      v-model="currentPassword"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      autocomplete="current-password"
                      placeholder="Contraseña actual"
                    />
                    <label for="profile-current-password">Contraseña actual</label>
                    <button
                      type="button"
                      class="toggle-password"
                      @click="togglePasswordVisibility('current')"
                      :aria-label="showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    >
                      <svg v-if="!showCurrentPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"></path>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    </button>
                  </div>

                  <div class="input-group" :class="{ focused: newPassword, filled: newPassword }">
                    <div class="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0110 0v4"></path>
                        <polyline points="9 16 11 18 15 14"></polyline>
                      </svg>
                    </div>
                    <input
                      id="profile-new-password"
                      v-model="newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      placeholder="Nueva contraseña"
                    />
                    <label for="profile-new-password">Nueva contraseña</label>
                    <button
                      type="button"
                      class="toggle-password"
                      @click="togglePasswordVisibility('new')"
                      :aria-label="showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    >
                      <svg v-if="!showNewPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"></path>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    </button>
                  </div>

                  <!-- Medidor de fortaleza -->
                  <div v-if="newPassword" class="strength-meter">
                    <div class="strength-bars">
                      <span
                        v-for="i in 5"
                        :key="i"
                        class="strength-bar"
                        :class="{ filled: i <= passwordStrength.score + 1 }"
                        :style="i <= passwordStrength.score + 1 ? { background: passwordStrength.color } : {}"
                      ></span>
                    </div>
                    <span class="strength-label" :style="{ color: passwordStrength.color }">
                      {{ passwordStrength.label }}
                    </span>
                  </div>

                  <div class="input-group" :class="{ focused: confirmNewPassword, filled: confirmNewPassword }">
                    <div class="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0110 0v4"></path>
                        <polyline points="9 16 11 18 15 14"></polyline>
                      </svg>
                    </div>
                    <input
                      id="profile-confirm-password"
                      v-model="confirmNewPassword"
                      :type="showConfirmNewPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      placeholder="Confirmar nueva contraseña"
                    />
                    <label for="profile-confirm-password">Confirmar nueva contraseña</label>
                    <button
                      type="button"
                      class="toggle-password"
                      @click="togglePasswordVisibility('confirm')"
                      :aria-label="showConfirmNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    >
                      <svg v-if="!showConfirmNewPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"></path>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="profile-card-foot">
                  <!-- Mensajes -->
                  <div v-if="passwordSuccess" class="form-feedback form-feedback-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{{ passwordSuccess }}</span>
                  </div>
                  <div v-if="passwordError" class="form-feedback form-feedback-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>{{ passwordError }}</span>
                  </div>

                  <button type="submit" class="primary-btn" :class="{ loading: passwordSaving }" :disabled="passwordSaving">
                    <span class="btn-label" v-if="!passwordSaving">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Actualizar contraseña
                    </span>
                    <span class="btn-loader" v-else>
                      <svg class="spinner" viewBox="0 0 50 50">
                        <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round"></circle>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </section>

          <!-- ── Mis Reservas (Hotel + Restaurante + Eventos) ── -->
          <section v-else-if="activeTab === 'reservas'" key="reservas" class="panel panel-reservas">
            <header class="panel-header">
              <div class="panel-title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                <h1 class="panel-title">Mis Reservas</h1>
                <p class="panel-subtitle">Hotel, restaurante y eventos en una sola pantalla</p>
              </div>
            </header>

            <!-- Resumen de estadísticas -->
            <div v-if="reservations.length" class="reservas-summary">
              <div class="reservas-summary-item">
                <strong>{{ reservations.length }}</strong>
                <span>Reservas</span>
              </div>
              <div class="reservas-summary-item">
                <strong>{{ activeCount }}</strong>
                <span>Activas</span>
              </div>
              <div class="reservas-summary-item">
                <strong>{{ upcomingCount }}</strong>
                <span>Próximas</span>
              </div>
            </div>

            <!-- Filtros por tipo -->
            <div class="reservas-filters">
              <button
                v-for="f in typeFilters"
                :key="f.value"
                type="button"
                class="reservas-filter"
                :class="{ active: typeFilter === f.value }"
                @click="setTypeFilter(f.value)"
              >
                {{ f.label }}
                <span class="reservas-filter-count">{{ f.count }}</span>
              </button>
            </div>

            <!-- Filtro por estado -->
            <div class="reservas-status-filters">
              <button
                v-for="s in statusFilters"
                :key="s.value"
                type="button"
                class="reservas-status-filter"
                :class="{ active: statusFilter === s.value }"
                @click="setStatusFilter(s.value)"
              >
                {{ s.label }}
              </button>
            </div>

            <!-- Cargando -->
            <div v-if="reservationsLoading" class="reservas-state">
              <span class="pf-spinner" role="status" aria-label="Cargando"></span>
              <p>Cargando tus reservas…</p>
            </div>

            <!-- Error -->
            <div v-else-if="reservationsError" class="reservas-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>No pudimos cargar tus reservas</h3>
              <p>{{ reservationsError }}</p>
              <button type="button" class="primary-btn" @click="loadAll">Reintentar</button>
            </div>

            <!-- Sin reservas / sin coincidencias -->
            <div v-else-if="filteredReservations.length === 0" class="reservas-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h3>{{ reservations.length === 0 ? 'Aún no tienes reservas' : `No hay reservas ${emptyTypeLabel}` }}</h3>
              <p v-if="reservations.length === 0">
                Explora el Hotel, el Restaurante o los Eventos y haz tu primera reserva.
              </p>
              <p v-else>Prueba con otro filtro o realiza una nueva reserva.</p>
              <div v-if="reservations.length === 0" class="reservas-cta-group">
                <button type="button" class="primary-btn" @click="emit('navigate', 'hotel')">Hotel</button>
                <button type="button" class="primary-btn" @click="emit('navigate', 'restaurant')">Restaurante</button>
                <button type="button" class="primary-btn" @click="emit('navigate', 'events')">Eventos</button>
              </div>
            </div>

            <!-- Lista unificada -->
            <div v-else class="reservas-list">
              <article
                v-for="r in filteredReservations"
                :key="r.key"
                class="reserva-card"
                :class="[`reserva-${r.status}`, `reserva-type-${r.type}`]"
              >
                <div class="reserva-card-head">
                  <div class="reserva-room">
                    <span class="reserva-room-icon">
                      <svg v-if="r.type === 'hotel'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 21h18"></path>
                        <path d="M3 10h18"></path>
                        <path d="M5 6l7-3 7 3"></path>
                        <path d="M4 10v11"></path>
                        <path d="M20 10v11"></path>
                      </svg>
                      <svg v-else-if="r.type === 'restaurant'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </span>
                    <span class="reserva-room-txt">
                      <small>Reserva #{{ r.id }} · {{ r.typeLabel }}</small>
                      <h3>{{ r.title }}</h3>
                    </span>
                  </div>
                  <span class="reserva-status">
                    <i class="reserva-status-dot"></i>
                    {{ r.statusLabel }}
                  </span>
                </div>

                <div class="reserva-meta">
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {{ r.dateLabel }}
                  </span>
                  <span v-if="r.timeLabel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {{ r.timeLabel }}
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 010 7.75"></path>
                    </svg>
                    {{ r.guestsLabel }}
                  </span>
                </div>

                <div class="reserva-foot">
                  <div class="reserva-total">
                    <small>{{ r.amountLabel ? 'Monto' : 'Detalle' }}</small>
                    <strong>{{ r.amountLabel || `Reserva #${r.id}` }}</strong>
                  </div>
                  <div class="reserva-actions">
                    <button type="button" class="reserva-detail" @click="openConfirmation(r)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Ver detalles
                    </button>
                    <button
                      v-if="r.canCancel"
                      type="button"
                      class="reserva-cancel"
                      @click="openConfirmation(r)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Cancelar
                    </button>
                    <span v-else class="reserva-finished">Finalizada</span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </Transition>
      </main>
    </div>

    <!-- Decorative corner elements -->
    <div class="corner-decor corner-tl"></div>
    <div class="corner-decor corner-br"></div>

    <!-- Toast / notificación de éxito o error -->
    <Transition name="toast-fade">
      <div
        v-if="toast"
        :key="toast.message + toast.type"
        class="profile-toast"
        :class="`profile-toast-${toast.type}`"
        role="status"
        aria-live="polite"
      >
        <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- ── Pantalla de confirmación de reserva (resumen y estado) ── -->
    <div
      class="reservas-confirm-overlay"
      :class="{ active: showConfirmation }"
      @click.self="closeConfirmation"
    >
      <div
        v-if="selected"
        class="reservas-confirm-modal"
        :class="`reservas-type-${selected.type}`"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservas-confirm-title"
      >
        <div class="reservas-confirm-head">
          <div class="reservas-confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="reservas-confirm-title">
            <span class="reservas-confirm-type">{{ selected.typeLabel }}</span>
            <h3 id="reservas-confirm-title">Confirmación de reserva</h3>
          </div>
          <button
            type="button"
            class="reservas-confirm-close"
            @click="closeConfirmation"
            aria-label="Cerrar detalles"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="reservas-confirm-status-row">
          <span class="reserva-status">
            <i class="reserva-status-dot"></i>
            {{ selected.statusLabel }}
          </span>
          <span class="reservas-confirm-ref">Reserva #{{ selected.id }}</span>
        </div>

        <div class="reservas-confirm-hero">
          <h4>{{ selected.title }}</h4>
          <p>{{ selected.subtitle }}</p>
        </div>

        <dl class="reservas-confirm-details">
          <div
            v-for="d in selected.details"
            :key="d.label"
            class="reservas-confirm-detail"
          >
            <dt>
              <svg v-if="d.icon === 'hash'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="9" x2="20" y2="9"></line>
                <line x1="4" y1="15" x2="20" y2="15"></line>
                <line x1="10" y1="3" x2="8" y2="21"></line>
                <line x1="16" y1="3" x2="14" y2="21"></line>
              </svg>
              <svg v-else-if="d.icon === 'calendar'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <svg v-else-if="d.icon === 'clock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <svg v-else-if="d.icon === 'users'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
              <svg v-else-if="d.icon === 'money'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
              </svg>
              <svg v-else-if="d.icon === 'table'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
              <svg v-else-if="d.icon === 'tag'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {{ d.label }}
            </dt>
            <dd>{{ d.value }}</dd>
          </div>
        </dl>

        <p v-if="selected.notes" class="reservas-confirm-notes">
          <strong>Notas:</strong> {{ selected.notes }}
        </p>

        <p v-if="cancelError" class="reservas-confirm-error">{{ cancelError }}</p>

        <div class="reservas-confirm-actions">
          <button
            v-if="selected.canCancel"
            type="button"
            class="reservas-confirm-btn reservas-confirm-danger"
            @click="cancelReservation"
            :disabled="cancellingId === selected.key"
          >
            <template v-if="cancellingId === selected.key">
              <span class="pf-spinner"></span>
              Cancelando…
            </template>
            <template v-else>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Cancelar reserva
            </template>
          </button>
          <button
            type="button"
            class="reservas-confirm-btn reservas-confirm-secondary"
            @click="closeConfirmation"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
