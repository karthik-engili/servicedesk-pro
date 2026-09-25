import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import notificationService from '../services/notificationService'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingUnread, setLoadingUnread] = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    try {
      setLoadingUnread(true)
      const data = await notificationService.getNotifications({ limit: 1 })
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to retrieve unread notification count', err)
    } finally {
      setLoadingUnread(false)
    }
  }, [user])

  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const updated = await notificationService.markAsRead(notificationId)
      setUnreadCount((prev) => Math.max(0, prev - 1))
      return updated
    } catch (err) {
      throw err
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setUnreadCount(0)
      return true
    } catch (err) {
      throw err
    }
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        loadingUnread,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext
