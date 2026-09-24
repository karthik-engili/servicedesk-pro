import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TicketStatusBadge from './TicketStatusBadge'
import TicketPriorityBadge from './TicketPriorityBadge'
import SlaIndicator from './SlaIndicator'
import { CATEGORY_LABELS } from '../../constants/tickets'
import EmptyState from '../ui/EmptyState'

export function TicketTable({ tickets = [], isLoading = false, onRowClick }) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-8 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading tickets...
          </p>
        </div>
      </div>
    )
  }

  if (!tickets || tickets.length === 0) {
    return (
      <EmptyState
        title="No Tickets Found"
        description="No support tickets match the current filters or query criteria."
      />
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">SLA</th>
              <th className="py-3 px-4">Requester</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {tickets.map((t) => {
              const categoryLabel = CATEGORY_LABELS[t.category] || t.category || 'General'

              return (
                <tr
                  key={t._id}
                  onClick={() => onRowClick ? onRowClick(t._id) : navigate(`/tickets/${t._id}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 group-hover:text-blue-700 whitespace-nowrap">
                    {t.ticketNumber}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                    {t.department?.name && (
                      <div className="text-[11px] text-slate-400 truncate">
                        Dept: {t.department.name}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                    {categoryLabel}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <TicketStatusBadge status={t.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <TicketPriorityBadge priority={t.priority} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <SlaIndicator ticket={t} compact={true} />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{t.createdBy?.name || 'User'}</div>
                    <div className="text-[11px] text-slate-400">{t.createdBy?.email}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {t.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                          {t.assignedTo.name?.slice(0, 1) || 'T'}
                        </span>
                        <span className="font-medium text-slate-800">{t.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                    {formatDate(t.createdAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Cards View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {tickets.map((t) => (
          <div
            key={t._id}
            onClick={() => onRowClick ? onRowClick(t._id) : navigate(`/tickets/${t._id}`)}
            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-blue-600">
                {t.ticketNumber}
              </span>
              <div className="flex items-center gap-1.5">
                <TicketPriorityBadge priority={t.priority} size="sm" />
                <TicketStatusBadge status={t.status} size="sm" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">{t.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span>Requester: </span>
                <span className="font-medium text-slate-700">{t.createdBy?.name || 'User'}</span>
              </div>
              <div>
                <span>Assignee: </span>
                <span className="font-medium text-slate-700">
                  {t.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TicketTable
