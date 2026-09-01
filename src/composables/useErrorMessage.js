/**
 * Resuelve un error de API (login/register) a un mensaje amigable en español
 * y al campo del formulario al que pertenece (si aplica).
 *
 * - Si `field` es distinto de null, el composable pinta el error inline en ese campo.
 * - Si `field` es null, el error va al banner general (`errorMessage`).
 */

const CODE_MESSAGES = {
  AUTH_INVALID_CREDENTIALS: { field: null, message: 'Correo o contraseña incorrectos' },
  AUTH_EMAIL_NOT_VERIFIED: { field: null, message: 'Correo no verificado. Revisa tu correo' },
  AUTH_EMAIL_ALREADY_EXISTS: { field: 'email', message: 'Este correo ya está registrado' },
  AUTH_DOCUMENT_ALREADY_EXISTS: { field: 'docNumber', message: 'Este número de documento ya está registrado' },
  VALIDATION_ERROR: { field: null, message: 'Revisa los datos ingresados' },
  RATE_LIMITED: { field: null, message: 'Demasiados intentos, espera un momento' },
  INTERNAL_ERROR: { field: null, message: 'Error del servidor, intenta de nuevo' },
}

export function resolveError(err) {
  const status = err?.response?.status
  const data = err?.response?.data
  const code = data?.code

  if (status === 429) {
    return { field: null, message: 'Demasiados intentos, espera un momento' }
  }

  if (code && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code]
  }

  if (status >= 500) {
    return { field: null, message: 'Error del servidor, intenta de nuevo' }
  }

  if (data?.message) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message
    return { field: null, message: message || 'Error de conexión. Intenta de nuevo.' }
  }

  return { field: null, message: 'Error de conexión. Intenta de nuevo.' }
}
