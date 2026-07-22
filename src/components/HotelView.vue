<script setup>
import { useAuth } from '../composables/useAuth.js'
import { useHotel } from '../composables/useHotel.js'

const emit = defineEmits(['navigate'])

const { isLoggedIn } = useAuth()

const {
  hotel,
  isVisible,
  handleReserveClick,
  goBackToHome,
  getFeatureIcon,
} = useHotel(emit, isLoggedIn)
</script>

<template>
  <div class="hotel-container">
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

    <!-- Bare tree branch - Left side -->
    <div class="branch-container branch-left" aria-hidden="true">
      <svg viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg" class="branch-svg">
        <path d="M380 0 Q340 120 300 200 Q260 280 240 350 Q220 420 250 480 Q280 540 300 600 Q310 640 320 700"
          stroke="#2d5a2e" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.25"/>
        <path d="M300 200 Q270 250 230 280 Q190 310 150 320"
          stroke="#2d5a2e" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.2"/>
        <path d="M240 350 Q210 380 180 390"
          stroke="#2d5a2e" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.15"/>
        <path d="M250 480 Q220 520 190 530"
          stroke="#2d5a2e" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.15"/>
      </svg>
    </div>

    <!-- Bare tree branch - Right side -->
    <div class="branch-container branch-right" aria-hidden="true">
      <svg viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg" class="branch-svg">
        <path d="M20 0 Q60 120 100 200 Q140 280 160 350 Q180 420 150 480 Q120 540 100 600 Q90 640 80 700"
          stroke="#2d5a2e" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.25"/>
        <path d="M100 200 Q130 250 170 280 Q210 310 250 320"
          stroke="#2d5a2e" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.2"/>
        <path d="M160 350 Q190 380 220 390"
          stroke="#2d5a2e" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.15"/>
        <path d="M150 480 Q180 520 210 530"
          stroke="#2d5a2e" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.15"/>
      </svg>
    </div>

    <!-- Subtle decorative rings -->
    <div class="deco-ring deco-ring-1"></div>
    <div class="deco-ring deco-ring-2"></div>

    <!-- Hotel Card -->
    <div class="hotel-card" :class="{ visible: isVisible }">
      <div class="hotel-card-inner">
        <!-- Image side -->
        <div class="hotel-card-image">
          <img :src="hotel.imagen" :alt="hotel.titulo" loading="lazy" />
          <div class="hotel-image-badge">{{ hotel.badge }}</div>
        </div>

        <!-- Info side -->
        <div class="hotel-card-info">
          <div class="hotel-card-header">
            <div class="hotel-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18"></path>
                <path d="M3 10h18"></path>
                <path d="M5 6l7-3 7 3"></path>
                <path d="M4 10v11"></path>
                <path d="M20 10v11"></path>
              </svg>
            </div>
            <div class="hotel-card-tag">{{ hotel.etiqueta }}</div>
          </div>

          <h1 class="hotel-card-title">{{ hotel.titulo }}</h1>
          <p class="hotel-card-desc">{{ hotel.descripcion }}</p>

          <div class="hotel-card-divider"></div>

          <div class="hotel-card-features">
            <div v-for="feat in hotel.features" :key="feat.icon" class="hotel-card-feat">
              <!-- Clock icon -->
              <svg v-if="feat.icon === 'clock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <!-- Wifi icon -->
              <svg v-else-if="feat.icon === 'wifi'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12.55a11 11 0 0114.08 0"></path>
                <path d="M1.42 9a16 16 0 0121.16 0"></path>
                <path d="M8.53 16.11a6 6 0 016.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
              <!-- Document icon -->
              <svg v-else-if="feat.icon === 'document'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <!-- Shield icon -->
              <svg v-else-if="feat.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <!-- Pool icon -->
              <svg v-else-if="feat.icon === 'pool'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"></path>
                <path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"></path>
                <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"></path>
                <path d="M12 2v6"></path>
                <path d="M9 5l3-3 3 3"></path>
              </svg>
              <!-- Spa icon -->
              <svg v-else-if="feat.icon === 'spa'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22c-4-3-8-6-8-11a8 8 0 0116 0c0 5-4 8-8 11z"></path>
                <path d="M12 22V12"></path>
                <path d="M9 7l3-3 3 3"></path>
              </svg>
              <!-- Default: check-circle -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{{ feat.label }}</span>
            </div>
          </div>

          <div class="hotel-card-actions">
            <button class="hotel-card-btn hotel-card-btn-primary" @click="handleReserveClick">
              Reservar Ahora
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button class="hotel-card-btn hotel-card-btn-secondary" @click="goBackToHome">
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative corner elements -->
    <div class="corner-decor corner-tl"></div>
    <div class="corner-decor corner-br"></div>
  </div>
</template>

<style>
@import url('../Hotel.css');
</style>
