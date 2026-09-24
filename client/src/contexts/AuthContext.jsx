import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'))
  const [loading, setLoading] = useState(true)
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('')

  // Clear auth session completely
  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setAccessToken(null)
    setUser(null)
  }, [])

  // Verify and hydrate current user on initial app mount
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!token && !refreshToken) {
      setLoading(false)
      return
    }

    try {
      // api instance automatically handles refresh if accessToken expired
      const response = await api.get('/auth/me')
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user)
        setAccessToken(localStorage.getItem('accessToken'))
      } else {
        clearAuth()
      }
    } catch {
      // Both access token and refresh failed
      clearAuth()
    } finally {
      setLoading(false)
    }
  }, [clearAuth])

  useEffect(() => {
    checkAuth()

    // Listen for session expiry event from Axios interceptor
    const handleSessionExpired = (event) => {
      clearAuth()
      const message =
        event.detail?.message || 'Your session has expired. Please sign in again.'
      setSessionExpiredMessage(message)
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired)
    }
  }, [checkAuth, clearAuth])

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { user: userData, accessToken: newAccess, refreshToken: newRefresh } =
      response.data.data

    localStorage.setItem('accessToken', newAccess)
    if (newRefresh) {
      localStorage.setItem('refreshToken', newRefresh)
    }

    setAccessToken(newAccess)
    setUser(userData)
    setSessionExpiredMessage('')
    return userData
  }

  // Register handler
  const register = async (registrationData) => {
    const response = await api.post('/auth/register', registrationData)
    const { user: userData, accessToken: newAccess, refreshToken: newRefresh } =
      response.data.data

    if (newAccess) {
      localStorage.setItem('accessToken', newAccess)
      if (newRefresh) {
        localStorage.setItem('refreshToken', newRefresh)
      }
      setAccessToken(newAccess)
      setUser(userData)
    }

    setSessionExpiredMessage('')
    return userData
  }

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors during logout
    } finally {
      clearAuth()
      setSessionExpiredMessage('')
    }
  }

  // Update in-memory user state (e.g. after profile edit)
  const updateUser = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }))
  }

  // Refresh user profile from backend
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me')
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user)
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err)
    }
  }

  const value = {
    user,
    accessToken,
    loading,
    sessionExpiredMessage,
    clearSessionExpiredMessage: () => setSessionExpiredMessage(''),
    isAuthenticated: Boolean(user && accessToken),
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
