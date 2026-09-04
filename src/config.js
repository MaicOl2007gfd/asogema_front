export const API_URL = import.meta.env.PROD
  ? 'https://api.clubasogema.com'
  : 'http://localhost:3000'

export const WS_URL = import.meta.env.PROD
  ? 'wss://api.clubasogema.com'
  : 'ws://localhost:3000'

/**
 * Configuración del login social (Google / Facebook).
 *
 * FLUJO (redirección OAuth estándar, p. ej. Passport):
 * 1. El front redirige al navegador a `${API_URL}${SOCIAL_AUTH[provider]}`.
 * 2. El backend hace el OAuth con el proveedor y redirige de vuelta al front:
 *    `${window.location.origin}/?access_token=...&refresh_token=...&error=...`
 * 3. useSocialAuth.js lee los query params, guarda la sesión y limpia la URL.
 *
 * Ajusta `redirectParam` si tu backend usa otro nombre para el parámetro
 * que indica a dónde volver (p. ej. 'redirect' o 'callback_url').
 */
export const SOCIAL_AUTH = {
  google: '/auth/google',
  facebook: '/auth/facebook',
  // Nombre del query param con el que el front indica al backend a dónde regresar
  redirectParam: 'redirect_uri',
}

/**
 * URL base para el perfil público que codifica el código QR de cada usuario.
 * Si se deja vacío, se usa el origen actual de la app (window.location.origin)
 * con la ruta `/u/<id>`.
 */
export const PROFILE_BASE_URL = ''

/**
 * WhatsApp — botón flotante del index.
 * `WHATSAPP_NUMBER`: número en formato internacional SIN "+" ni espacios
 * (código de país + número, p. ej. Colombia: "573001234567").
 * `WHATSAPP_MESSAGE`: mensaje precargado que se envía al abrir el chat.
 */
export const WHATSAPP_NUMBER = '573161596416'
export const WHATSAPP_MESSAGE = 'Hola Asogema, quiero más información.'

/**
 * Ubicación de la Sede Recreacional ASOGEMA (Ibagué, Tolima).
 * Usada por el mapa Leaflet de la sección "Contacto / Ubicación".
 *
 * Dirección registrada: Carrera 12 # 147-84, Barrio El Salado, Ibagué, Tolima.
 * Coordenadas verificadas sobre OpenStreetMap: 4.44913, -75.1415.
 */
export const CLUB_LOCATION = {
  name: 'Sede Recreacional ASOGEMA',
  address: 'Carrera 12 # 147-84, Barrio El Salado, Ibagué, Tolima',
  lat: 4.44913,
  lng: -75.1415,
  zoom: 16,
}

/**
 * Enlace de Google Maps para trazar una ruta hasta la sede.
 */
export const GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${CLUB_LOCATION.lat},${CLUB_LOCATION.lng}`
