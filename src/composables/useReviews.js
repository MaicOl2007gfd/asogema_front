import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth.js'
import { useReviewsApi } from './useReviewsApi.js'

/**
 * Composable que maneja toda la lógica del apartado de Reseñas de experiencia.
 * MVC: este archivo actúa como el Controlador/Modelo de ReviewsView.
 *
 * @param {import('vue').Ref<string>} serviceTypeRef - Ref con el tipo de servicio
 *   ('hotel' | 'restaurant' | 'events')
 * @returns {object} Estado reactivo y métodos de las reseñas
 */

/* ----------------------------------------------------------
   HELPERS — nombres e íconos por servicio
   ---------------------------------------------------------- */
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

const MIN_REVIEW_LENGTH = 10
const MAX_REVIEW_LENGTH = 500

export function useReviews(serviceTypeRef) {
  const { fetchReviews, createReview } = useReviewsApi()

  /* ----------------------------------------------------------
     STATE (Modelo)
     ---------------------------------------------------------- */
  const reviews = ref([])
  const isLoading = ref(false)
  const loadError = ref('')

  // Form
  const newRating = ref(0)
  const newReviewText = ref('')
  const hoveredRating = ref(0)
  const showForm = ref(false)
  const isSubmitting = ref(false)
  const submitSuccess = ref(false)
  const submitError = ref('')

  // Validación "touched" (para mostrar errores sin molestar al escribir)
  const ratingTouched = ref(false)
  const textTouched = ref(false)

  // Última reseña creada (para resaltarla / hacer scroll)
  const lastSubmittedId = ref(null)

  // Usuario actual para el autor de la reseña
  const { user } = useAuth()
  const currentAuthor = computed(() => {
    const name = user.value?.name || user.value?.nombre
    return (typeof name === 'string' ? name.trim() : '') || 'Huésped'
  })

  /* ----------------------------------------------------------
     CARGA DESDE API
     ---------------------------------------------------------- */
  async function loadReviews(service) {
    isLoading.value = true
    loadError.value = ''
    try {
      reviews.value = await fetchReviews(service)
    } catch (err) {
      loadError.value =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudieron cargar las reseñas'
    } finally {
      isLoading.value = false
    }
  }

  watch(serviceTypeRef, (service) => {
    loadReviews(service)
  }, { immediate: true })

  /* ----------------------------------------------------------
     COMPUTED
     ---------------------------------------------------------- */
  const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0
    const sum = reviews.value.reduce((acc, r) => acc + Number(r.rating), 0)
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

  const currentServiceName = computed(() => serviceNames[serviceTypeRef.value] || 'Servicio')

  /* ----------------------------------------------------------
     VALIDACIÓN
     ---------------------------------------------------------- */
  const ratingError = computed(() =>
    newRating.value === 0 ? 'Por favor selecciona una calificación' : '',
  )

  const textError = computed(() => {
    const t = newReviewText.value.trim()
    if (t.length === 0) return 'La reseña no puede estar vacía'
    if (t.length < MIN_REVIEW_LENGTH) {
      return `La reseña debe tener al menos ${MIN_REVIEW_LENGTH} caracteres (faltan ${MIN_REVIEW_LENGTH - t.length})`
    }
    return ''
  })

  const charCount = computed(() => newReviewText.value.length)
  const isNearLimit = computed(() => charCount.value >= MAX_REVIEW_LENGTH - 40)

  const canSubmit = computed(
    () => !isSubmitting.value && newRating.value > 0 && textError.value === '',
  )

  const formIsValid = computed(() => ratingError.value === '' && textError.value === '')

  /* ----------------------------------------------------------
     METHODS — Estrellas
     ---------------------------------------------------------- */
  function setRating(val) {
    newRating.value = val
  }

  function hoverStar(val) {
    hoveredRating.value = val
  }

  function leaveStars() {
    hoveredRating.value = 0
  }

  /* ----------------------------------------------------------
     METHODS — Form
     ---------------------------------------------------------- */
  function toggleForm() {
    showForm.value = !showForm.value
    if (!showForm.value) {
      submitError.value = ''
      ratingTouched.value = false
      textTouched.value = false
    }
  }

  function validateForm() {
    ratingTouched.value = true
    textTouched.value = true
    if (!formIsValid.value) {
      submitError.value = 'Revisa los campos marcados en rojo antes de enviar'
      return false
    }
    submitError.value = ''
    return true
  }

  async function submitReview() {
    if (!validateForm()) return

    isSubmitting.value = true
    submitError.value = ''

    try {
      const created = await createReview({
        tipo_servicio: serviceTypeRef.value,
        calificacion: newRating.value,
        texto: newReviewText.value.trim(),
      })
      reviews.value.unshift({ ...created, isOwn: true })
      lastSubmittedId.value = created.id

      newRating.value = 0
      newReviewText.value = ''
      hoveredRating.value = 0
      ratingTouched.value = false
      textTouched.value = false
      submitSuccess.value = true

      setTimeout(() => {
        submitSuccess.value = false
        lastSubmittedId.value = null
      }, 4000)
    } catch (err) {
      submitError.value =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo publicar la reseña. Intenta de nuevo.'
    } finally {
      isSubmitting.value = false
    }
  }

  /* ----------------------------------------------------------
     METHODS — Display helpers
     ---------------------------------------------------------- */
  function getStarPercentage(count) {
    return totalReviews.value > 0 ? Math.round((count / totalReviews.value) * 100) : 0
  }

  function getRatingLabel(rating) {
    const labels = ['', 'Malo', 'Regular', 'Bueno', 'Muy Bueno', 'Excelente']
    return labels[rating] || ''
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const [y, m, d] = String(dateStr).split('-')
    if (!y || !m || !d) return dateStr
    return `${d}/${m}/${y}`
  }

  /* ----------------------------------------------------------
     RETURN
     ---------------------------------------------------------- */
  return {
    // Data / Estado
    reviews,
    isLoading,
    loadError,
    newRating,
    newReviewText,
    hoveredRating,
    showForm,
    isSubmitting,
    submitSuccess,
    submitError,
    lastSubmittedId,
    currentAuthor,
    // Computed
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
    // Métodos - Estrellas
    setRating,
    hoverStar,
    leaveStars,
    // Métodos - Form
    toggleForm,
    submitReview,
    loadReviews,
    // Métodos - Display
    getStarPercentage,
    getRatingLabel,
    formatDate,
    // Constantes útiles
    serviceIcons,
    serviceNames,
    MIN_REVIEW_LENGTH,
    MAX_REVIEW_LENGTH,
  }
}