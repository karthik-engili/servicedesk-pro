/**
 * Centralized Constants for Tickets Module
 */

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export const TICKET_STATUSES = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'REOPENED',
]

export const TICKET_CATEGORIES = [
  'HARDWARE',
  'SOFTWARE',
  'NETWORK',
  'ACCESS',
  'GENERAL',
]

export const SLA_STATUSES = ['WITHIN_SLA', 'APPROACHING', 'BREACHED', 'MET']

export const STATUS_LABELS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
}

export const STATUS_BADGE_VARIANTS = {
  OPEN: 'info',
  ASSIGNED: 'purple',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'neutral',
  REOPENED: 'danger',
}

export const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export const PRIORITY_BADGE_VARIANTS = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
}

export const CATEGORY_LABELS = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  NETWORK: 'Network',
  ACCESS: 'Access & Accounts',
  GENERAL: 'General Support',
}

export const SLA_BADGE_VARIANTS = {
  WITHIN_SLA: 'success',
  APPROACHING: 'warning',
  BREACHED: 'danger',
  MET: 'success',
}

export const SLA_LABELS = {
  WITHIN_SLA: 'Within SLA',
  APPROACHING: 'Approaching Breach',
  BREACHED: 'SLA Breached',
  MET: 'SLA Met',
}

/**
 * Checks whether an explicit action is permitted given current ticket status
 */
export const ALLOWED_TRANSITIONS = {
  OPEN: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS', 'ASSIGNED'],
  IN_PROGRESS: ['RESOLVED', 'ASSIGNED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['IN_PROGRESS', 'ASSIGNED'],
  CLOSED: [],
}

export function canTransitionTo(currentStatus, targetStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus]
  return Array.isArray(allowed) && allowed.includes(targetStatus)
}
