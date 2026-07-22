import { ref, computed, watch } from 'vue'

/**
 * Composable que maneja toda la lógica del formulario de reserva de hotel.
 * MVC: este archivo actúa como el Controlador/Modelo.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos de la reserva
 */
export function useReservation(emit) {
  /* ----------------------------------------------------------
     ROOM DATA (Modelo)
     ---------------------------------------------------------- */
  const ROOM_TYPES = [
    {
      value: 'standard',
      label: 'Habitación Estándar',
      price: 120,
      capacity: 2,
      desc: 'Cómoda habitación con cama queen, ideal para viajeros solitarios o parejas.',
      fullDesc: 'Disfruta de una estancia acogedora en nuestra Habitación Estándar, equipada con una cama queen size de alta comodidad, escritorio de trabajo, TV de pantalla plana, aire acondicionado y baño privado con dador de agua caliente. Perfecta para quienes buscan confort y funcionalidad a un precio accesible.',
      image: 'https://picsum.photos/id/1043/600/400',
      features: ['Cama Queen', 'WiFi Gratis', 'TV LED 32"', 'Aire Acondicionado', 'Baño Privado', 'Escritorio'],
    },
    {
      value: 'double',
      label: 'Habitación Doble',
      price: 160,
      capacity: 4,
      desc: 'Dos camas dobles, ideal para familias o grupos pequeños.',
      fullDesc: 'Nuestra Habitación Doble ofrece dos camas dobles cómodas y espaciosas, perfectas para familias con niños o grupos de amigos. Incluye todas las comodidades esenciales como TV por cable, WiFi de alta velocidad, minibar, cafetera eléctrica y un amplio baño con artículos de tocador gratuitos.',
      image: 'https://picsum.photos/id/1044/600/400',
      features: ['2 Camas Dobles', 'WiFi Gratis', 'TV LED 40"', 'Minibar', 'Cafetera', 'Baño Completo'],
    },
    {
      value: 'suite',
      label: 'Suite Ejecutiva',
      price: 250,
      capacity: 3,
      desc: 'Suite con sala de estar y vista panorámica al paisaje.',
      fullDesc: 'La Suite Ejecutiva combina elegancia y funcionalidad con una sala de estar independiente, amplio dormitorio con cama king size y una impresionante vista panorámica de los alrededores. Ideal para viajeros de negocios o parejas que buscan una experiencia superior con espacio para trabajar y relajarse.',
      image: 'https://picsum.photos/id/1045/600/400',
      features: ['Cama King', 'Sala de Estar', 'Vista Panorámica', 'WiFi Premium', 'TV LED 50"', 'Room Service'],
    },
    {
      value: 'premium',
      label: 'Suite Premium',
      price: 380,
      capacity: 4,
      desc: 'Suite de lujo con jacuzzi y terraza privada.',
      fullDesc: 'Sumérgete en el lujo de nuestra Suite Premium, que cuenta con un dormitorio principal con cama king size, jacuzzi privado de hidromasaje, terraza exclusiva con muebles de exterior, vestidor, y un baño de mármol con dador tipo lluvia. La experiencia definitiva para una escapada romántica o una celebración especial.',
      image: 'https://picsum.photos/id/1048/600/400',
      features: ['Cama King', 'Jacuzzi Privado', 'Terraza Exclusiva', 'Vestidor', 'Baño de Mármol', 'Ducha tipo Lluvia'],
    },
    {
      value: 'master',
      label: 'Suite Master',
      price: 520,
      capacity: 6,
      desc: 'La máxima experiencia, dos habitaciones y sala amplia.',
      fullDesc: 'Nuestra Suite Master es el pináculo del alojamiento en Hotel Asogema: dos amplios dormitorios con camas king size, una sala de estar espaciosa con comedor, cocina equipada, dos baños completos y una terraza panorámica con vistas de 180 grados. Perfecta para familias numerosas o grupos que buscan lo mejor de lo mejor.',
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

  function selectRoomFromCard(roomValue) {
    roomType.value = roomValue
    closeRoomDetail()
    setTimeout(() => {
      const formEl = document.querySelector('.reservation-form-section')
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }

  /* ----------------------------------------------------------
     FORM STATE
     ---------------------------------------------------------- */
  const checkIn = ref('')
  const checkOut = ref('')
  const roomType = ref('standard')
  const adults = ref(2)
  const children = ref(0)
  const numRooms = ref(1)
  const fullName = ref('')
  const email = ref('')
  const phone = ref('')
  const specialRequests = ref('')

  /* ----------------------------------------------------------
     ERRORS
     ---------------------------------------------------------- */
  const errors = ref({
    checkIn: '',
    checkOut: '',
    roomType: '',
    adults: '',
    children: '',
    numRooms: '',
    fullName: '',
    email: '',
    phone: '',
  })

  /* ----------------------------------------------------------
     UI STATE
     ---------------------------------------------------------- */
  const isSubmitting = ref(false)
  const showSuccess = ref(false)

  /* ----------------------------------------------------------
     COMPUTED — Summary
     ---------------------------------------------------------- */
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

  const subtotal = computed(() => {
    return selectedRoom.value.price * nights.value * numRooms.value
  })

  const tax = computed(() => {
    return subtotal.value * 0.10 // 10% tax
  })

  const total = computed(() => {
    return subtotal.value + tax.value
  })

  const totalGuests = computed(() => {
    return adults.value + children.value
  })

  const maxGuests = computed(() => {
    return selectedRoom.value.capacity * numRooms.value
  })

  const guestWarning = computed(() => {
    if (totalGuests.value > maxGuests.value) {
      return `Máximo ${maxGuests.value} huéspedes para ${numRooms.value} habitación(es) ${selectedRoom.value.label.toLowerCase()}`
    }
    return ''
  })

  const isFormValid = computed(() => {
    return (
      checkIn.value &&
      checkOut.value &&
      nights.value > 0 &&
      fullName.value.trim() &&
      email.value.trim() &&
      phone.value.trim() &&
      totalGuests.value <= maxGuests.value &&
      totalGuests.value > 0
    )
  })

  /* ----------------------------------------------------------
     METHODS
     ---------------------------------------------------------- */
  function incrementAdults() {
    if (adults.value < 10) adults.value++
  }

  function decrementAdults() {
    if (adults.value > 1) adults.value--
  }

  function incrementChildren() {
    if (children.value < 8) children.value++
  }

  function decrementChildren() {
    if (children.value > 0) children.value--
  }

  function incrementRooms() {
    if (numRooms.value < 5) numRooms.value++
  }

  function decrementRooms() {
    if (numRooms.value > 1) numRooms.value--
  }

  function validateForm() {
    const newErrors = {
      checkIn: '',
      checkOut: '',
      roomType: '',
      adults: '',
      children: '',
      numRooms: '',
      fullName: '',
      email: '',
      phone: '',
    }
    let isValid = true

    if (!checkIn.value) {
      newErrors.checkIn = 'Selecciona fecha de entrada'
      isValid = false
    }

    if (!checkOut.value) {
      newErrors.checkOut = 'Selecciona fecha de salida'
      isValid = false
    } else if (checkIn.value && new Date(checkOut.value) <= new Date(checkIn.value)) {
      newErrors.checkOut = 'La salida debe ser después de la entrada'
      isValid = false
    }

    if (checkIn.value) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (new Date(checkIn.value) < today) {
        newErrors.checkIn = 'La fecha no puede ser en el pasado'
        isValid = false
      }
    }

    if (!fullName.value.trim()) {
      newErrors.fullName = 'El nombre es obligatorio'
      isValid = false
    }

    if (!email.value.trim()) {
      newErrors.email = 'El correo es obligatorio'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      newErrors.email = 'Correo inválido'
      isValid = false
    }

    if (!phone.value.trim()) {
      newErrors.phone = 'El teléfono es obligatorio'
      isValid = false
    } else if (!/^\+?\d{7,15}$/.test(phone.value.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Teléfono inválido'
      isValid = false
    }

    if (guestWarning.value) {
      isValid = false
    }

    errors.value = newErrors
    return isValid
  }

  async function handleSubmit() {
    if (!validateForm()) return

    isSubmitting.value = true

    // Simulación de envío de reserva
    await new Promise((resolve) => setTimeout(resolve, 1800))

    isSubmitting.value = false
    showSuccess.value = true
  }

  function closeSuccess() {
    showSuccess.value = false
  }

  function goBackToHome() {
    if (emit) {
      emit('navigate', 'index')
    }
  }

  function resetForm() {
    checkIn.value = ''
    checkOut.value = ''
    roomType.value = 'standard'
    adults.value = 2
    children.value = 0
    numRooms.value = 1
    fullName.value = ''
    email.value = ''
    phone.value = ''
    specialRequests.value = ''
    errors.value = {
      checkIn: '',
      checkOut: '',
      roomType: '',
      adults: '',
      children: '',
      numRooms: '',
      fullName: '',
      email: '',
      phone: '',
    }
  }

  /* ----------------------------------------------------------
     WATCH — Reset checkout if checkIn changes after checkout
     ---------------------------------------------------------- */
  watch(checkIn, (newVal) => {
    if (checkOut.value && new Date(checkOut.value) <= new Date(newVal)) {
      checkOut.value = ''
    }
  })

  /* ----------------------------------------------------------
     RETURN
     ---------------------------------------------------------- */
  return {
    // Constants
    ROOM_TYPES,
    // Form state
    checkIn,
    checkOut,
    roomType,
    adults,
    children,
    numRooms,
    fullName,
    email,
    phone,
    specialRequests,
    // Errors
    errors,
    // UI State
    isSubmitting,
    showSuccess,
    // Search & Filter
    searchQuery,
    showRoomDetail,
    selectedRoomDetail,
    filteredRooms,
    // Computed
    selectedRoom,
    nights,
    subtotal,
    tax,
    total,
    totalGuests,
    maxGuests,
    guestWarning,
    isFormValid,
    // Methods
    incrementAdults,
    decrementAdults,
    incrementChildren,
    decrementChildren,
    incrementRooms,
    decrementRooms,
    validateForm,
    handleSubmit,
    closeSuccess,
    goBackToHome,
    resetForm,
    openRoomDetail,
    closeRoomDetail,
    selectRoomFromCard,
  }
}
