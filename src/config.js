export const API_URL = import.meta.env.PROD
  ? 'https://api.clubasogema.com'
  : 'http://localhost:3000'

/**
 * URL base para el perfil público que codifica el código QR de cada usuario.
 * Si se deja vacío, se usa el origen actual de la app (window.location.origin)
 * con la ruta `/u/<id>`.
 */
export const PROFILE_BASE_URL = ''
