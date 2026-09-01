import { ref, computed, watch, onMounted } from 'vue'
import { useAuth } from './useAuth.js'
import { useRestaurantApi } from './useRestaurantApi.js'

/**
 * Composable para la reserva de mesas del Restaurante.
 */
export function useTableReservation(emit) {
  const { user, isLoggedIn } = useAuth()
  const { fetchTables, createReservation } = useRestaurantApi()

  /* ----------------------------------------------------------
     DATA
     ---------------------------------------------------------- */
  const RESERVATION_DATA = {
    restaurantName: 'Restaurante Asogema',
    address: 'Vía principal, Asogema',
    phone: '+57 300 000 0000',
    email: 'restaurante@asogema.com',
    openingHours: 'Lun-Dom: 7:00 AM - 11:00 PM',
  }

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30',
  ]

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */
  const isVisible = ref(false)
  const date = ref('')
  const time = ref('')
  const guests = ref(2)
  const occasion = ref('')
  const specialRequests = ref('')
  const isSubmitting = ref(false)
  const showSuccess = ref(false)
  const reservationResult = ref(null)
  const errors = ref({})
  const submitError = ref('')

  /* ----------------------------------------------------------
     TABLES STATE (from API)
     ---------------------------------------------------------- */
  const tables = ref([])
  const tablesLoading = ref(false)
  const tablesError = ref(null)
  const selectedTable = ref(null)

  /* ----------------------------------------------------------
     COMPUTED
     ---------------------------------------------------------- */
  const today = computed(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })

  const currentUserName = computed(() => {
    return user.value?.name || ''
  })

  const isFormValid = computed(() => {
    return date.value && time.value && selectedTable.value && guests.value >= 1
  })

  const totalGuests = computed(() => guests.value)

  /**
   * Indica si una franja horaria ya pasó para el día seleccionado.
   * Solo aplica cuando la fecha elegida es hoy; se exige al menos 60 minutos
   * de anticipación para dar margen de preparación.
   */
  const isTimeDisabled = computed(() => {
    return (slot) => {
      const now = new Date()
      const localToday =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      if (date.value !== localToday) return false
      const [hh, mm] = String(slot).split(':').map(Number)
      if (isNaN(hh) || isNaN(mm)) return false
      const slotMinutes = hh * 60 + mm
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      return slotMinutes <= nowMinutes + 60
    }
  })

  /* ----------------------------------------------------------
     METHODS
     ---------------------------------------------------------- */
  function incrementGuests() {
    if (guests.value < 20) guests.value++
  }

  function decrementGuests() {
    if (guests.value > 1) guests.value--
  }

  function selectTable(table) {
    selectedTable.value = table
    errors.value.mesa = ''
  }

  function validate() {
    const errs = {}
    if (!date.value) errs.date = 'La fecha es obligatoria'
    if (!time.value) errs.time = 'La hora es obligatoria'
    if (!selectedTable.value) errs.mesa = 'Selecciona una mesa'
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
    submitError.value = ''

    try {
      const reservationData = {
        mesa_id: Number(selectedTable.value.id),
        fecha: date.value,
        hora: `${date.value}T${time.value}:00`,
        cantidad_personas: guests.value,
        motivo: occasion.value || undefined,
        observaciones: specialRequests.value || undefined,
      }

      const result = await createReservation(reservationData)
      reservationResult.value = result

      isSubmitting.value = false
      showSuccess.value = true
      submitError.value = ''
    } catch (err) {
      isSubmitting.value = false
      if (err.response?.status === 409) {
        const msg = err.response?.data?.message || 'La mesa no está disponible en esa fecha y hora'
        errors.value.mesa = msg
        submitError.value = msg
      } else if (err.response?.status === 404) {
        const msg = err.response?.data?.message || 'La mesa no fue encontrada'
        errors.value.mesa = msg
        submitError.value = msg
      } else if (err.response?.data?.message) {
        const msg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message
        errors.value.mesa = msg
        submitError.value = msg
      } else {
        errors.value.mesa = 'Error al crear la reserva. Intenta de nuevo.'
        submitError.value = 'Error al crear la reserva. Intenta de nuevo.'
      }
    }
  }

  function resetForm() {
    date.value = ''
    time.value = ''
    guests.value = 2
    occasion.value = ''
    specialRequests.value = ''
    selectedTable.value = null
    reservationResult.value = null
    tables.value = []
    tablesError.value = null
    errors.value = {}
    submitError.value = ''
    showSuccess.value = false
  }

  function closeSuccess() {
    showSuccess.value = false
  }

  function goToPayment() {
    const url = reservationResult.value?.payment?.checkout_url
    if (url) {
      window.location.href = url
    }
  }

  function goBackToHome() {
    if (emit) emit('navigate', 'index')
  }

  function goBackToRestaurant() {
    if (emit) emit('navigate', 'restaurant')
  }

  function goToMyReservations() {
    if (emit) emit('navigate', 'profile')
  }

  /* ----------------------------------------------------------
     API DATA TRANSFORMATION
     ---------------------------------------------------------- */
  function transformTables(apiTables) {
    return apiTables.map((table) => ({
      id: table.id,
      label: `Mesa ${table.numero}`,
      capacidad: table.capacidad,
      ubicacion: table.ubicacion || '',
    }))
  }

  async function loadTables() {
    if (!date.value || !time.value) {
      tables.value = []
      selectedTable.value = null
      return
    }

    tablesLoading.value = true
    tablesError.value = null

    try {
      const apiTables = await fetchTables({
        fecha: date.value,
        hora: `${date.value}T${time.value}:00`,
        capacidad_min: guests.value,
      })
      tables.value = transformTables(apiTables)
      // Reiniciar la selección si la mesa ya no está disponible
      if (selectedTable.value && !tables.value.some(t => t.id === selectedTable.value.id)) {
        selectedTable.value = null
      }
    } catch (err) {
      tablesError.value = 'No se pudieron cargar las mesas disponibles'
      tables.value = []
      selectedTable.value = null
      console.error('Error loading tables:', err)
    } finally {
      tablesLoading.value = false
    }
  }

  /* ----------------------------------------------------------
     WATCH — Reload available tables when date/time/guests change
     ---------------------------------------------------------- */
  watch([date, time, guests], () => {
    if (selectedTable.value && !isFormValid.value) {
      selectedTable.value = null
    }
    submitError.value = ''
    // Si la hora seleccionada dejó de estar disponible (p. ej. cambió el día),
    // se limpia para forzar una nueva selección.
    if (time.value && isTimeDisabled.value(time.value)) {
      time.value = ''
    }
    loadTables()
  })

  /* ----------------------------------------------------------
     LIFECYCLE
     ---------------------------------------------------------- */
  onMounted(() => {
    requestAnimationFrame(() => {
      isVisible.value = true
    })
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    date.value = tomorrow.toISOString().split('T')[0]
  })

  /* ----------------------------------------------------------
     RETURN
     ---------------------------------------------------------- */
  return {
    RESERVATION_DATA,
    timeSlots,
    isVisible,
    date,
    time,
    guests,
    occasion,
    specialRequests,
    isSubmitting,
    showSuccess,
    reservationResult,
    errors,
    submitError,
    today,
    currentUserName,
    isFormValid,
    totalGuests,
    isTimeDisabled,
    // Tables
    tables,
    tablesLoading,
    tablesError,
    selectedTable,
    selectTable,
    // Methods
    incrementGuests,
    decrementGuests,
    handleSubmit,
    resetForm,
    goToPayment,
    closeSuccess,
    goBackToHome,
    goBackToRestaurant,
    goToMyReservations,
    loadTables,
  }
}
