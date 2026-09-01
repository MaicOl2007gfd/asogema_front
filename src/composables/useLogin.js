import { ref, onMounted } from 'vue'
import { useAuth, homeViewForRole } from './useAuth.js'
import api from './useApi.js'
import { resolveError } from './useErrorMessage.js'

// Clave usada por App.vue para notificar un error del callback OAuth
const OAUTH_ERROR_KEY = 'asogema_oauth_error'

export function useLogin(emit) {
  const { login: authLogin } = useAuth()
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
        emit('navigate', homeViewForRole(data.usuario?.rol_nombre))
      }
    } catch (err) {
      isLoading.value = false

      if (
        err.response?.status === 403 &&
        err.response?.data?.code === 'AUTH_EMAIL_NOT_VERIFIED'
      ) {
        localStorage.setItem('asogema_pending_verify', email.value)
        if (emit) emit('navigate', 'verify-email')
        return
      }

      const { field, message } = resolveError(err)

      if (field === 'email') {
        emailError.value = message
      } else if (field === 'password') {
        passwordError.value = message
      } else {
        errorMessage.value = message
      }
    }
  }

  onMounted(() => {
    // Mostrar un error del login social (si App.vue lo dejó pendiente)
    const oauthError = localStorage.getItem(OAUTH_ERROR_KEY)
    if (oauthError) {
      errorMessage.value = oauthError
      localStorage.removeItem(OAUTH_ERROR_KEY)
    }
  
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
