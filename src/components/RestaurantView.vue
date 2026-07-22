<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useRestaurant } from '../composables/useRestaurant.js'

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
  isVisible,
  activeCategory,
  selectedItem,
  filteredItems,
  order,
  showOrderPanel,
  orderCount,
  orderTotal,
  currentSlide,
  totalSlides,
  setCategory,
  showItemDetail,
  closeItemDetail,
  addToOrder,
  removeFromOrder,
  updateQuantity,
  clearOrder,
  toggleOrderPanel,
  closeOrderPanel,
  formatPrice,
  handleReserveClick,
  confirmOrder,
  goBackToHome,
  goToSlide,
  nextSlide,
  prevSlide,
} = useRestaurant(emit, isLoggedIn)
</script>

<template>
  <div class="restaurant-container">
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
    <div class="restaurant-carousel">
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
              Restaurante Asogema
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
    <div class="restaurant-content" :class="{ visible: isVisible }">
      <!-- Header Section -->
      <div class="restaurant-header">
        <div class="restaurant-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        </div>
        <div class="restaurant-header-text">
          <span class="restaurant-tag">Restaurante Asogema</span>
          <h1 class="restaurant-title">Experiencia Gastronómica</h1>
          <p class="restaurant-subtitle">
            Deleita tu paladar con nuestra exquisita selección de platillos,
            preparados por los mejores chefs con ingredientes de la más alta calidad.
          </p>
        </div>
      </div>

      <!-- Filter Categories -->
      <div class="restaurant-filters">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="restaurant-filter-btn"
          :class="{ active: activeCategory === cat.id }"
          @click="setCategory(cat.id)"
        >
          <!-- Grid icon -->
          <svg v-if="cat.icon === 'grid'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
          <!-- Sun icon (Desayunos) -->
          <svg v-else-if="cat.icon === 'sun'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <!-- Sunset icon (Almuerzos) -->
          <svg v-else-if="cat.icon === 'sunset'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 18a5 5 0 0 0-10 0"></path>
            <line x1="12" y1="9" x2="12" y2="2"></line>
            <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line>
            <line x1="1" y1="18" x2="3" y2="18"></line>
            <line x1="21" y1="18" x2="23" y2="18"></line>
            <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line>
            <line x1="23" y1="22" x2="1" y2="22"></line>
            <polyline points="16 5 12 9 8 5"></polyline>
          </svg>
          <!-- Moon icon (Cenas) -->
          <svg v-else-if="cat.icon === 'moon'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <!-- Leaf icon (Ensaladas) -->
          <svg v-else-if="cat.icon === 'leaf'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
          <!-- Coffee icon (Bebidas) -->
          <svg v-else-if="cat.icon === 'coffee'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>

          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- Menu Grid -->
      <div class="restaurant-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="restaurant-card"
        >
          <div class="restaurant-card-image" @click="showItemDetail(item)">
            <img :src="item.image" :alt="item.name" loading="lazy" />
            <div class="restaurant-card-badge">{{ item.badge }}</div>
            <button class="restaurant-card-add" @click.stop="addToOrder(item)" title="Agregar a la orden">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <div class="restaurant-card-info" @click="showItemDetail(item)">
            <h3 class="restaurant-card-name">{{ item.name }}</h3>
            <p class="restaurant-card-desc">{{ item.description }}</p>
            <div class="restaurant-card-footer">
              <span class="restaurant-card-price">{{ item.price }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredItems.length === 0" class="restaurant-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>No hay platillos disponibles en esta categoría</p>
      </div>

      <!-- Actions -->
      <div class="restaurant-actions">
        <button class="restaurant-btn restaurant-btn-primary" @click="handleReserveClick">
          Reservar Mesa
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
        <button class="restaurant-btn restaurant-btn-secondary" @click="goBackToHome">
          Volver al Inicio
        </button>
      </div>
    </div>

    <!-- Floating Order Button -->
    <Transition name="order-fab">
      <button
        v-if="orderCount > 0"
        class="restaurant-fab"
        @click="toggleOrderPanel"
        :title="'Ver orden (' + orderCount + ' items)'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="restaurant-fab-badge">{{ orderCount }}</span>
      </button>
    </Transition>

    <!-- Order Panel (slide-in) -->
    <Transition name="order-panel">
      <div v-if="showOrderPanel" class="order-panel-overlay" @click.self="closeOrderPanel">
        <div class="order-panel">
          <div class="order-panel-header">
            <div class="order-panel-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <div class="order-panel-header-text">
              <h2 class="order-panel-title">Tu Orden</h2>
              <span class="order-panel-count">{{ orderCount }} {{ orderCount === 1 ? 'artículo' : 'artículos' }}</span>
            </div>
            <button class="order-panel-close" @click="closeOrderPanel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="order-panel-divider"></div>

          <div class="order-panel-items">
            <div v-if="order.length === 0" class="order-panel-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p>Tu orden está vacía</p>
            </div>

            <div
              v-for="item in order"
              :key="item.id"
              class="order-panel-item"
            >
              <div class="order-item-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="order-item-info">
                <h4 class="order-item-name">{{ item.name }}</h4>
                <span class="order-item-price">{{ formatPrice(parseInt(item.price.replace(/[$.]/g, '')) * item.quantity) }}</span>
              </div>
              <div class="order-item-qty">
                <button class="order-qty-btn" @click="updateQuantity(item.id, item.quantity - 1)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <span class="order-qty-value">{{ item.quantity }}</span>
                <button class="order-qty-btn" @click="updateQuantity(item.id, item.quantity + 1)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              <button class="order-item-remove" @click="removeFromOrder(item.id)" title="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="order-panel-footer">
            <div class="order-panel-divider"></div>
            <div class="order-panel-total">
              <span class="order-total-label">Total</span>
              <span class="order-total-value">{{ formatPrice(orderTotal) }}</span>
            </div>
            <div class="order-panel-actions">
              <button class="restaurant-btn restaurant-btn-primary order-btn-submit" @click="confirmOrder">
                Confirmar Orden
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <button class="order-btn-clear" @click="clearOrder">
                Vaciar Orden
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Item Detail Modal -->
    <Transition name="modal-fade">
      <div v-if="selectedItem" class="restaurant-modal-overlay" @click.self="closeItemDetail">
        <div class="restaurant-modal">
          <button class="restaurant-modal-close" @click="closeItemDetail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="restaurant-modal-image">
            <img :src="selectedItem.image" :alt="selectedItem.name" />
          </div>
          <div class="restaurant-modal-info">
            <div class="restaurant-modal-badge">{{ selectedItem.badge }}</div>
            <h2 class="restaurant-modal-name">{{ selectedItem.name }}</h2>
            <p class="restaurant-modal-desc">{{ selectedItem.description }}</p>
            <div class="restaurant-modal-divider"></div>
            <div class="restaurant-modal-footer">
              <span class="restaurant-modal-price">{{ selectedItem.price }}</span>
              <button class="restaurant-btn restaurant-btn-primary" @click="addToOrder(selectedItem); closeItemDetail();">
                Agregar a la Orden
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ==========================================================
         FOOTER
         ========================================================== -->
    <footer class="restaurant-footer">
      <div class="restaurant-footer-grid">
        <div class="restaurant-footer-brand">
          <img src="/imagenes/Logo.png" alt="Asogema" style="width:36px;height:36px;object-fit:contain;filter:brightness(1.3);" />
          <p>Asogema es un destino único donde la naturaleza, la gastronomía y la elegancia se combinan para ofrecerte experiencias inolvidables.</p>
        </div>
        <div class="restaurant-footer-col">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#" @click.prevent="emit('navigate', 'index')">Inicio</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
            <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
          </ul>
        </div>
        <div class="restaurant-footer-col">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">+57 300 000 0000</a></li>
            <li><a href="#">restaurante@asogema.com</a></li>
            <li><a href="#">Vía principal, Asogema</a></li>
          </ul>
        </div>
      </div>
      <div class="restaurant-footer-bottom">
        <span>&copy; {{ new Date().getFullYear() }} Asogema. Todos los derechos reservados.</span>
        <div class="restaurant-footer-socials">
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
@import url('../Restaurant.css');
</style>
