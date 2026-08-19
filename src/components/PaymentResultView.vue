<script setup>
/**
 * PaymentResultView.vue — Resultado de pago Wompi
 * --------------------------------------------------------------
 * Pantalla que muestra el resultado del pago después de que Wompi
 * redirige al usuario. Lee factura_id de sessionStorage/URL params
 * y consulta el estado real al backend.
 *
 * Concepto: "Dark Luxury Suite" — lujo oscuro con glassmorphism.
 * Pantalla enfocada (sin navbar ni footer).
 */
import { usePaymentResult } from '../composables/usePaymentResult.js'

const emit = defineEmits(['navigate'])

const {
  isLoading,
  error,
  paymentData,
  wompiTransactionId,
  isVisible,
  formatCurrency,
  getDisplayStatus,
  mapWompiStatus,
} = usePaymentResult()

const status = getDisplayStatus()

function goToEvents() {
  emit('navigate', 'events')
}

function goToDashboard() {
  emit('navigate', 'dashboard')
}

function goHome() {
  emit('navigate', 'index')
}
</script>

<template>
  <div class="pr-page">
    <main class="pr-main" :class="{ visible: isVisible }">
      <div class="pr-card">
        <span
          class="pr-accent"
          :class="{
            'pr-accent--approved': status === 'APPROVED' || status === 'PAGADO' || status === 'CONFIRMADO',
            'pr-accent--pending': status === 'PENDING' || status === 'PENDIENTE',
            'pr-accent--declined': status === 'DECLINED' || status === 'RECHAZADO' || status === 'ERROR' || status === 'VOIDED' || status === 'ANULADO',
          }"
        ></span>

        <!-- Loading -->
        <div v-if="isLoading" class="pr-loader">
          <div class="pr-spinner"></div>
          <p>Verificando estado del pago...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="pr-error">
          <div class="pr-error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h2>Error al verificar</h2>
          <p>{{ error }}</p>
          <div class="pr-actions">
            <button class="pr-btn pr-btn--primary" @click="goHome">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Inicio
            </button>
          </div>
        </div>

        <!-- Result -->
        <div v-else class="pr-result">
          <!-- Approved -->
          <template v-if="status === 'APPROVED' || status === 'PAGADO' || status === 'CONFIRMADO'">
            <div class="pr-icon pr-icon--approved">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 class="pr-title">Pago Confirmado</h2>
            <p class="pr-subtitle">Tu pago ha sido procesado exitosamente. Recibirás un correo con los detalles de tu reserva.</p>
          </template>

          <!-- Pending -->
          <template v-else-if="status === 'PENDING' || status === 'PENDIENTE'">
            <div class="pr-icon pr-icon--pending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h2 class="pr-title">Pago Pendiente</h2>
            <p class="pr-subtitle">Tu pago está siendo procesado. Esto puede tomar unos minutos. Te notificaremos por correo cuando se confirme.</p>
          </template>

          <!-- Declined / Error / Voided -->
          <template v-else>
            <div class="pr-icon pr-icon--declined">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 class="pr-title">Pago No Completado</h2>
            <p class="pr-subtitle">El pago no pudo ser procesado. Puedes intentar nuevamente desde tu panel de reservas.</p>
          </template>

          <!-- Details -->
          <div v-if="paymentData" class="pr-details">
            <div class="pr-detail-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span class="pr-detail-label">Factura</span>
              <span class="pr-detail-value">#{{ paymentData.factura_id }}</span>
            </div>
            <div class="pr-detail-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span class="pr-detail-label">Total</span>
              <span class="pr-detail-value pr-detail-value--total">{{ formatCurrency(paymentData.total) }}</span>
            </div>
            <div class="pr-detail-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span class="pr-detail-label">Estado</span>
              <span class="pr-detail-value pr-detail-value--status">
                <span
                  class="pr-status-dot"
                  :class="{
                    'pr-status-dot--approved': status === 'APPROVED' || status === 'PAGADO' || status === 'CONFIRMADO',
                    'pr-status-dot--pending': status === 'PENDING' || status === 'PENDIENTE',
                    'pr-status-dot--declined': status === 'DECLINED' || status === 'RECHAZADO' || status === 'ERROR' || status === 'VOIDED' || status === 'ANULADO',
                  }"
                ></span>
                {{ mapWompiStatus(status) }}
              </span>
            </div>
            <div v-if="paymentData.pagos?.length" class="pr-detail-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <span class="pr-detail-label">Método</span>
              <span class="pr-detail-value">{{ paymentData.pagos[0].metodo_pago }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="pr-actions">
            <button class="pr-btn pr-btn--primary" @click="goToEvents">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Eventos
            </button>
            <button class="pr-btn pr-btn--secondary" @click="goToDashboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </button>
          </div>

          <div class="pr-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Recibirás un correo con los detalles de tu reserva
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import url('../PaymentResult.css');
</style>
