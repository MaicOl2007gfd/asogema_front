import axios from 'axios'
import { API_URL } from '../config.js'
import { logout, setTokens } from './useAuth.js'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('asogema_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingQueue = []

function onRefreshed(newToken) {
  pendingQueue.forEach((resolve) => resolve(newToken))
  pendingQueue = []
}

async function refreshTokens() {
  const refresh = sessionStorage.getItem('asogema_refresh')
  if (!refresh) return null

  const raw = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  })

  try {
    const { data } = await raw.post('/auth/refresh', {
      refresh_token: refresh,
    })
    setTokens(data.access_token, data.refresh_token)
    return data.access_token
  } catch {
    return null
  }
}

function handleSessionExpired() {
  logout()
  window.location.reload()
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    if (!response || response.status !== 401 || !config) {
      return Promise.reject(error)
    }

    const url = config.url || ''
    const isAuthEndpoint =
      url.includes('/auth/tokens') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout')
    if (isAuthEndpoint) {
      return Promise.reject(error)
    }

    if (!sessionStorage.getItem('asogema_refresh')) {
      handleSessionExpired()
      return Promise.reject(error)
    }

    if (config._retry) {
      handleSessionExpired()
      return Promise.reject(error)
    }

    config._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newToken) => {
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`
            resolve(api(config))
          } else {
            reject(error)
          }
        })
      })
    }

    isRefreshing = true
    try {
      const newToken = await refreshTokens()
      if (!newToken) {
        pendingQueue.forEach((reject) => reject(error))
        pendingQueue = []
        handleSessionExpired()
        return Promise.reject(error)
      }
      onRefreshed(newToken)
      config.headers.Authorization = `Bearer ${newToken}`
      return api(config)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
