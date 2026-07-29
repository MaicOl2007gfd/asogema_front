import { ref, computed } from 'vue'

const ADMIN_EMAIL = 'maicolquevedo29@gmail.com'
const ADMIN_PASSWORD = 'Ma1234567'
const user = ref(null)
const token = ref(null)
const isLoggedIn = computed(() => user.value !== null)

const isAdmin = computed(() => {
  if (!user.value) return false
  return (
    user.value.rol === 'admin' ||
    user.value.rol === 'administrador' ||
    user.value.role === 'admin' ||
    user.value.role === 'administrator' ||
    user.value.is_admin === true ||
    user.value.tipo_usuario === 'admin' ||
    user.value.rol_id === 1 ||
    user.value.role_id === 1
  )
})
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

export function validateAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}
export function useAuth() {
  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    restoreSession,
    validateAdminCredentials,
  }
}
