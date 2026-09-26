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
          icon: '●',
          bg: 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
          title: 'Ticket Created',
        }
      case 'ASSIGNED':
      case 'REASSIGNED':
        return {
          icon: '●',
          bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          title: 'Technician Assigned',
        }
      case 'STATUS_CHANGED':
      case 'STARTED':
      case 'WORK_STARTED':
        return {
          icon: '●',
          bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          title: 'Status Updated',
        }
      case 'RESOLVED':
        return {
          icon: '✓',
          bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          title: 'Ticket Resolved',
        }
      case 'REOPENED':
        return {
          icon: '🔄',
          bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          title: 'Ticket Reopened',
        }
      case 'CLOSED':
        return {
          icon: '🔒',
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
          title: 'Ticket Closed',
        }
      case 'COMMENT_ADDED':
        return {
          icon: '💬',
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          title: 'Comment Added',
        }
      case 'WORKLOG_ADDED':
        return {
          icon: '⏱',
          bg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          title: 'Work Logged',
        }
      default:
        return {
          icon: '●',
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          title: action?.replace(/_/g, ' ') || 'Audit Event',
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Audit Trail & Timeline
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {logs.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable log of state transitions, assignments, and updates
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAuditLogs}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchAuditLogs}>
            Retry
          </Button>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          <svg
            className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2"
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
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No audit records found</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-5 my-2">
          {logs.map((log) => {
            const badge = getActionBadge(log.action)
            const performerName = log.performedBy?.name || 'System'
            const performerRole = log.performedBy?.role
            const roleLabel = ROLE_LABELS[performerRole] || performerRole || ''

            return (
              <div key={log._id} className="relative group">
                {/* Timeline node */}
                <span
                  className={`absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-2xs border ${badge.bg}`}
                >
                  {badge.icon}
                </span>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {badge.title}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        by <strong className="font-medium text-slate-700 dark:text-slate-300">{performerName}</strong>
                        {roleLabel && ` (${roleLabel})`}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                      {formatTimestamp(log.createdAt)}
                    </span>
                  </div>

                  {log.details && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                      {log.details}
                    </p>
                  )}

                  {/* State transition details */}
                  {(log.previousState || log.newState) && (
                    <div className="flex items-center gap-2 text-xs pt-1 text-slate-500 dark:text-slate-400 font-mono">
                      {log.previousState && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {log.previousState}
                        </span>
                      )}
                      {log.previousState && log.newState && <span>&rarr;</span>}
                      {log.newState && (
                        <span className="px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-semibold border border-primary-200 dark:border-primary-800">
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
