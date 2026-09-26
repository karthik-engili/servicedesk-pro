import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge'
import TicketPriorityBadge from '../../components/tickets/TicketPriorityBadge'
import SlaIndicator from '../../components/tickets/SlaIndicator'
import TicketActionBar from '../../components/tickets/TicketActionBar'
import TicketComments from '../../components/tickets/TicketComments'
import TicketWorkLogs from '../../components/tickets/TicketWorkLogs'
import TicketAuditTimeline from '../../components/tickets/TicketAuditTimeline'
import { Button, Spinner, ErrorState, Badge } from '../../components/ui'
import ticketService from '../../services/ticketService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'
import { CATEGORY_LABELS } from '../../constants/tickets'
import { ROLES, hasAnyRole } from '../../constants/roles'
import { RecommendedArticles } from '../../components/knowledge'
import { AiTicketCopilot } from '../../components/ai'

export function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess } = useToast()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('comments')
  const [copied, setCopied] = useState(false)

  const isStaff = hasAnyRole(user, [
    ROLES.SYSTEM_ADMIN,
    ROLES.IT_MANAGER,
    ROLES.TECHNICIAN,
  ])

  const fetchTicket = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await ticketService.getTicket(id)
      if (!data) {
        throw new Error('Ticket not found or you do not have permission to view it.')
      }
      setTicket(data)
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to load ticket details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  const handleTicketUpdated = (updated) => {
    if (updated) {
      setTicket(updated)
    }
    // Also refetch to ensure populated references are completely updated
    fetchTicket()
  }

  const handleCopyTicketNumber = () => {
    if (!ticket?.ticketNumber) return
    navigator.clipboard.writeText(ticket.ticketNumber)
    setCopied(true)
    showSuccess('Ticket number copied to clipboard.')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <PageContainer title="Loading Ticket...">
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Fetching ticket records...
          </p>
        </div>
      </PageContainer>
    )
  }

  if (error || !ticket) {
    return (
      <PageContainer title="Ticket Not Found">
        <div className="max-w-2xl mx-auto py-12">
          <ErrorState
            title="Ticket Inaccessible"
            message={error || 'This ticket does not exist or you do not have sufficient permissions to view it.'}
            onRetry={fetchTicket}
          />
          <div className="mt-6 text-center">
            <Link to="/tickets">
              <Button variant="outline" size="sm">
                &larr; Back to Ticket List
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    )
  }

  const categoryLabel = CATEGORY_LABELS[ticket.category] || ticket.category || 'General'

  return (
    <PageContainer>
      {/* Top Navigation & Breadcrumb */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Tickets</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{ticket.ticketNumber}</span>
        </Link>
      </div>

      {/* Ticket Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2.5 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopyTicketNumber}
                title="Click to copy ticket number"
                className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>{ticket.ticketNumber}</span>
                <span className="text-[11px] text-primary-500">
                  {copied ? '✓' : '📋'}
                </span>
              </button>

              <TicketStatusBadge status={ticket.status} size="md" />
              <TicketPriorityBadge priority={ticket.priority} size="md" />

              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                Category: <strong className="text-slate-800 dark:text-slate-200">{categoryLabel}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {ticket.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span>
                Opened by <strong className="font-medium text-slate-700 dark:text-slate-300">{ticket.createdBy?.name || 'Requester'}</strong>
              </span>
              <span>•</span>
              <span className="font-mono">{formatDate(ticket.createdAt)}</span>
              {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                <>
                  <span>•</span>
                  <span>Updated <span className="font-mono">{formatDate(ticket.updatedAt)}</span></span>
                </>
              )}
            </div>
          </div>

          {/* Contextual Action Bar right in Header */}
          <div className="self-start lg:self-center shrink-0">
            <TicketActionBar
              ticket={ticket}
              onTicketUpdated={handleTicketUpdated}
            />
          </div>
        </div>
      </div>

      {/* Main Two-Column Enterprise Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Description, Affected Asset, Resolution, and Activity Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Description */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              Description & Details
            </h2>
            <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {/* Linked Asset Information (if attached) */}
          {ticket.asset && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 flex items-center gap-2">
                <span>💻</span> Affected Hardware Asset
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Asset Tag</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {ticket.asset.assetTag || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Device Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {ticket.asset.name || 'Unnamed Asset'}
                  </span>
                </div>
                {ticket.asset.model && (
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Model</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{ticket.asset.model}</span>
                  </div>
                )}
                {ticket.asset.serialNumber && (
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Serial Number</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{ticket.asset.serialNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resolution Details Card (if resolved or closed) */}
          {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && ticket.resolutionNotes && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-800 dark:text-emerald-300 font-bold text-sm">✅ Resolution Summary</span>
                {ticket.resolvedAt && (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    • Resolved on {formatDate(ticket.resolvedAt)}
                  </span>
                )}
              </div>
              <p className="text-sm text-emerald-950 dark:text-emerald-100 whitespace-pre-wrap leading-relaxed">
                {ticket.resolutionNotes}
              </p>
              {ticket.resolvedBy && (
                <div className="mt-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  Resolved by: {ticket.resolvedBy.name || 'Support Engineer'}
                </div>
              )}
            </div>
          )}

          {/* Activity Section Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'comments'
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                💬 Comments & Notes
              </button>

              {/* Work logs only accessible to support staff */}
              {isStaff && (
                <button
                  type="button"
                  onClick={() => setActiveTab('worklogs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === 'worklogs'
                      ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  ⏱ Work Logs
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'audit'
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                📋 Audit Timeline
              </button>
            </div>

            {/* Active Tab Content */}
            {activeTab === 'comments' && (
              <TicketComments ticketId={ticket._id} currentUser={user} />
            )}

            {activeTab === 'worklogs' && isStaff && (
              <TicketWorkLogs ticketId={ticket._id} currentUser={user} />
            )}

            {activeTab === 'audit' && (
              <TicketAuditTimeline ticketId={ticket._id} />
            )}
          </div>
        </div>

        {/* Right Column (1 col): SLA, Copilot, Metadata Details, Knowledge */}
        <div className="space-y-6">
          {/* SLA Tracking Panel */}
          <SlaIndicator ticket={ticket} compact={false} />

          {/* AI Ticket Intelligence Copilot */}
          <AiTicketCopilot
            ticket={ticket}
            onTicketUpdated={handleTicketUpdated}
          />

          {/* Ticket Metadata Details Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Ticket Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Requester
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm block">
                  {ticket.createdBy?.name || 'Unknown'}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {ticket.createdBy?.email || 'N/A'}
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Assignee
                </span>
                {ticket.assignedTo ? (
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm block">
                      {ticket.assignedTo.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {ticket.assignedTo.email}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                    Priority
                  </span>
                  <TicketPriorityBadge priority={ticket.priority} size="sm" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                    Status
                  </span>
                  <TicketStatusBadge status={ticket.status} size="sm" />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                    Category
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {categoryLabel}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                    Department
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {ticket.department?.name || 'General IT'}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Timeline
                </span>
                <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <div>Created: {formatDate(ticket.createdAt)}</div>
                  {ticket.updatedAt && <div>Updated: {formatDate(ticket.updatedAt)}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Knowledge Recommendations */}
          <RecommendedArticles ticketId={ticket._id} />
        </div>
      </div>
    </PageContainer>
  )
}

export default TicketDetailPage
