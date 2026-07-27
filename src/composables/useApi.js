import axios from 'axios'
import { API_URL } from '../config.js'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('asogema_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('asogema_token')
      localStorage.removeItem('asogema_user')
      window.location.reload()
    }
    return Promise.reject(error)
  },
)

export default api
