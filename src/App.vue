<script setup>
import { ref, onMounted } from 'vue'
import { restoreSession, logout, useAuth } from './composables/useAuth.js'
import { applyOAuthCallback } from './composables/useSocialAuth.js'
import api from './composables/useApi.js'
import IndexView from './components/IndexView.vue'
import LoginView from './components/LoginView.vue'
import RegisterView from './components/RegisterView.vue'
import VerifyEmailView from './components/VerifyEmailView.vue'
import ProfileView from './components/ProfileView.vue'
import ForgotPasswordView from './components/ForgotPasswordView.vue'
import HotelView from './components/HotelView.vue'
import BookingView from './components/BookingView.vue'
import RestaurantView from './components/RestaurantView.vue'
import DashboardView from './components/DashboardView.vue'
import EventsView from './components/EventsView.vue'
import TableReservationView from './components/TableReservationView.vue'
import RestaurantReservationsView from './components/RestaurantReservationsView.vue'
import PanelAdmin from './components/PanelAdmin.vue'
import PanelEmpleado from './components/PanelEmpleado.vue'
import PaymentResultView from './components/PaymentResultView.vue'

const currentView = ref('index')

const { isLoggedIn, isAdmin, isEmployee, user } = useAuth()

// Secciones que requieren sesión iniciada
// Nota: 'hotel-reservation' no está en la lista para que al pulsar
// "Seleccionar" en el catálogo se pueda ver la pantalla de reserva;
// la confirmación final sigue exigiendo iniciar sesión (useHotel).
const protectedViews = ['hotel', 'restaurant', 'events', 'table-reservation', 'restaurant-reservations', 'dashboard', 'admin', 'employee', 'profile']

const showLoginAlert = ref(false)
const pendingView = ref(null)

function navigate(view) {
  if (protectedViews.includes(view) && !isLoggedIn.value) {
    pendingView.value = view
    showLoginAlert.value = true
    return
  }
  if (view === 'admin' && !isAdmin.value) {
    currentView.value = 'index'
    return
  }
  if (view === 'employee' && !isEmployee.value) {
    currentView.value = 'index'
    return
  }
  currentView.value = view
}

function cancelLoginAlert() {
  showLoginAlert.value = false
  pendingView.value = null
}

function goToLogin() {
  showLoginAlert.value = false
  pendingView.value = null
  currentView.value = 'login'
}

onMounted(async () => {
  // Procesar callback OAuth (Google / Facebook) si el backend redirigió con tokens.
  // Se ejecuta antes de restoreSession para no sobrescribir la sesión recién creada.
  const oauth = applyOAuthCallback()
  if (oauth?.success) {
    currentView.value = isAdmin.value ? 'admin' : 'index'
  } else if (oauth?.error) {
    localStorage.setItem('asogema_oauth_error', oauth.error)
    currentView.value = 'login'
  }

  restoreSession()

  if (localStorage.getItem('asogema_token')) {
    try {
      const { data } = await api.get('/auth/users/me')
      const stored = JSON.parse(localStorage.getItem('asogema_user') || '{}')
      stored.nombre = data.nombre || stored.nombre
      stored.apellido = data.apellido || stored.apellido
      stored.correo = data.correo || stored.correo
      stored.name = `${stored.nombre || ''} ${stored.apellido || ''}`.trim() || stored.name || 'Usuario'
      user.value = stored
      localStorage.setItem('asogema_user', JSON.stringify(stored))
    } catch {
      logout()
    }
  }
})
</script>

<template>
  <Transition name="view-fade" mode="out-in">
    <IndexView v-if="currentView === 'index'" key="index" @navigate="navigate" />
    <LoginView v-else-if="currentView === 'login'" key="login" @navigate="navigate" />
    <RegisterView v-else-if="currentView === 'register'" key="register" @navigate="navigate" />
    <VerifyEmailView v-else-if="currentView === 'verify-email'" key="verify-email" @navigate="navigate" />
    <ForgotPasswordView v-else-if="currentView === 'forgot-password'" key="forgot-password" @navigate="navigate" />
    <ProfileView v-else-if="currentView === 'profile'" key="profile" @navigate="navigate" />
    <HotelView v-else-if="currentView === 'hotel'" key="hotel" @navigate="navigate" />
    <BookingView v-else-if="currentView === 'hotel-reservation'" key="hotel-reservation" @navigate="navigate" />
    <RestaurantView v-else-if="currentView === 'restaurant'" key="restaurant" @navigate="navigate" />
    <EventsView v-else-if="currentView === 'events'" key="events" @navigate="navigate" />
    <TableReservationView v-else-if="currentView === 'table-reservation'" key="table-reservation" @navigate="navigate" />
    <RestaurantReservationsView v-else-if="currentView === 'restaurant-reservations'" key="restaurant-reservations" @navigate="navigate" />
    <DashboardView v-else-if="currentView === 'dashboard'" key="dashboard" @navigate="navigate" />
    <PanelAdmin v-else-if="currentView === 'admin'" key="admin" @navigate="navigate" />
    <PanelEmpleado v-else-if="currentView === 'employee'" key="employee" @navigate="navigate" />
    <PaymentResultView v-else-if="currentView === 'payment-result'" key="payment-result" @navigate="navigate" />
  </Transition>

  <!-- Alerta de acceso restringido (no logueado) -->
  <Transition name="modal-fade">
    <div v-if="showLoginAlert" class="login-alert-overlay" @click.self="cancelLoginAlert">
      <div class="login-alert-card" role="alertdialog" aria-modal="true" aria-labelledby="login-alert-title">
        <div class="login-alert-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0110 0v4"></path>
          </svg>
        </div>
        <h3 id="login-alert-title">Acceso Denegado</h3>
        <p>Para ingresar a esta sección necesitas iniciar sesión.</p>
        <div class="login-alert-actions">
          <button type="button" class="login-alert-btn login-alert-btn-primary" @click="goToLogin">Iniciar Sesión</button>
          <button type="button" class="login-alert-btn login-alert-btn-cancel" @click="cancelLoginAlert">Cancelar</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.view-fade-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.view-fade-leave-to {
  opacity: 0;
  transform: scale(1.04);
}

/* ── Modal de acceso restringido ─────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.login-alert-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(5, 5, 5, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.login-alert-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 32px 32px;
  background: #F3E8D3;
  border: 1px solid #133215;
  border-radius: 16px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.45);
  text-align: center;
}

.login-alert-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #133215, #00cec9);
  color: #F3E8D3;
}

.login-alert-icon svg {
  width: 28px;
  height: 28px;
}

.login-alert-card h3 {
  font-size: 22px;
  font-weight: 700;
  color: #133215;
  margin-bottom: 10px;
}

.login-alert-card p {
  font-size: 14px;
  line-height: 1.6;
  color: #133215;
  margin-bottom: 28px;
}

.login-alert-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.login-alert-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px solid #133215;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-alert-btn-primary {
  background: #133215;
  color: #F3E8D3;
}

.login-alert-btn-primary:hover {
  background: #050505;
  transform: translateY(-2px);
}

.login-alert-btn-cancel {
  background: transparent;
  color: #133215;
}

.login-alert-btn-cancel:hover {
  background: rgba(19, 50, 21, 0.08);
}
</style>
