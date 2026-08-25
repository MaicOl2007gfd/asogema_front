/**
 * Utilidades compartidas del frontend (DRY).
 * Funciones puras: reciben valores, no refs.
 */

/** Formatea un monto en pesos colombianos (COP). */
export function formatCop(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(Number(amount) || 0))
}

/** Extrae el mensaje de error de una respuesta HTTP o lo genera por defecto. */
export function getErrorMessage(err) {
  const message = err.response?.data?.message
  if (Array.isArray(message)) return message.join('. ')
  return message || 'Ocurrió un error inesperado. Intenta de nuevo.'
}

/** Iniciales del usuario para avatares (máx 2 caracteres). */
export function getUserInitials(user) {
  const raw =
    `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || user?.name || ''
  if (!raw) return '?'
  return (
    raw
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  )
}

/** Indica si el usuario es personal (Admin, Mesero o Recepcionista). */
export function isStaffUser(user, isAdmin = false) {
  if (isAdmin) return true
  const rol = user?.rol_nombre
  return rol === 'Mesero' || rol === 'Recepcionista'
}

/** Formatea una fecha ISO como dd/mm/yyyy. */
export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).split('T')[0].split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

/** Formatea una fecha ISO como fecha larga en es-CO. */
export function formatDateLong(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Formatea una hora ISO como HH:MM. */
export function formatTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Etiqueta legible de un estado de pago/recarga/pedido. */
export function estadoLabel(estado) {
  return (
    {
      CONFIRMADO: 'Acreditada',
      PENDIENTE: 'Pendiente',
      RECHAZADO: 'Rechazada',
      PAGADA: 'Pagada',
      PENDIENTE_PEDIDO: 'Pendiente',
      EN_PREPARACION: 'En preparación',
      ENTREGADO: 'Entregado',
    }[estado] || estado
  )
}
