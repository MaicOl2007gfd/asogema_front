<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useTableReservation } from '../composables/useTableReservation.js'

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
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const {
  RESERVATION_DATA,
  timeSlots,
  isVisible,
  fullName,
  email,
  phone,
  date,
  time,
  guests,
  occasion,
  specialRequests,
  isSubmitting,
  showSuccess,
  errors,
  today,
  isFormValid,
  totalGuests,
  incrementGuests,
  decrementGuests,
  handleSubmit,
  resetForm,
  closeSuccess,
  goBackToHome,
  goBackToRestaurant,
} = useTableReservation(emit)
</script>

<template>
  <div class="table-reservation-page">
    <!-- ==========================================================
         NAVBAR
         ========================================================== -->
    <nav class="table-reservation-nav">
      <div class="nav-brand" @click="goBackToHome">
        <img src="/imagenes/Logo.png" alt="Asogema" class="nav-logo" />
        <span class="nav-brand-text">Asogema</span>
      </div>

      <ul class="nav-links" :class="{ open: mobileMenuOpen }">
        <li><a href="#" @click.prevent="goBackToHome">Inicio</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
      </ul>

      <div class="nav-actions" :class="{ open: mobileMenuOpen }">
        <template v-if="isLoggedIn && user">
          <button class="nav-btn nav-btn-outline" @click="handleLogout">Cerrar Sesión</button>
        </template>
        <template v-else>
          <button class="nav-btn nav-btn-outline" @click="emit('navigate', 'login')">Iniciar Sesión</button>
          <button class="nav-btn nav-btn-primary" @click="emit('navigate', 'register')">Registrarse</button>
        </template>
      </div>

      <button class="nav-toggle" :class="{ active: mobileMenuOpen }" @click="toggleMobileMenu" :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <!-- ==========================================================
         MAIN CONTENT
         ========================================================== -->
    <main class="table-reservation-main" :class="{ visible: isVisible }">
      <!-- Header -->
      <div class="trsv-header">
        <div class="trsv-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        </div>
        <div class="trsv-header-tag">Restaurante Asogema</div>
        <h1>Reserva tu Mesa</h1>
        <p>Disfruta de una experiencia gastronómica única. Reserva tu mesa y déjate sorprender.</p>
      </div>

      <!-- Info Bar -->
      <div class="trsv-info-bar">
        <div class="trsv-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{{ RESERVATION_DATA.address }}</span>
        </div>
        <div class="trsv-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>{{ RESERVATION_DATA.phone }}</span>
        </div>
        <div class="trsv-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{{ RESERVATION_DATA.openingHours }}</span>
        </div>
      </div>

      <!-- Success State -->
      <div v-if="showSuccess" class="trsv-form-card">
        <div class="trsv-success">
          <div class="trsv-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>¡Reserva Confirmada!</h2>
          <p>Hemos recibido tu solicitud. Te esperamos en Restaurante Asogema para brindarte una experiencia inolvidable.</p>
          <div class="trsv-success-details">
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{{ date }}</span>
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{{ time }} hrs</span>
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>{{ guests }} {{ guests === 1 ? 'persona' : 'personas' }}</span>
            </div>
          </div>
          <div class="trsv-success-actions">
            <button class="trsv-btn trsv-btn-primary" @click="goBackToRestaurant">
              Volver al Restaurante
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button class="trsv-btn trsv-btn-secondary" @click="resetForm">
              Nueva Reserva
            </button>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div v-else class="trsv-form-card">
        <h2 class="trsv-form-title">Completa tus Datos</h2>

        <div class="trsv-form-row">
          <div class="trsv-form-group">
            <label>Nombre Completo</label>
            <input
              v-model="fullName"
              type="text"
              placeholder="Tu nombre"
              :class="{ error: errors.fullName }"
            />
            <span v-if="errors.fullName" class="error-msg">{{ errors.fullName }}</span>
          </div>
          <div class="trsv-form-group">
            <label>Correo Electrónico</label>
            <input
              v-model="email"
              type="email"
              placeholder="correo@ejemplo.com"
              :class="{ error: errors.email }"
            />
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </div>
        </div>

        <div class="trsv-form-row">
          <div class="trsv-form-group">
            <label>Teléfono</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="+57 300 000 0000"
              :class="{ error: errors.phone }"
            />
            <span v-if="errors.phone" class="error-msg">{{ errors.phone }}</span>
          </div>
          <div class="trsv-form-group">
            <label>Ocasión (opcional)</label>
            <select v-model="occasion">
              <option value="">Seleccionar (opcional)</option>
              <option value="Cumpleaños">Cumpleaños</option>
              <option value="Aniversario">Aniversario</option>
              <option value="Cena de Negocios">Cena de Negocios</option>
              <option value="Cita Romántica">Cita Romántica</option>
              <option value="Reunión Familiar">Reunión Familiar</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div class="trsv-form-row">
          <div class="trsv-form-group">
            <label>Fecha</label>
            <input
              v-model="date"
              type="date"
              :min="today"
              :class="{ error: errors.date }"
            />
            <span v-if="errors.date" class="error-msg">{{ errors.date }}</span>
          </div>
          <div class="trsv-form-group">
            <label>Hora</label>
            <select v-model="time" :class="{ error: errors.time }">
              <option value="">Seleccionar hora</option>
              <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
            </select>
            <span v-if="errors.time" class="error-msg">{{ errors.time }}</span>
          </div>
        </div>

        <div class="trsv-form-row">
          <div class="trsv-form-group">
            <label>Número de Invitados</label>
            <div class="trsv-guests">
              <button class="trsv-guests-btn" @click="decrementGuests" :disabled="guests <= 1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span class="trsv-guests-value">{{ guests }}</span>
              <button class="trsv-guests-btn" @click="incrementGuests" :disabled="guests >= 20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="trsv-form-group">
            <label>&nbsp;</label>
            <div style="font-size:13px;color:var(--trsv-text-muted);padding-top:8px;">
              Capacidad máxima: 20 personas
            </div>
          </div>
        </div>

        <div class="trsv-form-group full-width">
          <label>Notas o Requisitos Especiales (opcional)</label>
          <textarea
            v-model="specialRequests"
            placeholder="Alergias, preferencias de mesa, solicitudes especiales..."
            rows="3"
          ></textarea>
        </div>

        <button class="trsv-submit" @click="handleSubmit" :disabled="isSubmitting">
          <template v-if="isSubmitting">
            <span class="trsv-spinner"></span>
            Reservando...
          </template>
          <template v-else>
            Confirmar Reserva
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </template>
        </button>
      </div>
    </main>

    <!-- ==========================================================
         FOOTER
         ========================================================== -->
    <footer class="trsv-footer">
      <div class="trsv-footer-grid">
        <div class="trsv-footer-brand">
          <img src="/imagenes/Logo.png" alt="Asogema" style="width:36px;height:36px;object-fit:contain;filter:brightness(1.3);" />
          <p>Asogema es un destino único donde la naturaleza, la gastronomía y la elegancia se combinan para ofrecerte experiencias inolvidables.</p>
        </div>
        <div class="trsv-footer-col">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#" @click.prevent="goBackToHome">Inicio</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
          </ul>
        </div>
        <div class="trsv-footer-col">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">{{ RESERVATION_DATA.phone }}</a></li>
            <li><a href="#">{{ RESERVATION_DATA.email }}</a></li>
            <li><a href="#">{{ RESERVATION_DATA.address }}</a></li>
          </ul>
        </div>
      </div>
      <div class="trsv-footer-bottom">
        <span>&copy; {{ new Date().getFullYear() }} Asogema. Todos los derechos reservados.</span>
        <div class="trsv-footer-socials">
          <a href="#" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import url('../TableReservation.css');
</style>
