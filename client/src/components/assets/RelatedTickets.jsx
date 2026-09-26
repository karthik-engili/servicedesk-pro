import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import assetService from '../../services/assetService'
import TicketStatusBadge from '../tickets/TicketStatusBadge'
import TicketPriorityBadge from '../tickets/TicketPriorityBadge'
import SlaIndicator from '../tickets/SlaIndicator'
import { Spinner, Button } from '../ui'
import { handleApiError } from '../../utils/errorHandler'

export function RelatedTickets({ assetId }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTickets = useCallback(async () => {
    if (!assetId) return
    try {
      setLoading(true)
      setError(null)
      const data = await assetService.getAssetTickets(assetId)
      setTickets(Array.isArray(data) ? data : [])
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to load related tickets.')
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Linked Service & Incident Tickets</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {tickets.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Support tickets referencing this asset tag for repairs, setup, or incident triage
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTickets}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 cursor-pointer transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-sm text-rose-700 dark:text-rose-400 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchTickets}>
            Retry
          </Button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs">
          No support tickets linked to this asset.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
          {tickets.map((t) => (
            <div
              key={t._id}
              className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/tickets/${t._id}`}
                    className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                  >
                    {t.ticketNumber}
                  </Link>
                  <TicketStatusBadge status={t.status} size="xs" />
                  <TicketPriorityBadge priority={t.priority} size="xs" />
                  <SlaIndicator ticket={t} compact={true} />
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {t.title}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Requester: <strong className="text-slate-700 dark:text-slate-300">{t.createdBy?.name || 'User'}</strong> • Created {formatDate(t.createdAt)}
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <Link to={`/tickets/${t._id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Ticket &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RelatedTickets
