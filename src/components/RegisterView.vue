<script setup>
import { useRegister } from '../composables/useRegister.js'

const emit = defineEmits(['navigate'])

const {
  DOCUMENT_TYPES,
  firstName,
  secondName,
  firstSurname,
  secondSurname,
  docType,
  docNumber,
  phone,
  email,
  password,
  confirmPassword,
  acceptTerms,
  showPassword,
  showConfirmPassword,
  isLoading,
  isVisible,
  firstNameError,
  secondNameError,
  firstSurnameError,
  secondSurnameError,
  docTypeError,
  docNumberError,
  phoneError,
  emailError,
  passwordError,
  confirmPasswordError,
  termsError,
  typingFirstName,
  typingSecondName,
  typingFirstSurname,
  typingSecondSurname,
  typingDocNumber,
  typingPhone,
  typingEmail,
  typingPassword,
  typingConfirmPassword,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  handleSubmit,
} = useRegister(emit)
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

    <!-- Register Card -->
    <div class="login-card register-card" :class="{ visible: isVisible }">
      <!-- Brand -->
      <div class="brand">
        <div class="logo-wrapper">
          <img src="/imagenes/Logo.png" alt="Asogema" class="logo-icon" />
        </div>
        <h1 class="brand-name">Asogema</h1>
        <p class="brand-tagline">Crear una cuenta</p>
      </div>

      <!-- Form -->
      <form class="login-form" @submit.prevent="handleSubmit" novalidate>
        <!-- Row: Primer nombre | Segundo nombre -->
        <div class="form-row">
          <div class="input-group" :class="{ focused: typingFirstName, filled: firstName, error: firstNameError }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              id="reg-first-name"
              v-model="firstName"
              type="text"
              autocomplete="given-name"
              @focus="typingFirstName = true"
              @blur="typingFirstName = false"
              placeholder="Primer nombre"
            />
            <label for="reg-first-name">Primer nombre</label>
            <span v-if="firstNameError" class="error-message">{{ firstNameError }}</span>
          </div>
          <div class="input-group" :class="{ focused: typingSecondName, filled: secondName, error: secondNameError }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              id="reg-second-name"
              v-model="secondName"
              type="text"
              autocomplete="additional-name"
              @focus="typingSecondName = true"
              @blur="typingSecondName = false"
              placeholder="Segundo nombre"
            />
            <label for="reg-second-name">Segundo nombre</label>
            <span v-if="secondNameError" class="error-message">{{ secondNameError }}</span>
          </div>
        </div>

        <!-- Row: Primer apellido | Segundo apellido -->
        <div class="form-row">
          <div class="input-group" :class="{ focused: typingFirstSurname, filled: firstSurname, error: firstSurnameError }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              id="reg-first-surname"
              v-model="firstSurname"
              type="text"
              autocomplete="family-name"
              @focus="typingFirstSurname = true"
              @blur="typingFirstSurname = false"
              placeholder="Primer apellido"
            />
            <label for="reg-first-surname">Primer apellido</label>
            <span v-if="firstSurnameError" class="error-message">{{ firstSurnameError }}</span>
          </div>
          <div class="input-group" :class="{ focused: typingSecondSurname, filled: secondSurname, error: secondSurnameError }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              id="reg-second-surname"
              v-model="secondSurname"
              type="text"
              autocomplete="family-name"
              @focus="typingSecondSurname = true"
              @blur="typingSecondSurname = false"
              placeholder="Segundo apellido"
            />
            <label for="reg-second-surname">Segundo apellido</label>
            <span v-if="secondSurnameError" class="error-message">{{ secondSurnameError }}</span>
          </div>
        </div>

        <!-- Row: Tipo documento | Número documento -->
        <div class="form-row">
          <div class="input-group input-group-select" :class="{ focused: docType, filled: docType, error: docTypeError }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                <line x1="7" y1="10" x2="17" y2="10" />
                <line x1="7" y1="14" x2="12" y2="14" />
              </svg>
            </div>
            <select
              id="reg-doc-type"
              v-model="docType"
              @focus="docType"
              @blur="docType"
            >
              <option v-for="dt in DOCUMENT_TYPES" :key="dt.value" :value="dt.value">
                {{ dt.label }}
              </option>
            </select>
            <label for="reg-doc-type">Tipo de documento</label>
            <span v-if="docTypeError" class="error-message">{{ docTypeError }}</span>
          </div>
          <div class="input-group" :class="{ focused: typingDocNumber, filled: docNumber, error: docNumberError }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
                <line x1="7" y1="9" x2="17" y2="9" />
                <line x1="7" y1="13" x2="14" y2="13" />
              </svg>
            </div>
            <input
              id="reg-doc-number"
              v-model="docNumber"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              @focus="typingDocNumber = true"
              @blur="typingDocNumber = false"
              placeholder="N° de documento"
            />
            <label for="reg-doc-number">N° de documento</label>
            <span v-if="docNumberError" class="error-message">{{ docNumberError }}</span>
          </div>
        </div>

        <!-- Teléfono -->
        <div class="input-group" :class="{ focused: typingPhone, filled: phone, error: phoneError }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </div>
          <input
            id="reg-phone"
            v-model="phone"
            type="tel"
            autocomplete="tel"
            @focus="typingPhone = true"
            @blur="typingPhone = false"
            placeholder="Teléfono"
          />
          <label for="reg-phone">Teléfono</label>
          <span v-if="phoneError" class="error-message">{{ phoneError }}</span>
        </div>

        <!-- Email -->
        <div class="input-group" :class="{ focused: typingEmail, filled: email, error: emailError }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13L2 4" />
            </svg>
          </div>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            autocomplete="email"
            @focus="typingEmail = true"
            @blur="typingEmail = false"
            placeholder="Correo electrónico"
          />
          <label for="reg-email">Correo electrónico</label>
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>

        <!-- Contraseña -->
        <div class="input-group" :class="{ focused: typingPassword, filled: password, error: passwordError }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <input
            id="reg-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            @focus="typingPassword = true"
            @blur="typingPassword = false"
            placeholder="Contraseña"
          />
          <label for="reg-password">Contraseña</label>
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

        <!-- Confirmar Contraseña -->
        <div class="input-group" :class="{ focused: typingConfirmPassword, filled: confirmPassword, error: confirmPasswordError }">
          <div class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
              <polyline points="9 16 11 18 15 14" />
            </svg>
          </div>
          <input
            id="reg-confirm-password"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            @focus="typingConfirmPassword = true"
            @blur="typingConfirmPassword = false"
            placeholder="Confirmar contraseña"
          />
          <label for="reg-confirm-password">Confirmar contraseña</label>
          <button
            type="button"
            class="toggle-password"
            @click="toggleConfirmPasswordVisibility"
            :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            <svg v-if="!showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
          <span v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</span>
        </div>

        <!-- Accept Terms -->
        <div class="form-options">
          <label class="checkbox-wrapper" :class="{ error: termsError }">
            <input type="checkbox" v-model="acceptTerms" />
            <span class="checkmark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span class="checkbox-label">Acepto los términos y condiciones</span>
          </label>
        </div>
        <span v-if="termsError" class="error-message terms-error">{{ termsError }}</span>

        <!-- Submit Button -->
        <button
          type="submit"
          class="submit-btn"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
        >
          <span class="btn-text" v-if="!isLoading">Crear Cuenta</span>
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
          ¿Ya tienes una cuenta?
          <a href="#" class="signup-link" @click.prevent="$emit('navigate', 'login')">Iniciar Sesión</a>
        </p>
      </div>
    </div>

    <!-- Decorative corner elements -->
    <div class="corner-decor corner-tl"></div>
    <div class="corner-decor corner-br"></div>
  </div>
</template>
