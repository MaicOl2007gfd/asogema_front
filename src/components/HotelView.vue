<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useHotel } from '../composables/useHotel.js'

const emit = defineEmits(['navigate'])
const mobileMenuOpen = ref(false)

const { logout } = useAuth()

const {
  user,
  isLoggedIn,
  rooms,
  roomsLoading,
  roomsError,
  filterCheckIn,
  filterCheckOut,
  filterGuests,
  filteredRooms,
  showRoomDetail,
  selectedRoomDetail,
  activeGalleryIndex,
  bookings,
  bookingsLoading,
  bookingsError,
  bookingToCancel,
  showCancelConfirm,
  isCancelling,
  isVisible,
  activeTab,
  formatDate,
  formatCurrency,
  getToday,
  loadRooms,
  loadBookings,
  applyFilters,
  clearFilters,
  incrementFilterGuests,
  decrementFilterGuests,
  openRoomDetail,
  closeRoomDetail,
  nextGalleryImage,
  prevGalleryImage,
  setGalleryImage,
  startReservation,
  requestCancel,
  closeCancelConfirm,
  confirmCancel,
  goBackToHome,
  goBackToHotel,
  switchTab,
} = useHotel()

const statusLabels = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  'check-in': 'Check-In',
  'check-out': 'Check-Out',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

function statusLabel(s) {
  return statusLabels[s] || s
}

// Conteo de reservas activas y total invertido (para el resumen)
const activeBookings = computed(
  () =>
    bookings.value.filter(
      (b) => !['cancelada', 'completada', 'check-out'].includes(b.status),
    ).length,
)
const totalSpent = computed(() =>
  bookings.value.reduce((sum, b) => sum + (Number(b.total) || 0), 0),
)

