import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Spinner } from '../ui'
import NotificationItem from './NotificationItem'
import notificationService from '../../services/notificationService'
import { useNotifications } from '../../contexts/NotificationContext'
import { useToast } from '../../contexts/ToastContext'

export function NotificationDropdown({ isOpen, onClose }) {
  const navigate = useNavigate()
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

  // Handle outside click to close
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
      aria-label="Notifications Dropdown"
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="p-3.5 px-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-[11px] font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Body List */}
      <div className="max-h-[360px] overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Spinner size="sm" />
            <p className="text-[11px] text-slate-400">Loading alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              You're all caught up!
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No new alerts or assigned updates.
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
      <div className="p-2.5 px-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1"
        >
          <span>View all notifications</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default NotificationDropdown
