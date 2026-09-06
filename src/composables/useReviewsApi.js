import api from './useApi.js'

/**
 * Reseñas API Composable
 * Maneja todas las llamadas al backend para las reseñas de experiencia.
 */

export function useReviewsApi() {
  /**
   * Obtener reseñas activas de un tipo de servicio
   * @param {string} service - 'hotel' | 'restaurant' | 'events'
   * @returns {Promise<Array>} Lista de reseñas
   */
  async function fetchReviews(service) {
    const { data } = await api.get('/reviews', { params: { service } })
    return data
  }

  /**
   * Crear una reseña (requiere JWT; el autor se toma del usuario autenticado)
   * @param {Object} payload
   * @param {string} payload.tipo_servicio - 'hotel' | 'restaurant' | 'events'
   * @param {number} payload.calificacion - 1 a 5
   * @param {string} payload.texto - entre 10 y 500 caracteres
   * @returns {Promise<Object>} Reseña creada
   */
  async function createReview(payload) {
    const { data } = await api.post('/reviews', payload)
    return data
  }

  return {
    fetchReviews,
    createReview,
  }
}