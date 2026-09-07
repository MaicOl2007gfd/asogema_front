<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useRecepcion } from '../composables/useRecepcion.js'
import '../PanelRecepcion.css'
import { formatDate, todayIso, formatCop } from '../composables/useUtils.js'

const emit = defineEmits(['navigate'])
const { user, logout, isRecepcionista } = useAuth()
const { bookings, fecha, tipo, loading, error, lastError, lastSuccess, counts, fetchDay, checkIn, checkOut, clearMessages, estadoLabel, estadoClass } = useRecepcion()

const autoTimer = ref(null)

function initials() {
  if (!user.value) return '?'
  const name = user.value.name || `${user.value.nombre || ''} ${user.value.apellido || ''}`.trim()
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
}

function handleLogout() {
  logout()
  emit('navigate','index')
}

function startAuto() {
  stopAuto()
  autoTimer.value = setInterval(() => { if (!loading.value) fetchDay() }, 30000)
}
function stopAuto() {
  if (autoTimer.value) { clearInterval(autoTimer.value); autoTimer.value = null }
}

async function onChangeType(t) {
  tipo.value = t
  clearMessages()
  await fetchDay()
}
async function onChangeDate() {
  clearMessages()
  await fetchDay()
}
async function onRefresh() {
  clearMessages()
  await fetchDay()
}
async function goToday() {
  fecha.value = todayIso()
  clearMessages()
  await fetchDay()
}

const confirmState = ref({ open:false, action:null, id:null, reserva:null })
function openConfirm(action, id, reserva) {
  confirmState.value = { open:true, action, id, reserva }
}
function closeConfirm() { confirmState.value = { open:false, action:null, id:null, reserva:null } }

async function confirmAction() {
  const { action, id } = confirmState.value
  closeConfirm()
  const ok = action === 'checkin' ? await checkIn(id) : await checkOut(id)
  // toasts handled by watch below
}

// computed helpers for state
function canCheckIn(r) { return fecha.value === todayIso() && r.estado === 'CONFIRMADA' }
function canCheckOut(r) { return fecha.value === todayIso() && r.estado === 'CHECK_IN' && (r.saldo_pendiente ?? 0) === 0 }
function canCheckOutBlocked(r) { return fecha.value === todayIso() && r.estado === 'CHECK_IN' && (r.saldo_pendiente ?? 0) > 0 }
function tipoLabel(t) {
  const map = { 'check-in':'check-in','check-out':'check-out', 'ocupadas':'ocupadas', 'todas':'todas' }
  return map[t] || t
}

onMounted(()=>{ fetchDay(); startAuto() })
onUnmounted(()=>{ stopAuto() })
</script>

