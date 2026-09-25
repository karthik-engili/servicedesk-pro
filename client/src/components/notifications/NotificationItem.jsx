import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  NOTIFICATION_TYPE_CONFIG,
  formatNotificationTime,
} from '../../constants/notifications'

export function NotificationItem({
  notification,
  onMarkAsRead,
  onCloseDropdown,
  compact = false,
  className = '',
}) {
  const navigate = useNavigate()
  if (!notification) return null

  const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type] || {
    label: notification.type || 'Alert',
    category: 'info',
    iconColor: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  }

  const isUnread = !notification.isRead
  const formattedTime = formatNotificationTime(notification.createdAt)

  // Determine navigation target if notification has linked entity
  let linkTarget = null
  if (notification.ticket) {
    const ticketId = notification.ticket._id || notification.ticket
    linkTarget = `/tickets/${ticketId}`
  }

  const handleClick = async () => {
    if (isUnread && onMarkAsRead) {
      try {
        await onMarkAsRead(notification._id)
      } catch (err) {
        console.error('Failed to mark notification as read on click', err)
      }
    }

    if (onCloseDropdown) {
      onCloseDropdown()
    }

    if (linkTarget) {
      navigate(linkTarget)
    }
  }

  const handleMarkReadOnly = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (onMarkAsRead) {
      await onMarkAsRead(notification._id)
    }
  }

  // Type icons
  const renderIcon = () => {
    switch (notification.type) {
      case 'TICKET_CREATED':
      case 'TICKET_ASSIGNED':
      case 'STATUS_UPDATED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        )
      case 'COMMENT_ADDED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'ASSET_ASSIGNED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'ASSET_LOST':
      case 'SLA_BREACH':
        return (
          <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'SLA_WARNING':
        return (
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div
      onClick={handleClick}
      role={linkTarget ? 'link' : 'article'}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer select-none rounded-xl border ${
        isUnread
          ? 'bg-blue-50/50 hover:bg-blue-50/80 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/40'
          : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60 border-slate-200/80 dark:border-slate-800/60'
      } ${className}`}
    >
      {/* Type Icon */}
      <div
        className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border shadow-3xs ${typeConfig.iconColor}`}
      >
        {renderIcon()}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {typeConfig.label}
          </span>
          {notification.ticket?.ticketNumber && (
            <span className="font-mono text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-1.5 py-0.2 rounded border border-primary-200/60">
              {notification.ticket.ticketNumber}
            </span>
          )}
          <span className="text-[10px] text-slate-400">• {formattedTime}</span>
        </div>

        <p
          className={`text-xs text-slate-800 dark:text-slate-200 leading-relaxed ${
            compact ? 'line-clamp-2' : ''
          }`}
        >
          {notification.message}
        </p>
      </div>

      {/* Unread dot / Mark-read action button */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
        {isUnread && (
          <span
            className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 shadow-3xs shrink-0"
            title="Unread"
          />
        )}

        {isUnread && onMarkAsRead && (
          <button
            type="button"
            onClick={handleMarkReadOnly}
            title="Mark as read"
            aria-label="Mark notification as read"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default NotificationItem
