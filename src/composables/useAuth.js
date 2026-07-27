import { ref, computed } from 'vue'

const user = ref(null)
const token = ref(null)
const isLoggedIn = computed(() => user.value !== null)

export function login(userData, accessToken) {
  token.value = accessToken
  user.value = {
    name: `${userData.nombre || ''} ${userData.apellido || ''}`.trim() || userData.name || 'Usuario',
    email: userData.correo || userData.email || '',
    ...userData,
  }
  localStorage.setItem('asogema_token', accessToken || '')
  localStorage.setItem('asogema_user', JSON.stringify(user.value))
}

export function logout() {
  user.value = null
  token.value = null
  localStorage.removeItem('asogema_token')
  localStorage.removeItem('asogema_user')
}

export function restoreSession() {
  try {
    const storedToken = localStorage.getItem('asogema_token')
    const storedUser = localStorage.getItem('asogema_user')
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  } catch {
    localStorage.removeItem('asogema_token')
    localStorage.removeItem('asogema_user')
  }
}

export function useAuth() {
  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    restoreSession,
  }
}
