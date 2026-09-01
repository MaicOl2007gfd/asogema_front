import { ref, computed, onMounted } from 'vue'
import { useAuth } from './useAuth.js'
import { getUserInitials as utilsGetUserInitials } from './useUtils.js'
import api from './useApi.js'

// Permite que otras vistas (p. ej. tras una reserva exitosa)
// abran el perfil directamente en una pestaña concreta, como "Mis Reservas".
let requestedTab = 'cuenta'
export function requestProfileTab(tab) {
  requestedTab = tab
}

/**
 * Composable que maneja toda la lógica del Perfil / Ajustes de cuenta.
 * Incluye: actualizar datos del perfil y cambiar contraseña.
 *
 * ⚠️ NOTA BACKEND — Piezas pendientes que requieren endpoints aún no implementados
 * en el backend (asogema-back). Cada bloque pendiente está marcado con "PENDIENTE BACKEND":
 *
 *   1. GET /auth/users/me        → solo devuelve { id, correo, rol, rol_nombre }.
 *      No expone nombre, apellido, telefono ni correo_verificado.
 *      Por eso los campos se prellenan desde el estado local de autenticación.
 *   2. Editar correo             → UpdateProfileDto NO acepta `correo`.
 *      (pendiente: agregar correo + validación de unicidad en el backend)
 *   3. Reenvío de código         → no existe endpoint público de reenvío.
 *      (pendiente: POST /auth/verify-email/resend { correo })
 *   4. Estado correo_verificado  → no se expone en el perfil.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @returns {object} Estado reactivo y métodos del perfil
 */
export function useProfile(emit) {
  const { user, logout } = useAuth()

  /* Tab activo: 'cuenta' | 'seguridad' */
  const activeTab = ref('cuenta')

  /* Animación de entrada */
  const isVisible = ref(false)

  /* ──────────────────────────────────────────────────────────
     AJUSTES DE CUENTA (editar nombre / teléfono)
     ────────────────────────────────────────────────────────── */
  const firstName = ref('')
  const lastName = ref('')
  const phone = ref('')
  const email = ref('')
  const birthDate = ref('')
  const originalBirthDate = ref('')

  /* Valores originales (para detectar cambios reales antes de habilitar "Guardar") */
  const originalFirstName = ref('')
  const originalLastName = ref('')
  const originalPhone = ref('')

  const typingFirstName = ref(false)
  const typingLastName = ref(false)
  const typingPhone = ref(false)

  const profileSaving = ref(false)
  const profileSuccess = ref('')
  const profileError = ref('')

  /* ──────────────────────────────────────────────────────────
     CAMBIAR CONTRASEÑA
     ────────────────────────────────────────────────────────── */
  const currentPassword = ref('')
  const newPassword = ref('')
  const confirmNewPassword = ref('')

  const showCurrentPassword = ref(false)
  const showNewPassword = ref(false)
  const showConfirmNewPassword = ref(false)

  const passwordSaving = ref(false)
  const passwordSuccess = ref('')
  const passwordError = ref('')

  /* Medidor de fortaleza de la contraseña */
  const passwordStrength = computed(() => {
    const p = newPassword.value
    if (!p) return { score: 0, label: '', percent: 0, color: '' }
    let score = 0
    if (p.length >= 6) score++
    if (p.length >= 10) score++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
    if (/\d/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte']
    const colors = ['#d63031', '#e17055', '#fdcb6e', '#00b894', '#00b894']
    const idx = Math.min(score, 4)
    return { score: idx, label: labels[idx], percent: (idx + 1) * 20, color: colors[idx] }
  })

  /* ──────────────────────────────────────────────────────────
     HELPERS
     ────────────────────────────────────────────────────────── */
  function getUserInitials() {
    return utilsGetUserInitials(user.value)
  }

  function extractError(err, fallback) {
    if (err.response?.data?.message) {
      return Array.isArray(err.response.data.message)
        ? err.response.data.message[0]
        : err.response.data.message
    }
    return fallback
  }

  /** Convierte una fecha ISO (o Date) a "yyyy-mm-dd" para el input type="date". */
  function toDateInput(iso) {
    if (!iso) return ''
    const value = String(iso)
    const [date] = value.split('T')
    return date || ''
  }

  /**
   * Sincroniza el estado local de autenticación + localStorage
   * tras una actualización de perfil, para que la navbar refleje el nuevo nombre.
   */
  function syncLocalUser(updated) {
    if (!user.value) return
    user.value.nombre = updated.nombre ?? user.value.nombre
    user.value.apellido = updated.apellido ?? user.value.apellido
    user.value.telefono = updated.telefono ?? user.value.telefono
    user.value.correo = updated.correo ?? user.value.correo
    user.value.fecha_nacimiento = updated.fecha_nacimiento ?? user.value.fecha_nacimiento
    user.value.email = updated.correo ?? user.value.correo ?? user.value.email
    user.value.name = `${user.value.nombre || ''} ${user.value.apellido || ''}`.trim()
      || user.value.name
      || 'Usuario'
    sessionStorage.setItem('asogema_user', JSON.stringify(user.value))
  }

  /* ──────────────────────────────────────────────────────────
     AJUSTES DE CUENTA
     ────────────────────────────────────────────────────────── */
  function loadProfile() {
    // PENDIENTE BACKEND: el perfil remoto no expone nombre/apellido/telefono.
    // Se prellenan desde el estado local de autenticación (login/restore).
    firstName.value = user.value?.nombre || ''
    lastName.value = user.value?.apellido || ''
    phone.value = user.value?.telefono || ''
    email.value = user.value?.correo || user.value?.email || ''
    birthDate.value = toDateInput(user.value?.fecha_nacimiento)
    syncOriginalProfile()
  }

  /* Guarda la "foto" de los datos al cargar / tras guardar con éxito. */
  function syncOriginalProfile() {
    originalFirstName.value = firstName.value
    originalLastName.value = lastName.value
    originalPhone.value = phone.value
    originalBirthDate.value = birthDate.value
  }

  /* True mientras existan cambios reales respecto a los datos originales. */
  const hasProfileChanges = computed(() => {
    const clean = v => (v || '').trim()
    return (
      clean(firstName.value) !== clean(originalFirstName.value) ||
      clean(lastName.value) !== clean(originalLastName.value) ||
      clean(phone.value) !== clean(originalPhone.value) ||
      birthDate.value !== originalBirthDate.value
    )
  })

  function validateProfile() {
    profileError.value = ''
    profileSuccess.value = ''
    if (!firstName.value.trim()) {
      profileError.value = 'El nombre es obligatorio'
      return false
    }
    if (birthDate.value) {
      const date = new Date(birthDate.value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (Number.isNaN(date.getTime())) {
        profileError.value = 'La fecha de nacimiento no es válida'
        return false
      }
      if (date > today) {
        profileError.value = 'La fecha de nacimiento no puede ser futura'
        return false
      }
    }
    return true
  }

  async function saveProfile() {
    if (!validateProfile()) return
    if (!hasProfileChanges.value) return

    profileSaving.value = true
    try {
      const { data } = await api.patch('/auth/users/me', {
        nombre: firstName.value.trim(),
        apellido: lastName.value.trim() || undefined,
        telefono: phone.value.trim() || undefined,
        fecha_nacimiento: birthDate.value || undefined,
      })
      syncLocalUser(data)
      profileSuccess.value = 'Tus datos se actualizaron correctamente'
      syncOriginalProfile()
    } catch (err) {
      profileError.value = extractError(err, 'No se pudieron guardar los cambios')
    } finally {
      profileSaving.value = false
    }
  }

  /* ──────────────────────────────────────────────────────────
     CAMBIAR CONTRASEÑA
     ────────────────────────────────────────────────────────── */
  function togglePasswordVisibility(field) {
    if (field === 'current') showCurrentPassword.value = !showCurrentPassword.value
    if (field === 'new') showNewPassword.value = !showNewPassword.value
    if (field === 'confirm') showConfirmNewPassword.value = !showConfirmNewPassword.value
  }

  function validatePasswordForm() {
    passwordError.value = ''
    passwordSuccess.value = ''
    if (!currentPassword.value) {
      passwordError.value = 'Ingresa tu contraseña actual'
      return false
    }
    if (!newPassword.value) {
      passwordError.value = 'Ingresa la nueva contraseña'
      return false
    }
    if (newPassword.value.length < 6) {
      passwordError.value = 'La nueva contraseña debe tener mínimo 6 caracteres'
      return false
    }
    if (newPassword.value !== confirmNewPassword.value) {
      passwordError.value = 'Las contraseñas no coinciden'
      return false
    }
    return true
  }

  async function submitChangePassword() {
    if (!validatePasswordForm()) return

    passwordSaving.value = true
    try {
      await api.patch('/auth/users/me/password', {
        current_password: currentPassword.value,
        new_password: newPassword.value,
      })
      passwordSuccess.value = 'Contraseña actualizada correctamente'
      currentPassword.value = ''
      newPassword.value = ''
      confirmNewPassword.value = ''
    } catch (err) {
      if (err.response?.status === 401) {
        passwordError.value = 'La contraseña actual no es correcta'
      } else {
        passwordError.value = extractError(err, 'No se pudo cambiar la contraseña')
      }
    } finally {
      passwordSaving.value = false
    }
  }

  /* ──────────────────────────────────────────────────────────
     CERRAR SESIÓN
     ────────────────────────────────────────────────────────── */
  function handleLogout() {
    logout()
    if (emit) emit('navigate', 'index')
  }

  function goBack() {
    if (emit) emit('navigate', 'index')
  }

  /* ──────────────────────────────────────────────────────────
     LIFECYCLE
     ────────────────────────────────────────────────────────── */
  onMounted(() => {
    // Si se solicitó abrir el perfil en una pestaña específica
    // (p. ej. "Mis Reservas"), se aplica y se reinicia el valor.
    if (requestedTab) {
      activeTab.value = requestedTab
      requestedTab = 'cuenta'
    }
    loadProfile()
    requestAnimationFrame(() => {
      isVisible.value = true
    })
  })

  return {
    // Navegación / usuario
    user,
    getUserInitials,
    handleLogout,
    goBack,
    // UI
    activeTab,
    isVisible,
    // Ajustes de cuenta
    firstName,
    lastName,
    phone,
    birthDate,
    email,
    typingFirstName,
    typingLastName,
    typingPhone,
    profileSaving,
    profileSuccess,
    profileError,
    saveProfile,
    hasProfileChanges,
    // Cambiar contraseña
    currentPassword,
    newPassword,
    confirmNewPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmNewPassword,
    passwordSaving,
    passwordSuccess,
    passwordError,
    passwordStrength,
    togglePasswordVisibility,
    submitChangePassword,
  }
}
