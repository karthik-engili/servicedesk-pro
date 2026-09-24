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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            Asset Lifecycle History
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              {history.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit record of custody transfers, maintenance, and status shifts
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
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
          <Button variant="ghost" size="sm" onClick={fetchHistory}>
            Retry
          </Button>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
          No history records recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-5 my-2">
          {history.map((record) => {
            const label = HISTORY_ACTION_LABELS[record.action] || record.action
            const icon = getActionIcon(record.action)
            const performerName = record.performedBy?.name || 'System'

            return (
              <div key={record._id} className="relative group">
                {/* Timeline node */}
                <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs shadow-xs border bg-white border-slate-300">
                  {icon}
                </span>

                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{label}</span>
                      <span className="text-slate-500">
                        by <strong className="font-medium text-slate-700">{performerName}</strong>
                      </span>
                    </div>
                    <span className="text-slate-400">{formatTimestamp(record.timestamp)}</span>
                  </div>

                  {record.notes && (
                    <p className="text-xs text-slate-600 leading-normal">{record.notes}</p>
                  )}

                  {/* Status Change details */}
                  {(record.previousStatus || record.newStatus) && (
                    <div className="flex items-center gap-2 text-xs pt-1 text-slate-500 font-mono">
                      {record.previousStatus && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {record.previousStatus}
                        </span>
                      )}
                      {record.previousStatus && record.newStatus && <span>&rarr;</span>}
                      {record.newStatus && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                          {record.newStatus}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Assignee Change details */}
                  {(record.previousAssignee || record.newAssignee) && (
                    <div className="text-xs text-slate-500 pt-0.5">
                      Assignee:{' '}
                      <span className="text-slate-700 font-medium">
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
