<script setup>
/**
 * ReservationDatePicker.vue
 * --------------------------------------------------------------
 * Date picker 100% personalizado (NO usa el input nativo del
 * navegador). Renderiza un campo con icono de calendario estilizado
 * y un popover de calendario propio con:
 *   - Navegación de mes (anterior / siguiente).
 *   - Días deshabilitados según `minDate` / `maxDate`.
 *   - Marcado del día de hoy y del día seleccionado.
 *   - Cierre al hacer clic fuera o al elegir una fecha.
 *
 * Props:
 *   modelValue  -> String ISO (YYYY-MM-DD)
 *   minDate     -> String ISO; días estrictamente anteriores se deshabilitan
 *   maxDate     -> String ISO (opcional); días posteriores se deshabilitan
 *   placeholder -> Texto de guía cuando no hay fecha
 *   invalid     -> Boolean; resalta el campo con borde rojo suave
 *
 * Emits:
 *   update:modelValue  -> nueva fecha ISO o '' al limpiar
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  minDate: { type: String, default: '' },
  maxDate: { type: String, default: '' },
  placeholder: { type: String, default: 'Selecciona una fecha' },
  invalid: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

/* ----------------------------------------------------------
   Estado del popover
   ---------------------------------------------------------- */
const open = ref(false)
const rootEl = ref(null)
// Mes que se muestra actualmente en el calendario
const viewDate = ref(new Date())

/* ----------------------------------------------------------
   Utilidades de fecha (locales, sin desfase de zona horaria)
   ---------------------------------------------------------- */
function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseISO(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const todayISO = toISO(new Date())

/* ----------------------------------------------------------
   Computed del calendario
   ---------------------------------------------------------- */
const viewYear = computed(() => viewDate.value.getFullYear())
const viewMonth = computed(() => viewDate.value.getMonth())

// Título del mes visible, p. ej. "agosto 2026"
const monthLabel = computed(() => {
  const label = viewDate.value.toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
})

// Cabecera de días de la semana (semana que inicia en domingo)
const weekdays = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

// Evita navegar a un mes anterior al mes de `minDate`
const canPrevMonth = computed(() => {
  const min = parseISO(props.minDate)
  if (!min) return true
  const viewStart = new Date(viewYear.value, viewMonth.value, 1)
  const minStart = new Date(min.getFullYear(), min.getMonth(), 1)
  return viewStart > minStart
})

// Decide si una fecha está fuera de rango (deshabilitada)
function isDisabled(iso, date) {
  const min = parseISO(props.minDate)
  const max = parseISO(props.maxDate)
  if (min && date < min) return true
  if (max && date > max) return true
  return false
}

// Grid de celdas: huecos vacíos + días del mes con su estado
const calendarDays = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const startWeekday = first.getDay() // 0 = domingo
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const cells = []

  // Espacios en blanco para alinear el primer día del mes
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ key: `blank-${i}`, blank: true })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear.value, viewMonth.value, d)
    const iso = toISO(date)
    cells.push({
      key: iso,
      day: d,
      iso,
      blank: false,
      disabled: isDisabled(iso, date),
      isToday: iso === todayISO,
      isSelected: iso === props.modelValue,
    })
  }
  return cells
})

/* ----------------------------------------------------------
   Formato de presentación de la fecha seleccionada
   ---------------------------------------------------------- */
function formatDisplay(value) {
  if (!value) return ''
  const d = parseISO(value)
  if (!d) return value
  return d.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/* ----------------------------------------------------------
   Acciones
   ---------------------------------------------------------- */
function openCalendar() {
  // Al abrir, centra la vista en la fecha elegida (o mínima / hoy)
  const target = parseISO(props.modelValue) || parseISO(props.minDate) || new Date()
  viewDate.value = new Date(target.getFullYear(), target.getMonth(), 1)
  open.value = true
}

function closeCalendar() {
  open.value = false
}

function toggle() {
  if (open.value) closeCalendar()
  else openCalendar()
}

function prevMonth() {
  viewDate.value = new Date(viewYear.value, viewMonth.value - 1, 1)
}

function nextMonth() {
  viewDate.value = new Date(viewYear.value, viewMonth.value + 1, 1)
}

function selectDay(cell) {
  if (cell.blank || cell.disabled) return
  emit('update:modelValue', cell.iso)
  closeCalendar()
}

function clear() {
  emit('update:modelValue', '')
  closeCalendar()
}

/* ----------------------------------------------------------
   Cierre al hacer clic fuera del componente
   ---------------------------------------------------------- */
function handleOutsideClick(event) {
  if (open.value && rootEl.value && !rootEl.value.contains(event.target)) {
    closeCalendar()
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <div ref="rootEl" class="rsdp">
    <!-- Campo de disparo: icono de calendario + fecha formateada -->
    <button
      type="button"
      class="rsdp-field"
      :class="{ open, invalid }"
      :aria-expanded="open"
      aria-haspopup="dialog"
      @click="toggle"
    >
      <span class="rsdp-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <path d="M8 14h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 14h.01"></path>
        </svg>
      </span>
      <span class="rsdp-value" :class="{ placeholder: !modelValue }">
        {{ modelValue ? formatDisplay(modelValue) : placeholder }}
      </span>
      <svg class="rsdp-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <!-- Popover del calendario -->
    <transition name="rsdp-pop">
      <div v-if="open" class="rsdp-pop" role="dialog" aria-label="Calendario">
        <!-- Navegación de mes -->
        <div class="rsdp-head">
          <button
            type="button"
            class="rsdp-nav"
            :disabled="!canPrevMonth"
            aria-label="Mes anterior"
            @click="prevMonth"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="rsdp-month">{{ monthLabel }}</span>
          <button type="button" class="rsdp-nav" aria-label="Mes siguiente" @click="nextMonth">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Cabecera de días -->
        <div class="rsdp-weekdays">
          <span v-for="w in weekdays" :key="w">{{ w }}</span>
        </div>

        <!-- Cuadrícula de días -->
        <div class="rsdp-grid">
          <button
            v-for="cell in calendarDays"
            :key="cell.key"
            type="button"
            class="rsdp-day"
            :class="{
              blank: cell.blank,
              disabled: cell.disabled,
              today: cell.isToday,
              selected: cell.isSelected,
            }"
            :disabled="cell.blank || cell.disabled"
            @click="selectDay(cell)"
          >
            {{ cell.day }}
          </button>
        </div>

        <!-- Acción secundaria: limpiar -->
        <div class="rsdp-footer">
          <button type="button" class="rsdp-clear" @click="clear">Limpiar</button>
        </div>
      </div>
    </transition>
  </div>
</template>
