import { ref, computed } from 'vue'

const ADMIN_EMAIL = 'maicolquevedo29@gmail.com'
const ADMIN_PASSWORD = 'Ma1234567'

const TOKEN_KEY = 'asogema_token'
const REFRESH_KEY = 'asogema_refresh'
const USER_KEY = 'asogema_user'

const user = ref(null)
const token = ref(null)
const refreshToken = ref(null)

const isLoggedIn = computed(() => user.value !== null)

const isAdmin = computed(() => {
  if (!user.value) return false
  return (
    user.value.rol_nombre === 'Administrador' ||
    user.value.rol_id === 1 ||
    user.value.rol === 'admin' ||
    user.value.rol === 'administrador' ||
    user.value.role === 'admin' ||
    user.value.role === 'administrator' ||
    user.value.is_admin === true ||
    user.value.tipo_usuario === 'admin' ||
    user.value.role_id === 1
  )
})

function storeTokens(accessToken, refreshTokenValue) {
  token.value = accessToken
  refreshToken.value = refreshTokenValue || null
  localStorage.setItem(TOKEN_KEY, accessToken || '')
  if (refreshTokenValue) {
    localStorage.setItem(REFRESH_KEY, refreshTokenValue)
  } else {
    localStorage.removeItem(REFRESH_KEY)
  }
}

export function login(userData, accessToken, refreshTokenValue) {
  storeTokens(accessToken, refreshTokenValue)
  user.value = {
    name: `${userData.nombre || ''} ${userData.apellido || ''}`.trim() || userData.name || 'Usuario',
    email: userData.correo || userData.email || '',
    ...userData,
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user.value))
}

export function setTokens(accessToken, refreshTokenValue) {
  storeTokens(accessToken, refreshTokenValue)
}

export async function logout() {
  const refresh = refreshToken.value || localStorage.getItem(REFRESH_KEY)
  if (refresh) {
    const { default: api } = await import('./useApi.js')
    api.post('/auth/logout', { refresh_token: refresh }).catch(() => {})
  }
  user.value = null
  token.value = null
  refreshToken.value = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export function restoreSession() {
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedRefresh = localStorage.getItem(REFRESH_KEY)
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedToken && storedUser) {
      token.value = storedToken
      refreshToken.value = storedRefresh || null
      user.value = JSON.parse(storedUser)
    }
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
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
    setTokens,
    restoreSession,
    validateAdminCredentials,
  }
}
