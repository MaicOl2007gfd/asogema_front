<script setup>
/**
 * WalletView.vue — "Mi Saldo"
 * --------------------------------------------------------------
 * Billetera Asogema: recarga con rápidos (50k/100k/200k) o monto
 * libre (10k–2M), historial de recargas y saldo disponible.
 * Tema claro coherente con Index (crema + verde bosque).
 */
import { watch, onUnmounted } from 'vue'
import { useWallet } from '../composables/useWallet.js'

const emit = defineEmits(['navigate'])

const {
  saldo,
  recargas,
  loading,
  error,
  monto,
  montoError,
  quickAmounts,
  isRecargando,
  METODOS_RECARGA,
  metodoRecarga,
  esMetodoDirecto,
  datosIncompletos,
  phoneNumber,
  financialInstitutions,
  financialInstitutionCode,
  userLegalIdType,
  userLegalId,
  cardNumber,
  cardExpMonth,
  cardExpYear,
  cardCvc,
  cardHolder,
  waitingConfirmation,
  loadInstitutions,
  selectQuickAmount,
  recargar,
  formatCop,
  estadoLabel,
} = useWallet(emit)

watch(metodoRecarga, (metodo) => {
  if (metodo === 'PSE') loadInstitutions()
})

// Al salir de Mi Saldo, reseteamos monto y método para que la próxima
// visita arranque limpia (sin dejar el pago anterior a medias).
onUnmounted(() => {
  monto.value = ''
  metodoRecarga.value = 'TARJETA'
  error.value = ''
})
</script>

