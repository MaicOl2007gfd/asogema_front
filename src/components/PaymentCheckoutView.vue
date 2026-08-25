<script setup>
/**
 * PaymentCheckoutView.vue — Pasarela de pago
 * --------------------------------------------------------------
 * Confirmación limpia y compacta: resumen a la izquierda,
 * métodos de pago a la derecha. Items y cupón colapsables.
 */
import { ref, computed, watch, onMounted } from 'vue'
import { usePaymentCheckout } from '../composables/usePaymentCheckout.js'

const emit = defineEmits(['navigate'])

const {
  request,
  items,
  subtotal,
  descuento,
  impuestos,
  total,
  conSaldo,
  saldoDisponible,
  saldoInsuficiente,
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
  waitingTransactionId,
  couponCode,
  couponInfo,
  couponError,
  couponLoading,
  metodoPago,
  isSubmitting,
  submitError,
  formatCop,
  loadSaldo,
  loadInstitutions,
  validarCupon,
  quitarCupon,
  pagar,
} = usePaymentCheckout()

const TIPO_LABEL = {
  RESTAURANTE: 'Pedido Restaurante',
  HOTEL: 'Reserva de Hotel',
  EVENTO: 'Reserva de Evento',
  RECARGA: 'Recarga de Saldo',
}

const couponOpen = ref(false)
const showAllItems = ref(false)

const visibleItems = computed(() =>
  showAllItems.value ? items.value : items.value.slice(0, 3),
)

watch(metodoPago, (metodo) => {
  if (metodo === 'PSE') loadInstitutions()
})

function goBack() {
  emit('navigate', request?.value?.origen || 'index')
}

function toggleItems() {
  showAllItems.value = !showAllItems.value
}

onMounted(() => {
  loadSaldo()
  requestAnimationFrame(() => {
    document.body.classList.add('paycheckout-mounted')
  })
})
</script>

