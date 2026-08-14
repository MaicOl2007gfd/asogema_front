import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import { PROFILE_BASE_URL } from '../config.js'

/**
 * Composable que genera un CÓDIGO QR único por perfil de usuario.
 *
 * El contenido del QR se construye a partir del identificador único del
 * usuario (id) + correo, garantizando que cada perfil tenga un QR diferente.
 *
 * @param {import('vue').Ref} user - Ref reactiva del usuario autenticado
 * @param {import('vue').Ref} email - Ref reactiva del correo del usuario
 * @returns {object} Estado y métodos del QR
 */
export function useQrCode(user, email) {
  const qrDataUrl = ref('')
  const qrValue = ref('')
  const qrLoading = ref(true)
  const qrError = ref('')
  const copied = ref(false)
  const copyError = ref(false)

  /* ──────────────────────────────────────────────────────────
     CONTENIDO ÚNICO DEL QR
     Se usa el id del usuario (o el correo como respaldo) para que
     cada perfil genere un QR distinto y estable.
     ────────────────────────────────────────────────────────── */
  function buildQrValue() {
    if (!user.value) return ''
    const uid =
      user.value.id ||
      user.value.usuario_id ||
      user.value.user_id ||
      ''
    const mail =
      user.value.correo ||
      user.value.email ||
      email.value ||
      ''
    // Identificador único: prioriza el id numérico; si no existe,
    // deriva un hash estable a partir del correo.
    const identifier = uid
      ? String(uid)
      : mail.replace(/[^a-z0-9]/gi, '').toLowerCase()

    if (!identifier) return ''
    const base = PROFILE_BASE_URL || `${window.location.origin}/u`
    return `${base}/${encodeURIComponent(identifier)}`
  }

  /* ──────────────────────────────────────────────────────────
     GENERACIÓN DEL QR (canvas → dataURL PNG)
     ────────────────────────────────────────────────────────── */
  async function generate() {
    qrLoading.value = true
    qrError.value = ''
    qrValue.value = buildQrValue()

    if (!qrValue.value) {
      qrLoading.value = false
      return
    }

    try {
      // errorCorrectionLevel 'H' permite superponer el monograma central
      // sin perder legibilidad al escanear.
      qrDataUrl.value = await QRCode.toDataURL(qrValue.value, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 420,
        color: {
          dark: '#1b2b40', // azul marino premium de la marca
          light: '#ffffff',
        },
      })
    } catch {
      qrError.value = 'No se pudo generar el código QR. Intenta de nuevo.'
    } finally {
      qrLoading.value = false
    }
  }

  /* ──────────────────────────────────────────────────────────
     DESCARGAR EL QR COMO PNG
     ────────────────────────────────────────────────────────── */
  function downloadQr() {
    if (!qrDataUrl.value) return
    const uid = user.value?.id || user.value?.usuario_id || 'perfil'
    const a = document.createElement('a')
    a.href = qrDataUrl.value
    a.download = `qr-asogema-${uid}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  /* ──────────────────────────────────────────────────────────
     COPIAR EL ENLACE ÚNICO DEL PERFIL
     ────────────────────────────────────────────────────────── */
  async function copyQrLink() {
    if (!qrValue.value) return
    copyError.value = false
    try {
      await navigator.clipboard.writeText(qrValue.value)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2200)
    } catch {
      copyError.value = true
      setTimeout(() => {
        copyError.value = false
      }, 2200)
    }
  }

  /* Regenerar automáticamente cuando cambia el usuario / correo */
  watch([user, email], generate)

  onMounted(generate)

  return {
    qrDataUrl,
    qrValue,
    qrLoading,
    qrError,
    copied,
    copyError,
    generate,
    downloadQr,
    copyQrLink,
  }
}
