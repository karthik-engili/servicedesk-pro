import React, { useState, useEffect, useCallback } from 'react'
import ticketService from '../../services/ticketService'
import { handleApiError } from '../../utils/errorHandler'
import { ROLE_LABELS } from '../../constants/roles'
import { Spinner, Button } from '../ui'

export function TicketAuditTimeline({ ticketId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAuditLogs = useCallback(async () => {
    if (!ticketId) return
    try {
      setLoading(true)
      setError(null)
      const data = await ticketService.getAuditLogs(ticketId, { limit: 50 })
      const list = data?.logs || (Array.isArray(data) ? data : [])
      setLogs(list)
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to load audit history.')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionBadge = (action) => {
    switch (action) {
      case 'TICKET_CREATED':
      case 'CREATED':
        return {
          icon: '✨',
          bg: 'bg-primary-100 text-primary-800 border-primary-200',
          title: 'Ticket Created',
        }
      case 'ASSIGNED':
      case 'REASSIGNED':
        return {
          icon: '👤',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          title: 'Technician Assigned',
        }
      case 'STATUS_CHANGED':
      case 'STARTED':
      case 'WORK_STARTED':
        return {
          icon: '⚡',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          title: 'Status Updated',
        }
      case 'RESOLVED':
        return {
          icon: '✅',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          title: 'Ticket Resolved',
        }
      case 'REOPENED':
        return {
          icon: '🔄',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          title: 'Ticket Reopened',
        }
      case 'CLOSED':
        return {
          icon: '🔒',
          bg: 'bg-slate-200 text-slate-800 border-slate-300',
          title: 'Ticket Closed',
        }
      case 'COMMENT_ADDED':
        return {
          icon: '💬',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          title: 'Comment Added',
        }
      case 'WORKLOG_ADDED':
        return {
          icon: '⏱️',
          bg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          title: 'Work Logged',
        }
      default:
        return {
          icon: '📋',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          title: action?.replace(/_/g, ' ') || 'Audit Event',
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            Audit Trail & History
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              {logs.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of state transitions, assignments, and updates
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAuditLogs}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchAuditLogs}>
            Retry
          </Button>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
          <svg
            className="w-10 h-10 text-slate-300 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm font-medium text-slate-600">No audit records found</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-2">
          {logs.map((log) => {
            const badge = getActionBadge(log.action)
            const performerName = log.performedBy?.name || 'System'
            const performerRole = log.performedBy?.role
            const roleLabel = ROLE_LABELS[performerRole] || performerRole || ''

            return (
              <div key={log._id} className="relative group">
                {/* Timeline node */}
                <span
                  className={`absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs shadow-xs border ${badge.bg}`}
                >
                  {badge.icon}
                </span>

                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">
                        {badge.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        by <strong className="font-medium text-slate-700">{performerName}</strong>
                        {roleLabel && ` (${roleLabel})`}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(log.createdAt)}
                    </span>
                  </div>

                  {log.details && (
                    <p className="text-sm text-slate-600 leading-normal">
                      {log.details}
                    </p>
                  )}

                  {/* State transition details */}
                  {(log.previousState || log.newState) && (
                    <div className="flex items-center gap-2 text-xs pt-1 text-slate-500">
                      {log.previousState && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
                          {log.previousState}
                        </span>
                      )}
                      {log.previousState && log.newState && <span>&rarr;</span>}
                      {log.newState && (
                        <span className="px-2 py-0.5 rounded bg-primary-50 font-mono text-primary-700 font-medium">
                          {log.newState}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TicketAuditTimeline