<template>
  <div class="paycheckout-wrap">
    <div class="paycheckout-orb" aria-hidden="true"></div>

    <div class="paycheckout-card">
      <!-- Header -->
      <header class="paycheckout-header">
        <button type="button" class="paycheckout-back" @click="goBack" aria-label="Volver">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="paycheckout-brand">
          <img src="/imagenes/Logo.png" alt="Asogema" class="paycheckout-logo" />
          <span>Asogema</span>
        </div>
        <div class="paycheckout-pill" aria-hidden="true"></div>
      </header>

      <!-- Sin pedido pendiente -->
      <div v-if="!request" class="paycheckout-empty">
        <div class="paycheckout-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2>No hay un pago pendiente</h2>
        <p>Selecciona un producto o servicio para continuar.</p>
        <button type="button" class="paycheckout-btn paycheckout-btn--dark" @click="emit('navigate', 'index')">
          Volver al inicio
        </button>
      </div>

      <!-- Body -->
      <div v-else class="paycheckout-body">
        <div class="paycheckout-grid">
          <!-- LEFT: resumen -->
          <section class="paycheckout-col">
            <div class="paycheckout-title-row">
              <h2 class="paycheckout-title">{{ TIPO_LABEL[request.tipo] || request.tipo }}</h2>
              <span v-if="request.tipo === 'RECARGA'" class="paycheckout-chip">Recarga</span>
            </div>

            <!-- Items -->
            <div v-if="items.length > 0" class="paycheckout-items">
              <div v-for="item in visibleItems" :key="item.id" class="paycheckout-item">
                <div class="paycheckout-item-img">
                  <img :src="item.image" :alt="item.name" />
                </div>
                <div class="paycheckout-item-info">
                  <span class="paycheckout-item-name">{{ item.name }}</span>
                  <span class="paycheckout-item-qty">Cantidad: {{ item.quantity }}</span>
                </div>
                <span class="paycheckout-item-price">
                  {{ formatCop(Number(item.precio ?? item.price) * item.quantity) }}
                </span>
              </div>
              <button v-if="items.length > 3" type="button" class="paycheckout-more" @click="toggleItems">
                {{ showAllItems ? 'Ver menos' : `Ver ${items.length} productos` }}
              </button>
            </div>
            <div v-else-if="request.tipo === 'RECARGA'" class="paycheckout-recharge-row">
              <span>Monto a recargar</span>
              <strong>{{ formatCop(request.monto) }}</strong>
            </div>
            <div v-else-if="request.montoReferencia != null" class="paycheckout-recharge-row">
              <span>Valor base</span>
              <strong>{{ formatCop(request.montoReferencia) }}</strong>
            </div>

            <!-- Cupón (colapsable) -->
            <div class="paycheckout-coupon">
              <button
                v-if="!couponInfo && !couponOpen"
                type="button"
                class="paycheckout-coupon-toggle"
                @click="couponOpen = true"
              >
                ¿Tienes un cupón de descuento?
              </button>
              <template v-else>
                <div class="paycheckout-coupon-input" :class="{ applied: couponInfo }">
                  <svg v-if="couponInfo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <input
                    v-model="couponCode"
                    type="text"
                    maxlength="20"
                    placeholder="Código de descuento"
                    :disabled="!!couponInfo"
                    @keyup.enter="validarCupon"
                  />
                  <button
                    v-if="couponInfo"
                    type="button"
                    class="paycheckout-coupon-clear"
                    @click="quitarCupon"
                    aria-label="Quitar cupón"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <button
                    v-else
                    type="button"
                    class="paycheckout-coupon-apply"
                    :disabled="couponLoading || !couponCode.trim()"
                    @click="validarCupon"
                  >
                    {{ couponLoading ? 'Validando…' : 'Aplicar' }}
                  </button>
                </div>
                <p v-if="couponInfo" class="paycheckout-coupon-msg paycheckout-coupon-msg--ok">
                  Cupón {{ couponCode.toUpperCase() }} aplicado: {{ couponInfo.porcentaje }}%
                </p>
                <p v-else-if="couponError" class="paycheckout-coupon-msg paycheckout-coupon-msg--err">
                  {{ couponError }}
                </p>
              </template>
            </div>

            <!-- Desglose compacto -->
            <div class="paycheckout-breakdown">
              <div class="paycheckout-line">
                <span>Subtotal</span>
                <span>{{ formatCop(subtotal) }}</span>
              </div>
              <div v-if="descuento > 0" class="paycheckout-line">
                <span>Descuento</span>
                <span class="paycheckout-line--discount">−{{ formatCop(descuento) }}</span>
              </div>
              <div v-if="impuestos > 0" class="paycheckout-line">
                <span>IVA 19%</span>
                <span>{{ formatCop(impuestos) }}</span>
              </div>
              <div class="paycheckout-total">
                <span>Total a pagar</span>
                <strong>{{ formatCop(total) }}</strong>
              </div>
            </div>
          </section>

          <!-- RIGHT: método de pago -->
          <section class="paycheckout-col paycheckout-col--pay">
            <h3 class="paycheckout-subtitle">Método de pago</h3>

            <div class="paycheckout-methods">
              <label class="paycheckout-method" :class="{ active: metodoPago === 'TARJETA' }">
                <input v-model="metodoPago" type="radio" value="TARJETA" />
                <div class="paycheckout-method-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
                <div class="paycheckout-method-text">
                  <strong>Tarjeta</strong>
                  <span>Crédito o débito (Wompi)</span>
                </div>
                <span v-if="metodoPago === 'TARJETA'" class="paycheckout-method-check">✓</span>
              </label>

              <label v-if="request.tipo !== 'RECARGA'" class="paycheckout-method" :class="{ active: conSaldo }">
                <input v-model="metodoPago" type="radio" value="SALDO" />
                <div class="paycheckout-method-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div class="paycheckout-method-text">
                  <strong>Mi saldo</strong>
                  <span v-if="saldoDisponible != null">
                    Disponible: {{ formatCop(saldoDisponible) }}
                  </span>
                  <span v-else>Cargando saldo…</span>
                </div>
                <span v-if="conSaldo" class="paycheckout-method-check">✓</span>
              </label>
            </div>

            <div v-if="metodoPago === 'TARJETA'" class="paycheckout-cardtype"></div>

            <!-- Campos Tarjeta (transacción directa) -->
            <div v-if="metodoPago === 'TARJETA'" class="paycheckout-fields">
              <label class="paycheckout-field">
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
              <div class="paycheckout-field-row">
                <label class="paycheckout-field">
                  <span>Vence (MM/AA)</span>
                  <div class="paycheckout-exp">
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
                <label class="paycheckout-field">
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
              <label class="paycheckout-field">
                <span>Titular</span>
                <input
                  v-model="cardHolder"
                  type="text"
                  maxlength="60"
                  placeholder="Nombre como aparece en la tarjeta"
                />
              </label>
              <p class="paycheckout-hint">Pago procesado de forma segura por Wompi. No almacenamos los datos de tu tarjeta.</p>
            </div>

            <!-- Campos Nequi / Daviplata -->
            <div v-if="metodoPago === 'NEQUI' || metodoPago === 'DAVIPLATA'" class="paycheckout-fields">
              <label class="paycheckout-field">
                <span>Celular registrado en {{ metodoPago }}</span>
                <input
                  v-model="phoneNumber"
                  type="tel"
                  inputmode="numeric"
                  maxlength="10"
                  placeholder="Ej: 3101234567"
                  @input="phoneNumber = phoneNumber.replace(/\D/g, '').slice(0, 10)"
                />
              </label>
              <p class="paycheckout-hint">Se enviará una notificación a tu celular para confirmar el pago.</p>
            </div>

            <!-- Campos PSE -->
            <div v-if="metodoPago === 'PSE'" class="paycheckout-fields">
              <label class="paycheckout-field">
                <span>Banco</span>
                <select v-model="financialInstitutionCode">
                  <option value="" disabled>Selecciona tu banco</option>
                  <option v-for="bank in financialInstitutions" :key="bank.code" :value="bank.code">
                    {{ bank.name }}
                  </option>
                </select>
              </label>
              <div class="paycheckout-field-row">
                <label class="paycheckout-field">
                  <span>Tipo de documento</span>
                  <select v-model="userLegalIdType">
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="NIT">NIT</option>
                    <option value="TI">Tarjeta de identidad</option>
                    <option value="PP">Pasaporte</option>
                  </select>
                </label>
                <label class="paycheckout-field">
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
              <p class="paycheckout-hint">Serás redirigido a tu banco para completar el pago.</p>
            </div>

            <p v-if="saldoInsuficiente" class="paycheckout-saldo-warn">
              Saldo insuficiente: necesitas {{ formatCop(total) }} y tienes {{ formatCop(saldoDisponible) }}.
            </p>
            <p v-if="submitError" class="paycheckout-submit-error">{{ submitError }}</p>

            <!-- Espera de confirmación (Nequi/Daviplata) -->
            <div v-if="waitingConfirmation" class="paycheckout-waiting">
              <span class="paycheckout-waiting-spinner" aria-hidden="true"></span>
              <strong>{{ metodoPago === 'TARJETA' ? 'Procesando tu pago' : 'Confirma el pago en tu celular' }}</strong>
              <p v-if="metodoPago === 'TARJETA'">
                Estamos confirmando el pago con tu tarjeta. No cierres esta página.
              </p>
              <p v-else>
                Enviamos una notificación de pago. Acéptala en tu app
                {{ metodoPago === 'DAVIPLATA' ? 'Daviplata' : 'Nequi' }}.
              </p>
              <small>Ref: {{ waitingTransactionId }}</small>
            </div>

            <button
              v-else
              type="button"
              class="paycheckout-btn paycheckout-btn--pay"
              :disabled="isSubmitting || saldoInsuficiente || (esMetodoDirecto && datosIncompletos) || (request.tipo === 'RECARGA' && conSaldo)"
              @click="pagar"
            >
              <span v-if="isSubmitting" class="paycheckout-spinner" aria-hidden="true"></span>
              <template v-else>
                {{
                  conSaldo
                    ? 'Pagar con saldo'
                    : esMetodoDirecto
                      ? 'Pagar ahora'
                      : 'Continuar'
                }}
              </template>
            </button>
            <p class="paycheckout-secure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Pago seguro procesado por Wompi · IVA incluido
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import url('../PaymentCheckout.css');
</style>