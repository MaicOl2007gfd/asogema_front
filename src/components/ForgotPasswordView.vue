<script setup>
import { useForgotPassword } from '../composables/useForgotPassword.js'
import Grainient from './Grainient.vue'
import '../Profile.css'

const emit = defineEmits(['navigate'])

const {
  step,
  email,
  code,
  newPassword,
  confirmNewPassword,
  showNewPassword,
  showConfirmNewPassword,
  isVisible,
  isLoading,
  errorMessage,
  successMessage,
  togglePasswordVisibility,
  requestCode,
  resetPassword,
  goToLogin,
  goBack,
} = useForgotPassword(emit)
</script>

<template>
  <div class="profile-container">
    <!-- Animated Grainient Shader Background (fullscreen) -->
    <Grainient
      :time-speed="4.0"
      :warp-strength="0.8"
      :warp-frequency="5.5"
      :warp-speed="1.2"
      :warp-amplitude="70.0"
      :blend-softness="0.1"
      :rotation-amount="250.0"
      :noise-scale="1.2"
      :grain-amount="0.04"
      :contrast="1.2"
      :zoom="1.0"
      color1="#2d5a2e"
      color2="#133215"
      color3="#0b1f0d"
    />

    <!-- Premium Diagonal Crosshatch Pattern overlay -->
    <div class="pattern-overlay" aria-hidden="true"></div>

    <!-- Atmospheric light overlay -->
    <div class="light-overlay" aria-hidden="true"></div>

    <!-- Back arrow -->
    <button type="button" class="back-arrow" @click="goBack" aria-label="Volver a iniciar sesión">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </button>

    <div class="login-card forgot-card" :class="{ visible: isVisible }">
      <!-- Brand -->
      <div class="brand">
        <div class="forgot-hero-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
          </svg>
        </div>
        <h1 class="brand-name">Recuperar contraseña</h1>
        <p class="brand-tagline">
          {{ step === 1 ? 'Te enviaremos un código a tu correo' : 'Ingresa el código y tu nueva contraseña' }}
        </p>
      </div>

      <!-- Paso 1: Solicitar código -->
      <form v-if="step === 1" class="login-form" @submit.prevent="requestCode" novalidate>
        <div class="input-group" :class="{ filled: email }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13L2 4" />
            </svg>
          </div>
          <input
            id="forgot-email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="Correo electrónico"
          />
          <label for="forgot-email">Correo electrónico</label>
        </div>

        <div v-if="errorMessage" class="error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
        <div v-if="successMessage" class="form-feedback form-feedback-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        <button type="submit" class="submit-btn" :class="{ loading: isLoading }" :disabled="isLoading">
          <span class="btn-text" v-if="!isLoading">Enviar código</span>
          <span class="btn-loader" v-else>
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
            </svg>
          </span>
        </button>
      </form>

      <!-- Paso 2: Código + nueva contraseña -->
      <form v-else class="login-form" @submit.prevent="resetPassword" novalidate>
        <div class="input-group" :class="{ filled: code }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <input
            id="forgot-code"
            v-model="code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            placeholder="Código de 6 dígitos"
          />
          <label for="forgot-code">Código de recuperación</label>
        </div>

        <div class="input-group" :class="{ filled: newPassword }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
              <polyline points="9 16 11 18 15 14" />
            </svg>
          </div>
          <input
            id="forgot-new-password"
            v-model="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Nueva contraseña"
          />
          <label for="forgot-new-password">Nueva contraseña</label>
          <button
            type="button"
            class="toggle-password"
            @click="togglePasswordVisibility('new')"
            :aria-label="showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            <svg v-if="!showNewPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>

        <div class="input-group" :class="{ filled: confirmNewPassword }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
              <polyline points="9 16 11 18 15 14" />
            </svg>
          </div>
          <input
            id="forgot-confirm-password"
            v-model="confirmNewPassword"
            :type="showConfirmNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Confirmar nueva contraseña"
          />
          <label for="forgot-confirm-password">Confirmar nueva contraseña</label>
          <button
            type="button"
            class="toggle-password"
            @click="togglePasswordVisibility('confirm')"
            :aria-label="showConfirmNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            <svg v-if="!showConfirmNewPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>

        <div v-if="errorMessage" class="error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
        <div v-if="successMessage" class="form-feedback form-feedback-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        <button type="submit" class="submit-btn" :class="{ loading: isLoading }" :disabled="isLoading">
          <span class="btn-text" v-if="!isLoading">Restablecer contraseña</span>
          <span class="btn-loader" v-else>
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
            </svg>
          </span>
        </button>

        <button type="button" class="resend-btn" @click="goToLogin">Volver a iniciar sesión</button>
      </form>
    </div>

    <!-- Decorative corner elements -->
    <div class="corner-decor corner-tl"></div>
    <div class="corner-decor corner-br"></div>
  </div>
</template>
