<script setup>
/**
 * BookingView.vue — Reserva de Habitación
 * --------------------------------------------------------------
 * Concepto "Dark Luxury Suite": lujo oscuro con glassmorphism.
 *   - Tarjeta oscura de cristal con acento turquesa.
 *   - Héroe cinematográfico (imagen + nombre serif + precio).
 *   - Formulario con campos glass y resumen en tiempo real.
 *   - CTA en píldora turquesa brillante con jerarquía clara.
 *
 * Paleta de marca: verde oscuro #0b1f0d, turquesa #00cec9/#5ff2ee, crema #F3E8D3.
 *
 * Pantalla enfocada (sin navbar ni footer): "Cancelar" regresa al catálogo.
 * Se llega pulsando "Seleccionar" en la sección Hotel.
 */
import { computed, watch, onMounted } from 'vue'
import { useHotel } from '../composables/useHotel.js'
import ReservationDatePicker from './ReservationDatePicker.vue'

const emit = defineEmits(['navigate'])

const {
  user,
  isLoggedIn,
  rooms,
  selectedRoom,
  checkIn,
  checkOut,
  guests,
  specialRequests,
  isSubmitting,
  showSuccess,
  errors,
  nights,
  maxGuests,
  subtotal,
  tax,
  total,
  isFormValid,
  MIN_GUESTS,
  isVisible,
  formatCurrency,
  formatDate,
  getToday,
  incrementGuests,
  decrementGuests,
  handleSubmit,
  resetForm,
  goToPayment,
  closeSuccess,
  goBackToHotel,
  loadRooms,
} = useHotel()

/* ----------------------------------------------------------
   Datos derivados para el diseño
   ---------------------------------------------------------- */
// Tags "pill" que acompañan a la habitación
const featuredTags = computed(() => (selectedRoom.value?.features || []).slice(0, 3))

// Características destacadas de la habitación
const roomFeatures = computed(() => (selectedRoom.value?.features || []).slice(0, 4))

// Si la habitación solo admite 1 persona (min = max), se bloquea el stepper
const guestsLocked = computed(() => maxGuests.value <= MIN_GUESTS)

// Fecha mínima para salida = día después de la entrada (o hoy si no hay entrada)
const checkOutMin = computed(() =>
  checkIn.value ? addDaysISO(checkIn.value, 1) : getToday(),
)

/* ----------------------------------------------------------
   Utilidades
   ---------------------------------------------------------- */
// Suma días a una fecha ISO (YYYY-MM-DD) sin desfase de zona horaria
function addDaysISO(iso, days) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

/* ----------------------------------------------------------
   Validación reactiva (microinteracciones):
   - Se limpia el error al corregir cada campo.
   - Si la entrada cambia y la salida queda inválida, se reasigna.
   ---------------------------------------------------------- */
watch(checkIn, (val) => {
  if (errors.value.checkIn) errors.value.checkIn = ''
  if (checkOut.value && (!val || checkOut.value <= val)) {
    checkOut.value = ''
    if (errors.value.checkOut) errors.value.checkOut = ''
  }
})
watch(checkOut, () => {
  if (errors.value.checkOut) errors.value.checkOut = ''
})
watch(guests, () => {
  if (errors.value.guests) errors.value.guests = ''
})

function onGoBackHotel() {
  goBackToHotel(emit)
}

function onSubmit() {
  handleSubmit(emit)
}

function onNewReservation() {
  resetForm()
  onGoBackHotel()
}

function goToMyBookings() {
  showSuccess.value = false
  // Abrir el Perfil directamente en "Mis Reservas" para que el usuario
  // vea su reserva recién creada (Hotel + Restaurante + Eventos).
  emit('navigate', 'profile')
}

onMounted(async () => {
  requestAnimationFrame(() => {
    isVisible.value = true
  })
  // Si se llega sin selección (acceso directo), se toma la primera
  // habitación disponible del catálogo como respaldo.
  if (!selectedRoom.value) {
    if (rooms.value.length === 0) await loadRooms()
    if (rooms.value.length > 0 && !selectedRoom.value) {
      const first = rooms.value[0]
      checkIn.value = ''
      checkOut.value = ''
      guests.value = Math.min(guests.value, first.capacity)
      selectedRoom.value = first
    }
  }
})
</script>

