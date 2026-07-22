import { ref, computed } from 'vue'

/**
 * Composable singleton que maneja el estado de autenticación.
 * Se comparte entre todos los componentes que lo importen.
 */
const user = ref(null)
const isLoggedIn = computed(() => user.value !== null)

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
 * Hook para usar en componentes que necesiten auth.
 */
export function useAuth() {
  return {
    user,
    isLoggedIn,
    login,
    logout,
    restoreSession,
  }
}
