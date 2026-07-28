import { ref, onMounted } from 'vue'
import { login as authLogin } from './useAuth.js'
import api from './useApi.js'

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

    try {
      const { data } = await api.post('/auth/tokens', {
        correo: email.value,
        password: password.value,
      })

      authLogin(data.usuario, data.access_token)
      isLoading.value = false

      if (emit) {
        emit('navigate', data.usuario.rol_id === 1 ? 'admin' : 'index')
      }
    } catch (err) {
      isLoading.value = false

      if (err.response?.status === 401) {
        emailError.value = 'Correo o contraseña incorrectos'
      } else if (err.response?.data?.message) {
        emailError.value = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message
      } else {
        emailError.value = 'Error de conexión. Intenta de nuevo.'
      }
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
