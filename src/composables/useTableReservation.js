import { ref, computed, onMounted } from 'vue'

/**
 * Composable para la reserva de mesas del Restaurante.
 */
export function useTableReservation(emit) {
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
  const fullName = ref('')
  const email = ref('')
  const phone = ref('')
  const date = ref('')
  const time = ref('')
  const guests = ref(2)
  const occasion = ref('')
  const specialRequests = ref('')
  const isSubmitting = ref(false)
  const showSuccess = ref(false)
  const errors = ref({})

  /* ----------------------------------------------------------
     COMPUTED
     ---------------------------------------------------------- */
  const today = computed(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })

  const isFormValid = computed(() => {
    return fullName.value && email.value && phone.value && date.value && time.value
  })

  const totalGuests = computed(() => guests.value)

  /* ----------------------------------------------------------
     METHODS
     ---------------------------------------------------------- */
  function incrementGuests() {
    if (guests.value < 20) guests.value++
  }

  function decrementGuests() {
    if (guests.value > 1) guests.value--
  }

  function validate() {
    const errs = {}
    if (!fullName.value.trim()) errs.fullName = 'El nombre es obligatorio'
    if (!email.value.trim()) errs.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) errs.email = 'Correo inválido'
    if (!phone.value.trim()) errs.phone = 'El teléfono es obligatorio'
    if (!date.value) errs.date = 'La fecha es obligatoria'
    if (!time.value) errs.time = 'La hora es obligatoria'
    errors.value = errs
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) return

    isSubmitting.value = true

    // Simulate API call
    setTimeout(() => {
      isSubmitting.value = false
      showSuccess.value = true

      console.log('Reserva de mesa:', {
        nombre: fullName.value,
        email: email.value,
        telefono: phone.value,
        fecha: date.value,
        hora: time.value,
        invitados: guests.value,
        ocasion: occasion.value,
        notas: specialRequests.value,
      })
    }, 1500)
  }

  function resetForm() {
    fullName.value = ''
    email.value = ''
    phone.value = ''
    date.value = ''
    time.value = ''
    guests.value = 2
    occasion.value = ''
    specialRequests.value = ''
    errors.value = {}
    showSuccess.value = false
  }

  function closeSuccess() {
    showSuccess.value = false
  }

  function goBackToHome() {
    if (emit) emit('navigate', 'index')
  }

  function goBackToRestaurant() {
    if (emit) emit('navigate', 'restaurant')
  }

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
    fullName,
    email,
    phone,
    date,
    time,
    guests,
    occasion,
    specialRequests,
    isSubmitting,
    showSuccess,
    errors,
    today,
    isFormValid,
    totalGuests,
    incrementGuests,
    decrementGuests,
    handleSubmit,
    resetForm,
    closeSuccess,
    goBackToHome,
    goBackToRestaurant,
  }
}
