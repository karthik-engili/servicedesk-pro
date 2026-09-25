/**
 * Centralized Notification Constants for ServiceDesk Pro
 * Synchronized with backend models and notification service
 */

export const NOTIFICATION_TYPES = {
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_ASSIGNED: 'TICKET_ASSIGNED',
  STATUS_UPDATED: 'STATUS_UPDATED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  ASSET_ASSIGNED: 'ASSET_ASSIGNED',
  ASSET_LOST: 'ASSET_LOST',
  SLA_WARNING: 'SLA_WARNING',
  SLA_BREACH: 'SLA_BREACH',
}

export const NOTIFICATION_TYPE_CONFIG = {
  [NOTIFICATION_TYPES.TICKET_CREATED]: {
    label: 'Ticket Created',
    category: 'info',
    iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
    icon: 'ticket',
  },
  [NOTIFICATION_TYPES.TICKET_ASSIGNED]: {
    label: 'Ticket Assigned',
    category: 'info',
    iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
    icon: 'user-check',
  },
  [NOTIFICATION_TYPES.STATUS_UPDATED]: {
    label: 'Status Updated',
    category: 'info',
    iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    icon: 'refresh',
  },
  [NOTIFICATION_TYPES.COMMENT_ADDED]: {
    label: 'New Comment',
    category: 'info',
    iconColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800',
    icon: 'chat',
  },
  [NOTIFICATION_TYPES.ASSET_ASSIGNED]: {
    label: 'Asset Assigned',
    category: 'info',
    iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
    icon: 'desktop',
  },
  [NOTIFICATION_TYPES.ASSET_LOST]: {
    label: 'Security Alert: Asset Lost',
    category: 'critical',
    iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
    icon: 'alert-triangle',
  },
  [NOTIFICATION_TYPES.SLA_WARNING]: {
    label: 'SLA Warning',
    category: 'warning',
    iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    icon: 'clock',
  },
  [NOTIFICATION_TYPES.SLA_BREACH]: {
    label: 'SLA Breach Alert',
    category: 'critical',
    iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
    icon: 'alert-octagon',
  },
}

/**
 * Format relative time helper for notifications
 */
export function formatNotificationTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) {
    return 'Yesterday'
  }

  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
