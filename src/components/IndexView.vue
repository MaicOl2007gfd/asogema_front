<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { isStaffUser, getUserInitials as utilsGetUserInitials } from '../composables/useUtils.js'
import { useIndex } from '../composables/useIndex.js'
import MagicBento from './MagicBento.vue'
import ClickSpark from './ClickSpark.vue'

const emit = defineEmits(['navigate'])

const { user, isLoggedIn, isAdmin, logout } = useAuth()

const isStaff = computed(() => isStaffUser(user.value, isAdmin.value))

const {
  slides,
  experiencias,
  features,
  testimonials,
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
  return utilsGetUserInitials(user.value)
}

function handleLogout() {
  logout()
  closeMobileMenu()
}

function handleAdminClick() {
  emit('navigate', 'admin')
}

function handleExperienceCta(action) {
  emit('navigate', action)
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
         ADMIN ACCESS — Botón flotante para el panel admin
         ====================================================== -->
    <div v-if="isAdmin" class="admin-float-btn" @click="handleAdminClick">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
      </svg>
      <span>Admin</span>
    </div>

    <!-- ======================================================
         NAVBAR
         ====================================================== -->
    <nav class="index-nav" :class="{ scrolled: isScrolled }">
      <div class="nav-brand" @click="emit('navigate', 'profile')">
        <img src="/imagenes/Logo.png" alt="Asogema" class="nav-logo" />
        <span class="nav-brand-text">Asogema</span>
      </div>

      <ul class="nav-links" :class="{ open: mobileMenuOpen }">
        <!-- Mobile user info -->
        <li
          v-if="isLoggedIn && user"
          class="nav-mobile-user"
          role="button"
          tabindex="0"
          title="Ver mi perfil"
          aria-label="Ver mi perfil"
          @click="emit('navigate', 'profile')"
          @keydown.enter="emit('navigate', 'profile')"
          @keydown.space.prevent="emit('navigate', 'profile')"
        >
          <div class="nav-user-avatar">{{ getUserInitials() }}</div>
          <span class="nav-user-greeting">Bienvenido</span>
          <strong class="nav-user-name">{{ user.name }}</strong>
        </li>
        <li><a href="#" @click.prevent="emit('navigate', 'index')">Inicio</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
        <li v-if="isLoggedIn"><a href="#" @click.prevent="emit('navigate', 'wallet')">Mi Saldo</a></li>
        <li v-if="isStaff"><a href="#" @click.prevent="emit('navigate', 'qr-reader')">Lector QR</a></li>
        <li><a href="#contact" @click.prevent="scrollToSection('contact')">Contacto</a></li>
      </ul>

      <!-- Logged-in user section -->
      <div v-if="isLoggedIn && user" class="nav-actions" :class="{ open: mobileMenuOpen }">
        <div
          class="nav-user-info"
          role="button"
          tabindex="0"
          title="Ver mi perfil"
          aria-label="Ver mi perfil"
          @click="emit('navigate', 'profile')"
          @keydown.enter="emit('navigate', 'profile')"
          @keydown.space.prevent="emit('navigate', 'profile')"
        >
          <span class="nav-user-greeting">Bienvenido</span>
          <strong class="nav-user-name">{{ user.name }}</strong>
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
        
        <button v-if="isAdmin" class="nav-admin-link-btn" @click="emit('navigate', 'admin')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
          </svg>
          Admin
        </button>
        <ClickSpark spark-color="#ffffff" :spark-size="10" :spark-radius="25" :spark-count="12" :duration="600" @spark-click="handleLogout">
          <button class="nav-btn nav-btn-logout" type="button">Cerrar Sesión</button>
        </ClickSpark>
      </div>
      <!-- Guest section -->
      <div v-else class="nav-actions" :class="{ open: mobileMenuOpen }">
        <ClickSpark spark-color="#ffffff" :spark-size="10" :spark-radius="25" :spark-count="12" :duration="600" @spark-click="emit('navigate', 'login')">
          <button class="nav-btn nav-btn-outline" type="button">Iniciar Sesión</button>
        </ClickSpark>
        <ClickSpark spark-color="#ffffff" :spark-size="10" :spark-radius="25" :spark-count="12" :duration="600" @spark-click="emit('navigate', 'register')">
          <button class="nav-btn nav-btn-primary" type="button">Registrarse</button>
        </ClickSpark>
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
              <ClickSpark spark-color="#ffffff" :spark-size="12" :spark-radius="30" :spark-count="14" :duration="600" @spark-click="handleSlideAction(slide.primaryAction)">
                <button class="slide-btn slide-btn-primary" type="button">
                  {{ slide.primaryBtn }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </ClickSpark>
              <ClickSpark spark-color="#ffffff" :spark-size="12" :spark-radius="30" :spark-count="14" :duration="600" @spark-click="handleSlideAction(slide.secondaryAction)">
                <button class="slide-btn slide-btn-secondary" type="button">
                  {{ slide.secondaryBtn }}
                </button>
              </ClickSpark>
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

      <div class="hero-curve" aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,90 C360,15 1080,15 1440,90 L1440,90 L0,90 Z" fill="#F3E8D3"></path>
        </svg>
      </div>
    </section>

    <!-- ======================================================
         NOSOTROS — Presentación del club (split layout)
         ====================================================== -->
    <section id="nosotros" class="about-section section-padding">
      <div class="about-container reveal">
        <div class="about-media">
          <img src="https://picsum.photos/id/1043/800/1000" alt="ASOGEMA" loading="lazy" />
          <div class="about-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Ibagué · Tolima · Colombia</span>
          </div>
        </div>

        <div class="about-content">
          <span class="section-tag">Bienvenidos a ASOGEMA</span>
          <h2 class="section-title">Un lugar donde la recreación, la naturaleza y la familia se encuentran</h2>
          <div class="about-divider"></div>
          <p class="about-text">
            Sean todos bienvenidos a la Asociación Recreacional Guillermo Eloy Mateus Rojas – ASOGEMA,
            un espacio creado para compartir, descansar y fortalecer los lazos de amistad, solidaridad
            y bienestar. Ubicada en Ibagué, Tolima, abre sus puertas a asociados, familias y visitantes.
          </p>
          <p class="about-text">
            Nuestro compromiso es ofrecer experiencias memorables, promoviendo la recreación, el deporte,
            la cultura y el turismo en un entorno seguro, familiar y acogedor.
          </p>

          <div class="about-values">
            <div class="about-value">
              <div class="about-value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div class="about-value-body">
                <strong>Seguridad y Confianza</strong>
                <span>Un entorno seguro y familiar en cada visita.</span>
              </div>
            </div>
            <div class="about-value">
              <div class="about-value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div class="about-value-body">
                <strong>Naturaleza y Recreación</strong>
                <span>Zonas verdes, piscinas y canchas para toda la familia.</span>
              </div>
            </div>
            <div class="about-value">
              <div class="about-value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <div class="about-value-body">
                <strong>Integración Familiar</strong>
                <span>Fortalecemos lazos y creamos recuerdos inolvidables.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================
         EXPERIENCIAS — Hotel · Restaurante · Eventos
         ====================================================== -->
    <section id="experiencias" class="experiencias-section section-padding">
      <div class="section-header reveal">
        <span class="section-tag">Experiencias</span>
        <h2 class="section-title">Vive ASOGEMA a tu manera</h2>
        <p class="section-desc">
          Tres experiencias pensadas para que cada visita sea única. Elige la tuya y déjate sorprender.
        </p>
      </div>

      <div class="experiencias-grid">
        <article
          v-for="(exp, i) in experiencias"
          :id="exp.id"
          :key="exp.id"
          class="experiencia-card reveal"
          :class="'reveal-delay-' + (i + 1)"
        >
          <div class="experiencia-card-media">
            <img :src="exp.imagen" :alt="exp.titulo" loading="lazy" />
            <div class="experiencia-card-overlay"></div>
            <span class="experiencia-card-badge">{{ exp.etiqueta }}</span>
          </div>

          <div class="experiencia-card-body">
            <div class="experiencia-card-icon">
              <svg v-if="exp.icon === 'hotel'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18"></path>
                <path d="M3 10h18"></path>
                <path d="M5 6l7-3 7 3"></path>
                <path d="M4 10v11"></path>
                <path d="M20 10v11"></path>
              </svg>
              <svg v-else-if="exp.icon === 'restaurant'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M8 14h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 14h.01"></path>
              </svg>
            </div>

            <h3 class="experiencia-card-title">{{ exp.titulo }}</h3>
            <p class="experiencia-desc">{{ exp.descripcion }}</p>

            <ul class="experiencia-feats">
              <li v-for="f in exp.features" :key="f">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ f }}</span>
              </li>
            </ul>

            <ClickSpark spark-color="#ffffff" :spark-size="12" :spark-radius="30" :spark-count="14" :duration="600" @spark-click="handleExperienceCta(exp.action)">
              <button class="experiencia-btn" type="button">
                {{ exp.cta }}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </ClickSpark>
          </div>
        </article>
      </div>
    </section>

    <!-- ======================================================
         SERVICIOS — Por qué elegir ASOGEMA
         ====================================================== -->
    <section id="servicios" class="features-section section-padding">
      <div class="section-header reveal">
        <span class="section-tag">Servicios</span>
        <h2 class="section-title">Todo lo que necesitas en un solo lugar</h2>
        <p class="section-desc">
          Diseñamos cada espacio para que tu visita sea cómoda, segura y memorable.
        </p>
      </div>

      <div class="features-grid">
        <div v-for="(feature, i) in features" :key="feature.title" class="feature-card reveal" :class="'reveal-delay-' + (i % 3 + 1)">
          <div class="feature-icon" v-html="feature.svg"></div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ======================================================
         GALERÍA — Muestra visual del club
         ====================================================== -->
    <section id="galeria" class="gallery-section section-padding">
      <div class="section-header reveal">
        <span class="section-tag">Galería</span>
        <h2 class="section-title">Un vistazo a nuestro paraíso</h2>
        <p class="section-desc">
          Espacios, sabores y momentos que hacen de ASOGEMA un lugar inolvidable.
        </p>
      </div>

      <div class="gallery-grid">
        <figure class="gallery-item reveal gallery-item-tall">
          <img src="https://picsum.photos/id/1043/800/1000" alt="Instalaciones del hotel" loading="lazy" />
          <figcaption>Hotel & Suites</figcaption>
        </figure>
        <figure class="gallery-item reveal reveal-delay-1">
          <img src="https://picsum.photos/id/164/800/600" alt="Habitación premium" loading="lazy" />
          <figcaption>Comodidad premium</figcaption>
        </figure>
        <figure class="gallery-item reveal reveal-delay-2">
          <img src="https://picsum.photos/id/431/800/600" alt="Gastronomía" loading="lazy" />
          <figcaption>Alta cocina</figcaption>
        </figure>
        <figure class="gallery-item reveal reveal-delay-1">
          <img src="https://picsum.photos/id/1067/800/600" alt="Naturaleza" loading="lazy" />
          <figcaption>Naturaleza viva</figcaption>
        </figure>
        <figure class="gallery-item reveal reveal-delay-2">
          <img src="https://picsum.photos/id/42/800/600" alt="Eventos" loading="lazy" />
          <figcaption>Eventos memorables</figcaption>
        </figure>
        <figure class="gallery-item reveal gallery-item-tall">
          <img src="https://picsum.photos/id/1084/800/1000" alt="Áreas de descanso" loading="lazy" />
          <figcaption>Áreas de descanso</figcaption>
        </figure>
      </div>
    </section>

    <!-- ======================================================
         NUESTRA HISTORIA
         ====================================================== -->
    <section id="historia" class="history-section section-padding">
      <div class="history-container reveal">
        <div class="section-header">
          <span class="section-tag">Nuestra Historia</span>
          <h2 class="section-title">Más de cuatro décadas construyendo bienestar</h2>
          <div class="history-divider"></div>
        </div>

        <div class="history-timeline">
          <div class="history-milestone reveal reveal-delay-1">
            <div class="history-milestone-year">1979</div>
            <div class="history-milestone-content">
              <p>
                La historia de ASOGEMA comienza en <strong>1979</strong>, cuando la entonces Sede Social
                fue adquirida por ATOLSURE. El predio, conocido como <strong>San Roque</strong>, contaba
                con aproximadamente siete hectáreas de terreno, una casa principal y ocho cabañas,
                convirtiéndose desde entonces en un espacio destinado al bienestar y la integración
                de sus asociados.
              </p>
            </div>
          </div>

          <div class="history-milestone reveal reveal-delay-2">
            <div class="history-milestone-year">2011</div>
            <div class="history-milestone-content">
              <p>
                Posteriormente, el <strong>15 de octubre de 2011</strong>, durante la Asamblea General
                de COOMUATOLSURE, nació oficialmente la
                <strong>Asociación Recreacional Guillermo Eloy Mateus Rojas (ASOGEMA)</strong>,
                siendo legalmente constituida el <strong>6 de enero de 2012</strong> como una entidad
                sin ánimo de lucro dedicada a la recreación, el deporte, la cultura y el bienestar
                de sus asociados y sus familias.
              </p>
            </div>
          </div>
        </div>

        <div class="history-services reveal reveal-delay-3">
          <h3 class="history-services-title">Servicios que ofrecemos</h3>
          <MagicBento
            :text-auto-hide="true"
            :enable-stars="true"
            :enable-spotlight="true"
            :enable-border-glow="true"
            :enable-tilt="true"
            :enable-magnetism="true"
            :click-effect="true"
            :spotlight-radius="300"
            :particle-count="12"
            glow-color="243, 232, 211"
          />
        </div>

        <div class="history-closing reveal reveal-delay-4">
          <div class="history-closing-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p>
            Más que un club, ASOGEMA representa un lugar donde las familias se reúnen para compartir
            momentos especiales, fortalecer la amistad y disfrutar de la naturaleza en un ambiente
            de tranquilidad y respeto.
          </p>
        </div>
      </div>
    </section>

    <!-- ======================================================
         TESTIMONIOS — Experiencias de nuestros huéspedes
         ====================================================== -->
    <section id="testimonios" class="testimonials-section section-padding">
      <div class="section-header reveal">
        <span class="section-tag">Testimonios</span>
        <h2 class="section-title">Lo que dicen nuestros huéspedes</h2>
        <p class="section-desc">
          Historias reales de quienes ya vivieron la experiencia ASOGEMA.
        </p>
      </div>

      <div class="testimonials-grid">
        <article v-for="(t, i) in testimonials" :key="t.name" class="testimonial-card reveal" :class="'reveal-delay-' + (i + 1)">
          <div class="testimonial-stars" :aria-label="'Calificación: ' + t.rating + ' de 5'">
            <svg v-for="n in t.rating" :key="n" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <p class="testimonial-text">“{{ t.text }}”</p>
          <footer class="testimonial-author">
            <div class="testimonial-avatar">{{ t.name.split(' ').map(w => w[0]).join('').slice(0, 2) }}</div>
            <div class="testimonial-meta">
              <strong>{{ t.name }}</strong>
              <span>{{ t.role }}</span>
            </div>
          </footer>
        </article>
      </div>
    </section>

    <!-- ======================================================
         CTA — Llamado a la acción final
         ====================================================== -->
    <section v-if="!isLoggedIn" class="cta-section section-padding">
      <div class="cta-banner reveal">
        <div class="cta-content">
          <span class="cta-tag">Únete a la familia</span>
          <h2 class="cta-title">¿Listo para vivir la experiencia ASOGEMA?</h2>
          <p class="cta-desc">
            Crea tu cuenta y comienza a reservar tu hotel, tu mesa o tu evento. Tu próxima
            experiencia inolvidable te espera.
          </p>
        </div>
        <div class="cta-actions">
          <ClickSpark spark-color="#133215" :spark-size="10" :spark-radius="25" :spark-count="12" :duration="600" @spark-click="emit('navigate', 'register')">
            <button class="cta-btn cta-btn-primary" type="button">Crear Cuenta</button>
          </ClickSpark>
          <ClickSpark spark-color="#ffffff" :spark-size="10" :spark-radius="25" :spark-count="12" :duration="600" @spark-click="emit('navigate', 'login')">
            <button class="cta-btn cta-btn-secondary" type="button">Iniciar Sesión</button>
          </ClickSpark>
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
        <div class="footer-col">
          <h4>Experiencias</h4>
          <ul>
            <li><a href="#inicio" @click.prevent="scrollToSection('hero')">Inicio</a></li>
            <li><a href="#hotel" @click.prevent="scrollToSection('hotel')">Hotel</a></li>
            <li><a href="#restaurante" @click.prevent="scrollToSection('restaurante')">Restaurante</a></li>
            <li><a href="#eventos" @click.prevent="scrollToSection('eventos')">Salón de Eventos</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Compañía</h4>
          <ul>
            <li><a href="#nosotros" @click.prevent="scrollToSection('nosotros')">Nosotros</a></li>
            <li><a href="#historia" @click.prevent="scrollToSection('historia')">Historia</a></li>
            <li><a href="#servicios" @click.prevent="scrollToSection('servicios')">Servicios</a></li>
            <li><a href="#contact" @click.prevent="scrollToSection('contact')">Contacto</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">Ibagué, Tolima</a></li>
            <li><a href="#">Centro de Ayuda</a></li>
            <li><a href="#">Reservas</a></li>
            <li><a href="#">Privacidad</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; {{ new Date().getFullYear() }} Asogema. Todos los derechos reservados.</span>
        <span class="footer-made">Hecho con <span class="footer-heart">♥</span> en Ibagué</span>
      </div>
    </footer>
  </div>
</template>

<style>
@import url('../Index.css');
</style>

