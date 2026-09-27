import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import NotificationItem from './NotificationItem'
import notificationService from '../../services/notificationService'
import { useNotifications } from '../../contexts/NotificationContext'
import { useToast } from '../../contexts/ToastContext'
import { CheckIcon, ArrowRightIcon, NotificationIcon } from '../ui/Icons'

export function NotificationDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null)
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { showSuccess, showError } = useToast()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const fetchRecent = async () => {
      setLoading(true)
      try {
        const data = await notificationService.getNotifications({ limit: 6 })
        if (isMounted) {
          setNotifications(data.notifications || [])
        }
      } catch (err) {
        console.error('Failed to load recent notifications', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchRecent()
    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Handle outside click & escape key to close
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleMarkItemRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
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
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to mark all as read.')
    } finally {
      setMarkingAll(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60">
              {unreadCount} unread
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-[11px] font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50 flex items-center gap-1 focus:outline-none"
          >
            <CheckIcon className="w-3 h-3" />
            <span>{markingAll ? 'Marking...' : 'Mark all read'}</span>
          </button>
        )}
      </div>

      {/* Body List */}
      <div className="max-h-[380px] overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {loading ? (
          <div className="p-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 animate-pulse"
              >
                <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-2.5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="w-9 h-9 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              <NotificationIcon className="w-4.5 h-4.5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              You're all caught up
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              No new service desk notifications.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkItemRead}
              onCloseDropdown={onClose}
              compact={true}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 px-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1.5 focus:outline-none"
        >
          <span>View all notifications</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default NotificationDropdown
