import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useAuth } from './useAuth.js'
import { useHotelApi } from './useHotelApi.js'

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
  const { fetchRooms, createBooking } = useHotelApi()

  /* ----------------------------------------------------------
     ROOM DATA (from API)
     ---------------------------------------------------------- */
  const rooms = ref([])
  const roomsLoading = ref(false)
  const roomsError = ref(null)

  /* ----------------------------------------------------------
     SEARCH & FILTER STATE
     ---------------------------------------------------------- */
  const searchQuery = ref('')
  const showRoomDetail = ref(false)
  const selectedRoomDetail = ref(null)

  const filteredRooms = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return rooms.value
    return rooms.value.filter(room =>
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
  const roomType = ref('')
  const guests = ref(3)
  const specialRequests = ref('')

  /* ----------------------------------------------------------
     ERRORS
     ---------------------------------------------------------- */
  const errors = ref({
    checkIn: '',
    checkOut: '',
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
  const MIN_GUESTS = 1

  const selectedRoom = computed(() => {
    return rooms.value.find(r => r.value === roomType.value) || rooms.value[0] || null
  })

  const nights = computed(() => {
    if (!checkIn.value || !checkOut.value) return 0
    const start = new Date(checkIn.value)
    const end = new Date(checkOut.value)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  })

  const maxGuests = computed(() => {
    return selectedRoom.value?.capacity || 0
  })

  const guestWarning = computed(() => {
    if (guests.value > maxGuests.value) {
      return `Máximo ${maxGuests.value} huéspedes para ${selectedRoom.value?.label?.toLowerCase() || 'esta habitación'}`
    }
    if (guests.value < MIN_GUESTS) {
      return `Mínimo ${MIN_GUESTS} persona(s) por habitación`
    }
    return ''
  })

  const isFormValid = computed(() => {
    return (
      checkIn.value &&
      checkOut.value &&
      nights.value > 0 &&
      guests.value >= MIN_GUESTS &&
      guests.value <= maxGuests.value &&
      selectedRoom.value !== null
    )
  })

  const subtotal = computed(() => {
    return selectedRoom.value?.price * nights.value || 0
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

    if (guests.value < MIN_GUESTS) {
      newErrors.guests = `Mínimo ${MIN_GUESTS} persona(s)`
      isValid = false
    }

    if (guests.value > maxGuests.value) {
      newErrors.guests = `Máximo ${maxGuests.value} persona(s)`
      isValid = false
    }

    if (!selectedRoom.value) {
      newErrors.guests = 'Selecciona una habitación válida'
      isValid = false
    }

    errors.value = newErrors
    return isValid
  }

  async function handleSubmit() {
    if (!validateForm()) return

    isSubmitting.value = true

    try {
      const bookingData = {
        habitacion_id: Number(selectedRoom.value.id),
        fecha_entrada: checkIn.value,
        fecha_salida: checkOut.value,
        cantidad_huespedes: guests.value,
        total: total.value,
        observaciones: specialRequests.value || undefined,
      }

      await createBooking(bookingData)

      isSubmitting.value = false
      showSuccess.value = true
      resetForm()
    } catch (err) {
      isSubmitting.value = false
      if (err.response?.status === 409) {
        errors.value.checkIn = 'La habitación no está disponible para esas fechas'
      } else if (err.response?.data?.message) {
        const msg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message
        errors.value.checkIn = msg
      } else {
        errors.value.checkIn = 'Error al crear la reserva. Intenta de nuevo.'
      }
    }
  }

  function closeSuccess() {
    showSuccess.value = false
  }

  function resetForm() {
    checkIn.value = ''
    checkOut.value = ''
    roomType.value = rooms.value[0]?.value || ''
    guests.value = 3
    specialRequests.value = ''
    errors.value = {
      checkIn: '',
      checkOut: '',
      guests: '',
    }
    showBookingPanel.value = false
  }

  /* ----------------------------------------------------------
     API DATA TRANSFORMATION
     ---------------------------------------------------------- */
  function transformRoomData(apiRooms) {
    return apiRooms.map((room, index) => {
      const tipo = room.tipos_habitacion
      return {
        value: `room_${room.id}`,
        id: room.id,
        label: tipo?.nombre || `Habitación ${room.numero}`,
        price: Number(tipo?.precio_noche || 0),
        capacity: tipo?.capacidad || 1,
        desc: tipo?.descripcion || room.descripcion || 'Habitación cómoda y acogedora.',
        fullDesc: tipo?.descripcion || room.descripcion || 'Disfruta de una estancia acogedora en nuestras habitaciones.',
        image: `https://picsum.photos/id/${1043 + index}/600/400`,
        features: [
          tipo?.nombre?.includes('Suite') ? 'Cama King' : 'Cama Queen',
          'WiFi Gratis',
          'TV LED',
          'Aire Acondicionado',
          'Baño Privado',
          'Servicio a la Habitación',
        ],
      }
    })
  }

  /* ----------------------------------------------------------
     LOAD ROOMS FROM API
     ---------------------------------------------------------- */
  async function loadRooms() {
    roomsLoading.value = true
    roomsError.value = null
    try {
      const apiRooms = await fetchRooms({
        fecha_entrada: checkIn.value || undefined,
        fecha_salida: checkOut.value || undefined,
      })
      rooms.value = transformRoomData(apiRooms)
      // Set default room type if not set
      if (!roomType.value && rooms.value.length > 0) {
        roomType.value = rooms.value[0].value
      }
    } catch (err) {
      roomsError.value = 'No se pudieron cargar las habitaciones'
      console.error('Error loading rooms:', err)
    } finally {
      roomsLoading.value = false
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

  // Reload rooms when dates change (to check availability)
  watch([checkIn, checkOut], () => {
    if (checkIn.value && checkOut.value) {
      loadRooms()
    }
  })

  /* ----------------------------------------------------------
     LIFECYCLE
     ---------------------------------------------------------- */
  onMounted(async () => {
    requestAnimationFrame(() => {
      isVisible.value = true
    })
    // Load rooms from API
    await loadRooms()
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
    // Room types (from API)
    rooms,
    roomsLoading,
    roomsError,
    // Form state
    checkIn,
    checkOut,
    roomType,
    guests,
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
    loadRooms,
  }
}