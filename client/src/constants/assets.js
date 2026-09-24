/**
 * Centralized Constants for Assets & CMDB Module
 * Aligned with backend models, validators, and lifecycle state machines
 */

export const ASSET_STATUSES = [
  'AVAILABLE',
  'ASSIGNED',
  'UNDER_REPAIR',
  'REPLACED',
  'RETIRED',
  'LOST',
]

export const ASSET_CATEGORIES = [
  'LAPTOP',
  'DESKTOP',
  'MONITOR',
  'PRINTER',
  'NETWORK',
  'MOBILE',
  'SOFTWARE',
  'SERVER',
  'OTHER',
]

export const VENDOR_STATUSES = ['ACTIVE', 'INACTIVE']

export const STATUS_LABELS = {
  AVAILABLE: 'Available',
  ASSIGNED: 'Assigned',
  UNDER_REPAIR: 'Under Repair',
  REPLACED: 'Replaced',
  RETIRED: 'Retired',
  LOST: 'Lost',
}

export const STATUS_BADGE_VARIANTS = {
  AVAILABLE: 'success',
  ASSIGNED: 'info',
  UNDER_REPAIR: 'warning',
  REPLACED: 'purple',
  RETIRED: 'neutral',
  LOST: 'danger',
}

export const CATEGORY_LABELS = {
  LAPTOP: 'Laptop',
  DESKTOP: 'Desktop',
  MONITOR: 'Monitor',
  PRINTER: 'Printer',
  NETWORK: 'Network Equipment',
  MOBILE: 'Mobile Device',
  SOFTWARE: 'Software License',
  SERVER: 'Server & Rack',
  OTHER: 'Other Hardware',
}

export const VENDOR_STATUS_LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
}

export const VENDOR_STATUS_BADGE_VARIANTS = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
}

export const ASSET_HISTORY_ACTIONS = [
  'CREATED',
  'ASSIGNED',
  'UNASSIGNED',
  'SENT_FOR_REPAIR',
  'RETURNED_FROM_REPAIR',
  'REPLACED',
  'RETIRED',
  'REPORTED_LOST',
  'RECOVERED',
  'UPDATED',
]

export const HISTORY_ACTION_LABELS = {
  CREATED: 'Asset Created',
  ASSIGNED: 'Assigned to User',
  UNASSIGNED: 'Unassigned / Returned',
  SENT_FOR_REPAIR: 'Sent for Repair',
  RETURNED_FROM_REPAIR: 'Returned from Repair',
  REPLACED: 'Replaced by New Asset',
  RETIRED: 'Permanently Retired',
  REPORTED_LOST: 'Reported Lost',
  RECOVERED: 'Recovered to Stock',
  UPDATED: 'Metadata Updated',
}

export const ALLOWED_ASSET_TRANSITIONS = {
  AVAILABLE: ['ASSIGNED', 'RETIRED', 'UNDER_REPAIR'],
  ASSIGNED: ['AVAILABLE', 'UNDER_REPAIR', 'REPLACED', 'LOST', 'RETIRED'],
  UNDER_REPAIR: ['AVAILABLE', 'RETIRED', 'REPLACED'],
  REPLACED: ['RETIRED'],
  LOST: ['AVAILABLE', 'RETIRED'],
  RETIRED: [],
}

/**
 * Validates if an asset can transition from current status to target status
 */
export function canTransitionAssetTo(currentStatus, targetStatus) {
  const allowed = ALLOWED_ASSET_TRANSITIONS[currentStatus]
  return Array.isArray(allowed) && allowed.includes(targetStatus)
}

/**
 * Evaluates warranty status based on date string/Date
 */
export function getWarrantyStatus(warrantyExpiry) {
  if (!warrantyExpiry) return { status: 'NONE', label: 'No Warranty', variant: 'neutral' }

  const now = new Date()
  const expiry = new Date(warrantyExpiry)

  if (isNaN(expiry.getTime())) return { status: 'NONE', label: 'No Warranty', variant: 'neutral' }

  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      status: 'EXPIRED',
      label: `Expired ${Math.abs(diffDays)}d ago`,
      variant: 'danger',
      daysRemaining: diffDays,
    }
  }

  if (diffDays <= 30) {
    return {
      status: 'EXPIRING_SOON',
      label: `Expires in ${diffDays}d`,
      variant: 'warning',
      daysRemaining: diffDays,
    }
  }

  return {
    status: 'ACTIVE',
    label: `Active (${Math.ceil(diffDays / 30)} mos left)`,
    variant: 'success',
    daysRemaining: diffDays,
  }
}