function getUserInitials() {
  if (!user.value) return '?'
  return user.value.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function handleLogout() {
  logout()
  mobileMenuOpen.value = false
  emit('navigate', 'index')
}

function onGoHome() {
  goBackToHome(emit)
}

function onGoBackHotel() {
  goBackToHotel(emit)
}

// Guarda la habitación seleccionada y navega a la vista de reserva.
// La ruta 'hotel-reservation' se renderiza con BookingView (App.vue),
// por lo que este botón redirige directamente a la pantalla de reserva.
function onStartReservation(room) {
  startReservation(room, emit)
}

function switchTabAndScroll(tab) {
  switchTab(tab)
  requestAnimationFrame(() => {
    const el = document.querySelector('.hotel-tabs')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function canCancel(booking) {
  return !['cancelada', 'completada', 'check-out'].includes(booking.status)
}

onMounted(async () => {
  requestAnimationFrame(() => {
    isVisible.value = true
  })
  if (rooms.value.length === 0) await loadRooms()
  if (bookings.value.length === 0) await loadBookings()
})
</script>

<template>
  <div class="hotel-page">
    <!-- ======================================================
         NAVBAR
         ====================================================== -->
    <nav class="hotel-nav">
      <div class="hotel-nav-brand" @click="onGoHome">
        <img src="/imagenes/Logo.png" alt="Asogema" class="hotel-nav-logo" />
        <span class="hotel-nav-brand-text">Asogema</span>
      </div>

      <ul class="hotel-nav-links" :class="{ open: mobileMenuOpen }">
        <li><a href="#" @click.prevent="onGoHome">Inicio</a></li>
        <li><a href="#" class="active" @click.prevent>Hotel</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
      </ul>

      <div class="hotel-nav-actions" :class="{ open: mobileMenuOpen }">
        <template v-if="isLoggedIn && user">
          <div class="hotel-nav-user">
            <span class="hotel-nav-avatar">{{ getUserInitials() }}</span>
            <strong>{{ user.name }}</strong>
          </div>
          <button class="hotel-nav-btn hotel-nav-btn-outline" @click="handleLogout">Cerrar Sesión</button>
        </template>
        <template v-else>
          <button class="hotel-nav-btn hotel-nav-btn-outline" @click="emit('navigate', 'login')">Iniciar Sesión</button>
          <button class="hotel-nav-btn hotel-nav-btn-primary" @click="emit('navigate', 'register')">Registrarse</button>
        </template>
      </div>

      <button
        class="hotel-nav-toggle"
        :class="{ active: mobileMenuOpen }"
        @click="toggleMobileMenu"
        :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <!-- ======================================================
         MAIN CONTENT
         ====================================================== -->
    <main class="hotel-main" :class="{ visible: isVisible }">
      <!-- ── HERO ── -->
      <section class="hotel-hero">
        <div class="hotel-hero-bg">
          <img src="https://picsum.photos/id/1043/1600/900" alt="Hotel Asogema" loading="lazy" />
        </div>
        <div class="hotel-hero-overlay"></div>

        <div class="hotel-hero-content">
          <div class="hotel-hero-badge">
            <span class="hotel-hero-badge-dot"></span>
            Alojamiento 5 estrellas
          </div>
          <h1>Hotel <span>Asogema</span></h1>
          <p>
            Habitaciones y suites de lujo con diseño contemporáneo. Disfruta de comodidad,
            privacidad y un servicio de clase mundial que hará de tu estadía una experiencia inolvidable.
          </p>
          <div class="hotel-hero-actions">
            <button class="hotel-hero-btn hotel-hero-btn-primary" @click="switchTabAndScroll('catalog')">
              Explorar Habitaciones
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button class="hotel-hero-btn hotel-hero-btn-secondary" @click="switchTabAndScroll('bookings')">
              Mis Reservas
            </button>
          </div>
        </div>
      </section>

      <!-- ── TABS ── -->
      <div class="hotel-tabs">
        <button class="hotel-tab" :class="{ active: activeTab === 'catalog' }" @click="switchTabAndScroll('catalog')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"></path>
            <path d="M3 10h18"></path>
            <path d="M5 6l7-3 7 3"></path>
            <path d="M4 10v11"></path>
            <path d="M20 10v11"></path>
          </svg>
          Catálogo de Habitaciones
        </button>
        <button class="hotel-tab" :class="{ active: activeTab === 'bookings' }" @click="switchTabAndScroll('bookings')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Mis Reservas
          <span v-if="bookings.length" class="hotel-tab-badge">{{ bookings.length }}</span>
        </button>
      </div>

      <!-- ── CATALOG ── -->
      <section v-if="activeTab === 'catalog'" class="hotel-catalog">
        <div class="hotel-section-head">
          <h2>Nuestras Habitaciones</h2>
          <p>Filtra por fechas y número de ocupantes para ver la disponibilidad real.</p>
        </div>

        <!-- Filter bar -->
        <div class="hotel-filter-bar">
          <div class="hotel-filter-field">
            <label for="hf-checkin">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Entrada
            </label>
            <input id="hf-checkin" v-model="filterCheckIn" type="date" :min="getToday()" />
          </div>

          <div class="hotel-filter-field">
            <label for="hf-checkout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Salida
            </label>
            <input id="hf-checkout" v-model="filterCheckOut" type="date" :min="filterCheckIn || getToday()" />
          </div>

          <div class="hotel-filter-field">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
              Ocupantes
            </label>
            <div class="hotel-filter-stepper">
              <button type="button" @click="decrementFilterGuests" :disabled="filterGuests <= 1" aria-label="Menos ocupantes">−</button>
              <span class="hotel-filter-stepper-value">{{ filterGuests }}</span>
              <button type="button" @click="incrementFilterGuests" :disabled="filterGuests >= 12" aria-label="Más ocupantes">+</button>
            </div>
          </div>

          <div class="hotel-filter-actions">
            <button class="hotel-filter-btn hotel-filter-btn-apply" @click="applyFilters">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Buscar
            </button>
            <button class="hotel-filter-btn hotel-filter-btn-clear" @click="clearFilters">Limpiar</button>
          </div>
        </div>

        <!-- Results info -->
        <div class="hotel-results-info" v-if="!roomsLoading && !roomsError">
          <span>{{ filteredRooms.length }} habitación(es) disponible(s)</span>
        </div>

        <!-- Loading -->
        <div v-if="roomsLoading" class="hotel-state hotel-loading" role="status" aria-live="polite">
          <span class="hotel-spinner"></span>
          <p>Buscando habitaciones disponibles…</p>
        </div>

        <!-- Error -->
        <div v-else-if="roomsError" class="hotel-state hotel-empty" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>No pudimos cargar las habitaciones</h3>
          <p>{{ roomsError }}</p>
          <button class="hotel-state-btn" @click="loadRooms">Reintentar</button>
        </div>

        <!-- Grid -->
        <div v-else class="hotel-cards-grid">
          <article v-for="room in filteredRooms" :key="room.value" class="hotel-room-card">
            <div class="hotel-room-card-image">
              <img :src="room.image" :alt="room.label" loading="lazy" />
              <div class="hotel-room-card-price">
                {{ formatCurrency(room.price) }} <small>/noche</small>
              </div>
              <div class="hotel-room-card-capacity">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 010 7.75"></path>
                </svg>
                Hasta {{ room.capacity }} huéspedes
              </div>
            </div>

            <div class="hotel-room-card-body">
              <h3 class="hotel-room-card-title">{{ room.label }}</h3>
              <p class="hotel-room-card-desc">{{ room.desc }}</p>

              <div class="hotel-room-card-features">
                <span v-for="feat in room.features.slice(0, 4)" :key="feat" class="hotel-feature-chip">{{ feat }}</span>
                <span v-if="room.features.length > 4" class="hotel-feature-chip hotel-feature-chip-more">+{{ room.features.length - 4 }}</span>
              </div>

              <div class="hotel-room-card-actions">
                <button class="hotel-room-btn hotel-room-btn-more" @click="openRoomDetail(room)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Ver Detalle
                </button>
                <!-- "Seleccionar" navega a la vista de reserva rediseñada -->
                <button class="hotel-room-btn hotel-room-btn-select" @click="onStartReservation(room)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Seleccionar
                </button>
              </div>
            </div>
          </article>

          <!-- Empty state -->
          <div v-if="filteredRooms.length === 0" class="hotel-state hotel-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>Sin habitaciones disponibles</h3>
            <p>No encontramos habitaciones que coincidan con tus fechas u ocupantes. Ajusta los filtros e inténtalo de nuevo.</p>
            <button class="hotel-state-btn" @click="clearFilters">Limpiar filtros</button>
          </div>
        </div>
      </section>

      <!-- ── MY BOOKINGS ── -->
      <section v-else class="hotel-bookings">
        <div class="hotel-section-head">
          <span class="hotel-section-eyebrow">Historial y gestión</span>
          <h2>Mis Reservas de Hotel</h2>
          <p>Consulta el historial de tus reservas y cancela cuando lo necesites.</p>
        </div>

        <!-- Resumen de estadísticas de reservas -->
        <div v-if="bookings.length" class="hotel-bookings-summary">
          <div>
            <strong>{{ bookings.length }}</strong>
            <span>Reservas</span>
          </div>
          <div>
            <strong>{{ activeBookings }}</strong>
            <span>Activas</span>
          </div>
          <div>
            <strong>{{ formatCurrency(totalSpent) }}</strong>
            <span>Total invertido</span>
          </div>
        </div>

        <div v-if="!isLoggedIn" class="hotel-state hotel-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0110 0v4"></path>
          </svg>
          <h3>Inicia sesión para ver tus reservas</h3>
          <p>Para consultar tu historial y gestionar tus reservas de hotel necesitas iniciar sesión.</p>
          <button class="hotel-state-btn" @click="emit('navigate', 'login')">Iniciar Sesión</button>
        </div>

        <template v-else>
        <div v-if="bookingsLoading" class="hotel-state hotel-loading" role="status" aria-live="polite">
          <span class="hotel-spinner"></span>
          <p>Cargando tus reservas…</p>
        </div>

        <div v-else-if="bookingsError" class="hotel-state hotel-empty" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>No pudimos cargar tus reservas</h3>
          <p>{{ bookingsError }}</p>
          <button class="hotel-state-btn" @click="loadBookings">Reintentar</button>
        </div>

        <div v-else-if="bookings.length === 0" class="hotel-state hotel-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3>Aún no tienes reservas</h3>
          <p>Explora el catálogo de habitaciones y reserva tu próxima estadía en Hotel Asogema.</p>
          <button class="hotel-state-btn" @click="switchTabAndScroll('catalog')">Ver Habitaciones</button>
        </div>

        <div v-else class="hotel-bookings-list">
          <article
            v-for="booking in bookings"
            :key="booking.id"
            class="hotel-booking-card"
            :class="`hotel-booking-${booking.status}`"
          >
            <!-- Cabecera: habitación + estado -->
            <div class="hotel-booking-head">
              <div class="hotel-booking-room">
                <span class="hotel-booking-room-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21h18"></path>
                    <path d="M3 10h18"></path>
                    <path d="M5 6l7-3 7 3"></path>
                    <path d="M4 10v11"></path>
                    <path d="M20 10v11"></path>
                  </svg>
                </span>
                <span class="hotel-booking-room-txt">
                  <small>Reserva #{{ booking.id }}</small>
                  <h3>{{ booking.roomName }}</h3>
                </span>
              </div>
              <span class="hotel-booking-status">
                <i class="hotel-booking-status-dot"></i>
                {{ statusLabel(booking.status) }}
              </span>
            </div>

            <!-- Detalles de la estadía -->
            <div class="hotel-booking-meta">
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

            <p v-if="booking.observaciones" class="hotel-booking-notes">Notas: {{ booking.observaciones }}</p>

            <!-- Pie: total de la reserva + acción -->
            <div class="hotel-booking-foot">
              <div class="hotel-booking-total">
                <small>Total de la reserva</small>
                <strong>{{ formatCurrency(booking.total) }}</strong>
              </div>
              <button
                v-if="canCancel(booking)"
                class="hotel-booking-cancel"
                @click="requestCancel(booking)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancelar Reserva
              </button>
              <span v-else class="hotel-booking-finished">Reserva finalizada</span>
            </div>
          </article>
        </div>
        </template>
      </section>
    </main>

    <!-- ======================================================
         ROOM DETAIL MODAL (galería, servicios, tarifa)
         ====================================================== -->
    <div
      class="hotel-detail-overlay"
      :class="{ active: showRoomDetail }"
      @click.self="closeRoomDetail"
    >
      <div class="hotel-detail-modal" v-if="selectedRoomDetail">
        <button class="hotel-detail-close" @click="closeRoomDetail" type="button" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Gallery -->
        <div class="hotel-detail-gallery">
          <div class="hotel-detail-stage">
            <img
              :src="selectedRoomDetail.gallery[activeGalleryIndex].src"
              :alt="selectedRoomDetail.gallery[activeGalleryIndex].alt"
            />
            <button class="hotel-detail-nav hotel-detail-nav-prev" @click="prevGalleryImage" type="button" aria-label="Anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button class="hotel-detail-nav hotel-detail-nav-next" @click="nextGalleryImage" type="button" aria-label="Siguiente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div class="hotel-detail-price">
              {{ formatCurrency(selectedRoomDetail.price) }} <small>/noche</small>
            </div>
            <div class="hotel-detail-counter">
              {{ activeGalleryIndex + 1 }} / {{ selectedRoomDetail.gallery.length }}
            </div>
          </div>
          <div class="hotel-detail-thumbs">
            <button
              v-for="(img, i) in selectedRoomDetail.gallery"
              :key="i"
              type="button"
              class="hotel-detail-thumb"
              :class="{ active: i === activeGalleryIndex }"
              @click="setGalleryImage(i)"
              :aria-label="`Ver imagen ${i + 1}`"
            >
              <img :src="img.src" :alt="img.alt" loading="lazy" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="hotel-detail-body">
          <div class="hotel-detail-head">
            <h2>{{ selectedRoomDetail.label }}</h2>
            <span class="hotel-detail-capacity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
              Hasta {{ selectedRoomDetail.capacity }} huéspedes
            </span>
          </div>

          <p class="hotel-detail-desc">{{ selectedRoomDetail.fullDesc }}</p>

          <div class="hotel-detail-features-title">Servicios incluidos</div>
          <div class="hotel-detail-features-grid">
            <div v-for="feat in selectedRoomDetail.features" :key="feat" class="hotel-detail-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ feat }}</span>
            </div>
          </div>

          <div class="hotel-detail-rate">
            <div>
              <span class="hotel-detail-rate-label">Tarifa por noche</span>
              <strong class="hotel-detail-rate-value">{{ formatCurrency(selectedRoomDetail.price) }} COP</strong>
            </div>
            <div class="hotel-detail-rate-hint">Impuestos y cargos incluidos</div>
          </div>

          <div class="hotel-detail-actions">
            <!-- También desde el detalle se redirige a la pantalla de reserva (BookingView) -->
            <button class="hotel-detail-btn hotel-detail-btn-primary" @click="onStartReservation(selectedRoomDetail)">
              Seleccionar esta habitación
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button class="hotel-detail-btn hotel-detail-btn-secondary" @click="closeRoomDetail">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================
         CANCEL CONFIRMATION MODAL
         ====================================================== -->
    <div
      class="hotel-cancel-overlay"
      :class="{ active: showCancelConfirm }"
      @click.self="closeCancelConfirm"
    >
      <div class="hotel-cancel-modal" v-if="bookingToCancel">
        <div class="hotel-cancel-icon">
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
        <div class="hotel-cancel-actions">
          <button class="hotel-cancel-btn hotel-cancel-btn-danger" @click="confirmCancel" :disabled="isCancelling">
            <template v-if="isCancelling">
              <span class="hotel-spinner"></span>
              Cancelando…
            </template>
            <template v-else>Sí, cancelar reserva</template>
          </button>
          <button class="hotel-cancel-btn hotel-cancel-btn-secondary" @click="closeCancelConfirm">Volver</button>
        </div>
      </div>
    </div>

    <!-- ======================================================
         FOOTER
         ====================================================== -->
    <footer class="hotel-footer">
      <div class="hotel-footer-grid">
        <div class="hotel-footer-brand">
          <img src="/imagenes/Logo.png" alt="Asogema" style="width:36px;height:36px;object-fit:contain;filter:brightness(1.3);" />
          <p>Asogema es un destino único donde la naturaleza, la gastronomía y la elegancia se combinan para ofrecerte experiencias inolvidables.</p>
        </div>
        <div class="hotel-footer-col">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#" @click.prevent="onGoHome">Inicio</a></li>
            <li><a href="#" @click.prevent="onGoBackHotel">Hotel</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
          </ul>
        </div>
        <div class="hotel-footer-col">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">+57 300 000 0000</a></li>
            <li><a href="#">hotel@asogema.com</a></li>
            <li><a href="#">Vía principal, Asogema</a></li>
          </ul>
        </div>
      </div>
      <div class="hotel-footer-bottom">
        <span>&copy; {{ new Date().getFullYear() }} Asogema. Todos los derechos reservados.</span>
        <div class="hotel-footer-socials">
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
@import url('../Hotel.css');
</style>
