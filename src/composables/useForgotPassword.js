import { ref, onMounted } from 'vue'
import api from './useApi.js'

/**
 * Composable que maneja la recuperación de contraseña ("¿Olvidaste tu contraseña?").
 *
 * ⚠️ PENDIENTE BACKEND — No existen endpoints de recuperación de contraseña en el
 * backend (asogema-back). La UI ya está lista y llama a los endpoints propuestos:
 *
 *   1. POST /auth/forgot-password  → { correo }  — envía el código de recuperación por email.
 *   2. POST /auth/reset-password   → { correo, codigo, new_password } — valida el código
 *      y guarda la nueva contraseña.
 *
 * Mientras no existan, los envíos fallarán y se mostrará un mensaje informativo.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos del formulario
 */
export function useForgotPassword(emit) {
  const step = ref(1) // 1 = solicitar código, 2 = código + nueva contraseña

  const email = ref('')
  const code = ref('')
  const newPassword = ref('')
  const confirmNewPassword = ref('')

  const showNewPassword = ref(false)
  const showConfirmNewPassword = ref(false)

  const isVisible = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  function togglePasswordVisibility(field) {
    if (field === 'new') showNewPassword.value = !showNewPassword.value
    if (field === 'confirm') showConfirmNewPassword.value = !showConfirmNewPassword.value
  }

  function goToLogin() {
    if (emit) emit('navigate', 'login')
  }

  function goBack() {
    if (emit) emit('navigate', 'login')
  }

  function validateEmail() {
    errorMessage.value = ''
    successMessage.value = ''
    if (!email.value) {
      errorMessage.value = 'Ingresa tu correo electrónico'
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      errorMessage.value = 'Correo electrónico inválido'
      return false
    }
    return true
  }

  /**
   * Paso 1: solicitar el código de recuperación.
   * PENDIENTE BACKEND: POST /auth/forgot-password
   */
  async function requestCode() {
    if (!validateEmail()) return

    isLoading.value = true
    try {
      await api.post('/auth/forgot-password', { correo: email.value.trim() })
      successMessage.value = 'Si el correo está registrado, recibirás un código de recuperación.'
      step.value = 2
    } catch {
      errorMessage.value = 'La recuperación de contraseña estará disponible próximamente (requiere backend)'
    } finally {
      isLoading.value = false
    }
  }

  function validateReset() {
    errorMessage.value = ''
    successMessage.value = ''
    if (!code.value || !/^\d{6}$/.test(code.value.trim())) {
      errorMessage.value = 'El código debe tener 6 dígitos'
      return false
    }
    if (!newPassword.value || newPassword.value.length < 6) {
      errorMessage.value = 'La nueva contraseña debe tener mínimo 6 caracteres'
      return false
    }
    if (newPassword.value !== confirmNewPassword.value) {
      errorMessage.value = 'Las contraseñas no coinciden'
      return false
    }
    return true
  }

  /**
   * Paso 2: validar código y guardar la nueva contraseña.
   * PENDIENTE BACKEND: POST /auth/reset-password
   */
  async function resetPassword() {
    if (!validateReset()) return

    isLoading.value = true
    try {
      await api.post('/auth/reset-password', {
        correo: email.value.trim(),
        codigo: code.value.trim(),
        new_password: newPassword.value,
      })
      successMessage.value = 'Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.'
      setTimeout(() => goToLogin(), 1600)
    } catch {
      errorMessage.value = 'El restablecimiento de contraseña estará disponible próximamente (requiere backend)'
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
    step,
    email,
    code,
    newPassword,
    confirmNewPassword,
    showNewPassword,
    showConfirmNewPassword,
    isVisible,
    isLoading,
    errorMessage,
    successMessage,
    togglePasswordVisibility,
    requestCode,
    resetPassword,
    goToLogin,
    goBack,
  }
}
