import api from './api'

class NotificationService {
  /**
   * Retrieve notifications for current authenticated user with unread filter and pagination
   */
  async getNotifications(params = {}) {
    const res = await api.get('/notifications', { params })
    return (
      res.data?.data || {
        notifications: [],
        unreadCount: 0,
        pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
      }
    )
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`)
    return res.data?.data?.notification
  }

  /**
   * Mark all unread notifications as read for current user
   */
  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all')
    return res.data
  }
}

export default new NotificationService()
