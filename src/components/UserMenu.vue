<script setup>
/**
 * UserMenu.vue — Menú de usuario unificado para las navbars.
 * --------------------------------------------------------------
 * Muestra solo el símbolo de perfil (avatar con iniciales). Al
 * pulsarlo abre un dropdown con: Saldo, Mi perfil,
 * Panel Admin (solo administradores) y Cerrar sesión.
 *
 * Consume useAuth() directamente (refs compartidos a nivel
 * módulo) y emite eventos para que cada vista padre aplique
 * su navegación y comportamiento móvil.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { getUserInitials } from '../composables/useUtils.js'

const emit = defineEmits(['navigate', 'logged-out'])

const { user, isAdmin, logout } = useAuth()

const open = ref(false)
const root = ref(null)

const initials = computed(() => getUserInitials(user.value))

const roleLabel = computed(() => user.value?.rol_nombre || 'Miembro')

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function go(view) {
  close()
  emit('navigate', view)
}

function doLogout() {
  logout()
  close()
  emit('logged-out')
}

function onDocumentClick(event) {
  if (root.value && !root.value.contains(event.target)) close()
}

function onKeyDown(event) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div ref="root" class="user-menu">
    <button
      type="button"
      class="user-menu-trigger"
      aria-haspopup="menu"
      :aria-expanded="open"
      aria-label="Abrir menú de usuario"
      :title="user?.name || 'Mi cuenta'"
      @click="toggle"
    >
      {{ initials }}
    </button>

    <Transition name="user-menu-pop">
      <div v-if="open" class="user-menu-dropdown" role="menu" aria-label="Menú de usuario">
        <div class="user-menu-head">
          <span class="user-menu-head-avatar">{{ initials }}</span>
          <div class="user-menu-head-text">
            <strong>{{ user?.name }}</strong>
            <span>{{ roleLabel }}</span>
          </div>
        </div>

        <button type="button" class="user-menu-item" role="menuitem" @click="go('wallet')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          Saldo
        </button>

        <button type="button" class="user-menu-item" role="menuitem" @click="go('profile')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Mi perfil
        </button>

        <button v-if="isAdmin" type="button" class="user-menu-item" role="menuitem" @click="go('admin')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l-.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
          </svg>
          Panel Admin
        </button>

        <div class="user-menu-divider" aria-hidden="true"></div>

        <button type="button" class="user-menu-item user-menu-item--logout" role="menuitem" @click="doLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Cerrar sesión
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.user-menu-trigger {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid rgba(200, 169, 106, 0.55);
  background: linear-gradient(135deg, #e8d5a8, #c8a96a);
  color: #133215;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(200, 169, 106, 0.3);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.user-menu-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(200, 169, 106, 0.45);
}

.user-menu-trigger:focus-visible {
  outline: 2px solid #c8a96a;
  outline-offset: 2px;
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  padding: 10px;
  background: #f3e8d3;
  border: 1px solid #133215;
  border-radius: 14px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
  z-index: 1200;
}

.user-menu-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px 12px;
}

.user-menu-head-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #133215, #0a6b5f);
  color: #f3e8d3;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-menu-head-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.user-menu-head-text strong {
  font-size: 14px;
  font-weight: 700;
  color: #133215;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-head-text span {
  font-size: 11px;
  font-weight: 500;
  color: rgba(19, 50, 21, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #133215;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.user-menu-item svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: rgba(19, 50, 21, 0.65);
}

.user-menu-item:hover {
  background: rgba(19, 50, 21, 0.08);
}

.user-menu-item--logout {
  color: #a93226;
}

.user-menu-item--logout svg {
  color: #a93226;
}

.user-menu-item--logout:hover {
  background: rgba(169, 50, 38, 0.1);
}

.user-menu-divider {
  height: 1px;
  margin: 8px 4px;
  background: rgba(19, 50, 21, 0.15);
}

.user-menu-pop-enter-active,
.user-menu-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
  transform-origin: top right;
}

.user-menu-pop-enter-from,
.user-menu-pop-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
