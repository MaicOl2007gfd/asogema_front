import { ref, nextTick } from 'vue'

/**
 * Composable que maneja la lógica de la página de inicio (Index).
 * MVC: este archivo actúa como el Controlador/Modelo.
 *
 * Organización profesional del landing (flujo UX):
 *   Hero  →  Stats  →  Nosotros  →  Experiencias  →  Servicios  →  Historia  →  CTA  →  Footer
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos del Index
 */
export function useIndex(emit) {
  /* ----------------------------------------------------------
     SLIDES DATA (Modelo) — Hero carousel
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
      EXPERIENCIAS DATA (Modelo) — Hotel · Restaurante · Eventos
     ---------------------------------------------------------- */
  const experiencias = [
    {
      id: 'hotel',
      titulo: 'Hotel & Suites',
      descripcion: 'Habitaciones y suites de lujo con diseño contemporáneo. Disfruta de comodidad, privacidad y un servicio de clase mundial con vistas únicas al paisaje.',
      etiqueta: 'Alojamiento 5 estrellas',
      imagen: 'https://picsum.photos/id/164/800/1000',
      icon: 'hotel',
      features: ['Check-in 24/7', 'Wifi Premium', 'Business Center', 'Seguridad 24h'],
      cta: 'Reservar Ahora',
      action: 'hotel'
    },
    {
      id: 'restaurante',
      titulo: 'Restaurante',
      descripcion: 'Una propuesta culinaria donde cada plato es una obra de arte. Ingredientes frescos, sabores auténticos y un ambiente acogedor te esperan.',
      etiqueta: 'Alta cocina',
      imagen: 'https://picsum.photos/id/431/800/1000',
      icon: 'restaurant',
      features: ['Chef Internacional', 'Menú Degustación', 'Vinos Premium', 'Ambiente Acogedor'],
      cta: 'Reservar Mesa',
      action: 'restaurant'
    },
    {
      id: 'eventos',
      titulo: 'Salón de Eventos',
      descripcion: 'Espacios diseñados para hacer realidad tus celebraciones. Salones modernos, jardines exuberantes y un equipo profesional listo para tu evento.',
      etiqueta: 'Capacidad hasta 300 pers.',
      imagen: 'https://picsum.photos/id/42/800/1000',
      icon: 'events',
      features: ['Salones Modernos', 'Equipo Profesional', 'Jardines Exclusivos', 'Eventos a Medida'],
      cta: 'Cotizar Evento',
      action: 'events'
    }
  ]

  /* ----------------------------------------------------------
     FEATURES DATA (Modelo) — Servicios / Por qué elegirnos
     ---------------------------------------------------------- */
  const features = [
    {
      title: 'Piscinas',
      desc: 'Espacios acuáticos para refrescarte y disfrutar en familia durante todo el año.',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>'
    },
    {
      title: 'Zonas verdes',
      desc: 'Más de siete hectáreas de naturaleza ideal para caminar, meditar y conectar con el entorno.',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>'
    },
    {
      title: 'Deporte',
      desc: 'Canchas y escenarios deportivos para mantenerte activo y compartir con amigos y familia.',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
    },
    {
      title: 'Salones para eventos',
      desc: 'Escenarios modernos y versátiles para bodas, conferencias, cumpleaños y celebraciones.',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
    },
    {
      title: 'Seguridad 24/7',
      desc: 'Instalaciones vigiladas y accesos controlados para que tu tranquilidad sea siempre primero.',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
    },
    {
      title: 'Ambiente familiar',
      desc: 'Un espacio pensado para fortalecer lazos, crear recuerdos y compartir momentos inolvidables.',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
    }
  ]

  /* ----------------------------------------------------------
     TESTIMONIALS DATA (Modelo) — Reseñas de huéspedes
     ---------------------------------------------------------- */
  const testimonials = [
    {
      name: 'María Fernanda Ruiz',
      role: 'Huésped del Hotel',
      text: 'Una experiencia de otro nivel. La atención, la tranquilidad y la belleza del lugar superaron todas mis expectativas. Sin duda volveré.',
      rating: 5
    },
    {
      name: 'Carlos Andrés Gómez',
      role: 'Asociado ASOGEMA',
      text: 'El espacio perfecto para compartir en familia. Cada rincón está pensado para el descanso y la integración. Un verdadero paraíso en Ibagué.',
      rating: 5
    },
    {
      name: 'Laura Patricia Vega',
      role: 'Organizadora de Eventos',
      text: 'Celebramos nuestra boda en el salón principal y fue impecable. Profesionalismo, elegancia y un equipo que hizo todo mágico.',
      rating: 5
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
    // 2. Mantener visible
    setTimeout(() => {
      splashState.value = 'open'
    }, 1000)
    // 3. Cascada sube
    setTimeout(() => {
      splashState.value = 'closing'
    }, 1500)
    // 4. Eliminar del DOM
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
    features,
    testimonials,
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
