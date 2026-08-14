<script setup>
import { useVerifyEmail } from '../composables/useVerifyEmail.js'
import Grainient from './Grainient.vue'

const emit = defineEmits(['navigate'])

const {
  email,
  codeParts,
  codeInputs,
  isLoading,
  isResending,
  isVisible,
  typingCode,
  codeError,
  errorMessage,
  successMessage,
  cooldown,
  handleSubmit,
  resendCode,
  handleCodeInput,
  handleCodeBackspace,
  handleCodePaste,
  focusInput,
} = useVerifyEmail(emit)
</script>

<template>
  <div class="login-container">
    <Grainient
      :time-speed="4"
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

    <div class="pattern-overlay" aria-hidden="true"></div>
    <div class="light-overlay" aria-hidden="true"></div>

    <div class="login-card verify-card" :class="{ visible: isVisible }">
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

      <div class="brand">
        <div class="logo-wrapper">
          <img src="/imagenes/Logo.png" alt="Asogema" class="logo-icon" />
        </div>
        <h1 class="brand-name">Asogema</h1>
        <p class="brand-tagline">Verifica tu correo</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit" novalidate>
        <p class="verify-hint">
          <template v-if="email">
            Te enviamos un código de 6 dígitos a <strong>{{ email }}</strong>.
          </template>
          <template v-else>
            No encontramos tu correo.
            <a href="#" class="signup-link" @click.prevent="$emit('navigate', 'register')">Crear una cuenta</a>
            para recibir tu código.
          </template>
        </p>

        <div
          class="code-boxes"
          :class="{ error: codeError }"
          role="group"
          aria-label="Código de verificación de 6 dígitos"
        >
          <input
            v-for="(part, index) in codeParts"
            :key="index"
            :ref="(el) => (codeInputs[index] = el)"
            :value="codeParts[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            :autocomplete="index === 0 ? 'one-time-code' : 'off'"
            :aria-label="'Dígito ' + (index + 1)"
            class="code-box"
            @input="handleCodeInput(index, $event)"
            @keydown.backspace="handleCodeBackspace(index)"
            @paste="handleCodePaste($event)"
            @focus="typingCode = true"
            @blur="typingCode = false"
          />
        </div>
        <span v-if="codeError" class="error-message code-error">{{ codeError }}</span>

        <div v-if="errorMessage" class="error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="success-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="success-icon">
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 10 10.5 15.5 8 13" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
        >
          <span class="btn-text" v-if="!isLoading">Verificar Código</span>
          <span class="btn-loader" v-else>
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
            </svg>
          </span>
        </button>

        <button
          type="button"
          class="resend-btn"
          :disabled="isResending || cooldown > 0"
          @click="resendCode"
        >
          <span v-if="cooldown > 0">Reenviar código ({{ cooldown }}s)</span>
          <span v-else-if="isResending">Reenviando...</span>
          <span v-else>¿No te llegó? Reenviar código</span>
        </button>
      </form>

      <div class="login-footer">
        <p class="signup-text">
          ¿Ya tienes una cuenta?
          <a href="#" class="signup-link" @click.prevent="$emit('navigate', 'login')">Iniciar Sesión</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verify-card {
  max-width: 440px;
}

.verify-hint {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text, #133215);
  margin-bottom: 20px;
  text-align: center;
}

.code-boxes {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 18px;
}

.code-box {
  width: 46px;
  height: 54px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #133215;
  background: rgba(19, 50, 21, 0.04);
  border: 1.5px solid rgba(19, 50, 21, 0.25);
  border-radius: 10px;
  outline: none;
  font-family: inherit;
  transition:
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.code-box:focus {
  border-color: #133215;
  background: rgba(19, 50, 21, 0.08);
  box-shadow: 0 0 0 3px rgba(19, 50, 21, 0.15);
}

.code-boxes.error .code-box {
  border-color: var(--color-error, #ff6b6b);
}

.code-error {
  display: block;
  text-align: center;
  margin: -10px 0 16px;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(46, 204, 113, 0.12);
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: var(--radius-sm, 10px);
  color: var(--color-success, #1a7f37);
  font-size: 0.875rem;
  margin-bottom: 16px;
}

.success-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.resend-btn {
  width: 100%;
  margin-top: 12px;
  padding: 10px 16px;
  background: transparent;
  border: 1.5px dashed rgba(19, 50, 21, 0.4);
  border-radius: 10px;
  color: #133215;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.resend-btn:hover:not(:disabled) {
  border-color: #133215;
  transform: translateY(-2px);
}

.resend-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
