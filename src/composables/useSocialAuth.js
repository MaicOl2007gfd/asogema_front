import { ref } from 'vue'
import { API_URL, SOCIAL_AUTH } from '../config.js'
import { login } from './useAuth.js'

/**
 * Estado global del login social. Indica qué proveedor está en proceso
 * de redirección ('google' | 'facebook' | null).
 */
const socialLoading = ref(null)

/**
 * Construye la URL del backend que inicia el flujo OAuth del proveedor.
 * @param {string} provider - 'google' | 'facebook'
 * @returns {string} URL absoluta hacia el endpoint de autenticación del backend
 */
function buildProviderUrl(provider) {
  const redirectUri = encodeURIComponent(`${window.location.origin}/`)
  const sep = SOCIAL_AUTH[provider].includes('?') ? '&' : '?'
  return `${API_URL}${SOCIAL_AUTH[provider]}${sep}${SOCIAL_AUTH.redirectParam}=${redirectUri}`
}

/**
 * Redirige el navegador hacia el backend para iniciar el flujo OAuth.
 * El backend redirige de vuelta al front con los tokens en la URL.
 * @param {string} provider - 'google' | 'facebook'
 */
function redirectToProvider(provider) {
  socialLoading.value = provider
  window.location.assign(buildProviderUrl(provider))
}

/**
 * Inicia el login con Google.
 */
export function redirectToGoogle() {
  redirectToProvider('google')
}

/**
 * Inicia el login con Facebook.
 */
export function redirectToFacebook() {
  redirectToProvider('facebook')
}

/**
 * Lee el resultado del callback OAuth desde la URL actual.
 * Compatible con `access_token`/`token`, `refresh_token`/`refresh`,
 * `error`/`message` y datos opcionales del usuario.
 * @returns {{ accessToken: string, refreshToken: string|null, userData: object, error: string|null } | null}
 */
function readCallbackResult() {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('access_token') || params.get('token')
  const refreshToken = params.get('refresh_token') || params.get('refresh')
  const error = params.get('error') || params.get('message')

  if (!accessToken && !error) return null

  const userData = {
    nombre: params.get('nombre') || params.get('first_name') || params.get('name') || '',
    apellido: params.get('apellido') || params.get('last_name') || '',
    correo: params.get('correo') || params.get('email') || '',
  }

  return { accessToken, refreshToken, userData, error }
}

/**
 * Procesa el callback OAuth (se invoca al montar la app) y limpia la URL.
 * @returns {{ success: true } | { error: string } | null}
 *  - `{ success: true }` cuando hay un token y la sesión se guardó.
 *  - `{ error }` cuando el backend devolvió un error o falta el token.
 *  - `null` cuando la URL no contiene un callback OAuth.
 */
export function applyOAuthCallback() {
  const result = readCallbackResult()
  if (!result) return null

  // Limpia la URL para que los tokens no queden expuestos en la barra de direcciones
  const cleanUrl = window.location.pathname + window.location.hash
  window.history.replaceState({}, document.title, cleanUrl)

  if (result.error) {
    return { error: decodeURIComponent(result.error) }
  }

  if (!result.accessToken) {
    return { error: 'No se recibió un token de acceso válido. Intenta de nuevo.' }
  }

  login(result.userData, result.accessToken, result.refreshToken)
  return { success: true }
}

/**
 * Composable para el login social en el front.
 * @returns {{ socialLoading: import('vue').Ref<string|null>, redirectToGoogle: Function, redirectToFacebook: Function, applyOAuthCallback: Function }}
 */
export function useSocialAuth() {
  return {
    socialLoading,
    redirectToGoogle,
    redirectToFacebook,
    applyOAuthCallback,
  }
}
