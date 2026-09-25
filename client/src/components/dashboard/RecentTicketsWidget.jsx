import React from 'react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANTS,
  PRIORITY_LABELS,
  PRIORITY_BADGE_VARIANTS,
  SLA_BADGE_VARIANTS,
  SLA_LABELS,
} from '../../constants/tickets'

export function RecentTicketsWidget({
  tickets = [],
  title = 'Recent Tickets',
  viewAllUrl = '/tickets',
  className = '',
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {title}
            </h3>
          </div>
          <Link
            to={viewAllUrl}
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1"
          >
            <span>View all</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <EmptyState
            title="No recent tickets"
            description="Tickets created or assigned to you will show up here."
            className="py-8"
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {tickets.map((t) => {
              const statusVariant = STATUS_BADGE_VARIANTS[t.status] || 'neutral'
              const statusLabel = STATUS_LABELS[t.status] || t.status
              const priorityVariant = PRIORITY_BADGE_VARIANTS[t.priority] || 'neutral'
              const priorityLabel = PRIORITY_LABELS[t.priority] || t.priority
              const slaVariant = SLA_BADGE_VARIANTS[t.slaStatus] || 'neutral'
              const slaLabel = SLA_LABELS[t.slaStatus] || t.slaStatus

              return (
                <Link
                  key={t._id}
                  to={`/tickets/${t._id}`}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors no-underline group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {t.ticketNumber}
                      </span>
                      <Badge variant={statusVariant} size="xs">
                        {statusLabel}
                      </Badge>
                      <Badge variant={priorityVariant} size="xs">
                        {priorityLabel}
                      </Badge>
                      {t.slaStatus && (
                        <Badge variant={slaVariant} size="xs">
                          {slaLabel}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {t.title}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap self-start sm:self-center">
                    {formatDate(t.createdAt)}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentTicketsWidget
