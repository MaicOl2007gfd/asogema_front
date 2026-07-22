import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useAuth } from './useAuth.js'

/**
 * Composable que maneja la lógica del Dashboard (logged-in).
 * Incluye el saludo al usuario y la lógica de reservas integrada.
 * MVC: este archivo actúa como el Controlador/Modelo.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos del Dashboard
 */
export function useDashboard(emit) {
  /* ----------------------------------------------------------
     AUTH
     ---------------------------------------------------------- */
  const { user, logout } = useAuth()

  /* ----------------------------------------------------------
     ROOM DATA
     ---------------------------------------------------------- */
  const ROOM_TYPES = [
    {
      value: 'standard',
      label: 'Habitación Estándar',
      price: 120,
      capacity: 2,
      desc: 'Cómoda habitación con cama queen, ideal para viajeros solitarios o parejas.',
      fullDesc: 'Disfruta de una estancia acogedora en nuestra Habitación Estándar, equipada con una cama queen size de alta comodidad, escritorio de trabajo, TV de pantalla plana, aire acondicionado y baño privado con dador de agua caliente.',
      image: 'https://picsum.photos/id/1043/600/400',
      features: ['Cama Queen', 'WiFi Gratis', 'TV LED 32"', 'Aire Acondicionado', 'Baño Privado', 'Escritorio'],
    },
    {
      value: 'double',
      label: 'Habitación Doble',
      price: 160,
      capacity: 4,
      desc: 'Dos camas dobles, ideal para familias o grupos pequeños.',
      fullDesc: 'Nuestra Habitación Doble ofrece dos camas dobles cómodas y espaciosas, perfectas para familias con niños o grupos de amigos. Incluye TV por cable, WiFi de alta velocidad, minibar, cafetera eléctrica y baño completo.',
      image: 'https://picsum.photos/id/1044/600/400',
      features: ['2 Camas Dobles', 'WiFi Gratis', 'TV LED 40"', 'Minibar', 'Cafetera', 'Baño Completo'],
    },
    {
      value: 'suite',
      label: 'Suite Ejecutiva',
      price: 250,
      capacity: 3,
      desc: 'Suite con sala de estar y vista panorámica al paisaje.',
      fullDesc: 'La Suite Ejecutiva combina elegancia y funcionalidad con una sala de estar independiente, amplio dormitorio con cama king size y una impresionante vista panorámica de los alrededores.',
      image: 'https://picsum.photos/id/1045/600/400',
      features: ['Cama King', 'Sala de Estar', 'Vista Panorámica', 'WiFi Premium', 'TV LED 50"', 'Room Service'],
    },
    {
      value: 'premium',
      label: 'Suite Premium',
      price: 380,
      capacity: 4,
      desc: 'Suite de lujo con jacuzzi y terraza privada.',
      fullDesc: 'Sumérgete en el lujo de nuestra Suite Premium, que cuenta con un dormitorio principal con cama king size, jacuzzi privado de hidromasaje, terraza exclusiva con muebles de exterior, vestidor y baño de mármol.',
      image: 'https://picsum.photos/id/1048/600/400',
      features: ['Cama King', 'Jacuzzi Privado', 'Terraza Exclusiva', 'Vestidor', 'Baño de Mármol', 'Ducha tipo Lluvia'],
    },
    {
      value: 'master',
      label: 'Suite Master',
      price: 520,
      capacity: 6,
      desc: 'La máxima experiencia, dos habitaciones y sala amplia.',
      fullDesc: 'Nuestra Suite Master es el pináculo del alojamiento en Hotel Asogema: dos amplios dormitorios con camas king size, una sala de estar espaciosa con comedor, cocina equipada, dos baños completos y una terraza panorámica.',
      image: 'https://picsum.photos/id/1049/600/400',
      features: ['2 Camas King', '2 Baños', 'Sala + Comedor', 'Cocina Equipada', 'Terraza Panorámica', 'Mayordomo Privado'],
    },
  ]

  /* ----------------------------------------------------------
     SEARCH & FILTER STATE
     ---------------------------------------------------------- */
  const searchQuery = ref('')
  const showRoomDetail = ref(false)
  const selectedRoomDetail = ref(null)

  const filteredRooms = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return ROOM_TYPES
    return ROOM_TYPES.filter(room =>
      room.label.toLowerCase().includes(q) ||
      room.desc.toLowerCase().includes(q) ||
      room.fullDesc.toLowerCase().includes(q) ||
      room.features.some(f => f.toLowerCase().includes(q)) ||
      room.value.toLowerCase().includes(q)
    )
  })

  function openRoomDetail(room) {
    selectedRoomDetail.value = room
    showRoomDetail.value = true
  }

  function closeRoomDetail() {
    showRoomDetail.value = false
    selectedRoomDetail.value = null
  }

  const showBookingPanel = ref(false)

  function selectRoomFromCard(roomValue) {
    roomType.value = roomValue
    showBookingPanel.value = true
    closeRoomDetail()
    // Reset guests to minimum for selected room
    guests.value = Math.min(3, selectedRoom.value?.capacity || 3)
    setTimeout(() => {
      const panelEl = document.getElementById('booking-panel')
      if (panelEl) {
        panelEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }

  function closeBookingPanel() {
    showBookingPanel.value = false
  }

  /* ----------------------------------------------------------
     FORM STATE
     ---------------------------------------------------------- */
  const checkIn = ref('')
  const checkOut = ref('')
  const roomType = ref('standard')
  const guests = ref(3)
  const fullName = ref('')
  const phone = ref('')
  const specialRequests = ref('')

  /* ----------------------------------------------------------
     ERRORS
     ---------------------------------------------------------- */
  const errors = ref({
    checkIn: '',
    checkOut: '',
    fullName: '',
    phone: '',
    guests: '',
  })

  /* ----------------------------------------------------------
     UI STATE
     ---------------------------------------------------------- */
  const isSubmitting = ref(false)
  const showSuccess = ref(false)
  const isVisible = ref(false)

  /* ----------------------------------------------------------
     COMPUTED
     ---------------------------------------------------------- */
  const MIN_GUESTS = 3

  const selectedRoom = computed(() => {
    return ROOM_TYPES.find(r => r.value === roomType.value) || ROOM_TYPES[0]
  })

  const nights = computed(() => {
    if (!checkIn.value || !checkOut.value) return 0
    const start = new Date(checkIn.value)
    const end = new Date(checkOut.value)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  })

  const maxGuests = computed(() => {
    return selectedRoom.value.capacity
  })

  const guestWarning = computed(() => {
    if (guests.value > maxGuests.value) {
      return `Máximo ${maxGuests.value} huéspedes para ${selectedRoom.value.label.toLowerCase()}`
    }
    if (guests.value < MIN_GUESTS) {
      return `Mínimo ${MIN_GUESTS} personas por habitación`
    }
    return ''
  })

  const isFormValid = computed(() => {
    return (
      checkIn.value &&
      checkOut.value &&
      nights.value > 0 &&
      fullName.value.trim() &&
      phone.value.trim() &&
      guests.value >= MIN_GUESTS &&
      guests.value <= maxGuests.value
    )
  })

  const subtotal = computed(() => {
    return selectedRoom.value.price * nights.value
  })

  const tax = computed(() => {
    return subtotal.value * 0.10
  })

  const total = computed(() => {
    return subtotal.value + tax.value
  })

  /* ----------------------------------------------------------
     METHODS
     ---------------------------------------------------------- */
  function getUserInitials() {
    if (!user.value) return '?'
    return user.value.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function incrementGuests() {
    if (guests.value < maxGuests.value) guests.value++
  }

  function decrementGuests() {
    if (guests.value > MIN_GUESTS) guests.value--
  }

  function getToday() {
    return new Date().toISOString().split('T')[0]
  }

  function scrollToGallery() {
    const el = document.querySelector('.room-gallery-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleLogout() {
    logout()
    if (emit) {
      emit('navigate', 'index')
    }
  }

  function goBackToHome() {
    if (emit) {
      emit('navigate', 'index')
    }
  }

  function validateForm() {
    const newErrors = {
      checkIn: '',
      checkOut: '',
      fullName: '',
      phone: '',
      guests: '',
    }
    let isValid = true

    if (!checkIn.value) {
      newErrors.checkIn = 'Selecciona fecha de entrada'
      isValid = false
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (new Date(checkIn.value) < today) {
        newErrors.checkIn = 'La fecha no puede ser en el pasado'
        isValid = false
      }
    }

    if (!checkOut.value) {
      newErrors.checkOut = 'Selecciona fecha de salida'
      isValid = false
    } else if (checkIn.value && new Date(checkOut.value) <= new Date(checkIn.value)) {
      newErrors.checkOut = 'La salida debe ser después de la entrada'
      isValid = false
    }

    if (!fullName.value.trim()) {
      newErrors.fullName = 'El nombre es obligatorio'
      isValid = false
    }

    if (!phone.value.trim()) {
      newErrors.phone = 'El teléfono es obligatorio'
      isValid = false
    } else if (!/^\+?\d{7,15}$/.test(phone.value.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Teléfono inválido'
      isValid = false
    }

    if (guests.value < MIN_GUESTS) {
      newErrors.guests = `Mínimo ${MIN_GUESTS} personas`
      isValid = false
    }

    if (guests.value > maxGuests.value) {
      newErrors.guests = `Máximo ${maxGuests.value} personas`
      isValid = false
    }

    errors.value = newErrors
    return isValid
  }

  async function handleSubmit() {
    if (!validateForm()) return

    isSubmitting.value = true
    await new Promise((resolve) => setTimeout(resolve, 1800))
    isSubmitting.value = false
    showSuccess.value = true
  }

  function closeSuccess() {
    showSuccess.value = false
  }

  function resetForm() {
    checkIn.value = ''
    checkOut.value = ''
    roomType.value = 'standard'
    guests.value = 3
    fullName.value = ''
    phone.value = ''
    specialRequests.value = ''
    errors.value = {
      checkIn: '',
      checkOut: '',
      fullName: '',
      phone: '',
      guests: '',
    }
  }

  /* ----------------------------------------------------------
     WATCH
     ---------------------------------------------------------- */
  watch(checkIn, (newVal) => {
    if (checkOut.value && new Date(checkOut.value) <= new Date(newVal)) {
      checkOut.value = ''
    }
  })

  /* ----------------------------------------------------------
     LIFECYCLE
     ---------------------------------------------------------- */
  onMounted(() => {
    // Pre-fill user data if available
    if (user.value) {
      fullName.value = user.value.name || ''
      phone.value = user.value.phone || ''
    }
    requestAnimationFrame(() => {
      isVisible.value = true
    })
  })

  /* ----------------------------------------------------------
     RETURN
     ---------------------------------------------------------- */
  return {
    // Auth
    user,
    getUserInitials,
    handleLogout,
    goBackToHome,
    // Room types
    ROOM_TYPES,
    // Form state
    checkIn,
    checkOut,
    roomType,
    guests,
    fullName,
    phone,
    specialRequests,
    // Errors
    errors,
    // UI
    isSubmitting,
    showSuccess,
    isVisible,
    showBookingPanel,
    // Computed
    selectedRoom,
    nights,
    subtotal,
    tax,
    total,
    maxGuests,
    guestWarning,
    isFormValid,
    MIN_GUESTS,
    // Search & Filter
    searchQuery,
    showRoomDetail,
    selectedRoomDetail,
    filteredRooms,
    // Methods
    incrementGuests,
    decrementGuests,
    getToday,
    scrollToGallery,
    validateForm,
    handleSubmit,
    closeSuccess,
    resetForm,
    openRoomDetail,
    closeRoomDetail,
    selectRoomFromCard,
    closeBookingPanel,
  }
}
