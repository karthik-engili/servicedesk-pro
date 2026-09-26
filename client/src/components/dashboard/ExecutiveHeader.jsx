import React from 'react'
import { Link } from 'react-router-dom'
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles'
import Badge from '../ui/Badge'
import { PlusIcon } from '../ui/Icons'

export function ExecutiveHeader({
  user,
  title = 'Dashboard',
  subtitle = 'Operational overview of your service desk',
  onRefresh,
  refreshing = false,
  showCreateTicket = true,
}) {
  const userRole = user?.role || 'employee'
  const roleLabel = ROLE_LABELS[userRole] || userRole
  const badgeVariant = ROLE_BADGE_VARIANTS[userRole] || 'neutral'
  const canCreateTicket = showCreateTicket && userRole !== 'asset_manager'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <Badge variant={badgeVariant} size="xs" className="font-medium">
            {roleLabel}
          </Badge>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-medium font-mono select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Data
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {canCreateTicket && (
          <Link
            to="/tickets?create=true"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 rounded-md transition-colors shadow-2xs cursor-pointer select-none"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </Link>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh dashboard metrics"
            aria-label="Refresh dashboard metrics"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 select-none shadow-2xs"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary-600' : 'text-slate-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ExecutiveHeader
