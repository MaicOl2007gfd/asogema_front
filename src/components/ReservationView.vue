<script setup>
import { useAuth } from '../composables/useAuth.js'
import { useReservation } from '../composables/useReservation.js'

const emit = defineEmits(['navigate'])

const { user, logout } = useAuth()
const {
  ROOM_TYPES,
  checkIn,
  checkOut,
  roomType,
  adults,
  children,
  numRooms,
  fullName,
  email,
  phone,
  specialRequests,
  errors,
  isSubmitting,
  showSuccess,
  selectedRoom,
  nights,
  subtotal,
  tax,
  total,
  totalGuests,
  maxGuests,
  guestWarning,
  isFormValid,
  searchQuery,
  showRoomDetail,
  selectedRoomDetail,
  filteredRooms,
  incrementAdults,
  decrementAdults,
  incrementChildren,
  decrementChildren,
  incrementRooms,
  decrementRooms,
  handleSubmit,
  closeSuccess,
  goBackToHome,
  openRoomDetail,
  closeRoomDetail,
  selectRoomFromCard,
} = useReservation(emit)

function handleLogout() {
  logout()
  emit('navigate', 'index')
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

function getToday() {
  return new Date().toISOString().split('T')[0]
}
</script>

<template>
  <div class="reservation-page">
    <!-- ======================================================
         NAVBAR (logged-in)
         ====================================================== -->
    <nav class="reservation-nav">
      <div class="nav-brand" @click="goBackToHome">
        <img src="/imagenes/Logo.png" alt="Asogema" class="nav-logo" />
        <span class="nav-brand-text">Asogema</span>
      </div>

      <div class="nav-user">
        <span class="nav-user-name" v-if="user">{{ user.name }}</span>
        <div class="nav-user-avatar">{{ getUserInitials() }}</div>
        <button class="nav-logout-btn" @click="handleLogout">Cerrar Sesión</button>
      </div>
    </nav>

    <!-- ======================================================
         HERO / BANNER
         ====================================================== -->
    <section class="reservation-hero">
      <div class="reservation-hero-bg">
        <img src="https://picsum.photos/id/1044/1600/500" alt="Hotel Asogema" loading="lazy" />
      </div>
      <div class="reservation-hero-content">
        <h1>Reserva tu Habitación</h1>
        <p>Selecciona fechas, tipo de habitación y huéspedes para confirmar tu reserva</p>
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
      <div class="room-results-info" v-if="searchQuery">
        <span>{{ filteredRooms.length }} habitación(es) encontrada(s)</span>
      </div>

      <!-- Room Cards Grid -->
      <div class="room-cards-grid">
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

    <!-- ======================================================
         RESERVATION CONTENT
         ====================================================== -->
    <div class="reservation-content">
      <!-- ---- FORM SECTION ---- -->
      <div class="reservation-form-section">
        <div class="section-header">
          <h2>Datos de la Reserva</h2>
          <p>Completa todos los campos para confirmar tu estadía en Hotel Asogema</p>
        </div>

        <form class="reservation-form" @submit.prevent="handleSubmit" novalidate>
          <!-- Full Name -->
          <div class="form-group form-group-full">
            <label for="rsv-name">Nombre completo <span class="required">*</span></label>
            <input
              id="rsv-name"
              v-model="fullName"
              type="text"
              placeholder="Ej: Juan Pérez"
              :class="{ error: errors.fullName }"
            />
            <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="rsv-email">Correo electrónico <span class="required">*</span></label>
            <input
              id="rsv-email"
              v-model="email"
              type="email"
              placeholder="correo@ejemplo.com"
              :class="{ error: errors.email }"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label for="rsv-phone">Teléfono <span class="required">*</span></label>
            <input
              id="rsv-phone"
              v-model="phone"
              type="tel"
              placeholder="+57 300 123 4567"
              :class="{ error: errors.phone }"
            />
            <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          </div>

          <!-- Room Type -->
          <div class="form-group">
            <label for="rsv-room">Tipo de habitación <span class="required">*</span></label>
            <select
              id="rsv-room"
              v-model="roomType"
              :class="{ error: errors.roomType }"
            >
              <option v-for="room in ROOM_TYPES" :key="room.value" :value="room.value">
                {{ room.label }} — ${{ room.price }}/noche
              </option>
            </select>
            <span v-if="errors.roomType" class="error-message">{{ errors.roomType }}</span>
          </div>

          <!-- Number of Rooms -->
          <div class="form-group">
            <label for="rsv-rooms">N° de habitaciones <span class="required">*</span></label>
            <div class="guest-counter" :class="{ error: errors.numRooms }">
              <button type="button" @click="decrementRooms" :disabled="numRooms <= 1">−</button>
              <span class="guest-value">{{ numRooms }}</span>
              <button type="button" @click="incrementRooms" :disabled="numRooms >= 5">+</button>
            </div>
            <span v-if="errors.numRooms" class="error-message">{{ errors.numRooms }}</span>
          </div>

          <!-- Check-in -->
          <div class="form-group">
            <label for="rsv-checkin">Fecha de entrada <span class="required">*</span></label>
            <input
              id="rsv-checkin"
              v-model="checkIn"
              type="date"
              :min="getToday()"
              :class="{ error: errors.checkIn }"
            />
            <span v-if="errors.checkIn" class="error-message">{{ errors.checkIn }}</span>
          </div>

          <!-- Check-out -->
          <div class="form-group">
            <label for="rsv-checkout">Fecha de salida <span class="required">*</span></label>
            <input
              id="rsv-checkout"
              v-model="checkOut"
              type="date"
              :min="checkIn || getToday()"
              :class="{ error: errors.checkOut }"
            />
            <span v-if="errors.checkOut" class="error-message">{{ errors.checkOut }}</span>
          </div>

          <!-- Adults -->
          <div class="form-group">
            <label>Adultos <span class="required">*</span></label>
            <div class="guest-counter">
              <button type="button" @click="decrementAdults" :disabled="adults <= 1">−</button>
              <span class="guest-value">{{ adults }}</span>
              <span class="guest-label">Adultos</span>
              <button type="button" @click="incrementAdults" :disabled="adults >= 10">+</button>
            </div>
          </div>

          <!-- Children -->
          <div class="form-group">
            <label>Niños</label>
            <div class="guest-counter">
              <button type="button" @click="decrementChildren" :disabled="children <= 0">−</button>
              <span class="guest-value">{{ children }}</span>
              <span class="guest-label">Niños</span>
              <button type="button" @click="incrementChildren" :disabled="children >= 8">+</button>
            </div>
          </div>

          <!-- Guest warning -->
          <div v-if="guestWarning" class="form-group form-group-full">
            <span class="error-message" style="display:block">{{ guestWarning }}</span>
          </div>

          <!-- Special Requests -->
          <div class="form-group form-group-full">
            <label for="rsv-requests">Solicitudes especiales</label>
            <textarea
              id="rsv-requests"
              v-model="specialRequests"
              placeholder="Ej: Habitación en pisos superiores, cama adicional, alergias alimentarias..."
              rows="3"
            ></textarea>
          </div>

          <!-- Submit -->
          <div class="submit-row">
            <button
              type="submit"
              class="btn-reserve"
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
            <button type="button" class="btn-cancel" @click="goBackToHome">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- ---- SUMMARY SIDEBAR ---- -->
      <aside class="reservation-summary">
        <h3>Resumen de Reserva</h3>

        <div v-if="!checkIn && !checkOut" class="summary-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p>Completa las fechas para ver el resumen</p>
        </div>

        <template v-else>
          <div class="summary-item">
            <span class="label">Habitación</span>
            <span class="value">{{ selectedRoom.label }}</span>
          </div>
          <div class="summary-item" v-if="numRooms > 1">
            <span class="label">Cantidad</span>
            <span class="value">{{ numRooms }} habitación(es)</span>
          </div>
          <div class="summary-item">
            <span class="label">Huéspedes</span>
            <span class="value">{{ totalGuests }} ({{ adults }} adulto(s){{ children ? ', ' + children + ' niño(s)' : '' }})</span>
          </div>
          <div class="summary-item" v-if="nights > 0">
            <span class="label">Noches</span>
            <span class="value">{{ nights }}</span>
          </div>
          <div class="summary-item" v-if="nights > 0">
            <span class="label">Precio por noche</span>
            <span class="value">${{ selectedRoom.price.toLocaleString() }}</span>
          </div>
          <div class="summary-item" v-if="nights > 0">
            <span class="label">Check-in</span>
            <span class="value">{{ checkIn }}</span>
          </div>
          <div class="summary-item" v-if="nights > 0">
            <span class="label">Check-out</span>
            <span class="value">{{ checkOut }}</span>
          </div>

          <div class="summary-item" v-if="subtotal > 0">
            <span class="label">Subtotal</span>
            <span class="value">${{ subtotal.toLocaleString() }}</span>
          </div>
          <div class="summary-item" v-if="tax > 0">
            <span class="label">Impuestos (10%)</span>
            <span class="value">${{ tax.toLocaleString() }}</span>
          </div>

          <div class="summary-total" v-if="total > 0">
            <span class="label">Total</span>
            <span class="value">${{ total.toLocaleString() }}</span>
          </div>
        </template>
      </aside>
    </div>

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
        <button class="btn-success" @click="goBackToHome">Volver al Inicio</button>
      </div>
    </div>
  </div>
</template>

<style>
@import url('../Reservation.css');
</style>
