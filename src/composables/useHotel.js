import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'
import { useHotelApi } from './useHotelApi.js'

/**
 * Hotel Composable — estado singleton (module scope).
 *
 * Controla toda la experiencia del Hotel:
 *  1. Catálogo de habitaciones con filtros por fecha y ocupantes.
 *  2. Detalle de habitación (galería, servicios, tarifa).
 *  3. Reserva de habitación (consumida por ReservationView).
 *  4. Mis reservas de hotel (historial + cancelar).
 *
 * Como el estado vive a nivel de módulo, HotelView y ReservationView
 * comparten la misma selección de habitación al navegar entre vistas.
 */

const { user, isLoggedIn } = useAuth()
const hotelApi = useHotelApi()

/* ----------------------------------------------------------
   CONSTANTS & HELPERS
   ---------------------------------------------------------- */
const MIN_GUESTS = 1

// Semillas de imágenes estables (picsum) para las galerías.
const SEED_POOL = [1043, 1044, 1047, 1048, 1050, 1057, 1060, 1063, 1068, 1074, 1080, 1081]

function isoDate(date) {
  return date.toISOString().split('T')[0]
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function normalizeStatus(s) {
  if (!s) return 'pendiente'
  const map = {
    CONFIRMADA: 'confirmada',
    CONFIRMED: 'confirmada',
    CHECK_IN: 'check-in',
    CHECKIN: 'check-in',
    CHECK_OUT: 'check-out',
    CHECKOUT: 'check-out',
    PENDIENTE: 'pendiente',
    CANCELADA: 'cancelada',
    CANCELLED: 'cancelada',
    COMPLETADA: 'completada',
  }
  return map[s] || String(s).toLowerCase()
}

function formatDate(value) {
  if (!value) return '—'
  const s = String(value).slice(0, 10)
  const d = new Date(`${s}T00:00:00`)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value) {
  if (value == null || isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

/* ----------------------------------------------------------
   ROOM CATALOG (rooms)
   ---------------------------------------------------------- */
const rooms = ref([])
const roomsLoading = ref(false)
const roomsError = ref(null)

/* ----------------------------------------------------------
   FILTERS (fecha y ocupantes)
   ---------------------------------------------------------- */
const filterCheckIn = ref(isoDate(addDays(new Date(), 1)))
const filterCheckOut = ref(isoDate(addDays(new Date(), 2)))
const filterGuests = ref(1)

/* ----------------------------------------------------------
   ROOM DETAIL MODAL
   ---------------------------------------------------------- */
const showRoomDetail = ref(false)
const selectedRoomDetail = ref(null)
const activeGalleryIndex = ref(0)

/* ----------------------------------------------------------
   BOOKING SELECTION (compartida con ReservationView)
   ---------------------------------------------------------- */
const selectedRoom = ref(null)
const checkIn = ref('')
const checkOut = ref('')
const guests = ref(1)
const specialRequests = ref('')

/* ----------------------------------------------------------
   SUBMIT STATE
   ---------------------------------------------------------- */
const isSubmitting = ref(false)
const showSuccess = ref(false)
const errors = ref({ checkIn: '', checkOut: '', guests: '' })

/* ----------------------------------------------------------
   MY BOOKINGS
   ---------------------------------------------------------- */
const bookings = ref([])
const bookingsLoading = ref(false)
const bookingsError = ref(null)
const bookingToCancel = ref(null)
const showCancelConfirm = ref(false)
const isCancelling = ref(false)

/* ----------------------------------------------------------
   UI STATE
   ---------------------------------------------------------- */
const isVisible = ref(false)
const activeTab = ref('catalog')

/* ----------------------------------------------------------
   COMPUTED
   ---------------------------------------------------------- */
const filteredRooms = computed(() => {
  const min = filterGuests.value || MIN_GUESTS
  return rooms.value.filter((room) => room.capacity >= min)
})

const nights = computed(() => {
  if (!checkIn.value || !checkOut.value) return 0
  const start = new Date(`${checkIn.value}T00:00:00`)
  const end = new Date(`${checkOut.value}T00:00:00`)
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
})

const maxGuests = computed(() => selectedRoom.value?.capacity || 0)

const subtotal = computed(() => (selectedRoom.value?.price || 0) * nights.value)
const tax = computed(() => subtotal.value * 0.10)
const total = computed(() => subtotal.value + tax.value)

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

/* ----------------------------------------------------------
   DATA TRANSFORMATION
   ---------------------------------------------------------- */
function roomGallery(index) {
  const n = SEED_POOL.length
  const seeds = [
    SEED_POOL[index % n],
    SEED_POOL[(index + 2) % n],
    SEED_POOL[(index + 5) % n],
    SEED_POOL[(index + 9) % n],
  ]
  return seeds.map((seed, i) => ({
    src: `https://picsum.photos/id/${seed}/960/620`,
    alt: i === 0 ? 'Vista principal de la habitación' : `Vista ${i + 1} de la habitación`,
  }))
}

function transformRoomData(apiRooms) {
  return (apiRooms || []).map((room, index) => {
    const tipo = room.tipos_habitacion
    const label = tipo?.nombre || `Habitación ${room.numero || index + 1}`
    const desc =
      tipo?.descripcion ||
      room.descripcion ||
      'Habitación cómoda y acogedora con todos los servicios para una estancia inolvidable.'
    const isSuite = String(label).toLowerCase().includes('suite')
    return {
      value: `room_${room.id}`,
      id: room.id,
      numero: room.numero,
      label,
      price: Number(tipo?.precio_noche || 0),
      capacity: tipo?.capacidad || 1,
      desc,
      fullDesc: desc,
      image: roomGallery(index)[0].src,
      gallery: roomGallery(index),
      features: [
        isSuite ? 'Cama King' : 'Cama Queen',
        'WiFi Premium',
        'TV LED 55"',
        'Aire Acondicionado',
        'Baño Privado',
        'Minibar',
        'Servicio a la Habitación',
        'Caja Fuerte',
      ],
    }
  })
}

function transformBooking(raw) {
  const roomInfo = raw.habitacion || raw.habitaciones || raw.tipo_habitacion || null
  let roomName = 'Habitación'
  if (typeof roomInfo === 'object' && roomInfo) {
    roomName =
      roomInfo.nombre ||
      roomInfo.tipos_habitacion?.nombre ||
      (roomInfo.numero ? `Habitación ${roomInfo.numero}` : roomName)
  } else if (roomInfo) {
    roomName = String(roomInfo)
  }
  return {
    id: raw.id,
    checkIn: raw.fecha_entrada || raw.entrada || '',
    checkOut: raw.fecha_salida || raw.salida || '',
    guests: raw.cantidad_huespedes || raw.personas || 1,
    status: normalizeStatus(raw.estado),
    roomName,
    total: Number(raw.total || 0),
    observaciones: raw.observaciones || raw.observaciones_extra || '',
  }
}

/* ----------------------------------------------------------
   METHODS — CATALOG
   ---------------------------------------------------------- */
function getToday() {
  return isoDate(new Date())
}

function incrementFilterGuests() {
  if (filterGuests.value < 12) filterGuests.value++
}

function decrementFilterGuests() {
  if (filterGuests.value > MIN_GUESTS) filterGuests.value--
}

async function loadRooms() {
  roomsLoading.value = true
  roomsError.value = null
  try {
    const params = {}
    if (filterCheckIn.value) params.fecha_entrada = filterCheckIn.value
    if (filterCheckOut.value) params.fecha_salida = filterCheckOut.value
    if (filterGuests.value > MIN_GUESTS) params.capacidad_min = filterGuests.value

    const apiRooms = await hotelApi.fetchRooms(params)
    rooms.value = transformRoomData(apiRooms)
  } catch (err) {
    roomsError.value = 'No se pudieron cargar las habitaciones disponibles'
    console.error('Error loading rooms:', err)
  } finally {
    roomsLoading.value = false
  }
}

function applyFilters() {
  // Si la salida no es posterior a la entrada, se limpia.
  if (
    filterCheckIn.value &&
    filterCheckOut.value &&
    new Date(filterCheckOut.value) <= new Date(filterCheckIn.value)
  ) {
    filterCheckOut.value = ''
  }
  loadRooms()
}

function clearFilters() {
  filterCheckIn.value = ''
  filterCheckOut.value = ''
  filterGuests.value = 1
  loadRooms()
}

/* ----------------------------------------------------------
   METHODS — ROOM DETAIL
   ---------------------------------------------------------- */
function openRoomDetail(room) {
  selectedRoomDetail.value = room
  activeGalleryIndex.value = 0
  showRoomDetail.value = true
}

function closeRoomDetail() {
  showRoomDetail.value = false
  selectedRoomDetail.value = null
}

function nextGalleryImage() {
  if (!selectedRoomDetail.value) return
  activeGalleryIndex.value =
    (activeGalleryIndex.value + 1) % selectedRoomDetail.value.gallery.length
}

function prevGalleryImage() {
  if (!selectedRoomDetail.value) return
  activeGalleryIndex.value =
    (activeGalleryIndex.value - 1 + selectedRoomDetail.value.gallery.length) %
    selectedRoomDetail.value.gallery.length
}

function setGalleryImage(index) {
  activeGalleryIndex.value = index
}

/* ----------------------------------------------------------
   METHODS — RESERVATION
   ---------------------------------------------------------- */
function incrementGuests() {
  if (guests.value < maxGuests.value) guests.value++
}

function decrementGuests() {
  if (guests.value > MIN_GUESTS) guests.value--
}

function startReservation(room, emit) {
  if (!room) return
  selectedRoom.value = room
  checkIn.value = filterCheckIn.value || isoDate(addDays(new Date(), 1))
  checkOut.value = filterCheckOut.value || isoDate(addDays(new Date(), 2))
  guests.value = Math.min(filterGuests.value || 1, room.capacity)
  specialRequests.value = ''
  errors.value = { checkIn: '', checkOut: '', guests: '' }
  if (emit) emit('navigate', 'hotel-reservation')
}

function validateForm() {
  const newErrors = { checkIn: '', checkOut: '', guests: '' }
  let isValid = true

  if (!checkIn.value) {
    newErrors.checkIn = 'Selecciona la fecha de entrada'
    isValid = false
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (new Date(`${checkIn.value}T00:00:00`) < today) {
      newErrors.checkIn = 'La fecha no puede ser en el pasado'
      isValid = false
    }
  }

  if (!checkOut.value) {
    newErrors.checkOut = 'Selecciona la fecha de salida'
    isValid = false
  } else if (checkIn.value && new Date(`${checkOut.value}T00:00:00`) <= new Date(`${checkIn.value}T00:00:00`)) {
    newErrors.checkOut = 'La salida debe ser después de la entrada'
    isValid = false
  }

  if (guests.value < MIN_GUESTS) {
    newErrors.guests = `Mínimo ${MIN_GUESTS} persona(s)`
    isValid = false
  }

  if (selectedRoom.value && guests.value > maxGuests.value) {
    newErrors.guests = `Máximo ${maxGuests.value} persona(s)`
    isValid = false
  }

  errors.value = newErrors
  return isValid
}

async function handleSubmit(emit) {
  if (!validateForm()) return

  if (!isLoggedIn.value) {
    if (emit) emit('navigate', 'login')
    return
  }

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

    await hotelApi.createBooking(bookingData)

    isSubmitting.value = false
    showSuccess.value = true
    // Refrescar el historial de reservas para reflejar la nueva reserva.
    loadBookings()
  } catch (err) {
    isSubmitting.value = false
    if (err.response?.status === 409) {
      errors.value.checkIn = err.response?.data?.message || 'La habitación no está disponible para esas fechas'
    } else if (err.response?.status === 404) {
      errors.value.checkIn = err.response?.data?.message || 'La habitación no fue encontrada'
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

function resetForm() {
  checkIn.value = ''
  checkOut.value = ''
  guests.value = 1
  specialRequests.value = ''
  errors.value = { checkIn: '', checkOut: '', guests: '' }
}

/* ----------------------------------------------------------
   METHODS — MY BOOKINGS
   ---------------------------------------------------------- */
async function loadBookings() {
  // El endpoint es privado: si el usuario no está autenticado se evita
  // disparar un 401 que provocaría el recargo de sesión.
  if (!isLoggedIn.value) {
    bookings.value = []
    bookingsLoading.value = false
    bookingsError.value = null
    return
  }
  bookingsLoading.value = true
  bookingsError.value = null
  try {
    const data = await hotelApi.fetchMyBookings()
    bookings.value = (data || []).map(transformBooking)
  } catch (err) {
    bookingsError.value = 'No se pudieron cargar tus reservas de hotel'
    console.error('Error loading bookings:', err)
  } finally {
    bookingsLoading.value = false
  }
}

function requestCancel(booking) {
  bookingToCancel.value = booking
  showCancelConfirm.value = true
}

function closeCancelConfirm() {
  showCancelConfirm.value = false
  bookingToCancel.value = null
}

async function confirmCancel() {
  if (!bookingToCancel.value) return
  isCancelling.value = true
  try {
    await hotelApi.cancelBooking(bookingToCancel.value.id)
    const target = bookings.value.find((b) => b.id === bookingToCancel.value.id)
    if (target) target.status = 'cancelada'
    closeCancelConfirm()
  } catch (err) {
    bookingsError.value =
      err.response?.data?.message || 'No se pudo cancelar la reserva. Intenta de nuevo.'
    closeCancelConfirm()
  } finally {
    isCancelling.value = false
  }
}

/* ----------------------------------------------------------
   NAVIGATION
   ---------------------------------------------------------- */
function goBackToHome(emit) {
  if (emit) emit('navigate', 'index')
}

function goBackToHotel(emit) {
  if (emit) emit('navigate', 'hotel')
}

function switchTab(tab) {
  activeTab.value = tab
}

/* ----------------------------------------------------------
   EXPORT
   ---------------------------------------------------------- */
export function useHotel(emit) {
  return {
    // Auth
    user,
    isLoggedIn,
    // Shared data
    rooms,
    roomsLoading,
    roomsError,
    // Filters
    filterCheckIn,
    filterCheckOut,
    filterGuests,
    filteredRooms,
    // Detail modal
    showRoomDetail,
    selectedRoomDetail,
    activeGalleryIndex,
    // Booking selection
    selectedRoom,
    checkIn,
    checkOut,
    guests,
    specialRequests,
    // Submit
    isSubmitting,
    showSuccess,
    errors,
    // Computed
    nights,
    maxGuests,
    subtotal,
    tax,
    total,
    isFormValid,
    MIN_GUESTS,
    // My bookings
    bookings,
    bookingsLoading,
    bookingsError,
    bookingToCancel,
    showCancelConfirm,
    isCancelling,
    // UI
    isVisible,
    activeTab,
    // Helpers
    formatDate,
    formatCurrency,
    getToday,
    // Catalog methods
    loadRooms,
    applyFilters,
    clearFilters,
    incrementFilterGuests,
    decrementFilterGuests,
    // Detail methods
    openRoomDetail,
    closeRoomDetail,
    nextGalleryImage,
    prevGalleryImage,
    setGalleryImage,
    // Reservation methods
    startReservation,
    incrementGuests,
    decrementGuests,
    validateForm,
    handleSubmit,
    resetForm,
    closeSuccess() {
      showSuccess.value = false
    },
    // Bookings methods
    loadBookings,
    requestCancel,
    closeCancelConfirm,
    confirmCancel,
    // Navigation
    goBackToHome,
    goBackToHotel,
    switchTab,
  }
}
