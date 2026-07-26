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
  categories,
  carouselSlides,
  testimonials,
  isVisible,
  activeCategory,
  selectedPackage,
  filteredPackages,
  showQuoteForm,
  quoteInquiry,
  quoteSubmitted,
  currentSlide,
  totalSlides,
  setCategory,
  selectPackage,
  closePackageDetail,
  openQuoteForm,
  closeQuoteForm,
  submitQuote,
  goBackToHome,
  goToSlide,
  nextSlide,
  prevSlide,
} = useEvents(emit, isLoggedIn)
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
            Convertimos tus sueños en momentos inolvidables. Bodas, quince años,
            cumpleaños y eventos corporativos con el más alto estándar de calidad
            y elegancia.
          </p>
        </div>
      </div>

      <!-- Filter Categories -->
      <div class="events-filters">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="events-filter-btn"
          :class="{ active: activeCategory === cat.id }"
          @click="setCategory(cat.id)"
        >
          <!-- Grid icon (Todos) -->
          <svg v-if="cat.icon === 'grid'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
          <!-- Heart icon (Bodas) -->
          <svg v-else-if="cat.icon === 'heart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <!-- Star icon (15 Años) -->
          <svg v-else-if="cat.icon === 'star'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <!-- Cake icon (Cumpleaños) -->
          <svg v-else-if="cat.icon === 'cake'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="5" r="1"></circle>
            <path d="M12 8a3 3 0 0 1 3 3v2"></path>
            <path d="M12 8a3 3 0 0 0-3 3v2"></path>
            <rect x="3" y="15" width="18" height="2"></rect>
          </svg>
          <!-- Briefcase icon (Corporativos) -->
          <svg v-else-if="cat.icon === 'briefcase'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <!-- Sparkles icon (Personalizado) -->
          <svg v-else-if="cat.icon === 'sparkles'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"></path>
            <line x1="19" y1="17" x2="19" y2="21"></line>
            <line x1="21" y1="19" x2="17" y2="19"></line>
          </svg>

          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- Packages Grid -->
      <div class="events-grid">
        <div
          v-for="pkg in filteredPackages"
          :key="pkg.id"
          class="events-card"
        >
          <div class="events-card-image" @click="selectPackage(pkg)">
            <img :src="pkg.image" :alt="pkg.name" loading="lazy" />
            <div class="events-card-badge">{{ pkg.badge }}</div>
          </div>
          <div class="events-card-info" @click="selectPackage(pkg)">
            <h3 class="events-card-name">{{ pkg.name }}</h3>
            <p class="events-card-desc">{{ pkg.description }}</p>
            <div class="events-card-footer">
              <span class="events-card-price">{{ pkg.price }}</span>
              <button class="events-card-quote-btn" @click.stop="openQuoteForm(pkg)">
                Cotizar
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
      <div v-if="filteredPackages.length === 0" class="events-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>No hay paquetes disponibles en esta categoría</p>
      </div>

      <!-- Actions -->
      <div class="events-actions">
        <button class="events-btn events-btn-primary" @click="openQuoteForm(null)">
          Solicitar Cotización Personalizada
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
        <button class="events-btn events-btn-secondary" @click="goBackToHome">
          Volver al Inicio
        </button>
      </div>

    </div>

    <!-- ==========================================================
         PACKAGE DETAIL MODAL
         ========================================================== -->
    <Transition name="events-modal-fade">
      <div v-if="selectedPackage && !showQuoteForm" class="events-modal-overlay" @click.self="closePackageDetail">
        <div class="events-modal">
          <button class="events-modal-close" @click="closePackageDetail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="events-modal-image">
            <img :src="selectedPackage.image" :alt="selectedPackage.name" />
          </div>
          <div class="events-modal-info">
            <div class="events-modal-badge">{{ selectedPackage.badge }}</div>
            <h2 class="events-modal-name">{{ selectedPackage.name }}</h2>
            <p class="events-modal-desc">{{ selectedPackage.description }}</p>

            <div class="events-modal-includes-title">Incluye</div>
            <ul class="events-modal-includes">
              <li v-for="(inc, idx) in selectedPackage.includes" :key="idx">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {{ inc }}
              </li>
            </ul>

            <div class="events-modal-divider"></div>
            <div class="events-modal-footer">
              <span class="events-modal-price">{{ selectedPackage.price }}</span>
              <button class="events-btn events-btn-primary" @click="openQuoteForm(selectedPackage)">
                Cotizar este Paquete
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
         QUOTE FORM MODAL
         ========================================================== -->
    <Transition name="events-modal-fade">
      <div v-if="showQuoteForm" class="events-form-overlay" @click.self="closeQuoteForm">
        <div class="events-form-modal">
          <button class="events-form-close" @click="closeQuoteForm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Success State -->
          <div v-if="quoteSubmitted" class="events-form-success">
            <div class="events-form-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>¡Cotización Enviada!</h3>
            <p>
              Gracias por tu interés. Nuestro equipo de eventos se pondrá en contacto
              contigo en las próximas 24 horas para brindarte una cotización
              personalizada y resolver todas tus dudas.
            </p>
          </div>

          <!-- Form State -->
          <template v-else>
            <h2 class="events-form-title">Solicitar Cotización</h2>
            <p class="events-form-subtitle">
              {{ selectedPackage ? 'Has seleccionado: ' + selectedPackage.name : 'Cuéntanos sobre tu evento y te enviaremos una cotización personalizada.' }}
            </p>

            <div class="events-form-row">
              <div class="events-form-group">
                <label>Nombre Completo</label>
                <input
                  v-model="quoteInquiry.name"
                  type="text"
                  placeholder="Tu nombre"
                />
              </div>
              <div class="events-form-group">
                <label>Correo Electrónico</label>
                <input
                  v-model="quoteInquiry.email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div class="events-form-row">
              <div class="events-form-group">
                <label>Teléfono</label>
                <input
                  v-model="quoteInquiry.phone"
                  type="tel"
                  placeholder="+57 300 000 0000"
                />
              </div>
              <div class="events-form-group">
                <label>Tipo de Evento</label>
                <select v-model="quoteInquiry.eventType">
                  <option value="" disabled>Seleccionar tipo</option>
                  <option value="Boda">Boda</option>
                  <option value="15 Años">15 Años</option>
                  <option value="Cumpleaños">Cumpleaños</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Personalizado">Personalizado</option>
                </select>
              </div>
            </div>

            <div class="events-form-row">
              <div class="events-form-group">
                <label>Número de Invitados</label>
                <input
                  v-model="quoteInquiry.guestCount"
                  type="number"
                  placeholder="Ej: 100"
                  min="1"
                />
              </div>
              <div class="events-form-group">
                <label>Fecha del Evento</label>
                <input
                  v-model="quoteInquiry.eventDate"
                  type="date"
                />
              </div>
            </div>

            <div class="events-form-group">
              <label>Mensaje o Requisitos Especiales</label>
              <textarea
                v-model="quoteInquiry.message"
                placeholder="Cuéntanos más sobre tu evento, colores, temática, requisitos especiales..."
              ></textarea>
            </div>

            <button class="events-form-submit" @click="submitQuote">
              Enviar Solicitud
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </template>
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
