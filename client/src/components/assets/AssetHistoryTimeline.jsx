import React, { useState, useEffect, useCallback } from 'react'
import assetService from '../../services/assetService'
import { HISTORY_ACTION_LABELS } from '../../constants/assets'
import { Spinner, Button } from '../ui'
import { handleApiError } from '../../utils/errorHandler'

export function AssetHistoryTimeline({ assetId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async () => {
    if (!assetId) return
    try {
      setLoading(true)
      setError(null)
      const data = await assetService.getAssetHistory(assetId)
      setHistory(Array.isArray(data) ? data : [])
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to load asset history.')
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

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

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATED':
        return '✨'
      case 'ASSIGNED':
        return '👤'
      case 'UNASSIGNED':
        return '↩️'
      case 'SENT_FOR_REPAIR':
        return '🔧'
      case 'RETURNED_FROM_REPAIR':
        return '✅'
      case 'REPLACED':
        return '🔄'
      case 'RETIRED':
        return '🗑️'
      case 'REPORTED_LOST':
        return '⚠️'
      case 'RECOVERED':
        return '🔍'
      case 'UPDATED':
      default:
        return '📝'
    }
  }

  // Derive distinct chronological status transitions from actual history
  const statusTransitions = history
    .filter((h) => h.newStatus)
    .map((h) => ({
      status: h.newStatus,
      timestamp: h.timestamp,
      action: h.action,
    }))
    .reverse() // from earliest to latest

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Asset Lifecycle History</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {history.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authoritative audit trail of custody transfers, maintenance, and status shifts
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 cursor-pointer transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Horizontal Lifecycle Summary based on REAL history */}
      {statusTransitions.length > 1 && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            Observed Lifecycle Progression
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {statusTransitions.map((t, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {t.status}
                  </span>
                </div>
                {idx < statusTransitions.length - 1 && (
                  <span className="text-slate-400 dark:text-slate-600 shrink-0 font-bold">&rarr;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-sm text-rose-700 dark:text-rose-400 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchHistory}>
            Retry
          </Button>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs">
          No history records recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-4 my-2">
          {history.map((record) => {
            const label = HISTORY_ACTION_LABELS[record.action] || record.action
            const icon = getActionIcon(record.action)
            const performerName = record.performedBy?.name || 'System'

            return (
              <div key={record._id} className="relative group">
                {/* Timeline node */}
                <span className="absolute -left-[31px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs shadow-xs border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                  {icon}
                </span>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{label}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        by <strong className="font-medium text-slate-700 dark:text-slate-300">{performerName}</strong>
                      </span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                      {formatTimestamp(record.timestamp)}
                    </span>
                  </div>

                  {record.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal bg-slate-50 dark:bg-slate-800/40 p-2 rounded-md border border-slate-100 dark:border-slate-800">
                      {record.notes}
                    </p>
                  )}

                  {/* Status Change details */}
                  {(record.previousStatus || record.newStatus) && (
                    <div className="flex items-center gap-2 text-xs pt-1 text-slate-500 dark:text-slate-400 font-mono">
                      {record.previousStatus && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {record.previousStatus}
                        </span>
                      )}
                      {record.previousStatus && record.newStatus && <span>&rarr;</span>}
                      {record.newStatus && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900/50">
                          {record.newStatus}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Assignee Change details */}
                  {(record.previousAssignee || record.newAssignee) && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                      Assignee:{' '}
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {record.previousAssignee?.name || 'Unassigned'} &rarr;{' '}
                        {record.newAssignee?.name || 'Unassigned'}
                      </span>
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

export default AssetHistoryTimeline
