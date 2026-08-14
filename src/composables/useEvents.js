import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from './useAuth.js'
import { useEventsApi } from './useEventsApi.js'

/**
 * Composable que maneja toda la lógica de la vista del Salón de Eventos.
 * MVC: este archivo actúa como el Controlador/Modelo.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos del Salón de Eventos
 */
export function useEvents(emit) {
  const { user, isLoggedIn } = useAuth()
  const { fetchEvents, createBooking } = useEventsApi()

  /* ----------------------------------------------------------
     SALONES Y TIPOS DE EVENTO (Modelo) — cargados desde la API
     ---------------------------------------------------------- */
  const salons = ref([])
  const tiposEvento = ref([])
  const eventsLoading = ref(false)
  const eventsError = ref(null)

  /* ----------------------------------------------------------
     CAROUSEL DATA
     ---------------------------------------------------------- */
  const carouselSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=600&fit=crop',
      title: 'Bodas de Ensueño',
      subtitle: 'Celebra tu amor con una boda inolvidable en nuestros salones',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=600&fit=crop',
      title: '15 Años Espectaculares',
      subtitle: 'Tu fiesta de quince años, un sueño hecho realidad',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=600&fit=crop',
      title: 'Cumpleaños Inolvidables',
      subtitle: 'Celebra cada año con estilo y elegancia',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=600&fit=crop',
      title: 'Eventos Corporativos',
      subtitle: 'Profesionalismo y distinción para tu empresa',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=600&fit=crop',
      title: 'Tu Estilo, Tu Evento',
      subtitle: 'Diseñamos experiencias personalizadas para cada ocasión',
    },
  ]

  /* ----------------------------------------------------------
     TESTIMONIALS
     ---------------------------------------------------------- */
  const testimonials = [
    {
      id: 1,
      name: 'María & Carlos',
      event: 'Boda Diamante',
      text: 'La boda de nuestros sueños. Cada detalle fue perfecto, desde la decoración hasta el banquete. El equipo de Asogema hizo de nuestro día algo mágico e inolvidable.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    {
      id: 2,
      name: 'Sofía Martínez',
      event: '15 Años Reina',
      text: 'Mi fiesta de 15 fue espectacular. La coreografía, el vestido, todo fue perfecto. Mis amigas aún hablan de lo increíble que fue la celebración.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    {
      id: 3,
      name: 'Grupo Empresarial GM',
      event: 'Corporativo Platinum',
      text: 'Un nivel de profesionalismo excepcional. Nuestra convención anual fue todo un éxito gracias al impecable servicio y organización de Asogema.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
  ]

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */
  const isVisible = ref(false)
  const selectedSalon = ref(null)
  const showBookingForm = ref(false)
  const isSubmitting = ref(false)
  const showSuccess = ref(false)
  const bookingResult = ref(null)
  const errors = ref({})
  const currentSlide = ref(0)
  const currentTestimonial = ref(0)
  let carouselTimer = null
  let testimonialTimer = null

  /* ----------------------------------------------------------
     RESERVATION FORM STATE
     ---------------------------------------------------------- */
  const fecha = ref('')
  const horaInicio = ref('')
  const horaFin = ref('')
  const personas = ref(2)
  const tipoEventoId = ref('')
  const observaciones = ref('')

  /* ----------------------------------------------------------
     COMPUTED
     ---------------------------------------------------------- */
  const totalSlides = computed(() => carouselSlides.length)
  const totalTestimonials = computed(() => testimonials.length)

  const today = computed(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })

  const currentUserName = computed(() => {
    return user.value?.name || ''
  })

  const timeSlots = computed(() => {
    const slots = []
    for (let hour = 8; hour <= 23; hour++) {
      const padded = String(hour).padStart(2, '0')
      slots.push(`${padded}:00`)
      if (hour !== 23) {
        slots.push(`${padded}:30`)
      }
    }
    return slots
  })

  const validEndSlots = computed(() => {
    if (!horaInicio.value) return timeSlots.value
    return timeSlots.value.filter((slot) => slot > horaInicio.value)
  })

  const selectedSalonObj = computed(() => {
    if (!selectedSalon.value) return null
    return salons.value.find((s) => s.id === selectedSalon.value.id) || null
  })

  const selectedTipoNombre = computed(() => {
    const tipo = tiposEvento.value.find((t) => t.id === Number(tipoEventoId.value))
    return tipo ? tipo.name : ''
  })

  const anticipoEstimado = computed(() => {
    const salon = selectedSalonObj.value
    if (!salon) return 0
    return Math.round(salon.basePrice * 0.3)
  })

  const anticipoMostrado = computed(() => {
    if (bookingResult.value && bookingResult.value.anticipo != null) {
      return Math.round(Number(bookingResult.value.anticipo) || 0)
    }
    return anticipoEstimado.value
  })

  const maxPersonas = computed(() => {
    const salon = selectedSalonObj.value
    return salon ? salon.capacity : 1
  })

  /* ----------------------------------------------------------
     UTILITY — helpers de transformación de la API
     ---------------------------------------------------------- */
  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function formatPrice(num) {
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  function transformSalons(apiSalons) {
    return (apiSalons || []).map((salon) => ({
      id: salon.id,
      name: salon.nombre,
      description: salon.descripcion || 'Salón ideal para tu evento especial.',
      capacity: salon.capacidad,
      ubicacion: salon.ubicacion || '',
      basePrice: Number(salon.precio_base) || 0,
      price: formatPrice(Math.round(Number(salon.precio_base) || 0)),
      badge: `${salon.capacidad} puestos`,
      image: `https://picsum.photos/seed/${slugify(salon.nombre)}/600/400`,
    }))
  }

  function transformTipos(apiTipos) {
    return (apiTipos || []).map((tipo) => ({
      id: tipo.id,
      name: tipo.nombre,
    }))
  }

  async function loadEvents() {
    eventsLoading.value = true
    eventsError.value = null
    try {
      const data = await fetchEvents()
      salons.value = transformSalons(data.salones)
      tiposEvento.value = transformTipos(data.tipos_evento)
    } catch (err) {
      eventsError.value = 'No se pudieron cargar los salones de eventos'
      console.error('Error loading events:', err)
    } finally {
      eventsLoading.value = false
    }
  }

  /* ----------------------------------------------------------
     METHODS — Salon selection / Booking
     ---------------------------------------------------------- */
  function showSalonDetail(salon) {
    selectedSalon.value = salon
  }

  function closeSalonDetail() {
    selectedSalon.value = null
  }

  function openBookingForm(salon) {
    selectedSalon.value = salon
    fecha.value = ''
    horaInicio.value = ''
    horaFin.value = ''
    personas.value = 2
    tipoEventoId.value = ''
    observaciones.value = ''
    errors.value = {}
    showBookingForm.value = true
  }

  function closeBookingForm() {
    showBookingForm.value = false
    errors.value = {}
  }

  function incrementPersonas() {
    if (personas.value < maxPersonas.value) personas.value++
  }

  function decrementPersonas() {
    if (personas.value > 1) personas.value--
  }

  function validate() {
    const errs = {}
    if (!tipoEventoId.value) errs.tipoEvento = 'Selecciona el tipo de evento'
    if (!fecha.value) {
      errs.fecha = 'La fecha es obligatoria'
    } else if (fecha.value < today.value) {
      errs.fecha = 'La fecha no puede ser anterior a hoy'
    }
    if (!horaInicio.value) errs.horaInicio = 'La hora de inicio es obligatoria'
    if (!horaFin.value) {
      errs.horaFin = 'La hora de fin es obligatoria'
    } else if (horaInicio.value && horaFin.value <= horaInicio.value) {
      errs.horaFin = 'La hora de fin debe ser posterior a la de inicio'
    }
    if (!personas.value || personas.value < 1) errs.personas = 'Indica el número de personas'
    if (personas.value > maxPersonas.value) {
      errs.personas = `Máximo ${maxPersonas.value} personas para este salón`
    }
    errors.value = errs
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    // Gate de login: la reserva requiere sesión iniciada
    if (!isLoggedIn.value) {
      if (emit) emit('navigate', 'login')
      return
    }

    isSubmitting.value = true

    try {
      const bookingData = {
        salon_id: Number(selectedSalon.value.id),
        tipo_evento_id: Number(tipoEventoId.value),
        fecha: fecha.value,
        hora_inicio: `${fecha.value}T${horaInicio.value}:00`,
        hora_fin: `${fecha.value}T${horaFin.value}:00`,
        cantidad_personas: personas.value,
        observaciones: observaciones.value || undefined,
      }

      const result = await createBooking(bookingData)
      bookingResult.value = result

      isSubmitting.value = false
      showBookingForm.value = false
      showSuccess.value = true
    } catch (err) {
      isSubmitting.value = false
      if (err.response?.status === 409) {
        errors.value.general = err.response?.data?.message || 'El salón no está disponible en ese horario'
      } else if (err.response?.status === 404) {
        errors.value.general = err.response?.data?.message || 'El salón no fue encontrado'
      } else if (err.response?.data?.message) {
        const msg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message
        errors.value.general = msg
      } else {
        errors.value.general = 'Error al crear la reserva. Intenta de nuevo.'
      }
    }
  }

  function resetForm() {
    fecha.value = ''
    horaInicio.value = ''
    horaFin.value = ''
    personas.value = 2
    tipoEventoId.value = ''
    observaciones.value = ''
    errors.value = {}
    selectedSalon.value = null
    bookingResult.value = null
    showSuccess.value = false
  }

  function closeSuccess() {
    resetForm()
  }

  /* ----------------------------------------------------------
     METHODS — Carousel
     ---------------------------------------------------------- */
  function startCarousel() {
    stopCarousel()
    carouselTimer = setInterval(() => {
      currentSlide.value = (currentSlide.value + 1) % carouselSlides.length
    }, 5000)
  }

  function stopCarousel() {
    if (carouselTimer) {
      clearInterval(carouselTimer)
      carouselTimer = null
    }
  }

  function goToSlide(index) {
    currentSlide.value = index
    startCarousel()
  }

  function nextSlide() {
    currentSlide.value = (currentSlide.value + 1) % carouselSlides.length
    startCarousel()
  }

  function prevSlide() {
    currentSlide.value = (currentSlide.value - 1 + carouselSlides.length) % carouselSlides.length
    startCarousel()
  }

  /* ----------------------------------------------------------
     METHODS — Navigation
     ---------------------------------------------------------- */
  function goBackToHome() {
    if (emit) {
      emit('navigate', 'index')
    }
  }

  function goToLogin() {
    if (emit) {
      emit('navigate', 'login')
    }
  }

  function nextTestimonial() {
    currentTestimonial.value = (currentTestimonial.value + 1) % testimonials.length
  }

  /* ----------------------------------------------------------
     LIFECYCLE
     ---------------------------------------------------------- */
  onMounted(() => {
    requestAnimationFrame(() => {
      isVisible.value = true
    })
    startCarousel()
    loadEvents()
  })

  onUnmounted(() => {
    stopCarousel()
    if (testimonialTimer) {
      clearInterval(testimonialTimer)
    }
  })

  /* ----------------------------------------------------------
     RETURN
     ---------------------------------------------------------- */
  return {
    // Data
    salons,
    tiposEvento,
    eventsLoading,
    eventsError,
    carouselSlides,
    testimonials,
    // State
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
    currentTestimonial,
    // Computed
    totalSlides,
    totalTestimonials,
    today,
    currentUserName,
    timeSlots,
    validEndSlots,
    selectedSalonObj,
    selectedTipoNombre,
    anticipoEstimado,
    anticipoMostrado,
    maxPersonas,
    formatPrice,
    // Methods - Salon / Booking
    showSalonDetail,
    closeSalonDetail,
    openBookingForm,
    closeBookingForm,
    incrementPersonas,
    decrementPersonas,
    handleSubmit,
    resetForm,
    closeSuccess,
    // Methods - Carousel
    goToSlide,
    nextSlide,
    prevSlide,
    // Methods - Navigation
    goBackToHome,
    goToLogin,
    nextTestimonial,
    loadEvents,
  }
}
