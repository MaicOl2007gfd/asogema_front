import { ref, computed } from 'vue'

/**
 * Composable singleton que maneja el estado de autenticación.
 * Se comparte entre todos los componentes que lo importen.
 */

// ─── Admin Credentials ───────────────────────────────────────
const ADMIN_EMAIL = 'maicolquevedo29@gmail.com'
const ADMIN_PASSWORD = 'Ma1234567'

const user = ref(null)
const isLoggedIn = computed(() => user.value !== null)

/**
 * Verifica si el usuario actual es el administrador.
 */
const isAdmin = computed(() => {
  return user.value?.email === ADMIN_EMAIL
})

/**
 * Inicia sesión con datos del usuario.
 * @param {object} userData - Información del usuario
 */
export function login(userData) {
  user.value = {
    name: userData.name || 'Usuario',
    email: userData.email || '',
    ...userData,
  }
  // Persistir en localStorage
  localStorage.setItem('asogema_user', JSON.stringify(user.value))
}

/**
 * Cierra la sesión del usuario.
 */
export function logout() {
  user.value = null
  localStorage.removeItem('asogema_user')
}

/**
 * Recupera la sesión desde localStorage (para persistencia).
 */
export function restoreSession() {
  try {
    const stored = localStorage.getItem('asogema_user')
    if (stored) {
      user.value = JSON.parse(stored)
    }
  } catch {
    localStorage.removeItem('asogema_user')
  }
}

/**
 * Valida si el correo y contraseña corresponden al administrador.
 * @param {string} email
 * @param {string} password
 * @returns {boolean}
 */
export function validateAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

/**
 * Hook para usar en componentes que necesiten auth.
 */
export function useAuth() {
  return {
    user,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    restoreSession,
    validateAdminCredentials,
  }
}
