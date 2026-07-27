<script setup>
import { useLogin } from '../composables/useLogin.js'

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
</script>

<template>
  <div class="login-container">
    <!-- Twinkling starfield background -->
    <div class="starfield" aria-hidden="true"></div>

    <!-- Animated background shapes -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
    </div>

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
