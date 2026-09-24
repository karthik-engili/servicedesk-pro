import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Variables to coordinate single-refresh queue for simultaneous 401s
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle automatic token refresh and error normalization
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If no response or configuration, reject with normalized error
    if (!error.response) {
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your internet connection or server status.',
        errors: [],
        raw: error,
      })
    }

    const { status, data } = error.response
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')

    // Handle 401 Unauthorized for authenticated endpoints
    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      const refreshToken = localStorage.getItem('refreshToken')

      // If no refresh token available, session is completely expired
      if (!refreshToken) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.dispatchEvent(
          new CustomEvent('auth:session-expired', {
            detail: { message: 'Your session has expired. Please sign in again.' },
          })
        )
        return Promise.reject({
          status: 401,
          message: data?.message || 'Authentication required. Please sign in.',
          errors: data?.errors || [],
          raw: error,
        })
      }

      if (isRefreshing) {
        // Queue concurrent requests while token is refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Use standard axios to avoid recursion in interceptor
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data

        localStorage.setItem('accessToken', newAccessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.dispatchEvent(
          new CustomEvent('auth:session-expired', {
            detail: { message: 'Your session has expired. Please sign in again.' },
          })
        )
        return Promise.reject({
          status: 401,
          message: 'Your session has expired. Please sign in again.',
          errors: [],
          raw: refreshErr,
        })
      } finally {
        isRefreshing = false
      }
    }

    // Standardized error response
    return Promise.reject({
      status: status || 500,
      message:
        data?.message ||
        error.message ||
        'A network or server error occurred. Please try again.',
      errors: data?.errors || [],
      raw: error,
    })
  }
)

export default api
