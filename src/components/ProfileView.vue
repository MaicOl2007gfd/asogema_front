
<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useProfile } from '../composables/useProfile.js'
import { useHotel } from '../composables/useHotel.js'
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
  // Código QR único del perfil
  qrDataUrl,
  qrValue,
  qrLoading,
  qrError,
  copied,
  copyError,
  generate,
  downloadQr,
  copyQrLink,
} = useProfile(emit)

/* ── Reservas de Hotel (historial + cancelar) ────────────────────
   Reutiliza el composable singleton de Hotel: mismo estado que la
   página del Hotel, por lo que cancelar aquí se refleja allí y
   viceversa. */
const {
  bookings: hotelBookings,
  bookingsLoading: hotelBookingsLoading,
  bookingsError: hotelBookingsError,
  bookingToCancel,
  showCancelConfirm,
  isCancelling,
  loadBookings,
  requestCancel,
  closeCancelConfirm,
  confirmCancel,
  formatDate,
  formatCurrency,
} = useHotel()

const bookingStatusLabels = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  'check-in': 'Check-In',
  'check-out': 'Check-Out',
  cancelada: 'Cancelada',
  completada: 'Completada',
}
function bookingStatusLabel(s) {
  return bookingStatusLabels[s] || s
}
function canCancelBooking(booking) {
  return !['cancelada', 'completada', 'check-out'].includes(booking.status)
}

const activeHotelBookings = computed(
  () =>
    hotelBookings.value.filter(
      (b) => !['cancelada', 'completada', 'check-out'].includes(b.status),
    ).length,
)
const totalHotelSpent = computed(() =>
  hotelBookings.value.reduce((sum, b) => sum + (Number(b.total) || 0), 0),
)

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

