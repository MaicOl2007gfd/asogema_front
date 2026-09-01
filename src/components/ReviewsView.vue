<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useReviews } from '../composables/useReviews.js'

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

// ── Composable (Controlador/Modelo) ──
const {
  reviews,
  newRating,
  newReviewText,
  hoveredRating,
  showForm,
  isSubmitting,
  submitSuccess,
  submitError,
  lastSubmittedId,
  currentAuthor,
  averageRating,
  ratingDistribution,
  totalReviews,
  currentServiceName,
  ratingTouched,
  textTouched,
  ratingError,
  textError,
  charCount,
  isNearLimit,
  canSubmit,
  setRating,
  hoverStar,
  leaveStars,
  toggleForm,
  submitReview,
  getStarPercentage,
  getRatingLabel,
  formatDate,
  serviceIcons,
  MIN_REVIEW_LENGTH,
  MAX_REVIEW_LENGTH,
} = useReviews(computed(() => props.serviceType))

// ── Refs del template ──
const textareaRef = ref(null)
const reviewEls = new Map()

// ── UX: enfocar el textarea al abrir el formulario ──
watch(showForm, async (open) => {
  if (open) {
    await nextTick()
    textareaRef.value?.focus()
  }
})

// ── UX: scroll suave + resaltado hacia la reseña recién creada ──
watch(lastSubmittedId, async (id) => {
  if (id) {
    await nextTick()
    const el = reviewEls.get(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('reviews-card--pulse')
      setTimeout(() => el.classList.remove('reviews-card--pulse'), 1200)
    }
  }
})

function setReviewEl(el, id) {
  if (el) reviewEls.set(id, el)
  else reviewEls.delete(id)
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
          type="button"
          class="reviews-toggle-btn"
          :aria-expanded="showForm ? 'true' : 'false'"
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
          <div v-if="submitSuccess" class="reviews-form-success" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>¡Gracias por tu reseña! Ha sido publicada correctamente.</span>
          </div>

          <div v-else class="reviews-form">
            <h3 class="reviews-form-title">Comparte tu Opinión</h3>

            <div class="reviews-form-rating">
              <span class="reviews-form-label">Calificación <span class="reviews-required">*</span></span>
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
              <span
                v-if="ratingTouched && ratingError"
                class="reviews-field-error"
                role="alert"
              >
                {{ ratingError }}
              </span>
            </div>

            <div class="reviews-form-field">
              <label for="review-text" class="reviews-form-label">
                Tu experiencia <span class="reviews-required">*</span>
              </label>
              <textarea
                id="review-text"
                ref="textareaRef"
                v-model="newReviewText"
                class="reviews-form-textarea"
                :class="{ 'reviews-form-textarea--error': textTouched && textError, 'reviews-form-textarea--warning': isNearLimit && !textError }"
                :placeholder="`Comparte tu experiencia con nosotros (mín. ${MIN_REVIEW_LENGTH} caracteres)...`"
                rows="4"
                :maxlength="MAX_REVIEW_LENGTH"
                @blur="textTouched = true"
              ></textarea>
              <span
                class="reviews-form-char-count"
                :class="{ 'reviews-form-char-count--warning': isNearLimit }"
              >
                {{ charCount }}/{{ MAX_REVIEW_LENGTH }}
              </span>
              <span
                v-if="textTouched && textError"
                class="reviews-field-error"
                role="alert"
              >
                {{ textError }}
              </span>
            </div>

            <p v-if="submitError" class="reviews-form-error" role="alert">{{ submitError }}</p>

            <button
              type="button"
              class="reviews-form-submit"
              :class="{ 'reviews-form-submit--invalid': (ratingTouched || textTouched) && !canSubmit }"
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
          v-if="reviews.length === 0"
          class="reviews-empty"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <p>Aún no hay reseñas para {{ currentServiceName.toLowerCase() }}. ¡Sé el primero en compartir tu experiencia!</p>
        </div>

        <div
          v-for="review in reviews"
          :key="review.id"
          :ref="(el) => setReviewEl(el, review.id)"
          class="reviews-card"
        >
          <div class="reviews-card-header">
            <div class="reviews-card-avatar">
              {{ (review.author || '?').charAt(0) }}
            </div>
            <div class="reviews-card-info">
              <strong class="reviews-card-author">{{ review.author }}</strong>
              <time class="reviews-card-date">{{ formatDate(review.date) }}</time>
            </div>
            <div class="reviews-card-meta">
              <span v-if="review.isOwn" class="reviews-own-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Tu reseña
              </span>
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
