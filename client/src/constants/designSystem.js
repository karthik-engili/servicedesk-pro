/**
 * Centralized Enterprise Design System Tokens & Semantic Utilities
 * Aligned with ServiceNow / Jira Service Management visual standards
 */

export const TYPOGRAPHY = {
  pageTitle: 'text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100',
  sectionHeading: 'text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100',
  subheading: 'text-sm font-semibold text-slate-800 dark:text-slate-200',
  body: 'text-sm font-normal text-slate-700 dark:text-slate-300 leading-normal',
  secondaryText: 'text-xs sm:text-[13px] text-slate-500 dark:text-slate-400',
  smallMeta: 'text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400',
  tableHeader: 'text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400',
  tableCell: 'text-[13px] sm:text-sm text-slate-700 dark:text-slate-300',
  codeId: 'font-mono text-xs sm:text-[13px] font-medium tracking-tight',
}

export const STATUS_BADGE_STYLES = {
  OPEN: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-500',
  },
  ASSIGNED: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    dot: 'bg-indigo-500',
  },
  IN_PROGRESS: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  RESOLVED: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  CLOSED: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  REOPENED: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
}

export const PRIORITY_BADGE_STYLES = {
  LOW: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  MEDIUM: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-500',
  },
  HIGH: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  CRITICAL: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
}

export const SLA_BADGE_STYLES = {
  WITHIN_SLA: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  APPROACHING: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  BREACHED: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
  MET: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
}

export const ELEVATIONS = {
  flat: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
  subtle: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-3xs',
  card: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs',
  panel: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs',
  dropdown: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md',
  modal: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl',
}
