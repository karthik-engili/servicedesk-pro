import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  NOTIFICATION_TYPE_CONFIG,
  formatNotificationTime,
  formatNotificationFullTime,
} from '../../constants/notifications'
import {
  TicketIcon,
  ClockIcon,
  AssetIcon,
  UserCheckIcon,
  ChatIcon,
  AlertTriangleIcon,
  AlertOctagonIcon,
  NotificationIcon,
  CheckIcon,
  ArrowRightIcon,
  RefreshIcon,
} from '../ui/Icons'

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
    label: notification.type || 'System Alert',
    category: 'system',
    iconColor: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  }

  const isUnread = !notification.isRead
  const isUrgent = Boolean(typeConfig.urgent)
  const isWarning = Boolean(typeConfig.warning)
  const relativeTime = formatNotificationTime(notification.createdAt)
  const fullTime = formatNotificationFullTime(notification.createdAt)

  // Determine navigation target if notification has linked entity
  let linkTarget = null
  let targetNumber = null
  if (notification.ticket) {
    const ticketId = notification.ticket._id || notification.ticket
    linkTarget = `/tickets/${ticketId}`
    targetNumber = notification.ticket.ticketNumber || null
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

  // Centralized Icon Selector
  const renderIcon = () => {
    const iconClass = compact ? 'w-3.5 h-3.5' : 'w-4 h-4'
    switch (notification.type) {
      case 'TICKET_CREATED':
        return <TicketIcon className={iconClass} />
      case 'TICKET_ASSIGNED':
        return <UserCheckIcon className={iconClass} />
      case 'STATUS_UPDATED':
        return <RefreshIcon className={iconClass} />
      case 'COMMENT_ADDED':
        return <ChatIcon className={iconClass} />
      case 'ASSET_ASSIGNED':
        return <AssetIcon className={iconClass} />
      case 'ASSET_LOST':
        return <AlertTriangleIcon className={iconClass} />
      case 'SLA_BREACH':
        return <AlertOctagonIcon className={iconClass} />
      case 'SLA_WARNING':
        return <ClockIcon className={iconClass} />
      default:
        return <NotificationIcon className={iconClass} />
    }
  }

  return (
    <div
      onClick={handleClick}
      role={linkTarget ? 'link' : 'article'}
      tabIndex={0}
      title={fullTime}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={`group relative flex items-start gap-3 transition-colors duration-150 cursor-pointer select-none rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
        compact ? 'p-2.5' : 'p-3 sm:p-3.5'
      } ${
        isUrgent
          ? isUnread
            ? 'bg-rose-50/50 hover:bg-rose-50/80 dark:bg-rose-950/25 dark:hover:bg-rose-950/35 border-rose-200/80 dark:border-rose-900/50'
            : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60 border-slate-200/80 dark:border-slate-800/80'
          : isUnread
          ? 'bg-primary-50/40 hover:bg-primary-50/70 dark:bg-primary-950/20 dark:hover:bg-primary-950/30 border-primary-200/60 dark:border-primary-900/40'
          : 'bg-white hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-slate-800/60 border-slate-200/70 dark:border-slate-800/70'
      } ${className}`}
    >
      {/* Type Icon Container */}
      <div
        className={`shrink-0 flex items-center justify-center rounded-md border ${
          compact ? 'w-7 h-7 mt-0.5' : 'w-8 h-8 mt-0.5'
        } ${typeConfig.iconColor}`}
        aria-hidden="true"
      >
        {renderIcon()}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {/* Unread indicator dot */}
          {isUnread && (
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isUrgent
                  ? 'bg-rose-600 dark:bg-rose-400'
                  : 'bg-primary-600 dark:bg-primary-400'
              }`}
              title="Unread notification"
              aria-label="Unread"
            />
          )}

          {/* Type / Semantic Label */}
          <span
            className={`text-xs ${
              isUnread
                ? 'font-bold text-slate-900 dark:text-slate-100'
                : 'font-semibold text-slate-700 dark:text-slate-300'
            }`}
          >
            {typeConfig.label}
          </span>

          {/* Urgent Badge if critical */}
          {isUrgent && (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Urgent
            </span>
          )}

          {/* Warning Badge if SLA warning */}
          {isWarning && (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Warning
            </span>
          )}

          {/* Related Ticket Identifier Badge */}
          {targetNumber && (
            <span className="font-mono text-[11px] font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 px-1.5 py-0.2 rounded border border-primary-200/70 dark:border-primary-800/60">
              {targetNumber}
            </span>
          )}

          {/* Relative Timestamp */}
          <span
            className="text-[11px] text-slate-400 dark:text-slate-500 ml-auto whitespace-nowrap"
            title={fullTime}
          >
            {relativeTime}
          </span>
        </div>

        {/* Message text */}
        <p
          className={`text-xs leading-relaxed text-slate-600 dark:text-slate-300 ${
            compact ? 'line-clamp-2' : ''
          }`}
        >
          {notification.message}
        </p>

        {/* Operational Link CTA if ticket exists and not compact */}
        {linkTarget && !compact && (
          <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300">
            <span>View ticket</span>
            <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>

      {/* Right Action: Mark as read button (visible when unread) */}
      {isUnread && onMarkAsRead && (
        <div className="absolute top-3 right-3 flex items-center">
          <button
            type="button"
            onClick={handleMarkReadOnly}
            title="Mark as read"
            aria-label="Mark notification as read"
            className="p-1 rounded text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-60 group-hover:opacity-100 focus:opacity-100 transition-all focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <CheckIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default NotificationItem
