<script setup>
/**
 * QrReaderView.vue — Lector QR del restaurante
 * --------------------------------------------------------------
 * Vista para Mesero/Administrador: escanea el QR del pedido
 * (cámara o código manual), muestra el detalle y permite avanzar
 * el estado: PENDIENTE → EN_PREPARACION → ENTREGADO.
 * Diseño minimalista y elegante (inspiración Apple).
 */
import { useQrReader } from '../composables/useQrReader.js'

const emit = defineEmits(['navigate'])

const {
  cameraActive,
  cameraError,
  manualCode,
  manualError,
  pedido,
  loading,
  updating,
  updateError,
  doneMessage,
  formatCop,
  estadoLabel,
  siguienteEstado,
  startCamera,
  stopCamera,
  submitManual,
  avanzarEstado,
  limpiar,
} = useQrReader()
</script>

<template>
  <div class="qr-wrap">
    <div class="qr-glow" aria-hidden="true"></div>

    <!-- Nav -->
    <nav class="qr-nav">
      <div class="qr-nav-brand" @click="emit('navigate', 'index')">
        <img src="/imagenes/Logo.png" alt="Asogema" class="qr-nav-logo" />
        <span>Asogema</span>
      </div>
      <div class="qr-nav-actions">
        <button type="button" class="qr-nav-btn" @click="emit('navigate', 'restaurant')">
          Restaurante
        </button>
        <button type="button" class="qr-nav-btn qr-nav-btn--ghost" @click="emit('navigate', 'index')">
          ← Volver
        </button>
      </div>
    </nav>

    <main class="qr-main">
      <header class="qr-head">
        <h1 class="qr-title">Lector de pedidos</h1>
        <p class="qr-subtitle">
          Escanea el código QR del pedido o ingresa el código manualmente
        </p>
      </header>

      <!-- Modo escaneo -->
      <div v-if="!pedido && !loading" class="qr-grid">
        <section class="qr-card">
          <div class="qr-card-head">
            <span class="qr-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                <path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M17 21v.01M21 17v.01"></path>
              </svg>
            </span>
            <div>
              <h2 class="qr-card-title">Cámara</h2>
              <p class="qr-card-hint">Apunta al QR del pedido</p>
            </div>
          </div>

          <div id="asogema-qr-reader" class="qr-camera" :class="{ active: cameraActive }"></div>

          <p v-if="cameraError" class="qr-msg qr-msg--err">{{ cameraError }}</p>

          <button
            type="button"
            class="qr-btn qr-btn--primary"
            :disabled="cameraActive"
            @click="startCamera"
          >
            {{ cameraActive ? 'Cámara activa…' : 'Activar cámara' }}
          </button>
          <button
            v-if="cameraActive"
            type="button"
            class="qr-btn qr-btn--ghost"
            @click="stopCamera"
          >
            Detener cámara
          </button>
        </section>

        <section class="qr-card">
          <div class="qr-card-head">
            <span class="qr-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 7V4h16v3M9 20h6M12 4v16"></path>
              </svg>
            </span>
            <div>
              <h2 class="qr-card-title">Código manual</h2>
              <p class="qr-card-hint">Pega el contenido del QR o el id del pedido</p>
            </div>
          </div>

          <div class="qr-input">
            <input
              v-model="manualCode"
              type="text"
              placeholder='Ej: 12 o {"pedido_id":"12",...}'
              @keyup.enter="submitManual"
            />
          </div>

          <p v-if="manualError" class="qr-msg qr-msg--err">{{ manualError }}</p>

          <button type="button" class="qr-btn qr-btn--primary" :disabled="!manualCode.trim()" @click="submitManual">
            Consultar pedido
          </button>
        </section>
      </div>

      <!-- Cargando -->
      <div v-else-if="loading" class="qr-loading">
        <span class="qr-loading-spinner" aria-hidden="true"></span>
        <p>Consultando pedido…</p>
      </div>

      <!-- Detalle del pedido -->
      <div v-else-if="pedido" class="qr-detail">
        <header class="qr-detail-head">
          <div>
            <span class="qr-detail-tag">Pedido #{{ pedido.pedido_id }}</span>
            <h2 class="qr-detail-type">
              {{ pedido.tipo === 'EN_MESA' ? 'En mesa' : 'Para llevar' }}
            </h2>
          </div>
          <span class="qr-state-chip" :class="pedido.estado.toLowerCase()">
            {{ estadoLabel(pedido.estado) }}
          </span>
        </header>

        <p v-if="pedido.cliente" class="qr-detail-client">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {{ pedido.cliente }}
        </p>

        <div class="qr-detail-items">
          <div v-for="item in pedido.items" :key="item.producto_id" class="qr-detail-item">
            <div class="qr-detail-item-info">
              <strong>{{ item.nombre }}</strong>
              <span>{{ item.cantidad }} × {{ formatCop(item.precio_unitario) }}</span>
            </div>
            <span class="qr-detail-item-price">{{ formatCop(item.subtotal) }}</span>
          </div>
        </div>

        <div class="qr-detail-total">
          <span>Total</span>
          <strong>{{ formatCop(pedido.total) }}</strong>
        </div>

        <p v-if="doneMessage" class="qr-msg qr-msg--ok">{{ doneMessage }}</p>
        <p v-if="updateError" class="qr-msg qr-msg--err">{{ updateError }}</p>

        <div class="qr-detail-actions">
          <button
            v-if="siguienteEstado()"
            type="button"
            class="qr-btn qr-btn--primary qr-btn--lg"
            :disabled="updating"
            @click="avanzarEstado"
          >
            {{ updating ? 'Actualizando…' : `Marcar como "${estadoLabel(siguienteEstado())}"` }}
          </button>
          <button type="button" class="qr-btn qr-btn--ghost" @click="limpiar">
            Escanear otro pedido
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import url('../QrReader.css');
</style>
