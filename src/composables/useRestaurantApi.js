import api from './useApi.js'

/**
 * Restaurante API Composable
 * Handles all restaurant-related API calls to the backend
 */

export function useRestaurantApi() {
  /**
   * Fetch the restaurant menu grouped by category
   * @returns {Promise<Array>} Array of categories with nested productos_menu
   */
  async function fetchMenu() {
    const { data } = await api.get('/restaurant/menu')
    return data
  }

  /**
   * Fetch available tables with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.fecha - Reservation date (ISO date string, e.g. '2026-08-10')
   * @param {string} params.hora - Reservation time (ISO datetime string, e.g. '2026-08-10T19:30:00')
   * @param {number} [params.capacidad_min] - Minimum table capacity filter
   * @returns {Promise<Array>} Array of available mesa objects
   */
  async function fetchTables(params = {}) {
    const queryParams = new URLSearchParams()

    if (params.fecha) {
      queryParams.append('fecha', params.fecha)
    }
    if (params.hora) {
      queryParams.append('hora', params.hora)
    }
    if (params.capacidad_min) {
      queryParams.append('capacidad_min', params.capacidad_min)
    }

    const url = `/restaurant/tables${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const { data } = await api.get(url)
    return data
  }

  /**
   * Create a restaurant table reservation
   * @param {Object} reservationData - Reservation data
   * @param {number} reservationData.mesa_id - Table ID (from mesas.id)
   * @param {string} reservationData.fecha - Reservation date (ISO date string)
   * @param {string} reservationData.hora - Reservation time (ISO datetime string)
   * @param {number} reservationData.cantidad_personas - Number of guests
   * @param {string} [reservationData.motivo] - Occasion (optional)
   * @param {string} [reservationData.observaciones] - Special requests (optional)
   * @returns {Promise<Object>} Created reservation response
   */
  async function createReservation(reservationData) {
    const { data } = await api.post('/restaurant/reservations', reservationData)
    return data
  }

  /**
   * Fetch current user's restaurant (table) reservations
   * @returns {Promise<Array>} Array of user's reservations with mesa details
   */
  async function fetchMyReservations() {
    const { data } = await api.get('/restaurant/reservations/mine')
    return data
  }

  /**
   * Cancel a restaurant reservation (changes its estado to CANCELADA)
   * @param {number} reservationId - Reservation ID (from reservas_restaurante.id)
   * @returns {Promise<Object>} Updated reservation response
   */
  async function cancelReservation(reservationId) {
    const { data } = await api.patch(`/restaurant/reservations/${reservationId}/cancel`)
    return data
  }

  return {
    fetchMenu,
    fetchTables,
    createReservation,
    fetchMyReservations,
    cancelReservation,
  }
}
