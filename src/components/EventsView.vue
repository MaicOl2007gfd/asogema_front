<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useEvents } from '../composables/useEvents.js'
import ReviewsView from './ReviewsView.vue'

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
  salons,
  tiposEvento,
  eventsLoading,
  eventsError,
  carouselSlides,
  isVisible,
  selectedSalon,
  showBookingForm,
  isSubmitting,
  showSuccess,
  bookingResult,
  errors,
  fecha,
  horaInicio,
  horaFin,
  personas,
  tipoEventoId,
  observaciones,
  currentSlide,
  totalSlides,
  today,
  currentUserName,
  timeSlots,
  validEndSlots,
  selectedTipoNombre,
  anticipoEstimado,
  anticipoMostrado,
  maxPersonas,
  formatPrice,
  showSalonDetail,
  closeSalonDetail,
  openBookingForm,
  closeBookingForm,
  incrementPersonas,
  decrementPersonas,
  handleSubmit,
  closeSuccess,
  goToSlide,
  nextSlide,
  prevSlide,
  goBackToHome,
} = useEvents(emit)
</script>

<template>
  <div class="events-container">
    <!-- ==========================================================
         NAVBAR
         ========================================================== -->
    <nav class="inner-nav">
      <div class="inner-nav-brand" @click="emit('navigate', 'index')">
        <img src="/imagenes/Logo.png" alt="Asogema" class="inner-nav-logo" />
        <span class="inner-nav-brand-text">Asogema</span>
      </div>

      <ul class="inner-nav-links" :class="{ open: mobileMenuOpen }">
        <li><a href="#" @click.prevent="emit('navigate', 'index')">Inicio</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
      </ul>

      <div class="inner-nav-actions" :class="{ open: mobileMenuOpen }">
        <template v-if="isLoggedIn && user">
          <div class="inner-nav-user-info">
            <span class="inner-nav-user-greeting">Bienvenido</span>
            <strong class="inner-nav-user-name">{{ user.name }}</strong>
          </div>
          <div class="inner-nav-user-avatar">{{ getUserInitials() }}</div>
          <button class="inner-nav-btn inner-nav-btn-logout" @click="handleLogout">Cerrar Sesión</button>
        </template>
        <template v-else>
          <button class="inner-nav-btn inner-nav-btn-outline" @click="emit('navigate', 'login')">Iniciar Sesión</button>
          <button class="inner-nav-btn inner-nav-btn-primary" @click="emit('navigate', 'register')">Registrarse</button>
        </template>
      </div>

      <button class="inner-nav-toggle" :class="{ active: mobileMenuOpen }" @click="toggleMobileMenu" :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <!-- Twinkling starfield background -->
    <div class="starfield" aria-hidden="true"></div>

    <!-- Animated background shapes -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
    </div>

    <!-- Decorative rings -->
    <div class="deco-ring deco-ring-1"></div>
    <div class="deco-ring deco-ring-2"></div>

    <!-- ==========================================================
         CAROUSEL
         ========================================================== -->
    <div class="events-carousel">
      <div class="carousel-track">
        <div
          v-for="(slide, i) in carouselSlides"
          :key="slide.id"
          class="carousel-slide"
          :class="{ active: currentSlide === i }"
        >
          <div class="carousel-slide-img">
            <img :src="slide.image" :alt="'Slide ' + (i + 1)" loading="lazy" />
          </div>

          <div class="carousel-slide-overlay"></div>

          <div class="carousel-slide-content">
            <div class="carousel-slide-badge">
              <span class="carousel-slide-badge-dot"></span>
              Salón de Eventos
            </div>
            <h2 class="carousel-slide-title">{{ slide.title }}</h2>
            <p class="carousel-slide-subtitle">{{ slide.subtitle }}</p>
          </div>
        </div>
      </div>

      <button class="carousel-arrow carousel-arrow-prev" @click="prevSlide" aria-label="Anterior">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="carousel-arrow carousel-arrow-next" @click="nextSlide" aria-label="Siguiente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div class="carousel-dots">
        <button
          v-for="(_, i) in totalSlides"
          :key="'dot-' + i"
          class="carousel-dot"
          :class="{ active: currentSlide === i }"
          @click="goToSlide(i)"
          :aria-label="'Ir al slide ' + (i + 1)"
        ></button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="events-content" :class="{ visible: isVisible }">
      <!-- Header Section -->
      <div class="events-header">
        <div class="events-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <path d="M8 14h.01"></path>
            <path d="M12 14h.01"></path>
            <path d="M16 14h.01"></path>
            <path d="M8 18h.01"></path>
            <path d="M12 18h.01"></path>
            <path d="M16 18h.01"></path>
          </svg>
        </div>
        <div class="events-header-text">
          <span class="events-tag">Salón de Eventos Asogema</span>
          <h1 class="events-title">Celebraciones Inolvidables</h1>
          <p class="events-subtitle">
            Reserva tu salón ideal para bodas, quince años, cumpleaños y eventos
            corporativos con el más alto estándar de calidad y elegancia.
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="eventsLoading" class="events-loader">
        <div class="events-loader-spinner"></div>
        <p>Cargando salones...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="eventsError" class="events-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <p>{{ eventsError }}</p>
        <button class="events-btn events-btn-primary" @click="loadEvents">
          Reintentar
        </button>
      </div>

      <!-- Salons Grid -->
      <template v-else>
        <div class="events-grid">
          <div
            v-for="salon in salons"
            :key="salon.id"
            class="events-card"
          >
            <div class="events-card-image" @click="showSalonDetail(salon)">
              <img :src="salon.image" :alt="salon.name" loading="lazy" />
              <div class="events-card-badge">{{ salon.badge }}</div>
            </div>
            <div class="events-card-info">
              <h3 class="events-card-name">{{ salon.name }}</h3>
              <p class="events-card-desc">{{ salon.description }}</p>
              <div class="events-card-meta">
                <span v-if="salon.ubicacion" class="events-card-location">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ salon.ubicacion }}
                </span>
              </div>
              <div class="events-card-footer">
                <span class="events-card-price">{{ salon.price }}</span>
                <button class="events-card-quote-btn" @click.stop="openBookingForm(salon)">
                  Reservar
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="salons.length === 0" class="events-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p>No hay salones disponibles por el momento</p>
        </div>
      </template>

      <!-- Actions -->
      <div class="events-actions">
        <button class="events-btn events-btn-secondary" @click="goBackToHome">
          Volver al Inicio
        </button>
      </div>

    </div>

    <!-- ==========================================================
         SALON DETAIL MODAL
         ========================================================== -->
    <Transition name="events-modal-fade">
      <div v-if="selectedSalon && !showBookingForm" class="events-modal-overlay" @click.self="closeSalonDetail">
        <div class="events-modal">
          <button class="events-modal-close" @click="closeSalonDetail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="events-modal-image">
            <img :src="selectedSalon.image" :alt="selectedSalon.name" />
          </div>
          <div class="events-modal-info">
            <div class="events-modal-badge">{{ selectedSalon.badge }}</div>
            <h2 class="events-modal-name">{{ selectedSalon.name }}</h2>
            <p class="events-modal-desc">{{ selectedSalon.description }}</p>

            <div class="events-modal-includes-title">Detalles</div>
            <ul class="events-modal-includes">
              <li v-if="selectedSalon.ubicacion">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ selectedSalon.ubicacion }}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Capacidad para {{ selectedSalon.capacity }} personas
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                Anticipo del 30% al reservar
              </li>
            </ul>

            <div class="events-modal-divider"></div>
            <div class="events-modal-footer">
              <span class="events-modal-price">{{ selectedSalon.price }}</span>
              <button class="events-btn events-btn-primary" @click="openBookingForm(selectedSalon)">
                Reservar este Salón
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ==========================================================
         BOOKING FORM MODAL
         ========================================================== -->
    <Transition name="events-modal-fade">
      <div v-if="showBookingForm" class="events-form-overlay" @click.self="closeBookingForm">
        <div class="events-form-modal">
          <button class="events-form-close" @click="closeBookingForm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2 class="events-form-title">Reservar Salón</h2>
          <p class="events-form-subtitle">
            {{ selectedSalon ? 'Has seleccionado: ' + selectedSalon.name : '' }}
          </p>

          <div class="events-logged-in">
            <div class="events-logged-in-avatar">&#127915;</div>
            <div>
              <span class="events-logged-in-label">Reservando como</span>
              <strong class="events-logged-in-name">{{ currentUserName }}</strong>
            </div>
          </div>

          <div class="events-form-group">
            <label>Tipo de Evento</label>
            <select v-model="tipoEventoId">
              <option value="" disabled>Seleccionar tipo</option>
              <option v-for="tipo in tiposEvento" :key="tipo.id" :value="tipo.id">
                {{ tipo.name }}
              </option>
            </select>
            <span v-if="errors.tipoEvento" class="events-form-error">{{ errors.tipoEvento }}</span>
          </div>

          <div class="events-form-group">
            <label>Fecha del Evento</label>
            <input
              v-model="fecha"
              type="date"
              :min="today"
            />
            <span v-if="errors.fecha" class="events-form-error">{{ errors.fecha }}</span>
          </div>

          <div class="events-form-row">
            <div class="events-form-group">
              <label>Hora de Inicio</label>
              <select v-model="horaInicio">
                <option value="" disabled>Seleccionar hora</option>
                <option v-for="slot in timeSlots" :key="slot" :value="slot">
                  {{ slot }}
                </option>
              </select>
              <span v-if="errors.horaInicio" class="events-form-error">{{ errors.horaInicio }}</span>
            </div>
            <div class="events-form-group">
              <label>Hora de Fin</label>
              <select v-model="horaFin">
                <option value="" disabled>Seleccionar hora</option>
                <option v-for="slot in validEndSlots" :key="slot" :value="slot">
                  {{ slot }}
                </option>
              </select>
              <span v-if="errors.horaFin" class="events-form-error">{{ errors.horaFin }}</span>
            </div>
          </div>

          <div class="events-form-group">
            <label>Número de Personas</label>
            <div class="events-guests-stepper">
              <button type="button" @click="decrementPersonas" aria-label="Disminuir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <input
                v-model.number="personas"
                type="number"
                min="1"
                :max="maxPersonas"
              />
              <button type="button" @click="incrementPersonas" aria-label="Aumentar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <span class="events-guests-hint">Máximo {{ maxPersonas }} personas</span>
            <span v-if="errors.personas" class="events-form-error">{{ errors.personas }}</span>
          </div>

          <div class="events-form-group">
            <label>Observaciones</label>
            <textarea
              v-model="observaciones"
              placeholder="Cuéntanos detalles de tu evento: temática, decoración, requisitos especiales..."
            ></textarea>
          </div>

          <div class="events-summary">
            <div class="events-summary-row">
              <span>Precio base</span>
              <strong>{{ selectedSalon ? selectedSalon.price : '-' }}</strong>
            </div>
            <div class="events-summary-row">
              <span>Anticipo (30%)</span>
              <strong>{{ formatPrice(anticipoEstimado) }}</strong>
            </div>
          </div>

          <span v-if="errors.general" class="events-form-error events-form-error-block">{{ errors.general }}</span>

          <button class="events-form-submit" :disabled="isSubmitting" @click="handleSubmit">
            <template v-if="isSubmitting">
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
      </div>
    </Transition>

    <!-- ==========================================================
         SUCCESS MODAL
         ========================================================== -->
    <Transition name="events-modal-fade">
      <div v-if="showSuccess" class="events-form-overlay" @click.self="closeSuccess">
        <div class="events-form-modal">
          <button class="events-form-close" @click="closeSuccess">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="events-form-success">
            <div class="events-form-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>¡Reserva Confirmada!</h3>
            <p>
              Tu evento fue reservado exitosamente. A continuación el resumen de tu reserva.
            </p>

            <div class="events-summary events-summary-success">
              <div class="events-summary-row">
                <span>Salón</span>
                <strong>{{ selectedSalon ? selectedSalon.name : '-' }}</strong>
              </div>
              <div class="events-summary-row">
                <span>Tipo de evento</span>
                <strong>{{ selectedTipoNombre }}</strong>
              </div>
              <div class="events-summary-row">
                <span>Fecha</span>
                <strong>{{ fecha }}</strong>
              </div>
              <div class="events-summary-row">
                <span>Horario</span>
                <strong>{{ horaInicio }} - {{ horaFin }}</strong>
              </div>
              <div class="events-summary-row">
                <span>Personas</span>
                <strong>{{ personas }}</strong>
              </div>
              <div class="events-summary-row">
                <span>Anticipo a pagar</span>
                <strong>{{ formatPrice(anticipoMostrado) }}</strong>
              </div>
            </div>

            <button class="events-form-submit" @click="closeSuccess">
              Entendido
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Reseñas ── -->
    <ReviewsView serviceType="events" theme="light" />

    <!-- ==========================================================
         FOOTER
         ========================================================== -->
    <footer class="events-footer">
      <div class="events-footer-grid">
        <div class="events-footer-brand">
          <img src="/imagenes/Logo.png" alt="Asogema" style="width:36px;height:36px;object-fit:contain;filter:brightness(1.3);" />
          <p>Asogema es un destino único donde la naturaleza, la gastronomía y la elegancia se combinan para ofrecerte experiencias inolvidables.</p>
        </div>
        <div class="events-footer-col">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#" @click.prevent="emit('navigate', 'index')">Inicio</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
          </ul>
        </div>
        <div class="events-footer-col">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">+57 300 000 0000</a></li>
            <li><a href="#">eventos@asogema.com</a></li>
            <li><a href="#">Vía principal, Asogema</a></li>
          </ul>
        </div>
      </div>
      <div class="events-footer-bottom">
        <span>&copy; {{ new Date().getFullYear() }} Asogema. Todos los derechos reservados.</span>
        <div class="events-footer-socials">
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
@import url('../Events.css');
</style>
