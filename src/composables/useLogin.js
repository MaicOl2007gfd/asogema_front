import { ref, onMounted } from 'vue'
import { useAuth } from './useAuth.js'
import api from './useApi.js'

export function useLogin(emit) {
  const { login: authLogin, isAdmin } = useAuth()
  const email = ref('')
  const password = ref('')
  const remember = ref(false)
  const showPassword = ref(false)
  const isLoading = ref(false)
  const isVisible = ref(false)
  const emailError = ref('')
  const passwordError = ref('')
  const errorMessage = ref('')

  const typingEmail = ref(false)
  const typingPassword = ref(false)

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value
  }

  function validateForm() {
    let isValid = true
    emailError.value = ''
    passwordError.value = ''
    errorMessage.value = ''

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
    errorMessage.value = ''

    try {
      const { data } = await api.post('/auth/tokens', {
        correo: email.value,
        password: password.value,
      })

      authLogin(data.usuario, data.access_token, data.refresh_token)
      isLoading.value = false

      if (emit) {
        emit('navigate', isAdmin.value ? 'admin' : 'index')
      }
    } catch (err) {
      isLoading.value = false

      if (
        err.response?.status === 403 &&
        /verific/i.test(err.response?.data?.message || '')
      ) {
        localStorage.setItem('asogema_pending_verify', email.value)
        if (emit) emit('navigate', 'verify-email')
        return
      }

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
    errorMessage,
    typingEmail,
    typingPassword,
    togglePasswordVisibility,
    handleSubmit,
  }
}
