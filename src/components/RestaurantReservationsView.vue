<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useMyRestaurantReservations } from '../composables/useMyRestaurantReservations.js'

const emit = defineEmits(['navigate'])

const { user, isLoggedIn, logout } = useAuth()
const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function handleLogout() {
  logout()
  mobileMenuOpen.value = false
}

function getUserInitials() {
  if (!user.value) return '?'
  return user.value.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const {
  reservations,
  reservationsLoading,
  reservationsError,
  reservationToCancel,
  showCancelConfirm,
  isCancelling,
  activeCount,
  upcomingCount,
  loadReservations,
  requestCancel,
  closeCancelConfirm,
  confirmCancel,
  canCancel,
  formatDate,
  formatDateLong,
  formatTime,
  goToRestaurant,
  goToNewReservation,
} = useMyRestaurantReservations(emit)

const isVisible = ref(false)

const RESERVATION_DATA = {
  restaurantName: 'Restaurante Asogema',
  address: 'Vía principal, Asogema',
  phone: '+57 300 000 0000',
  email: 'restaurante@asogema.com',
  openingHours: 'Lun-Dom: 7:00 AM - 11:00 PM',
}

onMounted(() => {
  requestAnimationFrame(() => {
    isVisible.value = true
  })
  loadReservations()
})
</script>

<template>
  <div class="rrsv-page">
    <!-- ==========================================================
         NAVBAR
         ========================================================== -->
    <nav class="rrsv-nav">
      <div class="rrsv-nav-brand" @click="emit('navigate', 'index')">
        <img src="/imagenes/Logo.png" alt="Asogema" class="rrsv-nav-logo" />
        <span class="rrsv-nav-brand-text">Asogema</span>
      </div>

      <ul class="rrsv-nav-links" :class="{ open: mobileMenuOpen }">
        <li><a href="#" @click.prevent="emit('navigate', 'index')">Inicio</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
      </ul>

      <div class="rrsv-nav-actions" :class="{ open: mobileMenuOpen }">
        <template v-if="isLoggedIn && user">
          <div class="rrsv-nav-user-info">
            <span class="rrsv-nav-user-greeting">Bienvenido</span>
            <strong class="rrsv-nav-user-name">{{ user.name }}</strong>
          </div>
          <div class="rrsv-nav-user-avatar">{{ getUserInitials() }}</div>
          <button class="rrsv-nav-btn rrsv-nav-btn-logout" @click="handleLogout">Cerrar Sesión</button>
        </template>
        <template v-else>
          <button class="rrsv-nav-btn rrsv-nav-btn-outline" @click="emit('navigate', 'login')">Iniciar Sesión</button>
          <button class="rrsv-nav-btn rrsv-nav-btn-primary" @click="emit('navigate', 'register')">Registrarse</button>
        </template>
      </div>

      <button class="rrsv-nav-toggle" :class="{ active: mobileMenuOpen }" @click="toggleMobileMenu" :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <!-- ==========================================================
         MAIN CONTENT
         ========================================================== -->
    <main class="rrsv-main" :class="{ visible: isVisible }">
      <!-- Header -->
      <div class="rrsv-header">
        <div class="rrsv-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="rrsv-header-tag">Restaurante Asogema</div>
        <h1>Mis Reservas de Restaurante</h1>
        <p>Consulta el historial de tus reservas de mesa, su estado y gestiona tus próximas visitas.</p>
      </div>

      <!-- Info bar -->
      <div class="rrsv-info-bar">
        <div class="rrsv-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{{ RESERVATION_DATA.address }}</span>
        </div>
        <div class="rrsv-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>{{ RESERVATION_DATA.phone }}</span>
        </div>
        <div class="rrsv-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{{ RESERVATION_DATA.openingHours }}</span>
        </div>
      </div>

      <!-- Summary stats -->
      <div v-if="reservations.length" class="rrsv-summary">
        <div class="rrsv-summary-item">
          <strong>{{ reservations.length }}</strong>
          <span>Reservas</span>
        </div>
        <div class="rrsv-summary-item">
          <strong>{{ activeCount }}</strong>
          <span>Activas</span>
        </div>
        <div class="rrsv-summary-item">
          <strong>{{ upcomingCount }}</strong>
          <span>Próximas</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="reservationsLoading" class="rrsv-state">
        <span class="rrsv-spinner" role="status" aria-label="Cargando"></span>
        <p>Cargando tus reservas…</p>
      </div>

      <!-- Error -->
      <div v-else-if="reservationsError" class="rrsv-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>No pudimos cargar tus reservas</h3>
        <p>{{ reservationsError }}</p>
        <button type="button" class="rrsv-btn rrsv-btn-primary" @click="loadReservations">Reintentar</button>
      </div>

      <!-- Empty -->
      <div v-else-if="reservations.length === 0" class="rrsv-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
        <h3>Aún no tienes reservas de restaurante</h3>
        <p>Reserva una mesa en Restaurante Asogema y disfruta de una experiencia gastronómica única.</p>
        <button type="button" class="rrsv-btn rrsv-btn-primary" @click="goToNewReservation(emit)">
          Reservar una Mesa
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <!-- List -->
      <div v-else class="rrsv-list">
        <article
          v-for="r in reservations"
          :key="r.id"
          class="rrsv-card"
          :class="`rrsv-${r.status}`"
        >
          <div class="rrsv-card-head">
            <div class="rrsv-mesa">
              <span class="rrsv-mesa-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </span>
              <span class="rrsv-mesa-txt">
                <small>Reserva #{{ r.id }}</small>
                <h3>{{ r.mesaLabel }}</h3>
              </span>
            </div>
            <span class="rrsv-status">
              <i class="rrsv-status-dot"></i>
              {{ r.statusLabel }}
            </span>
          </div>

          <div class="rrsv-meta">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{ formatDate(r.fecha) }}
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ r.hora }} hrs
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              {{ r.guests }} {{ r.guests === 1 ? 'persona' : 'personas' }}
            </span>
            <span v-if="r.mesaCapacidad">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
              {{ r.mesaCapacidad }} puestos
            </span>
          </div>

          <p v-if="r.motivo" class="rrsv-notes">
            <strong>Ocasión:</strong> {{ r.motivo }}
          </p>
          <p v-if="r.observaciones" class="rrsv-notes">
            <strong>Notas:</strong> {{ r.observaciones }}
          </p>

          <div class="rrsv-foot">
            <div class="rrsv-foot-info">
              <small>Confirmada el</small>
              <strong>{{ formatDate(r.createdAt) }}</strong>
            </div>
            <button
              v-if="canCancel(r)"
              type="button"
              class="rrsv-cancel"
              @click="requestCancel(r)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Cancelar Reserva
            </button>
            <span v-else class="rrsv-finished">Reserva finalizada</span>
          </div>
        </article>
      </div>

      <!-- Actions -->
      <div class="rrsv-actions">
        <button class="rrsv-btn rrsv-btn-primary" @click="goToNewReservation(emit)">
          Nueva Reserva
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
        <button class="rrsv-btn rrsv-btn-secondary" @click="goToRestaurant(emit)">
          Volver al Restaurante
        </button>
      </div>
    </main>

    <!-- ==========================================================
         FOOTER
         ========================================================== -->
    <footer class="rrsv-footer">
      <div class="rrsv-footer-grid">
        <div class="rrsv-footer-brand">
          <img src="/imagenes/Logo.png" alt="Asogema" style="width:36px;height:36px;object-fit:contain;filter:brightness(1.3);" />
          <p>Asogema es un destino único donde la naturaleza, la gastronomía y la elegancia se combinan para ofrecerte experiencias inolvidables.</p>
        </div>
        <div class="rrsv-footer-col">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#" @click.prevent="emit('navigate', 'index')">Inicio</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
          </ul>
        </div>
        <div class="rrsv-footer-col">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">{{ RESERVATION_DATA.phone }}</a></li>
            <li><a href="#">{{ RESERVATION_DATA.email }}</a></li>
            <li><a href="#">{{ RESERVATION_DATA.address }}</a></li>
          </ul>
        </div>
      </div>
      <div class="rrsv-footer-bottom">
        <span>&copy; {{ new Date().getFullYear() }} Asogema. Todos los derechos reservados.</span>
        <div class="rrsv-footer-socials">
          <a href="#" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
      </div>
    </footer>

    <!-- ── Confirmación de cancelación ── -->
    <div
      class="rrsv-cancel-overlay"
      :class="{ active: showCancelConfirm }"
      @click.self="closeCancelConfirm"
    >
      <div class="rrsv-cancel-modal">
        <div class="rrsv-cancel-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3>¿Cancelar esta reserva?</h3>
        <p>
          Vas a cancelar tu reserva de <strong>{{ reservationToCancel?.mesaLabel }}</strong> del
          {{ formatDateLong(reservationToCancel?.fecha) }} a las
          {{ reservationToCancel?.hora }} hrs.
          Esta acción no se puede deshacer.
        </p>
        <div class="rrsv-cancel-actions">
          <button
            type="button"
            class="rrsv-cancel-btn rrsv-cancel-danger"
            @click="confirmCancel"
            :disabled="isCancelling"
          >
            <template v-if="isCancelling">
              <span class="rrsv-spinner"></span>
              Cancelando…
            </template>
            <template v-else>Sí, cancelar reserva</template>
          </button>
          <button
            type="button"
            class="rrsv-cancel-btn rrsv-cancel-secondary"
            @click="closeCancelConfirm"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import url('../RestaurantReservations.css');
</style>
