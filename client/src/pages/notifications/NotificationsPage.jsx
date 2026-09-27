import React, { useState, useEffect, useCallback, useMemo } from 'react'
import PageContainer from '../../components/layout/PageContainer'
import { Button, ErrorState, Input } from '../../components/ui'
import { NotificationItem } from '../../components/notifications'
import notificationService from '../../services/notificationService'
import { useNotifications } from '../../contexts/NotificationContext'
import { useToast } from '../../contexts/ToastContext'
import {
  NOTIFICATION_TYPE_CONFIG,
} from '../../constants/notifications'
import {
  CheckIcon,
  SearchIcon,
  CloseIcon,
  NotificationIcon,
  TicketIcon,
  ClockIcon,
  AssetIcon,
} from '../../components/ui/Icons'

function NotificationRowSkeleton() {
  return (
    <div className="p-3 sm:p-3.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 flex items-start gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-800 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3.5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  )
}

export function NotificationsPage() {
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { showSuccess, showError } = useToast()

  const [notifications, setNotifications] = useState([])
  const [activeCategory, setActiveCategory] = useState('all') // 'all' | 'unread' | 'ticket' | 'sla' | 'asset'
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [error, setError] = useState(null)

  const isUnreadFilter = activeCategory === 'unread'

  const fetchNotifications = useCallback(
    async (page = 1, unreadOnly = isUnreadFilter) => {
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
    [isUnreadFilter]
  )

  useEffect(() => {
    fetchNotifications(1, isUnreadFilter)
  }, [fetchNotifications, isUnreadFilter])

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
      if (isUnreadFilter) {
        fetchNotifications(1, true)
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to mark all as read.')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
  }

  const handlePageChange = (newPage) => {
    fetchNotifications(newPage, isUnreadFilter)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Filter items in memory by category & search query
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Category filter
      if (activeCategory === 'ticket') {
        const cat = NOTIFICATION_TYPE_CONFIG[item.type]?.category
        if (cat !== 'ticket') return false
      } else if (activeCategory === 'sla') {
        const cat = NOTIFICATION_TYPE_CONFIG[item.type]?.category
        if (cat !== 'sla') return false
      } else if (activeCategory === 'asset') {
        const cat = NOTIFICATION_TYPE_CONFIG[item.type]?.category
        if (cat !== 'asset') return false
      }

      // 2. Search query filter
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase().trim()
      const message = (item.message || '').toLowerCase()
      const typeLabel = (NOTIFICATION_TYPE_CONFIG[item.type]?.label || item.type || '').toLowerCase()
      const ticketNumber = (item.ticket?.ticketNumber || '').toLowerCase()

      return (
        message.includes(query) ||
        typeLabel.includes(query) ||
        ticketNumber.includes(query)
      )
    })
  }, [notifications, activeCategory, searchQuery])

  // Derive counts from loaded records for quick category badges
  const categoryCounts = useMemo(() => {
    let tickets = 0
    let sla = 0
    let assets = 0
    notifications.forEach((n) => {
      const cat = NOTIFICATION_TYPE_CONFIG[n.type]?.category
      if (cat === 'ticket') tickets++
      else if (cat === 'sla') sla++
      else if (cat === 'asset') assets++
    })
    return { tickets, sla, assets }
  }, [notifications])

  return (
    <PageContainer
      title="Notifications"
      description="Stay up to date with ticket, SLA and system activity"
      actions={
        unreadCount > 0 ? (
          <Button
            variant="neutral"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 shadow-2xs"
          >
            <CheckIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>{markingAll ? 'Marking all...' : 'Mark all as read'}</span>
          </Button>
        ) : null
      }
    >
      <div className="max-w-5xl space-y-4">
        {/* Controls Toolbar: Categories and Search */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => handleCategoryChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300'
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('unread')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'unread'
                    ? 'bg-primary-600 text-white dark:bg-primary-500 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeCategory === 'unread'
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('ticket')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'ticket'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300'
                }`}
              >
                <TicketIcon className="w-3.5 h-3.5 opacity-70" />
                <span>Tickets</span>
                {categoryCounts.tickets > 0 && (
                  <span className="text-[10px] opacity-60">({categoryCounts.tickets})</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('sla')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'sla'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300'
                }`}
              >
                <ClockIcon className="w-3.5 h-3.5 opacity-70" />
                <span>SLA</span>
                {categoryCounts.sla > 0 && (
                  <span className="text-[10px] opacity-60">({categoryCounts.sla})</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('asset')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'asset'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300'
                }`}
              >
                <AssetIcon className="w-3.5 h-3.5 opacity-70" />
                <span>Assets</span>
                {categoryCounts.assets > 0 && (
                  <span className="text-[10px] opacity-60">({categoryCounts.assets})</span>
                )}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64 shrink-0">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <NotificationRowSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load notifications"
            description={error}
            actionLabel="Try Again"
            onAction={() => fetchNotifications(pagination.page, isUnreadFilter)}
          />
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-12 text-center shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <NotificationIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {searchQuery
                ? 'No matching notifications'
                : isUnreadFilter
                ? 'No unread notifications'
                : "You're all caught up"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search terms or filter to find what you are looking for.'
                : isUnreadFilter
                ? "You've read all your notifications. Switch to 'All' to view your historical activity."
                : 'No new service desk notifications. Alerts for tickets, SLAs, and assets will appear here.'}
            </p>
            {(searchQuery || isUnreadFilter) && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {searchQuery && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                )}
                {isUnreadFilter && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => handleCategoryChange('all')}
                  >
                    View All Notifications
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Notification Rows List */}
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl px-4 py-3 shadow-2xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="text-xs"
                  >
                    ← Previous
                  </Button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        return (
                          p === 1 ||
                          p === pagination.totalPages ||
                          Math.abs(p - pagination.page) <= 1
                        )
                      })
                      .map((p, idx, arr) => {
                        const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && (
                              <span className="px-1 text-xs text-slate-400">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handlePageChange(p)}
                              className={`w-7 h-7 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                p === pagination.page
                                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        )
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="text-xs"
                  >
                    Next →
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
