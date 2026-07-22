import { ref, onMounted } from 'vue'
import { login as authLogin } from './useAuth.js'

/**
 * Composable que maneja toda la lógica del formulario de inicio de sesión.
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos del login
 */
export function useLogin(emit) {
  const email = ref('')
  const password = ref('')
  const remember = ref(false)
  const showPassword = ref(false)
  const isLoading = ref(false)
  const isVisible = ref(false)
  const emailError = ref('')
  const passwordError = ref('')

  const typingEmail = ref(false)
  const typingPassword = ref(false)

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value
  }

  function validateForm() {
    let isValid = true
    emailError.value = ''
    passwordError.value = ''

    if (!email.value) {
      emailError.value = 'El correo es obligatorio'
      isValid = false
    }

    if (!password.value) {
      passwordError.value = 'La contraseña es obligatoria'
      isValid = false
    }

    return isValid
  }

  async function handleSubmit() {
    if (!validateForm()) return

    isLoading.value = true

    // Simulación de inicio de sesión
    await new Promise((resolve) => setTimeout(resolve, 1800))

    // Extraer nombre del email para el saludo
    const userName = email.value.split('@')[0] || 'Usuario'

    // Guardar sesión
    authLogin({
      name: userName,
      email: email.value,
    })

    isLoading.value = false

    // Redirigir al Index (con sesión iniciada)
    if (emit) {
      emit('navigate', 'index')
    }
  }

  onMounted(() => {
    requestAnimationFrame(() => {
      isVisible.value = true
    })
  })

  return {
    email,
    password,
    remember,
    showPassword,
    isLoading,
    isVisible,
    emailError,
    passwordError,
    typingEmail,
    typingPassword,
    togglePasswordVisibility,
    handleSubmit,
  }
}
