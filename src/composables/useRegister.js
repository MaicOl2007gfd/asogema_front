import { ref, onMounted } from 'vue'
import api from './useApi.js'

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'NIT', label: 'NIT' },
  { value: 'CD', label: 'Carné Diplomático' },
]

const DOC_TYPE_IDS = { CC: 1, CE: 2, PAS: 3, RC: 4, NIT: 5, CD: 6 }

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

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword.value = !showConfirmPassword.value
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
      })

      isLoading.value = false

      localStorage.setItem('asogema_pending_verify', email.value)

      if (emit) {
        emit('navigate', 'verify-email')
      }
    } catch (err) {
      isLoading.value = false
      if (err.response?.status === 409) {
        errorMessage.value = 'Este correo ya está registrado'
      } else if (err.response?.data?.message) {
        errorMessage.value = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message
      } else {
        errorMessage.value = 'Error de conexión. Intenta de nuevo.'
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
    // Methods
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleSubmit,
  }
}
