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
  unauthorized,
  isVisible,
  isVerifying,
  downloadingPdf,
  pdfError,
  status,
  displayStatus,
  formatCurrency,
  downloadInvoicePdf,
} = usePaymentResult()

function goToEvents() {
  emit('navigate', 'events')
}

function goToDashboard() {
  emit('navigate', 'dashboard')
}

function goToLogin() {
  emit('navigate', 'login')
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

        <!-- Sin sesión -->
        <div v-else-if="unauthorized" class="pr-unauthorized">
          <div class="pr-error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Inicia sesión para ver tu pago</h2>
          <p>Necesitas iniciar sesión para consultar el estado de tu pago y descargar tu factura electrónica.</p>
          <div class="pr-actions">
            <button class="pr-btn pr-btn--primary" @click="goToLogin">Iniciar sesión</button>
          </div>
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
            <p class="pr-subtitle">{{ isVerifying ? 'Estamos confirmando tu pago con el proveedor...' : 'Tu pago aún no ha sido confirmado. Si ya pagaste, verifica tu correo para conocer el estado de tu reserva.' }}</p>
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
                {{ displayStatus }}
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
            <div v-if="paymentData.pagos?.[0]?.fecha_pago" class="pr-detail-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span class="pr-detail-label">Fecha</span>
              <span class="pr-detail-value">{{ new Date(paymentData.pagos[0].fecha_pago).toLocaleString('es-CO') }}</span>
            </div>
          </div>

          <!-- Factura electrónica -->
          <div
            v-if="(status === 'APPROVED' || status === 'PAGADO' || status === 'CONFIRMADO') && paymentData?.cufe"
            class="pr-invoice"
          >
            <div class="pr-invoice-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <h3>Factura Electrónica</h3>
            </div>

            <div class="pr-invoice-row">
              <span class="pr-invoice-label">Número DIAN</span>
              <span class="pr-invoice-value">{{ paymentData.numero_factura }}</span>
            </div>
            <div class="pr-invoice-row pr-invoice-row--cufe">
              <span class="pr-invoice-label">CUFE</span>
              <span class="pr-invoice-value pr-invoice-value--cufe">{{ paymentData.cufe }}</span>
            </div>
            <div class="pr-invoice-row">
              <span class="pr-invoice-label">Estado DIAN</span>
              <span class="pr-invoice-value pr-invoice-value--valid">Validada</span>
            </div>

            <div class="pr-invoice-actions">
              <button class="pr-btn pr-btn--invoice" :disabled="downloadingPdf" @click="downloadInvoicePdf">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {{ downloadingPdf ? 'Descargando...' : 'Descargar PDF' }}
              </button>
              <a
                v-if="paymentData.qr_url"
                class="pr-btn pr-btn--invoice pr-btn--invoice-link"
                :href="paymentData.qr_url"
                target="_blank"
                rel="noopener"
              >
                Ver en DIAN
              </a>
            </div>
            <p v-if="pdfError" class="pr-invoice-error">{{ pdfError }}</p>
            <p class="pr-invoice-note">Este documento tiene validez oficial ante la DIAN.</p>
          </div>

          <!-- QR del pedido de restaurante -->
          <div v-if="paymentData.qr_pedido" class="pr-qr-pedido">
            <div class="pr-qr-pedido-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                <path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M17 21v.01M21 17v.01"></path>
              </svg>
              <div>
                <h3>Tu código de pedido</h3>
                <p>Muestra este QR en el restaurante para recoger tu pedido</p>
              </div>
            </div>
            <img :src="paymentData.qr_pedido" alt="QR del pedido" class="pr-qr-pedido-img" />
          </div>

          <!-- Actions: solo cuando el pago ya terminó (confirmado o fallido) -->
          <div v-if="status !== 'PENDING' && status !== 'PENDIENTE'" class="pr-actions">
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

          <div v-if="status !== 'PENDING' && status !== 'PENDIENTE'" class="pr-note">
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
