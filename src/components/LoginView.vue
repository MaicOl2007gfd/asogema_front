<script setup>
import { useLogin } from '../composables/useLogin.js'
import { useSocialAuth } from '../composables/useSocialAuth.js'
import Grainient from './Grainient.vue'

const emit = defineEmits(['navigate'])

const {
  email,
  password,
  remember,
  showPassword,
  isLoading,
  isVisible,
  emailError,
  passwordError,
  errorMessage,
  typingEmail,
  typingPassword,
  togglePasswordVisibility,
  handleSubmit,
} = useLogin(emit)

const { socialLoading, redirectToGoogle, redirectToFacebook } = useSocialAuth()
</script>

<template>
  <div class="login-container">
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

    <!-- Bare tree branch - Left side -->
    <div class="branch-container branch-left" aria-hidden="true">
      <svg viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg" class="branch-svg">
        <path d="M380 0 Q340 120 300 200 Q260 280 240 350 Q220 420 250 480 Q280 540 300 600 Q310 640 320 700"
          stroke="#2d5a2e" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.25"/>
        <path d="M300 200 Q270 250 230 280 Q190 310 150 320"
          stroke="#2d5a2e" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.2"/>
        <path d="M240 350 Q210 380 180 390"
          stroke="#2d5a2e" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.15"/>
        <path d="M250 480 Q220 520 190 530"
          stroke="#2d5a2e" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.15"/>
      </svg>
    </div>

    <!-- Bare tree branch - Right side -->
    <div class="branch-container branch-right" aria-hidden="true">
      <svg viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg" class="branch-svg">
        <path d="M20 0 Q60 120 100 200 Q140 280 160 350 Q180 420 150 480 Q120 540 100 600 Q90 640 80 700"
          stroke="#2d5a2e" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.25"/>
        <path d="M100 200 Q130 250 170 280 Q210 310 250 320"
          stroke="#2d5a2e" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.2"/>
        <path d="M160 350 Q190 380 220 390"
          stroke="#2d5a2e" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.15"/>
        <path d="M150 480 Q180 520 210 530"
          stroke="#2d5a2e" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.15"/>
      </svg>
    </div>

    <!-- Subtle decorative rings -->
    <div class="deco-ring deco-ring-1"></div>
    <div class="deco-ring deco-ring-2"></div>

    <!-- Login Card -->
    <div class="login-card" :class="{ visible: isVisible }">
      <!-- Back arrow -->
      <button
        type="button"
        class="back-arrow"
        @click="$emit('navigate', 'index')"
        aria-label="Volver al inicio"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      <!-- Brand -->
      <div class="brand">
        <div class="logo-wrapper">
          <img src="/imagenes/Logo.png" alt="Asogema" class="logo-icon" />
        </div>
        <h1 class="brand-name">Asogema</h1>
        <p class="brand-tagline">Bienvenido de nuevo</p>
      </div>

      <!-- Form -->
      <form class="login-form" @submit.prevent="handleSubmit" novalidate>
        <!-- Campos agrupados: Correo + Contraseña -->
        <div class="fields-group">
          <!-- Email Field -->
          <div class="input-group" :class="{ focused: typingEmail, filled: email, error: emailError }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13L2 4" />
            </svg>
          </div>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            @focus="typingEmail = true"
            @blur="typingEmail = false"
            placeholder="Correo electrónico"
          />
          <label for="email">Correo electrónico</label>
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>

        <!-- Password Field -->
        <div class="input-group" :class="{ focused: typingPassword, filled: password, error: passwordError }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            @focus="typingPassword = true"
            @blur="typingPassword = false"
            placeholder="Contraseña"
          />
          <label for="password">Contraseña</label>
          <button
            type="button"
            class="toggle-password"
            @click="togglePasswordVisibility"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
          </div>
        </div>

        <!-- Remember & Forgot -->
        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="remember" />
            <span class="checkmark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span class="checkbox-label">Recordarme</span>
          </label>
          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="submit-btn"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
        >
          <span class="btn-text" v-if="!isLoading">Iniciar Sesión</span>
          <span class="btn-loader" v-else>
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
            </svg>
          </span>
        </button>

        <!-- Divider -->
        <div class="social-divider">
          <span>o continúa con</span>
        </div>

        <!-- Social login buttons -->
        <div class="social-buttons">
          <button
            type="button"
            class="social-btn social-btn-google"
            :disabled="socialLoading !== null || isLoading"
            @click="redirectToGoogle"
            aria-label="Continuar con Google"
          >
            <span v-if="socialLoading === 'google'" class="social-btn-loader">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
              </svg>
            </span>
            <template v-else>
              <svg class="social-icon" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Continuar con Google</span>
            </template>
          </button>

          <button
            type="button"
            class="social-btn social-btn-facebook"
            :disabled="socialLoading !== null || isLoading"
            @click="redirectToFacebook"
            aria-label="Continuar con Facebook"
          >
            <span v-if="socialLoading === 'facebook'" class="social-btn-loader">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
              </svg>
            </span>
            <template v-else>
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continuar con Facebook</span>
            </template>
          </button>
        </div>
      </form>

      <!-- Footer -->
      <div class="login-footer">
        <p class="signup-text">
          ¿No tienes una cuenta?
          <a href="#" class="signup-link" @click.prevent="$emit('navigate', 'register')">Registrarse</a>
        </p>
      </div>
    </div>

    <!-- Decorative corner elements -->
    <div class="corner-decor corner-tl"></div>
    <div class="corner-decor corner-br"></div>
  </div>
</template>
