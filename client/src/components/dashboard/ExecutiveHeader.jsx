import React from 'react'
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles'
import Badge from '../ui/Badge'

export function ExecutiveHeader({ user, subtitle = 'IT Operations Overview', onRefresh, refreshing = false }) {
  const currentHour = new Date().getHours()
  let greeting = 'Good morning'
  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon'
  } else if (currentHour >= 17) {
    greeting = 'Good evening'
  }

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'Staff'
  const badgeVariant = ROLE_BADGE_VARIANTS[user?.role] || 'neutral'

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {greeting}, {user?.name || 'User'}
          </h1>
          <Badge variant={badgeVariant} size="sm">
            {roleLabel}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh dashboard metrics"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
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
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ExecutiveHeader
