<script setup>
import { ref, computed } from 'vue'
import { useDashboard } from '../composables/useDashboard.js'
import { useAuth } from '../composables/useAuth.js'
import { isStaffUser } from '../composables/useUtils.js'
import ReviewsView from './ReviewsView.vue'

const emit = defineEmits(['navigate'])
const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const { user, isLoggedIn, isAdmin } = useAuth()

const isStaff = computed(() => isStaffUser(user.value, isAdmin.value))

const {
  rooms,
  roomsLoading,
  roomsError,
  checkIn,
  checkOut,
  roomType,
  guests,
  specialRequests,
  errors,
  isSubmitting,
  showSuccess,
  isVisible,
  showBookingPanel,
  selectedRoom,
  nights,
  subtotal,
  tax,
  total,
  maxGuests,
  guestWarning,
  isFormValid,
  MIN_GUESTS,
  searchQuery,
  showRoomDetail,
  selectedRoomDetail,
  filteredRooms,
  incrementGuests,
  decrementGuests,
  getToday,
  handleSubmit,
  closeSuccess,
  openRoomDetail,
  closeRoomDetail,
  selectRoomFromCard,
  closeBookingPanel,
  scrollToGallery,
  getUserInitials,
  handleLogout,
  goBackToHome
} = useDashboard(emit)
</script>

