<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  serviceType: {
    type: String,
    default: 'hotel',
    validator: (v) => ['hotel', 'restaurant', 'events'].includes(v),
  },
  theme: {
    type: String,
    default: 'dark',
    validator: (v) => ['dark', 'light'].includes(v),
  },
})

// ── Sample reviews data (per service) ──
const reviewsData = ref({
  hotel: [
    {
      id: 1,
      author: 'María García',
      rating: 5,
      text: 'Una experiencia inolvidable. Las habitaciones son espacjosas y la vista es espectacular. El servicio al cliente es excepcional, realmente nos hicieron sentir como en casa.',
      date: '2026-06-15',
    },
    {
      id: 2,
      author: 'Carlos Mendoza',
      rating: 4,
      text: 'Muy buen hotel, la ubicación es perfecta y las instalaciones están muy bien cuidadas. La piscina y el spa son de primera. Solo mejoraría la variedad en el desayuno.',
      date: '2026-05-28',
    },
    {
      id: 3,
      author: 'Ana Lóez',
      rating: 5,
      text: 'Simplemente mágico. Pasamos nuestra luna de miel aquí y cada detalle fue perfecto. El personal es muy atento y profesional. Volveremos sin dudarlo.',
      date: '2026-04-10',
    },
  ],
  restaurant: [
    {
      id: 1,
      author: 'Laura Jiménez',
      rating: 5,
      text: 'La mejor experiencia gastronómica que hemos tenido. Cada plato es una obra de arte, tanto en presentación como en sabor. El chef es un verdadero artista.',
      date: '2026-07-02',
    },
    {
      id: 2,
      author: 'Andrés Castillo',
      rating: 4,
      text: 'Excelente atención y comida deliciosa. Probamos el menú degustación y quedamos encantados. El ambiente es muy acogedor y elegante.',
      date: '2026-06-18',
    },
    {
      id: 3,
      author: 'Valentina Ruiz',
      rating: 5,
      text: 'Un restaurante con una carta variada y productos frescos. Los postres son increíbles. Sin duda un lugar para repetir y recomendar.',
      date: '2026-05-22',
    },
  ],
  events: [
    {
      id: 1,
      author: 'Diana Paredes',
      rating: 5,
      text: 'Celebramos nuestra boda aquí y fue todo lo que soñábamos. El equipo de eventos se encargó de cada detalle, todo salió perfecto. Un lugar mágico.',
      date: '2026-06-30',
    },
    {
      id: 2,
      author: 'Roberto Vega',
      rating: 4,
      text: 'El salón de eventos es amplio y bien iluminado. La organización fue impecable y el catering delicioso. Muy recomendable para eventos corporativos.',
      date: '2026-05-14',
    },
    {
      id: 3,
      author: 'Patricia Gómez',
      rating: 5,
      text: 'Los 15 años de mi hija fueron inolvidables. El lugar es hermoso, la decoración espectacular y el personal muy profesional. Superó todas nuestras expectativas.',
      date: '2026-04-08',
    },
  ],
})

// ── New review form ──
const newRating = ref(0)
const newReviewText = ref('')
const hoveredRating = ref(0)
const showForm = ref(false)
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

// ── Computed ──
const reviews = computed(() => reviewsData.value[props.serviceType] || [])
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})
const ratingDistribution = computed(() => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.value.forEach((r) => {
    if (dist[r.rating] !== undefined) dist[r.rating]++
  })
  return dist
})
const totalReviews = computed(() => reviews.value.length)
const maxDistCount = computed(() => Math.max(...Object.values(ratingDistribution), 1))

function getStarPercentage(count) {
  return totalReviews.value > 0 ? Math.round((count / totalReviews.value) * 100) : 0
}

// ── Methods ──
function setRating(val) {
  newRating.value = val
}

function hoverStar(val) {
  hoveredRating.value = val
}

function leaveStars() {
  hoveredRating.value = 0
}

function toggleForm() {
  showForm.value = !showForm.value
  if (!showForm.value) {
    submitError.value = ''
  }
}

