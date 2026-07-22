import { ref, onMounted } from 'vue'

/**
 * Composable que maneja toda la lógica de la vista del Hotel.
 * MVC: este archivo actúa como el Controlador/Modelo.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @param {import('vue').ComputedRef<boolean>} isLoggedIn - Estado reactivo de autenticación
 * @returns {object} Estado reactivo y métodos del Hotel
 */
export function useHotel(emit, isLoggedIn) {
  /* ----------------------------------------------------------
     HOTEL DATA (Modelo)
     ---------------------------------------------------------- */
  const hotel = {
    titulo: 'Hotel Asogema',
    descripcion: 'Habitaciones y suites de lujo con diseño contemporáneo, cada una ofrece una vista única al paisaje circundante. Disfruta de comodidad, privacidad y un servicio de clase mundial que hará de tu estadía una experiencia inolvidable.',
    etiqueta: 'Alojamiento 5 estrellas',
    imagen: 'https://picsum.photos/id/1043/800/600',
    badge: 'Habitaciones desde $120/noche',
    features: [
      { icon: 'clock', label: 'Check-in 24/7' },
      { icon: 'wifi', label: 'Wifi Premium' },
      { icon: 'document', label: 'Business Center' },
      { icon: 'shield', label: 'Seguridad 24h' },
      { icon: 'pool', label: 'Piscina Climatizada' },
      { icon: 'spa', label: 'Spa & Wellness' },
    ]
  }

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */
  const isVisible = ref(false)

  /* ----------------------------------------------------------
     METHODS
     ---------------------------------------------------------- */
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

  /**
   * Si el usuario ya inició sesión, va directo a reservas.
   * Si no, lo lleva al login.
   */
  function handleReserveClick() {
    if (isLoggedIn && isLoggedIn.value) {
      goToReservation()
    } else {
      goToLogin()
    }
  }

  function goBackToHome() {
    if (emit) {
      emit('navigate', 'index')
    }
  }

  /* ----------------------------------------------------------
     ICON MAP
     ---------------------------------------------------------- */
  function getFeatureIcon(type) {
    switch (type) {
      case 'clock':
        return 'clock'
      case 'wifi':
        return 'wifi'
      case 'document':
        return 'document'
      case 'shield':
        return 'shield'
      case 'pool':
        return 'pool'
      case 'spa':
        return 'spa'
      default:
        return 'clock'
    }
  }

  /* ----------------------------------------------------------
     LIFECYCLE
     ---------------------------------------------------------- */
  onMounted(() => {
    requestAnimationFrame(() => {
      isVisible.value = true
    })
  })

  /* ----------------------------------------------------------
     RETURN
     ---------------------------------------------------------- */
  return {
    // Data
    hotel,
    // State
    isVisible,
    // Methods
    goToLogin,
    goToReservation,
    handleReserveClick,
    goBackToHome,
    getFeatureIcon,
  }
}
