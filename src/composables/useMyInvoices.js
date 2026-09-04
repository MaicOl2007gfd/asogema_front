import { ref, watch } from 'vue'
import { useAuth } from './useAuth.js'
import { usePaymentApi } from './usePaymentApi.js'
import { resolveError } from './useErrorMessage.js'

/**
 * Mis Facturas — Historial de facturas y pagos del usuario autenticado.
 *
 * Endpoint backend: GET /payments/mis-facturas
 * Proporciona:
 *   1. Lista de facturas del usuario (evento, hotel, restaurante, recarga).
 *   2. Estado de pago, método(s) de pago, detalle y total de cada factura.
 *   3. Descarga del PDF de la factura electrónica (requiere numero_factura).
 */

const { isLoggedIn } = useAuth()
const { getMisFacturas, downloadPdf } = usePaymentApi()

const invoices = ref([])
const loading = ref(false)
const error = ref('')
const loaded = ref(false)
const downloading = ref('')
const hasLoadedOnce = ref(false)

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  PAGADA: 'Pagada',
  CONFIRMADA: 'Confirmada',
  ANULADA: 'Anulada',
  RECHAZADA: 'Rechazada',
  FALLIDA: 'Fallida',
  EXPIRADA: 'Expirada',
}

const TYPE_LABELS = {
  HOTEL: 'Hotel',
  RESTAURANTE: 'Restaurante',
  EVENTO: 'Evento',
  RECARGA: 'Recarga wallet',
  WALLET: 'Recarga wallet',
}

function formatDate(value) {
  if (!value) return '—'
  const s = String(value).slice(0, 10)
  const d = new Date(`${s}T00:00:00`)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(value) {
  if (value == null || isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function paymentLabel(metodo) {
  const map = {
    TARJETA: 'Tarjeta',
    NEQUI: 'Nequi',
    PSE: 'PSE',
    SALDO: 'Saldo wallet',
  }
  return map[metodo] || metodo || '—'
}

async function loadInvoices() {
  if (!isLoggedIn.value) {
    invoices.value = []
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  loaded.value = true
  hasLoadedOnce.value = true
  try {
    const { facturas } = await getMisFacturas()
    invoices.value = (facturas || []).map((f) => ({
      id: f.factura_id,
      tipo: f.tipo_reserva,
      fecha: formatDate(f.fecha_factura),
      estado: f.estado,
      estadoLabel:
        STATUS_LABELS[f.estado] || String(f.estado || '').toLowerCase(),
      subtotal: f.subtotal,
      impuestos: f.impuestos,
      descuentos: f.descuentos,
      total: f.total,
      totalLabel: formatCurrency(f.total),
      numeroFactura: f.numero_factura,
      qrUrl: f.qr_url,
      cufe: f.cufe,
      detalle: f.detalle || [],
      pagos: f.pagos || [],
      metodoPago:
        f.pagos && f.pagos.length > 0
          ? paymentLabel(f.pagos[0].metodo_pago)
          : '—',
    }))
  } catch (err) {
    error.value = resolveError(err).message
  } finally {
    loading.value = false
  }
}

async function downloadPdfFor(invoiceId) {
  if (downloading.value || !invoiceId) return
  downloading.value = invoiceId
  try {
    const base64 = await downloadPdf(invoiceId)
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: 'application/pdf',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `factura-${invoiceId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    error.value = resolveError(err).message
  } finally {
    downloading.value = ''
  }
}

function reload() {
  hasLoadedOnce.value = false
  loadInvoices()
}

watch(isLoggedIn, (logged) => {
  if (!logged) {
    invoices.value = []
    loaded.value = false
    hasLoadedOnce.value = false
  }
})

export function useMyInvoices() {
  return {
    invoices,
    loading,
    error,
    loaded,
    hasLoadedOnce,
    downloading,
    reload,
    formatCurrency,
    paymentLabel,
    STATUS_LABELS,
    TYPE_LABELS,
    getInvoices: loadInvoices,
    downloadPdfFor,
  }
}