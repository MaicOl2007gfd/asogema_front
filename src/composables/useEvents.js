import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Composable que maneja toda la lógica de la vista del Salón de Eventos.
 * MVC: este archivo actúa como el Controlador/Modelo.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @param {import('vue').ComputedRef<boolean>} isLoggedIn - Estado reactivo de autenticación
 * @returns {object} Estado reactivo y métodos del Salón de Eventos
 */
export function useEvents(emit, isLoggedIn) {
  /* ----------------------------------------------------------
     CATEGORÍAS DE EVENTOS
     ---------------------------------------------------------- */
  const categories = [
    { id: 'all', label: 'Todos', icon: 'grid' },
    { id: 'bodas', label: 'Bodas', icon: 'heart' },
    { id: 'quince', label: '15 Años', icon: 'star' },
    { id: 'cumpleanos', label: 'Cumpleaños', icon: 'cake' },
    { id: 'corporativo', label: 'Corporativos', icon: 'briefcase' },
    { id: 'personalizado', label: 'Personalizado', icon: 'sparkles' },
  ]

  /* ----------------------------------------------------------
     PAQUETES DE EVENTOS (Modelo)
     ---------------------------------------------------------- */
  const eventPackages = [
    // --- BODAS ---
    {
      id: 1,
      name: 'Boda Esencial',
      description: 'Ceremonia íntima con salón decorado, banquete para 50 invitados, pastel de bodas de 3 pisos y sesión de fotos básica. Incluye coordinador de evento.',
      price: '$8.500.000',
      category: 'bodas',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
      badge: 'Popular',
      includes: [
        'Salón decorado hasta 50 px.',
        'Banquete 3 tiempos',
        'Pastel de bodas 3 pisos',
        'Sesión fotográfica 4h',
        'Coordinador dedicado',
        'Montaje floral básico',
      ],
    },
    {
      id: 2,
      name: 'Boda Premium',
      description: 'Celebración inolvidable para 100 invitados con decoración temática, banquete gourmet, barra libre, fotografía y video profesional, y show musical en vivo.',
      price: '$15.000.000',
      category: 'bodas',
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=400&fit=crop',
      badge: 'Premium',
      includes: [
        'Salón decorado hasta 100 px.',
        'Banquete gourmet 4 tiempos',
        'Barra libre (6h)',
        'Foto y video profesional',
        'Show musical en vivo',
        'Pastel de bodas 5 pisos',
        'Montaje floral completo',
        'Alfombra roja y photobooth',
      ],
    },
    {
      id: 3,
      name: 'Boda Diamante',
      description: 'La experiencia más exclusiva. Hasta 200 invitados, decoración de lujo, menú degustación firmado por chef estrella, espectáculo de fuegos artificiales y luna de miel sorpresa.',
      price: '$32.000.000',
      category: 'bodas',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop',
      badge: 'Diamante',
      includes: [
        'Salón principal + jardines',
        'Menú degustación 7 tiempos',
        'Barra premium ilimitada',
        'Foto, video y drone',
        'Espectáculo de fuegos artificiales',
        'Pastel de bodas 7 pisos',
        'Montaje floral premium',
        'Transporte para invitados',
        'Luna de miel sorpresa',
        'Wedding planner exclusivo',
      ],
    },

    // --- 15 AÑOS ---
    {
      id: 4,
      name: '15 Años Clásico',
      description: 'Fiesta tradicional con salón decorado, banquete para 60 invitados, vals con coreografía, pastel decorado y sesión de fotos.',
      price: '$6.500.000',
      category: 'quince',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop',
      badge: 'Tradicional',
      includes: [
        'Salón decorado hasta 60 px.',
        'Banquete 3 tiempos',
        'Coreografía de vals',
        'Pastel decorado 3 pisos',
        'Sesión fotográfica 3h',
        'Coordinador de evento',
      ],
    },
    {
      id: 5,
      name: '15 Años Soñado',
      description: 'Fiesta de ensueño para 120 invitados con temática personalizada, banquete gourmet, animador, DJ en vivo, cabina de fotos y vestido de fiesta.',
      price: '$12.000.000',
      category: 'quince',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop',
      badge: 'Soñado',
      includes: [
        'Salón decorado hasta 120 px.',
        'Banquete gourmet 4 tiempos',
        'DJ en vivo + animador',
        'Cabina de fotos 360',
        'Pastel decorado 4 pisos',
        'Sesión foto y video',
        'Vestido de fiesta incluido',
        'Coreografía personalizada',
      ],
    },
    {
      id: 6,
      name: '15 Años Reina',
      description: 'La celebración más espectacular. Hasta 250 invitados, show de luces, artista sorpresa, vestido diseñador, maquillaje profesional y recuerdos de lujo.',
      price: '$25.000.000',
      category: 'quince',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
      badge: 'Reina',
      includes: [
        'Salón principal + terraza',
        'Menú degustación 5 tiempos',
        'Show de luces LED',
        'Artista sorpresa',
        'Vestido de diseñador',
        'Maquillaje y peinado prof.',
        'Foto, video y drone',
        'Recuerdos de lujo',
        'Transporte limusina',
        'Animador exclusivo',
      ],
    },

    // --- CUMPLEAÑOS ---
    {
      id: 7,
      name: 'Cumpleaños Dorado',
      description: 'Celebración elegante para 40 invitados con salón privado, banquete ejecutivo, pastel personalizado y decoración con globos y flores.',
      price: '$3.500.000',
      category: 'cumpleanos',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop',
      badge: 'Dorado',
      includes: [
        'Salón privado hasta 40 px.',
        'Banquete ejecutivo 2 tiempos',
        'Pastel personalizado',
        'Decoración globos y flores',
        'Música ambiental',
        'Coordinador básico',
      ],
    },
    {
      id: 8,
      name: 'Cumpleaños Platinum',
      description: 'Fiesta inolvidable para 80 invitados con buffet gourmet, DJ, photobooth, barra de cocteles y pastel de diseño exclusivo.',
      price: '$7.500.000',
      category: 'cumpleanos',
      image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&h=400&fit=crop',
      badge: 'Platinum',
      includes: [
        'Salón hasta 80 invitados',
        'Buffet gourmet 3 tiempos',
        'DJ y equipo de sonido',
        'Cabina de fotos',
        'Barra de cocteles (4h)',
        'Pastel de diseño',
        'Decoración temática',
        'Fotografía 4h',
      ],
    },
    {
      id: 9,
      name: 'Cumpleaños VIP',
      description: 'Experiencia exclusiva para 150 invitados con show en vivo, barra premium, comida de autor, decoración de lujo y recuerdos personalizados.',
      price: '$14.000.000',
      category: 'cumpleanos',
      image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&h=400&fit=crop',
      badge: 'VIP',
      includes: [
        'Salón principal hasta 150 px.',
        'Comida de autor 4 tiempos',
        'Show en vivo (banda)',
        'Barra premium ilimitada',
        'Decoración de lujo',
        'Foto y video profesional',
        'Recuerdos personalizados',
        'Animador y juegos',
        'Coordinador exclusivo',
      ],
    },

    // --- CORPORATIVOS ---
    {
      id: 10,
      name: 'Corporativo Ejecutivo',
      description: 'Sala de conferencias equipada con tecnología audiovisual, coffee break premium, almuerzo ejecutivo y material corporativo.',
      price: '$4.500.000',
      category: 'corporativo',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
      badge: 'Ejecutivo',
      includes: [
        'Sala ejecutiva hasta 40 px.',
        'Equipo AV completo',
        'Coffee break premium',
        'Almuerzo ejecutivo',
        'Material corporativo',
        'Asistente técnico',
      ],
    },
    {
      id: 11,
      name: 'Corporativo Gold',
      description: 'Convención empresarial para 100 personas con salón principal, catering completo, equipo de traducción y organización logística integral.',
      price: '$9.000.000',
      category: 'corporativo',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop',
      badge: 'Gold',
      includes: [
        'Salón principal hasta 100 px.',
        'Catering completo',
        'Equipo de sonido y video',
        'Servicio de traducción',
        'Material promocional',
        'Organización logística',
        'Coordinador de evento',
      ],
    },
    {
      id: 12,
      name: 'Corporativo Platinum',
      description: 'Evento corporativo de alto nivel para 200 invitados. Salones múltiples, producción audiovisual profesional, catering gourmet y entretenimiento.',
      price: '$18.000.000',
      category: 'corporativo',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop',
      badge: 'Platinum',
      includes: [
        'Salones múltiples 200 px.',
        'Producción AV profesional',
        'Catering gourmet',
        'Barra ejecutiva',
        'Entretenimiento corporativo',
        'Foto y video institucional',
        'Transporte ejecutivo',
        'Equipo de producción',
      ],
    },

    // --- PERSONALIZADO ---
    {
      id: 13,
      name: 'Paquete Básico',
      description: 'Ideal para eventos pequeños y reuniones familiares. Incluye salón, decoración sencilla y refrigerio básico. Tú eliges el tema.',
      price: '$2.500.000',
      category: 'personalizado',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop',
      badge: 'Flexible',
      includes: [
        'Salón hasta 30 invitados',
        'Decoración básica',
        'Refrigerio',
        'Mesa principal',
        '2h de coordinación',
      ],
    },
    {
      id: 14,
      name: 'Paquete Personalizado',
      description: 'Diseñamos tu evento a tu medida. Eliges colores, menú, música y cada detalle. Nuestro equipo crea una experiencia única para ti.',
      price: 'A Cotizar',
      category: 'personalizado',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop',
      badge: 'A tu medida',
      includes: [
        'Asesoría personalizada',
        'Diseño de evento único',
        'Menú a elección',
        'Selección musical',
        'Decoración customizada',
        'Coordinador dedicado 24/7',
        'Proveedores seleccionados',
        'Presupuesto transparente',
      ],
    },
  ]

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
  const activeCategory = ref('all')
  const selectedPackage = ref(null)
  const showQuoteForm = ref(false)
  const quoteInquiry = ref({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    guestCount: '',
    eventDate: '',
    packageId: null,
    message: '',
  })
  const quoteSubmitted = ref(false)
  const currentSlide = ref(0)
  const currentTestimonial = ref(0)
  let carouselTimer = null
  let testimonialTimer = null

  /* ----------------------------------------------------------
     COMPUTED
     ---------------------------------------------------------- */
  const totalSlides = computed(() => carouselSlides.length)
  const totalTestimonials = computed(() => testimonials.length)

  const filteredPackages = computed(() => {
    if (activeCategory.value === 'all') {
      return eventPackages
    }
    return eventPackages.filter(pkg => pkg.category === activeCategory.value)
  })

  /* ----------------------------------------------------------
     METHODS — Quote / Inquiry
     ---------------------------------------------------------- */
  function selectPackage(pkg) {
    selectedPackage.value = pkg
    quoteInquiry.value.packageId = pkg.id
  }

  function closePackageDetail() {
    selectedPackage.value = null
  }

  function openQuoteForm(pkg) {
    if (pkg) {
      selectPackage(pkg)
    }
    quoteInquiry.value.eventType = pkg ? pkg.name : ''
    showQuoteForm.value = true
  }

  function closeQuoteForm() {
    showQuoteForm.value = false
    quoteSubmitted.value = false
    if (!selectedPackage.value) {
      quoteInquiry.value = {
        name: '',
        email: '',
        phone: '',
        eventType: '',
        guestCount: '',
        eventDate: '',
        packageId: null,
        message: '',
      }
    }
  }

  function submitQuote() {
    // Simulate inquiry submission
    quoteSubmitted.value = true

    // In a real app, you'd send this to an API
    const inquiryData = {
      ...quoteInquiry.value,
      packageName: selectedPackage.value ? selectedPackage.value.name : quoteInquiry.value.eventType,
      packagePrice: selectedPackage.value ? selectedPackage.value.price : 'A Cotizar',
    }

    console.log('Cotización enviada:', inquiryData)

    // Auto-close after showing success
    setTimeout(() => {
      closeQuoteForm()
      selectedPackage.value = null
    }, 3000)
  }

  function requestCustomQuote() {
    showQuoteForm.value = true
    quoteInquiry.value.eventType = 'Personalizado'
    quoteInquiry.value.packageId = null
    selectedPackage.value = null
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
  function setCategory(categoryId) {
    activeCategory.value = categoryId
  }

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

  function goToReservation() {
    if (emit) {
      emit('navigate', 'dashboard')
    }
  }

  function handleQuoteClick() {
    if (isLoggedIn && isLoggedIn.value) {
      // Open the first package or show all
      if (eventPackages.length > 0) {
        selectPackage(eventPackages[0])
      }
      openQuoteForm(null)
    } else {
      goToLogin()
    }
  }

  /* ----------------------------------------------------------
     UTILITY
     ---------------------------------------------------------- */
  function getCategoryIcon(type) {
    const iconMap = {
      grid: 'grid',
      heart: 'heart',
      star: 'star',
      cake: 'cake',
      briefcase: 'briefcase',
      sparkles: 'sparkles',
    }
    return iconMap[type] || 'grid'
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
    categories,
    eventPackages,
    carouselSlides,
    testimonials,
    // State
    isVisible,
    activeCategory,
    selectedPackage,
    showQuoteForm,
    quoteInquiry,
    quoteSubmitted,
    currentSlide,
    currentTestimonial,
    // Computed
    filteredPackages,
    totalSlides,
    totalTestimonials,
    // Methods - Quote
    selectPackage,
    closePackageDetail,
    openQuoteForm,
    closeQuoteForm,
    submitQuote,
    requestCustomQuote,
    // Methods - Carousel
    goToSlide,
    nextSlide,
    prevSlide,
    // Methods - Navigation
    setCategory,
    handleQuoteClick,
    goBackToHome,
    goToLogin,
    goToReservation,
    // Utility
    getCategoryIcon,
    nextTestimonial,
  }
}
