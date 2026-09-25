import React, { useState, useEffect, useCallback } from 'react'
import PageContainer from '../../components/layout/PageContainer'
import { Spinner, EmptyState, ErrorState, Button } from '../../components/ui'
import { NotificationItem } from '../../components/notifications'
import notificationService from '../../services/notificationService'
import { useNotifications } from '../../contexts/NotificationContext'
import { useToast } from '../../contexts/ToastContext'

export function NotificationsPage() {
  const { unreadCount, markAsRead, markAllAsRead, fetchUnreadCount } = useNotifications()
  const { showSuccess, showError } = useToast()

  const [notifications, setNotifications] = useState([])
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [error, setError] = useState(null)

  const fetchNotifications = useCallback(
    async (page = 1, unreadOnly = filterUnreadOnly) => {
      setLoading(true)
      setError(null)
      try {
        const data = await notificationService.getNotifications({
          page,
          limit: 15,
          unreadOnly,
        })
        setNotifications(data.notifications || [])
        setPagination(
          data.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 }
        )
      } catch (err) {
        console.error('Failed to load notifications list', err)
        setError(err.response?.data?.message || 'Failed to retrieve notifications.')
      } finally {
        setLoading(false)
      }
    },
    [filterUnreadOnly]
  )

  useEffect(() => {
    fetchNotifications(1, filterUnreadOnly)
  }, [fetchNotifications, filterUnreadOnly])

  const handleMarkItemRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      showSuccess('Notification marked as read.')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to mark notification as read.')
    }
  }

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return
    setMarkingAll(true)
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      showSuccess('All notifications marked as read.')
      if (filterUnreadOnly) {
        fetchNotifications(1, true)
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to mark all as read.')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleTabChange = (unreadOnly) => {
    setFilterUnreadOnly(unreadOnly)
  }

  const handlePageChange = (newPage) => {
    fetchNotifications(newPage, filterUnreadOnly)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageContainer
      title="Notification Center"
      description="System alerts, ticket updates, SLA notifications, and operational broadcasts"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Control Bar: Tabs & Mark All Read */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTabChange(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !filterUnreadOnly
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300'
              }`}
            >
              All Notifications
            </button>

            <button
              type="button"
              onClick={() => handleTabChange(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterUnreadOnly
                  ? 'bg-primary-600 text-white dark:bg-primary-500 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300'
              }`}
            >
              <span>Unread Only</span>
              {unreadCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    filterUnreadOnly
                      ? 'bg-white/20 text-white'
                      : 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Mark All Read Action */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="neutral"
                size="sm"
                onClick={handleMarkAllRead}
                loading={markingAll}
                disabled={markingAll}
              >
                <svg className="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List Body */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading notifications...</p>
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to Load Notifications"
            description={error}
            actionLabel="Try Again"
            onAction={() => fetchNotifications(pagination.page, filterUnreadOnly)}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            title={filterUnreadOnly ? 'No Unread Notifications' : 'No Notifications Yet'}
            description={
              filterUnreadOnly
                ? "You have acknowledged all system alerts and updates. Switch to 'All Notifications' to view history."
                : 'When tickets are assigned, comments are posted, or SLA warnings occur, alerts will appear here.'
            }
            actionLabel={filterUnreadOnly ? 'View All Notifications' : undefined}
            onAction={filterUnreadOnly ? () => handleTabChange(false) : undefined}
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkItemRead}
                  compact={false}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="neutral"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="neutral"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default NotificationsPage
