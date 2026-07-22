<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useIndex } from '../composables/useIndex.js'

const emit = defineEmits(['navigate'])

const { user, isLoggedIn, logout } = useAuth()

const {
  slides,
  experiencias,
  currentSlide,
  totalSlides,
  goToSlide,
  nextSlide,
  prevSlide,
  handleSlideAction,
  isScrolled,
  mobileMenuOpen,
  toggleMobileMenu,
  closeMobileMenu,
  scrollToSection,
  showSplash,
  splashState,
  onMount,
  onUnmount
} = useIndex(emit)

function getUserInitials() {
  if (!user.value) return '?'
  return user.value.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function handleLogout() {
  logout()
  closeMobileMenu()
}

onMounted(() => onMount())
onUnmounted(() => onUnmount())
</script>

<template>
  <div class="index-page">
    <!-- ======================================================
         SPLASH INTRO — Imagen fondo al cargar, se desvanece
         ====================================================== -->
    <div v-if="showSplash" class="splash-overlay" :class="'splash-' + splashState">
      <div class="splash-cascade"></div>
    </div>

    <!-- ======================================================
         NAVBAR
         ====================================================== -->
    <nav class="index-nav" :class="{ scrolled: isScrolled }">
      <div class="nav-brand" @click="scrollToSection('hero')">
        <img src="/imagenes/Logo.png" alt="Asogema" class="nav-logo" />
        <span class="nav-brand-text">Asogema</span>
      </div>

      <ul class="nav-links" :class="{ open: mobileMenuOpen }">
        <!-- Mobile user info -->
        <li v-if="isLoggedIn && user" class="nav-mobile-user">
          <div class="nav-user-avatar">{{ getUserInitials() }}</div>
          <span class="nav-user-greeting">Bienvenido</span>
          <strong class="nav-user-name">{{ user.name }}</strong>
        </li>
        <li><a href="#inicio" @click.prevent="scrollToSection('hero')">Inicio</a></li>
        <li><a href="#hotel" @click.prevent="scrollToSection('hotel')">Hotel</a></li>
        <li><a href="#restaurante" @click.prevent="scrollToSection('restaurante')">Restaurante</a></li>
        <li><a href="#eventos" @click.prevent="scrollToSection('eventos')">Eventos</a></li>
        <li><a href="#contact" @click.prevent="scrollToSection('contact')">Contacto</a></li>
      </ul>

      <!-- Logged-in user section -->
      <div v-if="isLoggedIn && user" class="nav-actions" :class="{ open: mobileMenuOpen }">
        <div class="nav-user-info">
          <span class="nav-user-greeting">Bienvenido</span>
          <strong class="nav-user-name">{{ user.name }}</strong>
        </div>
        <div class="nav-user-avatar">{{ getUserInitials() }}</div>
        <button class="nav-btn nav-btn-logout" @click="handleLogout">Cerrar Sesión</button>
      </div>
      <!-- Guest section -->
      <div v-else class="nav-actions" :class="{ open: mobileMenuOpen }">
        <button class="nav-btn nav-btn-outline" @click="emit('navigate', 'login')">Iniciar Sesión</button>
        <button class="nav-btn nav-btn-primary" @click="emit('navigate', 'register')">Registrarse</button>
      </div>

      <button
        class="nav-toggle"
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
         HERO — CAROUSEL
         ====================================================== -->
    <section id="hero" class="hero-carousel">
      <div class="carousel-track">
        <div
          v-for="(slide, i) in slides"
          :key="slide.id"
          class="carousel-slide"
          :class="{ active: currentSlide === i }"
        >
          <div class="carousel-slide-img">
            <img :src="slide.image" :alt="'Slide ' + (i + 1)" loading="lazy" />
          </div>

          <div class="carousel-slide-pattern" aria-hidden="true"></div>

          <div class="carousel-shapes" aria-hidden="true">
            <div class="carousel-shape carousel-shape-1"></div>
            <div class="carousel-shape carousel-shape-2"></div>
            <div class="carousel-shape carousel-shape-3"></div>
          </div>

          <div class="slide-content">
            <div class="slide-badge">
              <span class="slide-badge-dot"></span>
              {{ slide.badge }}
            </div>
            <h1 class="slide-title" v-html="slide.title"></h1>
            <p class="slide-subtitle">{{ slide.subtitle }}</p>
            <div class="slide-actions">
              <button class="slide-btn slide-btn-primary" @click="handleSlideAction(slide.primaryAction)">
                {{ slide.primaryBtn }}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <button class="slide-btn slide-btn-secondary" @click="handleSlideAction(slide.secondaryAction)">
                {{ slide.secondaryBtn }}
              </button>
            </div>
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

      <div class="scroll-indicator" aria-hidden="true">
        <span>Descubre</span>
        <div class="scroll-line"></div>
      </div>
    </section>

    <!-- ======================================================
         HOTEL — Paralelogramo #133215 en la mitad derecha
         con imagen + información dentro
         (Oculto cuando el usuario ha iniciado sesión)
         ====================================================== -->
    <section id="hotel" class="hotel-section">
      <!-- Paralelogramo de fondo en la mitad derecha -->
      <div class="hotel-paralelogramo"></div>

      <!-- Contenido dentro del paralelogramo -->
      <div class="hotel-content-wrapper reveal">
        <div class="hotel-image">
          <img :src="experiencias[0].imagen" alt="Hotel Asogema" loading="lazy" />
          <div class="hotel-image-badge">Habitaciones desde $120/noche</div>
        </div>

        <div class="hotel-info">
          <div class="hotel-info-header">
            <div class="hotel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18"></path>
                <path d="M3 10h18"></path>
                <path d="M5 6l7-3 7 3"></path>
                <path d="M4 10v11"></path>
                <path d="M20 10v11"></path>
              </svg>
            </div>
            <div class="hotel-tag">Hotel Asogema</div>
          </div>

          <h2 class="hotel-title">{{ experiencias[0].titulo }}</h2>
          <p class="hotel-desc">{{ experiencias[0].descripcion }}</p>

          <div class="hotel-divider"></div>

          <div class="hotel-features">
            <div class="hotel-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span>Check-in 24/7</span>
            </div>
            <div class="hotel-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Wifi Premium</span>
            </div>
            <div class="hotel-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Business Center</span>
            </div>
            <div class="hotel-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Seguridad 24h</span>
            </div>
          </div>

          <button class="hotel-btn" @click="isLoggedIn ? emit('navigate', 'dashboard') : emit('navigate', 'hotel')">
            Reservar Ahora
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ======================================================
         RESTAURANTE — Paralelogramo #133215, imagen izq + info der
         ====================================================== -->
    <section id="restaurante" class="restaurante-section">
      <div class="restaurante-paralelogramo"></div>

      <div class="restaurante-content-wrapper reveal">
        <div class="restaurante-image">
          <img :src="experiencias[1].imagen" alt="Restaurante Asogema" loading="lazy" />
          <div class="restaurante-image-badge">Reserva tu mesa</div>
        </div>

        <div class="restaurante-info">
          <div class="restaurante-info-header">
            <div class="restaurante-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            </div>
            <div class="restaurante-tag">Restaurante Asogema</div>
          </div>

          <h2 class="restaurante-title">{{ experiencias[1].titulo }}</h2>
          <p class="restaurante-desc">{{ experiencias[1].descripcion }}</p>

          <div class="restaurante-divider"></div>

          <div class="restaurante-features">
            <div class="restaurante-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Chef Internacional</span>
            </div>
            <div class="restaurante-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span>Menú Degustación</span>
            </div>
            <div class="restaurante-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Vinos Premium</span>
            </div>
            <div class="restaurante-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Ambiente Acogedor</span>
            </div>
          </div>

          <button class="restaurante-btn" @click="emit('navigate', 'restaurant')">
            Reservar Mesa
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ======================================================
         SALÓN DE EVENTOS — Paralelogramo #133215, imagen izq + info der
         ====================================================== -->
    <section id="eventos" class="eventos-section">
      <div class="eventos-paralelogramo"></div>

      <div class="eventos-content-wrapper reveal">
        <div class="eventos-image">
          <img :src="experiencias[2].imagen" alt="Salón de Eventos Asogema" loading="lazy" />
          <div class="eventos-image-badge">Capacidad hasta 300 pers.</div>
        </div>

        <div class="eventos-info">
          <div class="eventos-info-header">
            <div class="eventos-icon">
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
            <div class="eventos-tag">Salón de Eventos</div>
          </div>

          <h2 class="eventos-title">{{ experiencias[2].titulo }}</h2>
          <p class="eventos-desc">{{ experiencias[2].descripcion }}</p>

          <div class="eventos-divider"></div>

          <div class="eventos-features">
            <div class="eventos-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Salones Modernos</span>
            </div>
            <div class="eventos-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span>Equipo Profesional</span>
            </div>
            <div class="eventos-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Jardines Exclusivos</span>
            </div>
            <div class="eventos-feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Eventos a Medida</span>
            </div>
          </div>

          <button class="eventos-btn" @click="emit('navigate', 'events')">
            Cotizar Evento
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ======================================================
         FOOTER
         ====================================================== -->
    <footer id="contact" class="index-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/imagenes/Logo.png" alt="Asogema" class="footer-brand-img" />
          <p>
            Asogema es un destino único donde la naturaleza, la gastronomía y la elegancia
            se combinan para ofrecerte experiencias inolvidables.
          </p>
        </div>
        <div class="footer-col">
          <h4>Experiencias</h4>
          <ul>
            <li><a href="#hero" @click.prevent="scrollToSection('hero')">Inicio</a></li>
            <li><a href="#hotel" @click.prevent="scrollToSection('hotel')">Hotel</a></li>
            <li><a href="#restaurante" @click.prevent="scrollToSection('restaurante')">Restaurante</a></li>
            <li><a href="#eventos" @click.prevent="scrollToSection('eventos')">Salón de Eventos</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Compañía</h4>
          <ul>
            <li><a href="#">Nosotros</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Prensa</a></li>
            <li><a href="#">Carreras</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">Centro de Ayuda</a></li>
            <li><a href="#">Reservas</a></li>
            <li><a href="#">Eventos</a></li>
            <li><a href="#">Privacidad</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; {{ new Date().getFullYear() }} Asogema. Todos los derechos reservados.</span>
        <div class="footer-socials">
          <a href="#" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a href="#" aria-label="Twitter">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import url('../Index.css');
</style>
