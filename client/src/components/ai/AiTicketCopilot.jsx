import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Spinner } from '../ui'
import AiSourceBadge from './AiSourceBadge'
import AiConfidenceBadge from './AiConfidenceBadge'
import AiAnalysisHistory from './AiAnalysisHistory'
import aiService from '../../services/aiService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { isStaff, isAdminOrManager } from '../../constants/roles'
import { ARTICLE_CATEGORY_CONFIG } from '../../constants/articles'
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../../constants/tickets'

export function AiTicketCopilot({ ticket, onTicketUpdated, className = '' }) {
  const { user } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()

  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [applyingCategory, setApplyingCategory] = useState(false)
  const [applyingPriority, setApplyingPriority] = useState(false)
  const [generatingDraft, setGeneratingDraft] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [copiedDraft, setCopiedDraft] = useState(false)
  const [error, setError] = useState(null)

  const staff = isStaff(user)
  const privileged = isAdminOrManager(user)
  const isOwner = ticket?.createdBy?._id === user?._id || ticket?.createdBy === user?._id
  const canApplyCategory = staff || isOwner
  const canApplyPriority = privileged

  // Trigger full analysis
  const handleAnalyze = async () => {
    if (!ticket?._id || analyzing) return
    setAnalyzing(true)
    setError(null)
    try {
      const data = await aiService.analyzeTicket(ticket._id)
      setAnalysis(data)
      if (data.aiAvailable) {
        showSuccess('AI ticket analysis completed.')
      } else {
        showInfo('AI analysis generated using local support intelligence.')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete AI ticket analysis.'
      setError(msg)
      showError(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  // Apply recommended category
  const handleApplyCategory = async () => {
    const recommendedCat = analysis?.classification?.category
    if (!recommendedCat || applyingCategory) return

    setApplyingCategory(true)
    try {
      const updated = await aiService.applyCategory(ticket._id, recommendedCat)
      showSuccess(`Category updated to ${CATEGORY_LABELS[recommendedCat] || recommendedCat}.`)
      if (onTicketUpdated) onTicketUpdated(updated)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to apply recommended category.')
    } finally {
      setApplyingCategory(false)
    }
  }

  // Apply recommended priority (Recalculates SLA)
  const handleApplyPriority = async () => {
    const recommendedPri = analysis?.priorityRecommendation?.priority
    if (!recommendedPri || applyingPriority) return

    setApplyingPriority(true)
    try {
      const updated = await aiService.applyPriority(ticket._id, recommendedPri)
      showSuccess(`Priority updated to ${PRIORITY_LABELS[recommendedPri] || recommendedPri} and SLA recalculated.`)
      if (onTicketUpdated) onTicketUpdated(updated)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to apply recommended priority.')
    } finally {
      setApplyingPriority(false)
    }
  }

  // Generate Solution Draft on-demand
  const handleGenerateSolutionDraft = async () => {
    if (!ticket?._id || generatingDraft) return
    setGeneratingDraft(true)
    try {
      const draftData = await aiService.generateSolutionDraft(ticket._id)
      setAnalysis((prev) => ({
        ...prev,
        solutionDraft: draftData.solutionDraft,
      }))
      showSuccess('Troubleshooting solution draft generated.')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to generate solution draft.')
    } finally {
      setGeneratingDraft(false)
    }
  }

  // Copy solution to clipboard
  const handleCopySolution = () => {
    if (!analysis?.solutionDraft) return
    navigator.clipboard.writeText(analysis.solutionDraft)
    setCopiedDraft(true)
    showSuccess('Solution draft copied to clipboard.')
    setTimeout(() => setCopiedDraft(false), 2500)
  }

  const riskBadgeStyles = {
    LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    MEDIUM: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    HIGH: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    CRITICAL: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold',
  }

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden ${className}`}
    >
      {/* Copilot Header */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-xs">
            🤖
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              AI Ticket Copilot
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Enterprise Diagnostics & Assist
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {analysis && (
            <AiSourceBadge
              source={analysis.source}
              aiAvailable={analysis.aiAvailable}
            />
          )}

          {staff && (
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              title="View analysis revision history"
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4">
        {/* Initial State: No Analysis Yet */}
        {!analysis && !analyzing && (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Analyze this ticket to evaluate category, calibrate SLA priority, scan for security risks, and generate grounded solutions.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAnalyze}
              className="w-full justify-center"
            >
              <span className="mr-1.5">⚡</span> Analyze Ticket with AI
            </Button>
            {error && (
              <p className="text-xs text-rose-500 pt-1">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Loading Spinner State */}
        {analyzing && (
          <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-center">
            <Spinner size="md" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Evaluating ticket taxonomy, priority, and knowledge solutions...
            </p>
            <p className="text-[11px] text-slate-400">
              Correlating system signals and historical resolutions
            </p>
          </div>
        )}

        {/* Analyzed Active Intelligence State */}
        {analysis && !analyzing && (
          <div className="space-y-4 text-xs">
            {/* Advisory Human-in-the-loop Notice */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="uppercase tracking-wider font-semibold">AI Suggestion</span>
              <span>Review before applying</span>
            </div>

            {/* Fallback Notice (if source is fallback) */}
            {!analysis.aiAvailable && (
              <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] space-y-0.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <span>ℹ️</span>
                  <span>Using local fallback analysis</span>
                </div>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 pl-5">
                  AI service unavailable. Recommendations generated from localized rule heuristics.
                </p>
              </div>
            )}

            {/* Category Recommendation */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Category Recommendation
                </span>
                <AiConfidenceBadge confidence={analysis.classification?.confidence} size="xs" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {CATEGORY_LABELS[analysis.classification?.category] || analysis.classification?.category}
                </div>

                {canApplyCategory && (
                  <Button
                    variant="neutral"
                    size="xs"
                    disabled={
                      applyingCategory ||
                      ticket.category === analysis.classification?.category
                    }
                    loading={applyingCategory}
                    onClick={handleApplyCategory}
                  >
                    {ticket.category === analysis.classification?.category
                      ? 'Applied'
                      : 'Apply Category'}
                  </Button>
                )}
              </div>

              {analysis.classification?.reasoning && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-snug">
                  "{analysis.classification.reasoning}"
                </p>
              )}
            </div>

            {/* Priority Recommendation */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Priority & SLA Recommendation
                </span>
                <AiConfidenceBadge confidence={analysis.priorityRecommendation?.confidence} size="xs" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {PRIORITY_LABELS[analysis.priorityRecommendation?.priority] || analysis.priorityRecommendation?.priority}
                </div>

                {canApplyPriority && (
                  <Button
                    variant="neutral"
                    size="xs"
                    disabled={
                      applyingPriority ||
                      ticket.priority === analysis.priorityRecommendation?.priority
                    }
                    loading={applyingPriority}
                    onClick={handleApplyPriority}
                  >
                    {ticket.priority === analysis.priorityRecommendation?.priority
                      ? 'Applied'
                      : 'Apply Priority'}
                  </Button>
                )}
              </div>

              {ticket.priority !== analysis.priorityRecommendation?.priority && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Applying will recalculate response & resolution SLA targets.
                </p>
              )}
            </div>

            {/* Risk Assessment & Escalation */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Risk Assessment
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    riskBadgeStyles[analysis.riskLevel] || riskBadgeStyles.LOW
                  }`}
                >
                  {analysis.riskLevel} RISK
                </span>
              </div>

              {/* Risk items */}
              {analysis.risks && analysis.risks.length > 0 ? (
                <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                  {analysis.risks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 shrink-0">⚠</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  No anomalous security or system outage risks detected.
                </p>
              )}

              {/* Escalation Flag */}
              {analysis.escalationRecommended && (
                <div className="mt-2 p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>🚨</span>
                    <span>Human Escalation Recommended</span>
                  </div>
                  {analysis.escalationReason && (
                    <p className="leading-snug">{analysis.escalationReason}</p>
                  )}
                </div>
              )}
            </div>

            {/* Recommended Knowledge Articles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Matched Solutions
                </span>
                <span className="text-[10px] text-slate-400">
                  {analysis.articleRecommendations?.length || 0} found
                </span>
              </div>

              {analysis.articleRecommendations && analysis.articleRecommendations.length > 0 ? (
                <div className="space-y-1.5">
                  {analysis.articleRecommendations.map((art, idx) => {
                    const relevancePct = Math.round((art.relevance || 0.8) * 100)
                    return (
                      <Link
                        key={art.articleId || idx}
                        to={`/knowledge/${art.articleId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100 truncate text-[11px]">
                            {art.title}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                            {relevancePct}%
                          </span>
                        </div>
                        {art.reason && (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {art.reason}
                          </p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic p-2 bg-slate-50 dark:bg-slate-800/40 rounded text-center">
                  No relevant knowledge articles found.
                </p>
              )}
            </div>

            {/* Solution Draft */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Troubleshooting Solution Draft
                </span>
                {analysis.solutionDraft && (
                  <button
                    type="button"
                    onClick={handleCopySolution}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                  >
                    <span>{copiedDraft ? '✓ Copied' : 'Copy Draft'}</span>
                  </button>
                )}
              </div>

              {analysis.solutionDraft ? (
                <div className="space-y-1.5">
                  <pre className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed">
                    {analysis.solutionDraft}
                  </pre>
                  <p className="text-[10px] text-slate-400 italic">
                    Draft recommendation — please review before adding to ticket comments.
                  </p>
                </div>
              ) : (
                <Button
                  variant="neutral"
                  size="xs"
                  onClick={handleGenerateSolutionDraft}
                  loading={generatingDraft}
                  className="w-full justify-center"
                >
                  Generate Solution Draft
                </Button>
              )}
            </div>

            {/* Re-analyze Footer Action */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Re-analyze</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analysis History Modal */}
      {showHistoryModal && (
        <AiAnalysisHistory
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          ticketId={ticket._id}
          ticketNumber={ticket.ticketNumber}
        />
      )}
    </div>
  )
}

export default AiTicketCopilot
