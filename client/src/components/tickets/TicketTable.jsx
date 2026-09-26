import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'
import TicketStatusBadge from './TicketStatusBadge'
import TicketPriorityBadge from './TicketPriorityBadge'
import SlaIndicator from './SlaIndicator'
import { CATEGORY_LABELS } from '../../constants/tickets'
import EmptyState from '../ui/EmptyState'

function TicketTableSkeleton() {
  return (
    <Card variant="bordered" className="overflow-hidden">
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton variant="text" width="60px" height="18px" />
              <div className="space-y-1.5 flex-1 max-w-md">
                <Skeleton variant="text" width="80%" height="16px" />
                <Skeleton variant="text" width="40%" height="12px" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton variant="badge" />
              <Skeleton variant="badge" />
              <Skeleton variant="rect" width="80px" height="24px" className="hidden md:block" />
              <Skeleton variant="circle" width="28px" height="28px" className="hidden lg:block" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function TicketTable({ tickets = [], isLoading = false, onRowClick }) {
  const navigate = useNavigate()

  if (isLoading) {
    return <TicketTableSkeleton />
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card variant="bordered" className="p-8">
        <EmptyState
          title="No Tickets Found"
          description="No support tickets match the current filters or search query."
        />
      </Card>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return String(dateStr)
    }
  }

  const handleRowClick = (ticketId) => {
    if (onRowClick) {
      onRowClick(ticketId)
    } else {
      navigate(`/tickets/${ticketId}`)
    }
  }

  return (
    <Card variant="bordered" className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-4 font-semibold">Ticket</th>
              <th className="py-3 px-4 font-semibold">Issue</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">SLA Status</th>
              <th className="py-3 px-4 font-semibold">Requester</th>
              <th className="py-3 px-4 font-semibold">Assignee</th>
              <th className="py-3 px-4 font-semibold text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {tickets.map((t) => {
              const categoryLabel = CATEGORY_LABELS[t.category] || t.category || 'General'

              return (
                <tr
                  key={t._id}
                  onClick={() => handleRowClick(t._id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  {/* Monospace Ticket Number */}
                  <td className="py-3 px-4 font-mono font-semibold text-primary-600 dark:text-primary-400 group-hover:underline whitespace-nowrap">
                    {t.ticketNumber}
                  </td>

                  {/* Subject / Title */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {t.title}
                    </div>
                    {t.department?.name && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block">
                        Dept: {t.department.name}
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                    {categoryLabel}
                  </td>

                  {/* Priority Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <TicketPriorityBadge priority={t.priority} size="sm" />
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <TicketStatusBadge status={t.status} size="sm" />
                  </td>

                  {/* SLA Indicator */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <SlaIndicator ticket={t} compact={true} />
                  </td>

                  {/* Requester */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {t.createdBy?.name || 'Requester'}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      {t.createdBy?.email}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {t.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-semibold text-[10px] flex items-center justify-center border border-primary-200/80 dark:border-primary-800/80">
                          {t.assignedTo.name?.slice(0, 1) || 'T'}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {t.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic select-none">
                        — Unassigned
                      </span>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {formatDate(t.createdAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card-style View */}
      <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {tickets.map((t) => (
          <div
            key={t._id}
            onClick={() => handleRowClick(t._id)}
            className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer space-y-2 select-none"
          >
            {/* Row 1: ID, Priority, Status */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-primary-600 dark:text-primary-400">
                {t.ticketNumber}
              </span>
              <div className="flex items-center gap-1.5">
                <TicketPriorityBadge priority={t.priority} size="xs" />
                <TicketStatusBadge status={t.status} size="xs" />
              </div>
            </div>

            {/* Row 2: Title */}
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                {t.title}
              </p>
            </div>

            {/* Row 3: SLA & People */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="truncate">
                <span>By: {t.createdBy?.name || 'Requester'}</span>
                {t.assignedTo && <span className="ml-1.5">• {t.assignedTo.name}</span>}
              </div>
              <SlaIndicator ticket={t} compact={true} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default TicketTable
