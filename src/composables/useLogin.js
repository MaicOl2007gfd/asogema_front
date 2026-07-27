import { ref, onMounted } from 'vue'
import { login as authLogin } from './useAuth.js'
import api from './useApi.js'

export function useLogin(emit) {
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
      const { data } = await api.post('/auth/login', {
        correo: email.value,
        password: password.value,
      })

      authLogin(data.usuario, data.access_token)

      if (emit) {
        emit('navigate', 'index')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        errorMessage.value = 'Correo o contraseña incorrectos'
      } else if (err.response?.data?.message) {
        errorMessage.value = err.response.data.message
      } else {
        errorMessage.value = 'Error de conexión. Intenta de nuevo.'
      }
    } finally {
      isLoading.value = false
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