<template>
  <div class="rec-page">
    <header class="rec-header">
      <div class="rec-header-inner">
        <div class="rec-brand">
          <img src="/imagenes/Logo.png" alt="Asogema" class="rec-logo" />
          <div>
            <div class="rec-title">Panel Recepción</div>
            <div class="rec-title-sub">Reservas del día · Check-in / Check-out</div>
          </div>
        </div>
        <div class="rec-user-pill">
          <div class="rec-user-avatar">{{ initials() }}</div>
          <div>
            <div style="font-weight:600">{{ user?.name }}</div>
            <div style="font-size:12px;opacity:.8">Recepcionista</div>
          </div>
          <button class="rec-logout" @click="handleLogout" title="Cerrar sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>

    <main class="rec-main">
      <div class="rec-controls">
        <input class="rec-date" type="date" v-model="fecha" @change="onChangeDate" />
        <button class="rec-btn" @click="goToday">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Hoy</span>
        </button>
        <div class="rec-tabs">
          <button class="rec-tab" :class="{active: tipo==='check-in'}" @click="onChangeType('check-in')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span>Check-in</span>
            <span v-if="counts['check-in'] > 0" class="rec-tab-badge">{{ counts['check-in'] }}</span>
          </button>
          <button class="rec-tab" :class="{active: tipo==='check-out'}" @click="onChangeType('check-out')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Check-out</span>
            <span v-if="counts['check-out'] > 0" class="rec-tab-badge">{{ counts['check-out'] }}</span>
          </button>
          <button class="rec-tab" :class="{active: tipo==='ocupadas'}" @click="onChangeType('ocupadas')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Ocupadas</span>
            <span v-if="counts['ocupadas'] > 0" class="rec-tab-badge">{{ counts['ocupadas'] }}</span>
          </button>
          <button class="rec-tab" :class="{active: tipo==='todas'}" @click="onChangeType('todas')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <span>Todas</span>
            <span v-if="counts['todas'] > 0" class="rec-tab-badge">{{ counts['todas'] }}</span>
          </button>
        </div>
        <button class="rec-btn" @click="onRefresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <span>Actualizar</span>
        </button>
      </div>

      <div class="rec-banner">
        <span class="rec-banner-icon">📅</span>
        <span>
          Mostrando <strong>{{ tipoLabel(tipo) }}</strong> del
          <strong>{{ formatDate(fecha) }}</strong> · {{ bookings.length }} reserva(s)
        </span>
        <span v-if="fecha !== todayIso()" class="rec-banner-warn">
          ⚠️ Vista de otra fecha · acciones bloqueadas
        </span>
        <span v-if="tipo === 'todas'" class="rec-banner-warn">
          ⚠️ Estás viendo TODAS las reservas no canceladas, no solo del día
        </span>
      </div>

      <div class="rec-table-wrap">
        <div v-if="loading && bookings.length===0" class="rec-state">
          <div class="rec-spinner"></div>
          <p>Cargando reservas...</p>
        </div>
        <div v-else-if="error" class="rec-state">
          <p style="color:#b91c1c">{{ error }}</p>
          <button class="rec-btn primary" @click="onRefresh">Reintentar</button>
        </div>
        <table v-else class="rec-table">
           <thead>
             <tr>
               <th>Habitación</th>
               <th>Cliente</th>
               <th>Teléfono</th>
               <th>Entrada</th>
               <th>Salida</th>
               <th>Huéspedes</th>
               <th>Saldo</th>
               <th>Estado</th>
               <th>Acción</th>
             </tr>
           </thead>
          <tbody>
             <tr v-for="r in bookings" :key="r.id">
               <td>{{ r.habitacion || '—' }}</td>
               <td>{{ r.cliente }}</td>
               <td>{{ r.telefono || '—' }}</td>
               <td>{{ formatDate(r.fecha_entrada) }}</td>
               <td>{{ formatDate(r.fecha_salida) }}</td>
               <td>{{ r.personas }}</td>
               <td>{{ r.saldo_pendiente > 0 ? formatCop(r.saldo_pendiente) : '—' }}</td>
                <td><span class="rec-badge" :class="estadoClass(r.estado)">{{ estadoLabel(r.estado) }}</span></td>
                 <td>
                   <button v-if="canCheckIn(r)" class="rec-btn-action checkin" @click="openConfirm('checkin', r.id, r)">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                     <span>Check-in</span>
                   </button>
                   <button v-else-if="canCheckOut(r)" class="rec-btn-action checkout" @click="openConfirm('checkout', r.id, r)">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                     <span>Check-out</span>
                   </button>
                   <button v-else-if="canCheckOutBlocked(r)" class="rec-btn-action checkout blocked" disabled title="Saldo pendiente">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                     <span>Check-out · {{ formatCop(r.saldo_pendiente) }}</span>
                   </button>
                   <span v-else>—</span>
                 </td>
             </tr>
             <tr v-if="!loading && bookings.length===0">
               <td colspan="9" class="rec-state">No hay reservas para este filtro</td>
             </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="lastSuccess" class="rec-toast" @click="clearMessages()">{{ lastSuccess }}</div>
    <div v-if="lastError" class="rec-toast error" @click="clearMessages()">{{ lastError }}</div>

    <div v-if="confirmState.open" class="rec-modal-overlay" @click.self="closeConfirm">
      <div class="rec-modal">
        <h3>Confirmar {{ confirmState.action === 'checkin' ? 'check-in' : 'check-out' }}</h3>
        <p>Reserva {{ confirmState.reserva?.id }} — {{ confirmState.reserva?.cliente }} — Habitación {{ confirmState.reserva?.habitacion }}</p>
        <p style="font-size:13px;opacity:.8">Esta acción cambiará el estado de la reserva.</p>
        <div class="rec-modal-actions">
          <button class="rec-btn ghost" @click="closeConfirm">Cancelar</button>
          <button class="rec-btn primary" @click="confirmAction">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>
