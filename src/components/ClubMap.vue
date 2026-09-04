<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Mapa Leaflet personalizado para mostrar la ubicación de la Sede
 * Recreacional ASOGEMA con un pin de marca (verde + dorado) y popup.
 *
 * Uso:
 *   <ClubMap :lat="4.44913" :lng="-75.1415" :zoom="16"
 *            title="Sede Recreacional ASOGEMA"
 *            address="Carrera 12 # 147-84, Barrio El Salado, Ibagué, Tolima" />
 */
const props = defineProps({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  zoom: { type: Number, default: 16 },
  title: { type: String, default: 'ASOGEMA' },
  address: { type: String, default: '' },
  height: { type: String, default: '440px' }
})

const mapEl = ref(null)
let map = null
let marker = null

/* Pin SVG personalizado (acorde a la paleta del sitio) */
const pinSvg = `
  <svg width="46" height="58" viewBox="0 0 46 58" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 10px rgba(11,31,13,.35));">
    <path d="M23 1C11.1 1 1.5 10.6 1.5 22.5c0 15.5 21.5 34.5 21.5 34.5S44.5 38 44.5 22.5C44.5 10.6 34.9 1 23 1z" fill="#133215" stroke="#C8A96A" stroke-width="2"/>
    <circle cx="23" cy="22.5" r="8.2" fill="#F3E8D3"/>
    <circle cx="23" cy="22.5" r="4.4" fill="#C8A96A"/>
  </svg>
`

function initMap() {
  if (!mapEl.value) return

  map = L.map(mapEl.value, {
    center: [props.lat, props.lng],
    zoom: props.zoom,
    scrollWheelZoom: false
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  const icon = L.divIcon({
    className: 'asogema-map-pin',
    html: pinSvg,
    iconSize: [46, 58],
    iconAnchor: [23, 56],
    popupAnchor: [0, -50]
  })

  marker = L.marker([props.lat, props.lng], { icon }).addTo(map)

  if (props.address) {
    const popup = `<strong>${props.title}</strong><br/>${props.address}`
    marker.bindPopup(popup).openPopup()
  }

  /* Si el contenedor se crea oculto (reveal), forzar el cálculo de tamaño */
  setTimeout(() => {
    if (map) map.invalidateSize()
  }, 350)
}

function onResize() {
  if (map) {
    setTimeout(() => map.invalidateSize(), 120)
  }
}

onMounted(() => {
  initMap()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (map) {
    map.remove()
    map = null
    marker = null
  }
})
</script>

<template>
  <div class="asogema-club-map" ref="mapEl" :style="{ height }" role="application" aria-label="Mapa de ubicación ASOGEMA"></div>
</template>

<style scoped>
.asogema-club-map {
  width: 100%;
  min-height: 320px;
  position: relative;
  z-index: 0;
  border-radius: 22px;
  overflow: hidden;
  background: #e8e3d6;
}
</style>
