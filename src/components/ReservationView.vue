<script setup>
/**
 * DEPRECATED — Estilo antiguo de reserva eliminado.
 * La reserva de habitación ahora la maneja BookingView.vue
 * (concepto "Dark Luxury Suite"). Este archivo solo redirige
 * a la nueva vista y se conserva por compatibilidad; App.vue
 * ya importa BookingView directamente.
 */
import BookingView from './BookingView.vue'
</script>

<template>
  <BookingView v-bind="$attrs" />
</template>
