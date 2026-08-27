import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'

/**
 * Composable que maneja toda la lógica del apartado de Reseñas de experiencia.
 * MVC: este archivo actúa como el Controlador/Modelo de ReviewsView.
 *
 * @param {import('vue').Ref<string>} serviceTypeRef - Ref con el tipo de servicio
 *   ('hotel' | 'restaurant' | 'events')
 * @returns {object} Estado reactivo y métodos de las reseñas
 */

/* ----------------------------------------------------------
   DATOS DE EJEMPLO (Modelo) — por tipo de servicio
   ---------------------------------------------------------- */
const seedReviews = {
  hotel: [
    {
      id: 1,
      author: 'María García',
      rating: 5,
      text: 'Una experiencia inolvidable. Las habitaciones son espaciosas y la vista es espectacular. El servicio al cliente es excepcional, realmente nos hicieron sentir como en casa.',
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
      author: 'Ana López',
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
}

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
  /* ----------------------------------------------------------
     STATE (Modelo)
     ---------------------------------------------------------- */
  const reviewsData = ref(JSON.parse(JSON.stringify(seedReviews)))

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
     COMPUTED
     ---------------------------------------------------------- */
  const reviews = computed(() => reviewsData.value[serviceTypeRef.value] || [])

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

  function submitReview() {
    if (!validateForm()) return

    isSubmitting.value = true

    // Simula una llamada a la API con datos de ejemplo
    setTimeout(() => {
      const review = {
        id: Date.now(),
        author: currentAuthor.value,
        rating: newRating.value,
        text: newReviewText.value.trim(),
        date: new Date().toISOString().slice(0, 10),
        isOwn: true,
      }
      reviewsData.value[serviceTypeRef.value].unshift(review)
      lastSubmittedId.value = review.id

      newRating.value = 0
      newReviewText.value = ''
      hoveredRating.value = 0
      ratingTouched.value = false
      textTouched.value = false
      isSubmitting.value = false
      submitSuccess.value = true

      setTimeout(() => {
        submitSuccess.value = false
        lastSubmittedId.value = null
      }, 4000)
    }, 600)
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
    reviewsData,
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