<template>
  <div class="dashboard-page">
    <!-- ======================================================
         NAVBAR
         ====================================================== -->
    <nav class="dashboard-nav" :class="{ 'has-admin': isAdmin }">
      <div class="nav-brand" @click="scrollToGallery">
        <img src="/imagenes/Logo.png" alt="Asogema" class="nav-logo" />
        <span class="nav-brand-text">Asogema</span>
      </div>

      <ul class="dashboard-nav-links" :class="{ open: mobileMenuOpen }">
        <li><a href="#" @click.prevent="emit('navigate', 'index')">Inicio</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
        <li v-if="isLoggedIn"><a href="#" @click.prevent="emit('navigate', 'wallet')">Mi Saldo</a></li>
        <li v-if="isStaff"><a href="#" @click.prevent="emit('navigate', 'qr-reader')">Lector QR</a></li>
      </ul>

      <div class="nav-user" :class="{ open: mobileMenuOpen }">
        <div v-if="isAdmin" class="nav-admin-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span>Admin</span>
        </div>
        <div
          class="nav-user-greeting"
          v-if="user"
          role="button"
          tabindex="0"
          title="Ver mi perfil"
          aria-label="Ver mi perfil"
          @click="emit('navigate', 'profile')"
          @keydown.enter="emit('navigate', 'profile')"
          @keydown.space.prevent="emit('navigate', 'profile')"
        >
          <small>Bienvenido</small>
          <strong>{{ user.name }}</strong>
        </div>
        <div
          class="nav-user-avatar"
          role="button"
          tabindex="0"
          title="Ver mi perfil"
          aria-label="Ver mi perfil"
          @click="emit('navigate', 'profile')"
          @keydown.enter="emit('navigate', 'profile')"
          @keydown.space.prevent="emit('navigate', 'profile')"
        >{{ getUserInitials() }}</div>
        <button class="nav-profile-btn" @click="emit('navigate', 'profile')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Mi Perfil
        </button>
        <button v-if="isAdmin" class="nav-admin-btn" @click="emit('navigate', 'admin')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
          </svg>
          Admin
        </button>
        <button class="nav-logout-btn" @click="handleLogout">Cerrar Sesión</button>
      </div>

      <button class="dashboard-nav-toggle" :class="{ active: mobileMenuOpen }" @click="toggleMobileMenu" :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <!-- ======================================================
         HERO — WELCOME
         ====================================================== -->
    <section class="dashboard-hero">
      <div class="dashboard-hero-bg">
        <img src="https://picsum.photos/id/1044/1600/900" alt="Hotel Asogema" loading="lazy" />
      </div>

      <div class="dashboard-hero-shapes" aria-hidden="true">
        <div class="dashboard-hero-shape dh-shape-1"></div>
        <div class="dashboard-hero-shape dh-shape-2"></div>
        <div class="dashboard-hero-shape dh-shape-3"></div>
      </div>

      <div class="dashboard-hero-content">
        <div class="hero-badge">
          <span class="hero-badge-dot"></span>
          Hotel Asogema
        </div>
        <h1>
          Bienvenido,
          <span class="welcome-name" v-if="user">{{ user.name }}</span>
        </h1>
        <p class="hero-sub">
          Estamos encantados de tenerte aquí. Reserva tu habitación y disfruta de una experiencia inolvidable en nuestro hotel.
        </p>
        <div class="hero-actions">
          <button class="hero-btn hero-btn-primary" @click="scrollToGallery">
            Reservar Ahora
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <button class="hero-btn hero-btn-secondary" @click="goBackToHome">
            Volver al Inicio
          </button>
        </div>
      </div>

      <div class="dashboard-scroll-indicator" @click="scrollToGallery" aria-label="Ir a reservas">
        <span>Reservar</span>
        <div class="dashboard-scroll-line"></div>
      </div>
    </section>

    <!-- ======================================================
         ROOM GALLERY — Search & Cards
         ====================================================== -->
    <section class="room-gallery-section">
      <div class="room-gallery-header">
        <h2>Nuestras Habitaciones</h2>
        <p>Explora todos los tipos de habitación disponibles en Hotel Asogema</p>
      </div>

      <!-- Search Bar -->
      <div class="room-search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre, descripción o características…"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Results count -->
      <div class="room-results-info" v-if="searchQuery && !roomsLoading">
        <span>{{ filteredRooms.length }} habitación(es) encontrada(s)</span>
      </div>

      <!-- Loading skeleton -->
      <div v-if="roomsLoading" class="room-loading" role="status" aria-live="polite">
        <div class="room-loading-spinner" aria-hidden="true"></div>
        <p>Cargando habitaciones…</p>
      </div>

      <!-- Error state -->
      <div v-else-if="roomsError" class="room-cards-empty room-error-state" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>No pudimos cargar las habitaciones</h3>
        <p>{{ roomsError }}</p>
        <button @click="loadRooms" class="room-cards-empty-btn">Reintentar</button>
      </div>

      <!-- Room Cards Grid -->
      <div v-else class="room-cards-grid">
        <article
          v-for="room in filteredRooms"
          :key="room.value"
          class="room-card"
        >
          <!-- Card Image -->
          <div class="room-card-image">
            <img :src="room.image" :alt="room.label" loading="lazy" />
            <div class="room-card-price-badge">
              ${{ room.price.toLocaleString() }} <small>/noche</small>
            </div>
            <div class="room-card-capacity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
              Hasta {{ room.capacity }} huéspedes
            </div>
          </div>

          <!-- Card Body -->
          <div class="room-card-body">
            <h3 class="room-card-title">{{ room.label }}</h3>
            <p class="room-card-desc">{{ room.desc }}</p>

            <!-- Features chips -->
            <div class="room-card-features">
              <span v-for="feat in room.features.slice(0, 4)" :key="feat" class="feature-chip">{{ feat }}</span>
              <span v-if="room.features.length > 4" class="feature-chip feature-chip-more">+{{ room.features.length - 4 }}</span>
            </div>

            <!-- Actions -->
            <div class="room-card-actions">
              <button class="room-card-btn room-card-btn-more" @click="openRoomDetail(room)">
                Ver más información
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <button class="room-card-btn room-card-btn-select" @click="selectRoomFromCard(room.value)">
                Seleccionar
              </button>
            </div>
          </div>
        </article>

        <!-- Empty state -->
        <div v-if="filteredRooms.length === 0" class="room-cards-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>Sin resultados</h3>
          <p>No encontramos habitaciones que coincidan con tu búsqueda. Intenta con otros términos.</p>
          <button @click="searchQuery = ''" class="room-cards-empty-btn">Limpiar búsqueda</button>
        </div>
      </div>
    </section>

    <!-- ── Reseñas de Habitaciones ── -->
    <ReviewsView serviceType="hotel" theme="light" />

    <!-- ======================================================
         BOOKING PANEL — appears when a room is selected
         ====================================================== -->
    <section id="booking-panel" v-if="showBookingPanel" class="booking-panel-section">
      <div class="booking-panel-header">
        <div class="booking-panel-title-group">
          <span class="booking-panel-tag">Reserva tu estadía</span>
          <h2>{{ selectedRoom.label }}</h2>
          <p class="booking-panel-price">${{ selectedRoom.price.toLocaleString() }} <small>/noche</small></p>
        </div>
        <button class="booking-panel-close" @click="closeBookingPanel" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="booking-panel-layout">
        <!-- Left: Room Image -->
        <div class="booking-panel-image">
          <img :src="selectedRoom.image" :alt="selectedRoom.label" />
          <div class="booking-panel-image-overlay">
            <div class="booking-panel-image-features">
              <span v-for="feat in selectedRoom.features.slice(0, 3)" :key="feat" class="bp-feature-chip">{{ feat }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Form -->
        <div class="booking-panel-form-wrap">
          <form @submit.prevent="handleSubmit" novalidate>
            <div class="booking-panel-grid">
              <!-- Check-in -->
              <div class="booking-field">
                <label for="book-checkin">Fecha de entrada <span class="required">*</span></label>
                <input
                  id="book-checkin"
                  v-model="checkIn"
                  type="date"
                  :min="getToday()"
                  :class="{ error: errors.checkIn }"
                />
                <span v-if="errors.checkIn" class="error-message">{{ errors.checkIn }}</span>
              </div>

              <!-- Check-out -->
              <div class="booking-field">
                <label for="book-checkout">Fecha de salida <span class="required">*</span></label>
                <input
                  id="book-checkout"
                  v-model="checkOut"
                  type="date"
                  :min="checkIn || getToday()"
                  :class="{ error: errors.checkOut }"
                />
                <span v-if="errors.checkOut" class="error-message">{{ errors.checkOut }}</span>
              </div>

              <!-- Guests -->
              <div class="booking-field">
                <label>N° de personas <span class="required">*</span></label>
                <div class="booking-guest-counter" :class="{ error: errors.guests }">
                  <button type="button" @click="decrementGuests" :disabled="guests <= MIN_GUESTS">−</button>
                  <span class="guest-value">{{ guests }}</span>
                  <span class="guest-label">personas</span>
                  <button type="button" @click="incrementGuests" :disabled="guests >= maxGuests">+</button>
                </div>
                <span v-if="errors.guests" class="error-message">{{ errors.guests }}</span>
                <span v-else class="guest-hint">Mínimo {{ MIN_GUESTS }} — Máximo {{ maxGuests }}</span>
              </div>
            </div>

            <!-- Special Requests -->
            <div class="booking-field booking-field-full">
              <label for="book-requests">Solicitudes especiales</label>
              <textarea
                id="book-requests"
                v-model="specialRequests"
                placeholder="Ej: Habitación en pisos superiores, cama adicional, alergias alimentarias..."
                rows="2"
              ></textarea>
            </div>

            <!-- Summary & Submit -->
            <div class="booking-summary-row">
              <div class="booking-total" v-if="nights > 0">
                <div class="booking-total-line">
                  <span>{{ selectedRoom.label }}</span>
                  <span>${{ selectedRoom.price.toLocaleString() }} x {{ nights }} noche(s)</span>
                </div>
                <div class="booking-total-line">
                  <span>Subtotal</span>
                  <span>${{ subtotal.toLocaleString() }}</span>
                </div>
                <div class="booking-total-line">
                  <span>Impuestos (10%)</span>
                  <span>${{ tax.toLocaleString() }}</span>
                </div>
                <div class="booking-total-line booking-total-grand">
                  <span>Total</span>
                  <span>${{ total.toLocaleString() }}</span>
                </div>
              </div>
              <div class="booking-actions">
                <button
                  type="submit"
                  class="booking-btn booking-btn-primary"
                  :disabled="isSubmitting || !isFormValid"
                >
                  <template v-if="!isSubmitting">
                    Confirmar Reserva
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </template>
                  <template v-else>
                    <svg class="spinner" viewBox="0 0 50 50" style="width:22px;height:22px">
                      <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
                    </svg>
                    Procesando...
                  </template>
                </button>
                <button type="button" class="booking-btn booking-btn-secondary" @click="closeBookingPanel">
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- ======================================================
         ROOM DETAIL MODAL
         ====================================================== -->
    <div class="room-detail-overlay" :class="{ active: showRoomDetail }" @click.self="closeRoomDetail">
      <div class="room-detail-modal" v-if="selectedRoomDetail">
        <!-- Close button -->
        <button class="room-detail-close" @click="closeRoomDetail" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Header image -->
        <div class="room-detail-image">
          <img :src="selectedRoomDetail.image" :alt="selectedRoomDetail.label" />
          <div class="room-detail-price-badge">
            ${{ selectedRoomDetail.price.toLocaleString() }} <small>/noche</small>
          </div>
        </div>

        <!-- Content -->
        <div class="room-detail-body">
          <h2 class="room-detail-title">{{ selectedRoomDetail.label }}</h2>

          <div class="room-detail-meta">
            <div class="room-detail-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              <span>Capacidad: hasta {{ selectedRoomDetail.capacity }} huéspedes</span>
            </div>
            <div class="room-detail-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
              </svg>
              <span>Precio: ${{ selectedRoomDetail.price.toLocaleString() }} COP por noche</span>
            </div>
          </div>

          <p class="room-detail-desc">{{ selectedRoomDetail.fullDesc }}</p>

          <div class="room-detail-features-title">Características incluidas</div>
          <div class="room-detail-features-grid">
            <div v-for="feat in selectedRoomDetail.features" :key="feat" class="room-detail-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ feat }}</span>
            </div>
          </div>

          <div class="room-detail-actions">
            <button class="room-detail-btn room-detail-btn-primary" @click="selectRoomFromCard(selectedRoomDetail.value)">
              Seleccionar esta habitación
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button class="room-detail-btn room-detail-btn-secondary" @click="closeRoomDetail">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================
         SUCCESS MODAL
         ====================================================== -->
    <div class="success-overlay" :class="{ active: showSuccess }" @click.self="closeSuccess">
      <div class="success-modal">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>¡Reserva Confirmada!</h2>
        <p>
          Tu reserva en <strong>Hotel Asogema</strong> ha sido procesada exitosamente.<br />
          Recibirás un correo con los detalles de confirmación.
        </p>
        <button class="btn-success" @click="closeSuccess">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<style>
@import url('../Dashboard.css');
</style>
