import { ref, onMounted } from 'vue'
import api from './useApi.js'
import { DOCUMENT_TYPES, DOC_TYPE_IDS } from './documentTypes.js'
import { resolveError } from './useErrorMessage.js'

/**
 * Composable que maneja toda la lógica del formulario de registro.
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos del registro
 */
export function useRegister(emit) {
  const firstName = ref('')
  const secondName = ref('')
  const firstSurname = ref('')
  const secondSurname = ref('')
  const docType = ref('CC')
  const docNumber = ref('')
  const phone = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const birthDate = ref('')
  const acceptTerms = ref(false)
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const isLoading = ref(false)
  const isVisible = ref(false)

  const firstNameError = ref('')
  const secondNameError = ref('')
  const firstSurnameError = ref('')
  const secondSurnameError = ref('')
  const docTypeError = ref('')
  const docNumberError = ref('')
  const phoneError = ref('')
  const emailError = ref('')
  const passwordError = ref('')
  const confirmPasswordError = ref('')
  const birthDateError = ref('')
  const termsError = ref('')
  const errorMessage = ref('')

  const typingFirstName = ref(false)
  const typingSecondName = ref(false)
  const typingFirstSurname = ref(false)
  const typingSecondSurname = ref(false)
  const typingDocNumber = ref(false)
  const typingPhone = ref(false)
  const typingEmail = ref(false)
  const typingPassword = ref(false)
  const typingConfirmPassword = ref(false)
  const typingBirthDate = ref(false)

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword.value = !showConfirmPassword.value
  }

  /** Formatea la fecha como DD/MM/AAAA mientras se escribe. */
  function formatBirthDateInput(e) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    birthDate.value = formatted
  }

  /** Convierte "DD/MM/AAAA" a "AAAA-MM-DD" (ISO) para la API. */
  function birthDateToISO(value) {
    if (!value) return ''
    const parts = value.split('/')
    if (parts.length !== 3) return ''
    const [dd, mm, yyyy] = parts
    return `${yyyy}-${mm}-${dd}`
  }

  const MIN_BIRTH_YEAR = 1900

  /** Valida la fecha de nacimiento en formato "DD/MM/AAAA".
   *  Devuelve un mensaje de error o null si es válida. */
  function validateBirthDate(value) {
    if (!value) return 'Obligatorio'

    const parts = value.split('/')
    if (parts.length !== 3) return 'Formato inválido (DD/MM/AAAA)'

    const [ddStr, mmStr, yyyyStr] = parts
    if (ddStr.length !== 2 || mmStr.length !== 2 || yyyyStr.length !== 4) {
      return 'Formato inválido (DD/MM/AAAA)'
    }

    const dd = Number(ddStr)
    const mm = Number(mmStr)
    const yyyy = Number(yyyyStr)
    if (Number.isNaN(dd) || Number.isNaN(mm) || Number.isNaN(yyyy)) {
      return 'Fecha inválida'
    }

    if (mm < 1 || mm > 12) return 'Mes inválido'

    if (yyyy < MIN_BIRTH_YEAR) return `El año debe ser ${MIN_BIRTH_YEAR} o posterior`

    const daysInMonth = new Date(yyyy, mm, 0).getDate()
    if (dd < 1 || dd > daysInMonth) return 'Día inválido para ese mes'

    const date = new Date(yyyy, mm - 1, dd)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date > today) return 'La fecha no puede ser futura'

    return null
  }

  function validateForm() {
    let isValid = true
    firstNameError.value = ''
    secondNameError.value = ''
    firstSurnameError.value = ''
    secondSurnameError.value = ''
    docTypeError.value = ''
    docNumberError.value = ''
    phoneError.value = ''
    emailError.value = ''
    passwordError.value = ''
    confirmPasswordError.value = ''
    birthDateError.value = ''
    termsError.value = ''

    // Primer nombre (required)
    if (!firstName.value.trim()) {
      firstNameError.value = 'Obligatorio'
      isValid = false
    }

    // Primer apellido (required)
    if (!firstSurname.value.trim()) {
      firstSurnameError.value = 'Obligatorio'
      isValid = false
    }

    // Tipo de documento (always selected by default, but validate)
    if (!docType.value) {
      docTypeError.value = 'Selecciona un tipo'
      isValid = false
    }

    // Número de documento (required)
    if (!docNumber.value.trim()) {
      docNumberError.value = 'Obligatorio'
      isValid = false
    }

    // Teléfono (required)
    if (!phone.value.trim()) {
      phoneError.value = 'Obligatorio'
      isValid = false
    } else if (!/^\+?\d{7,15}$/.test(phone.value.replace(/[\s-]/g, ''))) {
      phoneError.value = 'Teléfono inválido'
      isValid = false
    }

    // Email (required)
    if (!email.value) {
      emailError.value = 'Obligatorio'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      emailError.value = 'Correo inválido'
      isValid = false
    }

    // Contraseña (required)
    if (!password.value) {
      passwordError.value = 'Obligatorio'
      isValid = false
    } else if (password.value.length < 6) {
      passwordError.value = 'Mínimo 6 caracteres'
      isValid = false
    }

    // Confirmar contraseña (required)
    if (!confirmPassword.value) {
      confirmPasswordError.value = 'Obligatorio'
      isValid = false
    } else if (password.value !== confirmPassword.value) {
      confirmPasswordError.value = 'No coinciden'
      isValid = false
    }

    // Fecha de nacimiento (required para poder pagar)
    const birthError = validateBirthDate(birthDate.value)
    if (birthError) {
      birthDateError.value = birthError
      isValid = false
    }
    
    // Términos
    if (!acceptTerms.value) {
      termsError.value = 'Debes aceptar los términos'
      isValid = false
    }

    return isValid
  }

  async function handleSubmit() {
    if (!validateForm()) return

    isLoading.value = true
    errorMessage.value = ''

    try {
      await api.post('/auth/users', {
        nombre: [firstName.value, secondName.value].filter(Boolean).join(' '),
        apellido: [firstSurname.value, secondSurname.value].filter(Boolean).join(' '),
        tipo_documento_id: DOC_TYPE_IDS[docType.value] ?? 1,
        numero_documento: docNumber.value,
        correo: email.value,
        password: password.value,
        telefono: phone.value || undefined,
        fecha_nacimiento: birthDateToISO(birthDate.value),
      })

      isLoading.value = false

      localStorage.setItem('asogema_pending_verify', email.value)

      if (emit) {
        emit('navigate', 'verify-email')
      }
    } catch (err) {
      isLoading.value = false

      const { field, message } = resolveError(err)

      if (field === 'email') {
        emailError.value = message
      } else if (field === 'docNumber') {
        docNumberError.value = message
      } else {
        errorMessage.value = message
      }
    }
  }

  onMounted(() => {
    requestAnimationFrame(() => {
      isVisible.value = true
    })
  })

  return {
    // Constants
    DOCUMENT_TYPES,
    // State
    firstName,
    secondName,
    firstSurname,
    secondSurname,
    docType,
    docNumber,
    phone,
    email,
    password,
    confirmPassword,
    birthDate,
    acceptTerms,
    showPassword,
    showConfirmPassword,
    isLoading,
    isVisible,
    // Errors
    firstNameError,
    secondNameError,
    firstSurnameError,
    secondSurnameError,
    docTypeError,
    docNumberError,
    phoneError,
    emailError,
    passwordError,
    confirmPasswordError,
    birthDateError,
    termsError,
    errorMessage,
    // Typing flags
    typingFirstName,
    typingSecondName,
    typingFirstSurname,
    typingSecondSurname,
    typingDocNumber,
    typingPhone,
    typingEmail,
    typingPassword,
    typingConfirmPassword,
    typingBirthDate,
    // Methods
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    formatBirthDateInput,
    handleSubmit,
  }
}
