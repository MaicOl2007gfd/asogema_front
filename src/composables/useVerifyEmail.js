import { ref, onMounted } from 'vue'
import api from './useApi.js'

const RESEND_COOLDOWN_SECONDS = 60
const CODE_LENGTH = 6

/**
 * Composable de la vista de verificación de correo.
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos de verificación
 */
export function useVerifyEmail(emit) {
  const email = ref('')
  const codeParts = ref(Array(CODE_LENGTH).fill(''))
  const codeInputs = ref([])
  const isLoading = ref(false)
  const isResending = ref(false)
  const isVisible = ref(false)
  const typingCode = ref(false)
  const codeError = ref('')
  const errorMessage = ref('')
  const successMessage = ref('')
  const cooldown = ref(0)

  let cooldownTimer = null

  onMounted(() => {
    requestAnimationFrame(() => {
      isVisible.value = true
    })
    email.value = localStorage.getItem('asogema_pending_verify') || ''
  })

  function startCooldown() {
    cooldown.value = RESEND_COOLDOWN_SECONDS
    if (cooldownTimer) clearInterval(cooldownTimer)
    cooldownTimer = setInterval(() => {
      cooldown.value -= 1
      if (cooldown.value <= 0) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }, 1000)
  }

  function focusInput(index) {
    const input = codeInputs.value[index]
    if (input) {
      input.focus()
      input.select?.()
    }
  }

  function handleCodeInput(index, event) {
    const digit = (event.target.value || '').replace(/\D/g, '').slice(0, 1)
    codeParts.value[index] = digit

    if (digit) {
      if (index < CODE_LENGTH - 1) {
        focusInput(index + 1)
      } else if (codeParts.value.join('').length === CODE_LENGTH) {
        handleSubmit()
      }
    }
  }

  function handleCodeBackspace(index) {
    if (!codeParts.value[index] && index > 0) {
      focusInput(index - 1)
    }
  }

  function handleCodePaste(event) {
    const text = (event.clipboardData?.getData('text') || '')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)
    if (!text) return

    event.preventDefault()
    text.split('').forEach((digit, i) => {
      codeParts.value[i] = digit
    })
    focusInput(Math.min(text.length, CODE_LENGTH - 1))

    if (text.length === CODE_LENGTH) {
      handleSubmit()
    }
  }

  function validate() {
    codeError.value = ''
    errorMessage.value = ''

    if (!email.value.trim()) {
      errorMessage.value = 'No encontramos tu correo. Crea una cuenta para recibir el código.'
      return false
    }
    if (!/^\d{6}$/.test(codeParts.value.join(''))) {
      codeError.value = 'El código debe tener 6 dígitos'
      return false
    }
    return true
  }

  async function handleSubmit() {
    if (isLoading.value) return
    if (!validate()) return

    isLoading.value = true
    successMessage.value = ''

    try {
      await api.post('/auth/verify-email', {
        correo: email.value.trim(),
        codigo: codeParts.value.join(''),
      })
      successMessage.value = 'Correo verificado correctamente'
      localStorage.removeItem('asogema_pending_verify')
      if (emit) {
        setTimeout(() => emit('navigate', 'login'), 1500)
      }
    } catch (err) {
      if (err.response?.data?.message) {
        errorMessage.value = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message
      } else {
        errorMessage.value = 'Error de conexión. Intenta de nuevo.'
      }
    } finally {
      isLoading.value = false
    }
  }

  function clearCode() {
    codeParts.value = Array(CODE_LENGTH).fill('')
  }

  async function resendCode() {
    if (isResending.value || cooldown.value > 0) return

    if (!email.value.trim()) {
      errorMessage.value = 'No encontramos tu correo. Crea una cuenta para recibir el código.'
      return
    }

    isResending.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await api.post('/auth/resend-code', { correo: email.value.trim() })
      successMessage.value = 'Código reenviado. Revisa tu correo.'
      clearCode()
      focusInput(0)
      startCooldown()
    } catch (err) {
      if (err.response?.status === 409) {
        errorMessage.value = 'Tu correo ya está verificado. Puedes iniciar sesión.'
      } else if (err.response?.data?.message) {
        errorMessage.value = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message
      } else {
        errorMessage.value = 'No se pudo reenviar el código. Intenta de nuevo.'
      }
    } finally {
      isResending.value = false
    }
  }

  return {
    email,
    codeParts,
    codeInputs,
    isLoading,
    isResending,
    isVisible,
    typingCode,
    codeError,
    errorMessage,
    successMessage,
    cooldown,
    handleSubmit,
    resendCode,
    handleCodeInput,
    handleCodeBackspace,
    handleCodePaste,
    focusInput,
  }
}