<template>
  <div class="bk-page">
    <main class="bk-main" :class="{ visible: isVisible }">
      <!-- Success State -->
      <div v-if="showSuccess" class="bk-card">
        <div class="bk-success">
          <div class="bk-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>¡Reserva Confirmada!</h2>
          <p>
            Tu reserva en <strong>Hotel Asogema</strong> ha sido procesada exitosamente.<br />
            Recibirás un correo con los detalles de confirmación.
          </p>
          <div v-if="selectedRoom" class="bk-success-details">
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18"></path>
                <path d="M3 10h18"></path>
                <path d="M5 6l7-3 7 3"></path>
              </svg>
              <span>{{ selectedRoom.label }}</span>
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{{ formatDate(checkIn) }} → {{ formatDate(checkOut) }}</span>
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              <span>{{ guests }} {{ guests === 1 ? 'huésped' : 'huéspedes' }}</span>
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>{{ formatCurrency(total) }}</span>
            </div>
          </div>
          <div class="bk-success-actions">
            <button class="bk-btn bk-btn-primary" @click="goToPayment">
              Pagar Ahora
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button class="bk-btn bk-btn-secondary" @click="goToMyBookings">
              Ver Mis Reservas
            </button>
          </div>
        </div>
      </div>

      <!-- No room selected fallback -->
      <div v-else-if="!selectedRoom" class="bk-card">
        <div class="bk-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"></path>
            <path d="M3 10h18"></path>
            <path d="M5 6l7-3 7 3"></path>
          </svg>
          <h2>Selecciona una habitación</h2>
          <p>Primero elige una habitación en el catálogo del hotel para continuar con tu reserva.</p>
          <button class="bk-btn bk-btn-primary" @click="onGoBackHotel">
            Ver Catálogo de Habitaciones
          </button>
        </div>
      </div>

      <!-- ======================================================
           BOOKING CARD — Dark Luxury Suite
           Héroe cinematográfico + cuerpo en 2 columnas.
           ====================================================== -->
      <div v-else class="bk-card bk-card--booking">
        <span class="bk-accent" aria-hidden="true"></span>

        <!-- Cabecera: sello del hotel -->
        <header class="bk-head">
          <div class="bk-head-brand">
            <img src="/imagenes/Logo.png" alt="Asogema" class="bk-head-logo" />
            <div class="bk-head-txt">
              <strong>Hotel Asogema</strong>
              <span>Reserva de habitación</span>
            </div>
          </div>
          <span class="bk-head-badge">
            <i class="bk-head-dot"></i>
            Reserva tu estadía
          </span>
        </header>

        <!-- Héroe: imagen cinematográfica con datos de la habitación -->
        <section class="bk-hero">
          <img class="bk-hero-img" :src="selectedRoom.image" :alt="selectedRoom.label" />
          <div class="bk-hero-overlay"></div>
          <div class="bk-hero-content">
            <div class="bk-hero-left">
              <span class="bk-eyebrow">Reserva tu estadía</span>
              <h2 class="bk-room-name">{{ selectedRoom.label }}</h2>
              <div class="bk-rating" aria-label="Hotel de 5 estrellas">
                <span class="bk-stars" aria-hidden="true">
                  <svg v-for="s in 5" :key="s" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </span>
                <span class="bk-rating-label">Hotel 5 estrellas</span>
              </div>
            </div>

            <div class="bk-hero-price">
              <span class="bk-price">{{ formatCurrency(selectedRoom.price) }}</span>
              <span class="bk-price-per">/ noche</span>
            </div>
          </div>
        </section>

        <div class="bk-body">
          <!-- LEFT: detalles de la habitación -->
          <section class="bk-details">
            <div class="bk-tags">
              <span v-for="tag in featuredTags" :key="tag" class="bk-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {{ tag }}
              </span>
            </div>

            <p class="bk-desc">{{ selectedRoom.fullDesc }}</p>

            <div class="bk-features">
              <span v-for="f in roomFeatures" :key="f" class="bk-feature">{{ f }}</span>
            </div>
          </section>

          <!-- RIGHT: formulario de reserva -->
          <section class="bk-form-col">
            <div class="bk-form-head">
              <span class="bk-eyebrow">Detalles de la reserva</span>
              <h3 class="bk-form-title">Confirma tu estadía</h3>
            </div>

            <!-- Banner de usuario logueado -->
            <div v-if="isLoggedIn && user" class="bk-logged">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Reservando como <strong>{{ user.name }}</strong></span>
            </div>

            <form @submit.prevent="onSubmit" novalidate>
              <!-- Fechas con date picker personalizado (glass) -->
              <div class="bk-field-row">
                <div class="bk-field">
                  <label for="rs-checkin">Entrada <span class="required">*</span></label>
                  <ReservationDatePicker
                    v-model="checkIn"
                    :min-date="getToday()"
                    :invalid="!!errors.checkIn"
                    placeholder="Fecha de entrada"
                  />
                  <transition name="fade">
                    <span v-if="errors.checkIn" class="error-msg">{{ errors.checkIn }}</span>
                  </transition>
                </div>

                <div class="bk-field">
                  <label for="rs-checkout">Salida <span class="required">*</span></label>
                  <ReservationDatePicker
                    v-model="checkOut"
                    :min-date="checkOutMin"
                    :invalid="!!errors.checkOut"
                    placeholder="Fecha de salida"
                  />
                  <transition name="fade">
                    <span v-if="errors.checkOut" class="error-msg">{{ errors.checkOut }}</span>
                  </transition>
                </div>
              </div>

              <!-- Ocupantes (máximo dinámico) + noches -->
              <div class="bk-field-row">
                <div class="bk-field">
                  <label>Ocupantes <span class="required">*</span></label>
                  <div class="bk-guests" :class="{ invalid: !!errors.guests, locked: guestsLocked }">
                    <button
                      type="button"
                      class="bk-step"
                      :disabled="guests <= MIN_GUESTS || guestsLocked"
                      aria-label="Quitar persona"
                      @click="decrementGuests"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>

                    <div class="bk-guests-core">
                      <transition name="pop" mode="out-in">
                        <span :key="guests" class="bk-guests-num">{{ guests }}</span>
                      </transition>
                      <span class="bk-guests-word">{{ guests === 1 ? 'persona' : 'personas' }}</span>
                    </div>

                    <button
                      type="button"
                      class="bk-step"
                      :disabled="guests >= maxGuests || guestsLocked"
                      aria-label="Agregar persona"
                      @click="incrementGuests"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>

                  <transition name="fade">
                    <span v-if="errors.guests" class="error-msg">{{ errors.guests }}</span>
                    <span v-else-if="guestsLocked" class="bk-hint bk-hint-locked">
                      Habitación para {{ maxGuests }} persona — selector bloqueado
                    </span>
                    <span v-else class="bk-hint">
                      Máximo {{ maxGuests }} personas · capacidad de esta habitación
                    </span>
                  </transition>
                </div>

                <div class="bk-field">
                  <label>Noches</label>
                  <div class="bk-nights" :class="{ muted: nights === 0 }">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <transition name="pop" mode="out-in">
                      <strong :key="nights">{{ nights }}</strong>
                    </transition>
                    <span>{{ nights === 1 ? 'noche' : 'noches' }}</span>
                  </div>
                </div>
              </div>

              <!-- Solicitudes especiales -->
              <div class="bk-field bk-field-full">
                <label for="rs-requests">
                  Solicitudes especiales <span class="optional">(opcional)</span>
                </label>
                <textarea
                  id="rs-requests"
                  v-model="specialRequests"
                  placeholder="Ej: Habitación en pisos superiores, cama adicional, alergias alimentarias..."
                  rows="2"
                ></textarea>
              </div>

              <!-- Resumen de precio en tiempo real -->
              <div class="bk-summary" :class="{ empty: nights === 0 }">
                <div class="bk-summary-head">
                  <span>Resumen de tu estadía</span>
                  <span class="bk-summary-stay">
                    {{ nights }} {{ nights === 1 ? 'noche' : 'noches' }}
                  </span>
                </div>

                <div v-if="nights > 0" class="bk-summary-body">
                  <div class="bk-summary-line">
                    <span>{{ selectedRoom.label }}</span>
                    <span>
                      {{ formatCurrency(selectedRoom.price) }} <em>× {{ nights }}</em>
                    </span>
                  </div>
                  <div class="bk-summary-line">
                    <span>Subtotal</span>
                    <span>{{ formatCurrency(subtotal) }}</span>
                  </div>
                  <div class="bk-summary-line">
                    <span>Impuestos y cargos (10%)</span>
                    <span>{{ formatCurrency(tax) }}</span>
                  </div>
                  <!-- Total con animación al recalcular -->
                  <div class="bk-summary-total">
                    <span>Total</span>
                    <transition name="num" mode="out-in">
                      <strong :key="total">{{ formatCurrency(total) }}</strong>
                    </transition>
                  </div>

                  <!-- Nota de transparencia -->
                  <div class="bk-summary-note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Impuestos y cargos incluidos · Sin sorpresas
                  </div>
                </div>

                <div v-else class="bk-summary-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Selecciona las fechas para ver el total.
                </div>
              </div>

              <!-- Acciones: CTA píldora brillante + Cancelar ghost -->
              <div class="bk-actions">
                <button
                  type="submit"
                  class="bk-cta"
                  :disabled="isSubmitting || !isFormValid"
                >
                  <template v-if="!isSubmitting">
                    <span>Confirmar Reserva</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </template>
                  <template v-else>
                    <span class="bk-spinner"></span>
                    Procesando…
                  </template>
                </button>

                <button type="button" class="bk-cancel" @click="onGoBackHotel">
                  Cancelar
                </button>
              </div>

              <!-- Reaseguro de confianza -->
              <div class="bk-secure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Reserva 100% segura · Cancelación flexible
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import url('../Booking.css');
</style>
