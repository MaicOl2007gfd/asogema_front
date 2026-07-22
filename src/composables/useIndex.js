import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Composable que maneja la lógica de la página de inicio (Index).
 * MVC: este archivo actúa como el Controlador/Modelo.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos del Index
 */
export function useIndex(emit) {
  /* ----------------------------------------------------------
     SLIDES DATA (Modelo)
     ---------------------------------------------------------- */
  const slides = [
    {
      id: 1,
      badge: 'Hotel Asogema',
      title: 'Descubre el lujo\ny la <span class="highlight">naturaleza</span>',
      subtitle: 'Habitaciones elegantes con vistas impresionantes, diseñadas para ofrecerte el descanso que mereces en un entorno natural incomparable.',
      primaryBtn: 'Ver Hotel',
      primaryAction: 'scroll-hotel',
      secondaryBtn: 'Reservar Ahora',
      secondaryAction: 'register',
      image: 'https://picsum.photos/id/1044/1600/900'
    },
    {
      id: 2,
      badge: 'Restaurante Asogema',
      title: 'Sabores que\n<span class="highlight">enamoran</span>',
      subtitle: 'Una experiencia gastronómica única donde la cocina tradicional se fusiona con técnicas contemporáneas, creando platos inolvidables.',
      primaryBtn: 'Ver Restaurante',
      primaryAction: 'scroll-restaurante',
      secondaryBtn: 'Hacer Reserva',
      secondaryAction: 'register',
      image: 'https://picsum.photos/id/292/1600/900'
    },
    {
      id: 3,
      badge: 'Salón de Eventos',
      title: 'Crea momentos\n<span class="highlight">inolvidables</span>',
      subtitle: 'Espacios versátiles y sofisticados para bodas, conferencias y celebraciones. Equipados con la mejor tecnología y un equipo de profesionales.',
      primaryBtn: 'Ver Salones',
      primaryAction: 'scroll-eventos',
      secondaryBtn: 'Cotizar Evento',
      secondaryAction: 'events',
      image: 'https://picsum.photos/id/128/1600/900'
    }
  ]

  /* ----------------------------------------------------------
     EXPERIENCIAS DATA (Modelo)
     ---------------------------------------------------------- */
  const experiencias = [
    {
      id: 'hotel',
      titulo: 'Hotel',
      descripcion: 'Habitaciones y suites de lujo con diseño contemporáneo, cada una ofrece una vista única al paisaje circundante. Disfruta de comodidad, privacidad y un servicio de clase mundial que hará de tu estadía una experiencia inolvidable.',
      etiqueta: 'Alojamiento 5 estrellas',
      imagen: 'https://picsum.photos/id/1043/600/400',
      icon: 'hotel'
    },
    {
      id: 'restaurante',
      titulo: 'Restaurante',
      descripcion: 'Déjate sorprender por nuestra propuesta culinaria, donde cada plato es una obra de arte. Ingredientes frescos, sabores auténticos y un ambiente acogedor te esperan para vivir una experiencia gastronómica única.',
      etiqueta: 'Alta cocina',
      imagen: 'https://picsum.photos/id/431/600/400',
      icon: 'restaurant'
    },
    {
      id: 'eventos',
      titulo: 'Salón de Eventos',
      descripcion: 'Espacios diseñados para hacer realidad tus celebraciones. Salones modernos, jardines exuberantes y un equipo profesional listo para organizar bodas, conferencias, cumpleaños y todo tipo de eventos corporativos y sociales.',
      etiqueta: 'Capacidad hasta 300 personas',
      imagen: 'https://picsum.photos/id/42/600/400',
      icon: 'events'
    }
  ]

  /* ----------------------------------------------------------
     CAROUSEL STATE
     ---------------------------------------------------------- */
  const currentSlide = ref(0)
  const totalSlides = slides.length
  const isTransitioning = ref(false)
  let autoPlayTimer = null

  function goToSlide(index) {
    if (isTransitioning.value || index === currentSlide.value) return
    isTransitioning.value = true
    currentSlide.value = index
    setTimeout(() => { isTransitioning.value = false }, 1000)
    resetAutoPlay()
  }

  function nextSlide() {
    goToSlide((currentSlide.value + 1) % totalSlides)
  }

  function prevSlide() {
    goToSlide((currentSlide.value - 1 + totalSlides) % totalSlides)
  }

  function startAutoPlay() {
    stopAutoPlay()
    autoPlayTimer = setInterval(() => { nextSlide() }, 6000)
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer)
      autoPlayTimer = null
    }
  }

  function resetAutoPlay() {
    startAutoPlay()
  }

  function handleSlideAction(action) {
    if (!emit) return
    if (action === 'register') {
      emit('navigate', 'register')
    } else if (action === 'login') {
      emit('navigate', 'login')
    } else if (action === 'events') {
      emit('navigate', 'events')
    } else if (action.startsWith('scroll-')) {
      const target = action.replace('scroll-', '')
      nextTick(() => {
        const el = document.getElementById(target)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    }
  }

  /* ----------------------------------------------------------
     NAVBAR
     ---------------------------------------------------------- */
  const isScrolled = ref(false)
  const mobileMenuOpen = ref(false)

  function handleScroll() {
    isScrolled.value = window.scrollY > 60
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
    document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
    document.body.style.overflow = ''
  }

  function scrollToSection(sectionId) {
    closeMobileMenu()
    nextTick(() => {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  /* ----------------------------------------------------------
     SCROLL REVEAL
     ---------------------------------------------------------- */
  let revealObserver = null

  function initReveal() {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            revealObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    nextTick(() => {
      document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el))
    })
  }

  /* ----------------------------------------------------------
     SPLASH INTRO — se abre por la mitad como cortina
     ---------------------------------------------------------- */
  const showSplash = ref(true)
  const splashState = ref('closed') // closed → opening → open → closing → closed

  function startSplashSequence() {
    // 1. Cascada cae (0ms → 1000ms)
    splashState.value = 'opening'
    // 2. Mantener visible (1000ms → 3000ms)
    setTimeout(() => {
      splashState.value = 'open'
    }, 1000)
    // 3. Cascada sube (3000ms → 3800ms)
    setTimeout(() => {
      splashState.value = 'closing'
    }, 1500)
    // 4. Eliminar del DOM (4000ms)
    setTimeout(() => {
      showSplash.value = false
      document.body.style.overflow = ''
    }, 2000)
  }

  /* ----------------------------------------------------------
     LIFECYCLE
     ---------------------------------------------------------- */
  function onMount() {
    startAutoPlay()
    window.addEventListener('scroll', handleScroll)
    initReveal()
    setTimeout(() => startSplashSequence(), 300)
  }

  function onUnmount() {
    stopAutoPlay()
    window.removeEventListener('scroll', handleScroll)
    document.body.style.overflow = ''
    if (revealObserver) {
      revealObserver.disconnect()
      revealObserver = null
    }
  }

  return {
    slides,
    experiencias,
    currentSlide,
    totalSlides,
    isTransitioning,
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
  }
}