<template>
  <div class="wallet-wrap">
    <!-- Nav -->
    <nav class="wallet-nav">
      <div class="wallet-nav-brand" @click="emit('navigate', 'index')">
        <img src="/imagenes/Logo.png" alt="Asogema" class="wallet-nav-logo" />
        <span>Asogema</span>
      </div>
      <ul class="wallet-nav-links">
        <li><a href="#" @click.prevent="emit('navigate', 'index')">Inicio</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'hotel')">Hotel</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'restaurant')">Restaurante</a></li>
        <li><a href="#" @click.prevent="emit('navigate', 'events')">Eventos</a></li>
      </ul>
      <button type="button" class="wallet-nav-back" @click="emit('navigate', 'index')">
        ← Volver
      </button>
    </nav>

    <main class="wallet-main">
      <div class="wallet-grid">
        <!-- COLUMNA IZQUIERDA: saldo + recarga -->
        <div class="wallet-col">
          <header class="wallet-head">
            <img src="/imagenes/Logo.png" alt="Asogema" class="wallet-head-logo" />
            <div class="wallet-head-text">
              <span class="wallet-tag">Club Privado Social</span>
              <h1 class="wallet-title">Mi Saldo</h1>
            </div>
          </header>

          <!-- Saldo -->
          <div class="wallet-balance">
            <span class="wallet-balance-label">Saldo disponible</span>
            <strong class="wallet-balance-value">{{ loading ? '—' : formatCop(saldo) }}</strong>
            <span class="wallet-balance-hint">Usa tu saldo para pagar en hotel, restaurante o eventos</span>
          </div>

          <div v-if="error" class="wallet-error">{{ error }}</div>

          <!-- Recarga -->
          <section class="wallet-section">
            <h2 class="wallet-section-title">Recargar saldo</h2>
            <div class="wallet-quick">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                type="button"
                class="wallet-quick-btn"
                :class="{ active: Number(monto) === amount }"
                @click="selectQuickAmount(amount)"
              >
                {{ formatCop(amount) }}
              </button>
            </div>

            <div class="wallet-custom">
              <span class="wallet-custom-prefix">$</span>
              <input
                v-model="monto"
                type="number"
                min="10000"
                max="2000000"
                step="1000"
                placeholder="Monto libre (10.000 – 2.000.000)"
                aria-label="Monto a recargar"
              />
            </div>
            <p v-if="montoError" class="wallet-monto-error">{{ montoError }}</p>

            <!-- Método de pago de la recarga -->
            <div class="wallet-methods">
              <button
                v-for="m in METODOS_RECARGA"
                :key="m.value"
                type="button"
                class="wallet-method"
                :class="{ active: metodoRecarga === m.value }"
                @click="metodoRecarga = m.value"
              >
                <strong>{{ m.label }}</strong>
                <span>{{ m.hint }}</span>
              </button>
            </div>

            <!-- Campos Tarjeta (transacción directa) -->
            <div v-if="metodoRecarga === 'TARJETA'" class="wallet-fields">
              <label class="wallet-field">
                <span>Número de tarjeta</span>
                <input
                  v-model="cardNumber"
                  type="text"
                  inputmode="numeric"
                  maxlength="19"
                  placeholder="4242 4242 4242 4242"
                  @input="cardNumber = cardNumber.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')"
                />
              </label>
              <div class="wallet-field-row">
                <label class="wallet-field">
                  <span>Vence (MM/AA)</span>
                  <div class="wallet-exp">
                    <input
                      v-model="cardExpMonth"
                      type="text"
                      inputmode="numeric"
                      maxlength="2"
                      placeholder="MM"
                      @input="cardExpMonth = cardExpMonth.replace(/\D/g, '').slice(0, 2)"
                    />
                    <span>/</span>
                    <input
                      v-model="cardExpYear"
                      type="text"
                      inputmode="numeric"
                      maxlength="2"
                      placeholder="AA"
                      @input="cardExpYear = cardExpYear.replace(/\D/g, '').slice(0, 2)"
                    />
                  </div>
                </label>
                <label class="wallet-field">
                  <span>CVC</span>
                  <input
                    v-model="cardCvc"
                    type="password"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="123"
                    @input="cardCvc = cardCvc.replace(/\D/g, '').slice(0, 4)"
                  />
                </label>
              </div>
              <label class="wallet-field">
                <span>Titular</span>
                <input
                  v-model="cardHolder"
                  type="text"
                  maxlength="60"
                  placeholder="Nombre como aparece en la tarjeta"
                />
              </label>
              <p class="wallet-hint">Pago procesado de forma segura por Wompi. No almacenamos los datos de tu tarjeta.</p>
            </div>

            <!-- Campos Nequi / Daviplata -->
            <div v-if="metodoRecarga === 'NEQUI' || metodoRecarga === 'DAVIPLATA'" class="wallet-fields">
              <label class="wallet-field">
                <span>Celular registrado en {{ metodoRecarga }}</span>
                <input
                  v-model="phoneNumber"
                  type="tel"
                  inputmode="numeric"
                  maxlength="10"
                  placeholder="Ej: 3101234567"
                  @input="phoneNumber = phoneNumber.replace(/\D/g, '').slice(0, 10)"
                />
              </label>
              <div class="wallet-field-row">
                <label class="wallet-field">
                  <span>Tipo de documento</span>
                  <select v-model="userLegalIdType">
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="NIT">NIT</option>
                    <option value="PP">Pasaporte</option>
                  </select>
                </label>
                <label class="wallet-field">
                  <span>Número de documento</span>
                  <input
                    v-model="userLegalId"
                    type="text"
                    inputmode="numeric"
                    maxlength="12"
                    placeholder="Ej: 1099888777"
                    @input="userLegalId = userLegalId.replace(/\D/g, '').slice(0, 12)"
                  />
                </label>
              </div>
              <p class="wallet-hint">Se enviará una notificación a tu celular para confirmar el pago.</p>
            </div>

            <!-- Campos PSE -->
            <div v-if="metodoRecarga === 'PSE'" class="wallet-fields">
              <label class="wallet-field">
                <span>Banco</span>
                <select v-model="financialInstitutionCode">
                  <option value="" disabled>Selecciona tu banco</option>
                  <option v-for="bank in financialInstitutions" :key="bank.code" :value="bank.code">
                    {{ bank.name }}
                  </option>
                </select>
              </label>
              <div class="wallet-field-row">
                <label class="wallet-field">
                  <span>Tipo de documento</span>
                  <select v-model="userLegalIdType">
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="NIT">NIT</option>
                    <option value="PP">Pasaporte</option>
                  </select>
                </label>
                <label class="wallet-field">
                  <span>Número de documento</span>
                  <input
                    v-model="userLegalId"
                    type="text"
                    inputmode="numeric"
                    maxlength="12"
                    placeholder="Ej: 1099888777"
                    @input="userLegalId = userLegalId.replace(/\D/g, '').slice(0, 12)"
                  />
                </label>
              </div>
              <p class="wallet-hint">Serás redirigido a tu banco para completar el pago.</p>
            </div>

            <div v-if="waitingConfirmation" class="wallet-waiting">
              <span class="wallet-waiting-spinner" aria-hidden="true"></span>
              <strong>{{ metodoRecarga === 'TARJETA' ? 'Procesando tu pago' : 'Confirma el pago en tu celular' }}</strong>
              <p v-if="metodoRecarga === 'TARJETA'">Estamos confirmando el pago con tu tarjeta. No cierres esta página.</p>
              <p v-else>Acéptalo en tu app {{ metodoRecarga === 'DAVIPLATA' ? 'Daviplata' : 'Nequi' }}.</p>
            </div>

            <button
              type="button"
              class="wallet-btn"
              :disabled="isRecargando || !!montoError || !monto || (esMetodoDirecto && datosIncompletos)"
              @click="recargar"
            >
              <span v-if="isRecargando" class="wallet-spinner" aria-hidden="true"></span>
              <template v-else>Recargar {{ monto && !montoError ? formatCop(monto) : '' }}</template>
            </button>
            <p class="wallet-secure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Pago seguro procesado por Wompi · La recarga se acredita al confirmar el pago
            </p>
          </section>
        </div>

        <!-- COLUMNA DERECHA: historial -->
        <div class="wallet-col wallet-col--history">
          <section class="wallet-section">
            <h2 class="wallet-section-title">Historial de recargas</h2>
            <div v-if="recargas.length === 0 && !loading" class="wallet-history-empty">
              <span>Aún no has recargado. Tu saldo se acredita automáticamente.</span>
            </div>
            <div class="wallet-history">
              <div v-for="rec in recargas" :key="rec.id" class="wallet-history-item" :class="rec.estado === 'CONFIRMADO' ? 'ok' : 'pend'">
                <div class="wallet-history-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div class="wallet-history-info">
                  <strong>{{ formatCop(rec.monto) }}</strong>
                  <span>{{ new Date(rec.created_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) }}</span>
                </div>
                <span class="wallet-history-state">{{ estadoLabel(rec.estado) }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import url('../Wallet.css');
</style>