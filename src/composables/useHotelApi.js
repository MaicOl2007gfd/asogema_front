import api from './useApi.js'

/**
 * Hotel API Composable
 * Handles all hotel-related API calls to the backend
 */

export function useHotelApi() {
  /**
   * Fetch available rooms with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.tipo_habitacion_id - Room type ID filter
   * @param {number} params.capacidad_min - Minimum capacity filter
   * @param {string} params.fecha_entrada - Check-in date (ISO string)
   * @param {string} params.fecha_salida - Check-out date (ISO string)
   * @returns {Promise<Array>} Array of room objects with tipo_habitacion included
   */
  async function fetchRooms(params = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.tipo_habitacion_id) {
      queryParams.append('tipo_habitacion_id', params.tipo_habitacion_id)
    }
    if (params.capacidad_min) {
      queryParams.append('capacidad_min', params.capacidad_min)
    }
    if (params.fecha_entrada) {
      queryParams.append('fecha_entrada', params.fecha_entrada)
    }
    if (params.fecha_salida) {
      queryParams.append('fecha_salida', params.fecha_salida)
    }

    const url = `/hotel/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const { data } = await api.get(url)
    return data
  }

  /**
   * Create a hotel booking
   * @param {Object} bookingData - Booking data
   * @param {number} bookingData.habitacion_id - Room ID (from habitaciones.id)
   * @param {string} bookingData.fecha_entrada - Check-in date (ISO string)
   * @param {string} bookingData.fecha_salida - Check-out date (ISO string)
   * @param {number} bookingData.cantidad_huespedes - Number of guests
   * @param {number} [bookingData.total] - Total amount (optional)
   * @param {string} [bookingData.observaciones] - Special requests (optional)
   * @returns {Promise<Object>} Created booking response
   */
  async function createBooking(bookingData) {
    const { data } = await api.post('/hotel/bookings', bookingData)
    return data
  }

  /**
   * Fetch current user's bookings
   * @returns {Promise<Array>} Array of user's bookings with room details
   */
  async function fetchMyBookings() {
    const { data } = await api.get('/hotel/bookings/mine')
    return data
  }

  return {
    fetchRooms,
    createBooking,
    fetchMyBookings,
  }
}