function submitReview() {
  if (newRating.value === 0) {
    submitError.value = 'Por favor selecciona una calificación'
    return
  }
  if (newReviewText.value.trim().length < 10) {
    submitError.value = 'La reseña debe tener al menos 10 caracteres'
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  // Simulate API call
  setTimeout(() => {
    const review = {
      id: Date.now(),
      author: 'Tu Nombre',
      rating: newRating.value,
      text: newReviewText.value.trim(),
      date: new Date().toISOString().slice(0, 10),
    }
    reviewsData.value[props.serviceType].unshift(review)
    newRating.value = 0
    newReviewText.value = ''
    isSubmitting.value = false
    submitSuccess.value = true
    setTimeout(() => {
      submitSuccess.value = false
    }, 3000)
  }, 600)
}

// ── Service display names ──
const serviceNames = {
  hotel: 'Hotel',
  restaurant: 'Restaurante',
  events: 'Zona de Eventos',
}

const serviceIcons = {
  hotel: '<path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/>',
  restaurant:
    '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
  events:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/><path d="M16 18h.01"/>',
}

function getRatingLabel(rating) {
  const labels = ['', 'Malo', 'Regular', 'Bueno', 'Muy Bueno', 'Excelente']
  return labels[rating] || ''
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}
</script>

<template>
  <section :class="['reviews-section', `reviews-theme-${theme}`]">
    <div class="reviews-container">
      <!-- ── Header ── -->
      <div class="reviews-header">
        <div class="reviews-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" v-html="serviceIcons[serviceType]"></svg>
        </div>
        <div class="reviews-header-text">
          <span class="reviews-tag">Reseñas</span>
          <h2 class="reviews-title">
            Opiniones de Nuestros Huéspedes
          </h2>
        </div>
      </div>

      <!-- ── Rating Summary ── -->
      <div class="reviews-summary">
        <div class="reviews-summary-average">
          <span class="reviews-average-number">{{ averageRating }}</span>
          <div class="reviews-average-stars">
            <svg
              v-for="i in 5"
              :key="i"
              viewBox="0 0 24 24"
              :class="['reviews-star-icon', { 'reviews-star-filled': i <= Math.round(Number(averageRating)) }]"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <span class="reviews-average-label">{{ totalReviews }} reseñas</span>
        </div>

        <div class="reviews-summary-bars">
          <div v-for="star in 5" :key="star" class="reviews-bar-row">
            <span class="reviews-bar-label">{{ star }}★</span>
            <div class="reviews-bar-track">
              <div
                class="reviews-bar-fill"
                :style="{ width: getStarPercentage(ratingDistribution[star]) + '%' }"
              ></div>
            </div>
            <span class="reviews-bar-count">{{ ratingDistribution[star] }}</span>
          </div>
        </div>
      </div>

      <!-- ── Toggle Form Button ── -->
      <div class="reviews-form-toggle">
        <button
          class="reviews-toggle-btn"
          @click="toggleForm"
        >
          <template v-if="showForm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cerrar Formulario
          </template>
          <template v-else>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Dejar una Reseña
          </template>
        </button>
      </div>

      <!-- ── Review Form ── -->
      <Transition name="reviews-form-slide">
        <div v-if="showForm" class="reviews-form-container">
          <div v-if="submitSuccess" class="reviews-form-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>¡Gracias por tu reseña! Ha sido publicada correctamente.</span>
          </div>

          <div v-else class="reviews-form">
            <h3 class="reviews-form-title">Comparte tu Opinión</h3>

            <div class="reviews-form-rating">
              <span class="reviews-form-label">Calificación</span>
              <div class="reviews-stars-input">
                <button
                  v-for="i in 5"
                  :key="i"
                  type="button"
                  class="reviews-star-btn"
                  @click="setRating(i)"
                  @mouseenter="hoverStar(i)"
                  @mouseleave="leaveStars"
                  :aria-label="`${i} estrella${i !== 1 ? 's' : ''}`"
                >
                  <svg viewBox="0 0 24 24" :class="['reviews-star-input-icon', { 'reviews-star-filled': i <= (hoveredRating || newRating) }]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
                <span v-if="hoveredRating || newRating" class="reviews-star-label">
                  {{ getRatingLabel(hoveredRating || newRating) }}
                </span>
              </div>
            </div>

            <div class="reviews-form-field">
              <label for="review-text" class="reviews-form-label">Tu experiencia</label>
              <textarea
                id="review-text"
                v-model="newReviewText"
                class="reviews-form-textarea"
                placeholder="Comparte tu experiencia con nosotros..."
                rows="4"
                maxlength="500"
              ></textarea>
              <span class="reviews-form-char-count">{{ newReviewText.length }}/500</span>
            </div>

            <p v-if="submitError" class="reviews-form-error">{{ submitError }}</p>

            <button
              class="reviews-form-submit"
              :disabled="isSubmitting"
              @click="submitReview"
            >
              <template v-if="isSubmitting">
                <svg class="reviews-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="50"></circle>
                </svg>
                Enviando...
              </template>
              <template v-else>
                Publicar Reseña
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </template>
            </button>
          </div>
        </div>
      </Transition>

      <!-- ── Reviews List ── -->
      <div class="reviews-list">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="reviews-card"
        >
          <div class="reviews-card-header">
            <div class="reviews-card-avatar">
              {{ review.author.charAt(0) }}
            </div>
            <div class="reviews-card-info">
              <strong class="reviews-card-author">{{ review.author }}</strong>
              <time class="reviews-card-date">{{ formatDate(review.date) }}</time>
            </div>
            <div class="reviews-card-stars">
              <svg
                v-for="i in 5"
                :key="i"
                viewBox="0 0 24 24"
                :class="['reviews-star-icon', 'reviews-star-icon-sm', { 'reviews-star-filled': i <= review.rating }]"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
          </div>
          <p class="reviews-card-text">{{ review.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
@import url('../Reviews.css');
</style>
