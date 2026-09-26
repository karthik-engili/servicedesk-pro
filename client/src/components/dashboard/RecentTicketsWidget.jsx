import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
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
  title = 'Recent Operational Tickets',
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
    <Card variant="bordered" className={`flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {title}
          </h2>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            ({tickets.length} recent)
          </span>
        </div>
        <Link
          to={viewAllUrl}
          className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1 select-none"
        >
          <span>View all queue</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Content */}
      <div className="p-0 overflow-x-auto">
        {tickets.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No recent tickets"
              description="Tickets created in or assigned to your queue will appear here."
              className="py-6"
            />
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                <th className="py-2.5 px-4 font-semibold">ID</th>
                <th className="py-2.5 px-4 font-semibold">Title</th>
                <th className="py-2.5 px-4 font-semibold">Priority</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold hidden md:table-cell">Assignee</th>
                <th className="py-2.5 px-4 font-semibold hidden sm:table-cell text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {tickets.map((t) => {
                const statusVariant = STATUS_BADGE_VARIANTS[t.status] || 'neutral'
                const statusLabel = STATUS_LABELS[t.status] || t.status
                const priorityVariant = PRIORITY_BADGE_VARIANTS[t.priority] || 'neutral'
                const priorityLabel = PRIORITY_LABELS[t.priority] || t.priority
                const assigneeName = t.assignedTo?.name || '—'

                return (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <Link
                        to={`/tickets/${t._id}`}
                        className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                      >
                        {t.ticketNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 max-w-xs truncate">
                      <Link
                        to={`/tickets/${t._id}`}
                        className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate block"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <Badge variant={priorityVariant} size="xs">
                        {priorityLabel}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <Badge variant={statusVariant} size="xs">
                        {statusLabel}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 hidden md:table-cell">
                      {assigneeName}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-400 dark:text-slate-500 hidden sm:table-cell text-right font-mono text-[11px]">
                      {formatDate(t.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  )
}

export default RecentTicketsWidget
