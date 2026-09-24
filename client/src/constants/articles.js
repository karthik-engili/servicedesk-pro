/**
 * Centralized Knowledge Base Constants for ServiceDesk Pro
 * Synchronized with backend models and validators
 */

export const ARTICLE_CATEGORIES = [
  'PASSWORDS',
  'NETWORK',
  'HARDWARE',
  'SOFTWARE',
  'EMAIL',
  'SECURITY',
  'VPN',
  'PRINTER',
  'ACCOUNT_ACCESS',
  'GENERAL',
]

export const ARTICLE_CATEGORY_CONFIG = {
  PASSWORDS: {
    label: 'Passwords & Credentials',
    shortLabel: 'Passwords',
    badgeVariant: 'warning',
    icon: 'key',
  },
  NETWORK: {
    label: 'Network & Connectivity',
    shortLabel: 'Network',
    badgeVariant: 'info',
    icon: 'wifi',
  },
  HARDWARE: {
    label: 'Hardware & Peripherals',
    shortLabel: 'Hardware',
    badgeVariant: 'neutral',
    icon: 'desktop',
  },
  SOFTWARE: {
    label: 'Software & Applications',
    shortLabel: 'Software',
    badgeVariant: 'primary',
    icon: 'code',
  },
  EMAIL: {
    label: 'Email & Messaging',
    shortLabel: 'Email',
    badgeVariant: 'info',
    icon: 'mail',
  },
  SECURITY: {
    label: 'Cybersecurity & Compliance',
    shortLabel: 'Security',
    badgeVariant: 'danger',
    icon: 'shield',
  },
  VPN: {
    label: 'VPN & Remote Access',
    shortLabel: 'VPN',
    badgeVariant: 'info',
    icon: 'globe',
  },
  PRINTER: {
    label: 'Printers & Imaging',
    shortLabel: 'Printer',
    badgeVariant: 'neutral',
    icon: 'printer',
  },
  ACCOUNT_ACCESS: {
    label: 'Account Access & Permissions',
    shortLabel: 'Account Access',
    badgeVariant: 'warning',
    icon: 'user-check',
  },
  GENERAL: {
    label: 'General IT Help',
    shortLabel: 'General',
    badgeVariant: 'neutral',
    icon: 'help-circle',
  },
}

export const ARTICLE_STATUSES = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
}

export const ARTICLE_STATUS_CONFIG = {
  [ARTICLE_STATUSES.DRAFT]: {
    label: 'Draft',
    variant: 'neutral',
    colorClasses: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  },
  [ARTICLE_STATUSES.PUBLISHED]: {
    label: 'Published',
    variant: 'success',
    colorClasses: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  [ARTICLE_STATUSES.ARCHIVED]: {
    label: 'Archived',
    variant: 'warning',
    colorClasses: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
}

export const ARTICLE_VISIBILITIES = {
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  DEPARTMENT: 'DEPARTMENT',
}

export const ARTICLE_VISIBILITY_CONFIG = {
  [ARTICLE_VISIBILITIES.PUBLIC]: {
    label: 'Public (All Users)',
    badgeVariant: 'success',
    description: 'Visible to everyone including all employees and staff',
  },
  [ARTICLE_VISIBILITIES.INTERNAL]: {
    label: 'Internal (Staff Only)',
    badgeVariant: 'info',
    description: 'Visible only to IT support staff and administrators',
  },
  [ARTICLE_VISIBILITIES.DEPARTMENT]: {
    label: 'Department Restricted',
    badgeVariant: 'warning',
    description: 'Restricted to members of a specific department and IT staff',
  },
}

export const ALLOWED_ARTICLE_TRANSITIONS = {
  DRAFT: ['PUBLISHED'],
  PUBLISHED: ['ARCHIVED', 'DRAFT'],
  ARCHIVED: ['DRAFT'],
}

export function canTransitionArticle(currentStatus, targetStatus) {
  const allowed = ALLOWED_ARTICLE_TRANSITIONS[currentStatus]
  return Array.isArray(allowed) && allowed.includes(targetStatus)
}
