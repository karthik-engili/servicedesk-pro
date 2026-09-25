import React, { useState, useEffect } from 'react'
import { Modal, Spinner, EmptyState, Button } from '../ui'
import aiService from '../../services/aiService'
import AiSourceBadge from './AiSourceBadge'
import AiConfidenceBadge from './AiConfidenceBadge'
import { ROLE_LABELS } from '../../constants/roles'

export function AiAnalysisHistory({ isOpen, onClose, ticketId, ticketNumber }) {
  const [history, setHistory] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!isOpen || !ticketId) return

    let isMounted = true
    const fetchHistory = async (page = 1) => {
      setLoading(true)
      setError('')
      try {
        const data = await aiService.getAnalysisHistory(ticketId, { page, limit: 10 })
        if (isMounted) {
          setHistory(data.history || [])
          setPagination(data.pagination || { total: 0, page: 1, limit: 10, pages: 1 })
          if (data.history && data.history.length > 0) {
            setExpandedId(data.history[0]._id)
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load AI analysis history.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchHistory()
    return () => {
      isMounted = false
    }
  }, [isOpen, ticketId])

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const riskBadgeVariants = {
    LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    MEDIUM: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    HIGH: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    CRITICAL: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Ticket Intelligence History"
      size="lg"
    >
      <div className="space-y-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          Historical AI diagnostic runs, classification predictions, and risk assessments for ticket{' '}
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ticketNumber}</span>.
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <Spinner size="md" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
            {error}
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            title="No Analysis History"
            description="AI diagnostics run on this ticket will be audited and cataloged here."
          />
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {history.map((record) => {
              const isExpanded = expandedId === record._id
              const formattedDate = new Date(record.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={record._id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-all"
                >
                  <div
                    onClick={() => toggleExpand(record._id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer select-none gap-3"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <AiSourceBadge source={record.provider || record.source} aiAvailable={record.aiAvailable} />

                      <div className="text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {record.categorySuggestion || 'N/A'} • {record.prioritySuggestion || 'N/A'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2">
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          riskBadgeVariants[record.riskLevel] || riskBadgeVariants.LOW
                        }`}
                      >
                        Risk: {record.riskLevel}
                      </span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="text-slate-500 block mb-0.5">Category Suggestion:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 mr-2">
                            {record.categorySuggestion}
                          </span>
                          <AiConfidenceBadge confidence={record.categoryConfidence} size="xs" showLabel={false} />
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5">Priority Suggestion:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 mr-2">
                            {record.prioritySuggestion}
                          </span>
                          <AiConfidenceBadge confidence={record.priorityConfidence} size="xs" showLabel={false} />
                        </div>
                      </div>

                      {record.reasoning && (
                        <div>
                          <span className="text-slate-500 block mb-0.5">Reasoning:</span>
                          <p className="text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded border border-slate-200 dark:border-slate-800">
                            "{record.reasoning}"
                          </p>
                        </div>
                      )}

                      {record.escalationRecommended && (
                        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200">
                          <span className="font-bold block mb-0.5">⚠ Escalation Flagged:</span>
                          {record.escalationReason || 'High-severity signals detected requiring staff triage.'}
                        </div>
                      )}

                      {record.risks && record.risks.length > 0 && (
                        <div>
                          <span className="text-slate-500 block mb-1">Identified Risk Signals:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                            {record.risks.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {record.solutionDraft && (
                        <div>
                          <span className="text-slate-500 block mb-1">Drafted Solution:</span>
                          <pre className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 font-mono text-[11px] whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {record.solutionDraft}
                          </pre>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Run by: {record.analyzedBy?.name || 'Staff User'} ({ROLE_LABELS[record.analyzedBy?.role] || record.analyzedBy?.role || 'Staff'})
                        </span>
                        <span>Model: {record.model || 'Default'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default AiAnalysisHistory
