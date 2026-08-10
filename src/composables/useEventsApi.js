import api from './useApi.js'

/**
 * Eventos API Composable
 * Handles all event-related API calls to the backend
 */

export function useEventsApi() {
  /**
   * Fetch available salones and tipos de evento
   * @returns {Promise<{salones: Array, tipos_evento: Array}>} Salones and event types
   */
  async function fetchEvents() {
    const { data } = await api.get('/events')
    return data
  }

  /**
   * Create an event booking
   * @param {Object} bookingData - Booking data
   * @param {number} bookingData.salon_id - Salon ID (from salones.id)
   * @param {number} bookingData.tipo_evento_id - Event type ID (from tipos_evento.id)
   * @param {string} bookingData.fecha - Event date (ISO date string)
   * @param {string} bookingData.hora_inicio - Start time (ISO datetime string)
   * @param {string} bookingData.hora_fin - End time (ISO datetime string)
   * @param {number} bookingData.cantidad_personas - Number of guests
   * @param {number} [bookingData.anticipo] - Advance payment (optional, defaults to 30%)
   * @param {string} [bookingData.observaciones] - Special requests (optional)
   * @returns {Promise<Object>} Created booking response
   */
  async function createBooking(bookingData) {
    const { data } = await api.post('/events/bookings', bookingData)
    return data
  }

  return {
    fetchEvents,
    createBooking,
  }
}