// Cargar el historial de reservas de hotel al abrir el perfil.
onMounted(() => {
  loadBookings()
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
            :class="{ active: activeTab === 'qr' }"
            @click="activeTab = 'qr'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <path d="M3 14h7v7H3z"></path>
            </svg>
            Mi Código QR
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
            <span v-if="hotelBookings.length" class="sidebar-nav-badge">{{ hotelBookings.length }}</span>
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
            </form>
          </section>

          <!-- ── Mi Código QR ── -->
          <section v-else-if="activeTab === 'qr'" key="qr" class="panel">
            <header class="panel-header">
              <div class="panel-title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <path d="M3 14h7v7H3z"></path>
                </svg>
              </div>
              <div>
                <h1 class="panel-title">Mi Código QR</h1>
                <p class="panel-subtitle">Tu identificador digital único e intransferible</p>
              </div>
            </header>

            <div class="qr-layout">
              <!-- Tarjeta con el QR -->
              <div class="qr-card">
                <div class="qr-frame" :class="{ loading: qrLoading }">
                  <img
                    v-if="qrDataUrl && !qrLoading"
                    :src="qrDataUrl"
                    alt="Código QR único de tu perfil"
                    class="qr-image"
                  />
                  <div v-if="qrLoading" class="qr-loading">
                    <svg class="spinner" viewBox="0 0 50 50">
                      <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round"></circle>
                    </svg>
                    <span>Generando tu código…</span>
                  </div>
                  <div v-if="qrError && !qrLoading" class="qr-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{{ qrError }}</span>
                  </div>
                  <div v-if="qrDataUrl && !qrLoading" class="qr-monogram" aria-hidden="true">
                    {{ getUserInitials() }}
                  </div>
                </div>
                <p class="qr-caption">Escanea este código para acceder a tu perfil</p>
              </div>

              <!-- Información y acciones -->
              <div class="qr-info">
                <div class="qr-info-item">
                  <span class="qr-info-label">Enlace único de tu perfil</span>
                  <code class="qr-value">{{ qrValue }}</code>
                </div>

                <p class="qr-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Este código QR es exclusivo de tu cuenta: cada perfil genera un código diferente.
                </p>

                <div class="qr-actions">
                  <button
                    type="button"
                    class="qr-btn qr-btn-primary"
                    @click="copyQrLink"
                    :disabled="!qrValue"
                  >
                    <svg v-if="!copied && !copyError" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                    </svg>
                    <svg v-else-if="copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {{ copied ? '¡Enlace copiado!' : copyError ? 'No se pudo copiar' : 'Copiar enlace' }}
                  </button>

                  <button
                    type="button"
                    class="qr-btn qr-btn-secondary"
                    @click="downloadQr"
                    :disabled="!qrDataUrl"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Descargar PNG
                  </button>

                  <button
                    type="button"
                    class="qr-btn qr-btn-ghost"
                    @click="generate"
                    :disabled="qrLoading"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path>
                    </svg>
                    Regenerar
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Mis Reservas de Hotel ── -->
          <section v-else-if="activeTab === 'reservas'" key="reservas" class="panel panel-reservas">
            <header class="panel-header">
              <div class="panel-title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 21h18"></path>
                  <path d="M3 10h18"></path>
                  <path d="M5 6l7-3 7 3"></path>
                  <path d="M4 10v11"></path>
                  <path d="M20 10v11"></path>
                </svg>
              </div>
              <div>
                <h1 class="panel-title">Mis Reservas de Hotel</h1>
                <p class="panel-subtitle">Historial de tus reservas y cancelación</p>
              </div>
            </header>

            <!-- Resumen de estadísticas -->
            <div v-if="hotelBookings.length" class="reservas-summary">
              <div class="reservas-summary-item">
                <strong>{{ hotelBookings.length }}</strong>
                <span>Reservas</span>
              </div>
              <div class="reservas-summary-item">
                <strong>{{ activeHotelBookings }}</strong>
                <span>Activas</span>
              </div>
              <div class="reservas-summary-item">
                <strong>{{ formatCurrency(totalHotelSpent) }}</strong>
                <span>Total invertido</span>
              </div>
            </div>

            <!-- Cargando -->
            <div v-if="hotelBookingsLoading" class="reservas-state">
              <span class="pf-spinner" role="status" aria-label="Cargando"></span>
              <p>Cargando tus reservas…</p>
            </div>

            <!-- Error -->
            <div v-else-if="hotelBookingsError" class="reservas-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>No pudimos cargar tus reservas</h3>
              <p>{{ hotelBookingsError }}</p>
              <button type="button" class="primary-btn" @click="loadBookings">Reintentar</button>
            </div>

            <!-- Sin reservas -->
            <div v-else-if="hotelBookings.length === 0" class="reservas-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h3>Aún no tienes reservas de hotel</h3>
              <p>Explora las habitaciones de Hotel Asogema y haz tu primera reserva.</p>
              <button type="button" class="primary-btn" @click="emit('navigate', 'hotel')">Reservar en el Hotel</button>
            </div>

            <!-- Lista de reservas -->
            <div v-else class="reservas-list">
              <article
                v-for="booking in hotelBookings"
                :key="booking.id"
                class="reserva-card"
                :class="`reserva-${booking.status}`"
              >
                <div class="reserva-card-head">
                  <div class="reserva-room">
                    <span class="reserva-room-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 21h18"></path>
                        <path d="M3 10h18"></path>
                        <path d="M5 6l7-3 7 3"></path>
                        <path d="M4 10v11"></path>
                        <path d="M20 10v11"></path>
                      </svg>
                    </span>
                    <span class="reserva-room-txt">
                      <small>Reserva #{{ booking.id }}</small>
                      <h3>{{ booking.roomName }}</h3>
                    </span>
                  </div>
                  <span class="reserva-status">
                    <i class="reserva-status-dot"></i>
                    {{ bookingStatusLabel(booking.status) }}
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
                    {{ formatDate(booking.checkIn) }} → {{ formatDate(booking.checkOut) }}
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 010 7.75"></path>
                    </svg>
                    {{ booking.guests }} {{ booking.guests === 1 ? 'huésped' : 'huéspedes' }}
                  </span>
                </div>

                <p v-if="booking.observaciones" class="reserva-notes">Notas: {{ booking.observaciones }}</p>

                <div class="reserva-foot">
                  <div class="reserva-total">
                    <small>Total de la reserva</small>
                    <strong>{{ formatCurrency(booking.total) }}</strong>
                  </div>
                  <button
                    v-if="canCancelBooking(booking)"
                    type="button"
                    class="reserva-cancel"
                    @click="requestCancel(booking)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancelar Reserva
                  </button>
                  <span v-else class="reserva-finished">Reserva finalizada</span>
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

    <!-- ── Confirmación de cancelación de reserva ── -->
    <div
      class="reservas-cancel-overlay"
      :class="{ active: showCancelConfirm }"
      @click.self="closeCancelConfirm"
    >
      <div class="reservas-cancel-modal" v-if="bookingToCancel">
        <div class="reservas-cancel-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3>¿Cancelar esta reserva?</h3>
        <p>
          Vas a cancelar tu reserva de <strong>{{ bookingToCancel.roomName }}</strong> del
          {{ formatDate(bookingToCancel.checkIn) }} al {{ formatDate(bookingToCancel.checkOut) }}.
          Esta acción no se puede deshacer.
        </p>
        <div class="reservas-cancel-actions">
          <button
            type="button"
            class="reservas-cancel-btn reservas-cancel-danger"
            @click="confirmCancel"
            :disabled="isCancelling"
          >
            <template v-if="isCancelling">
              <span class="pf-spinner"></span>
              Cancelando…
            </template>
            <template v-else>Sí, cancelar reserva</template>
          </button>
          <button
            type="button"
            class="reservas-cancel-btn reservas-cancel-secondary"
            @click="closeCancelConfirm"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
