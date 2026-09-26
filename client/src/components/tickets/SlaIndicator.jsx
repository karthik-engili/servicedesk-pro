import React from 'react'
import Badge from '../ui/Badge'
import { SLA_LABELS, SLA_BADGE_VARIANTS } from '../../constants/tickets'

/**
 * Calculates human-readable time remaining or breach duration relative to now
 */
function getRelativeTime(targetDate) {
  if (!targetDate) return null
  const now = new Date()
  const target = new Date(targetDate)
  const diffMs = target.getTime() - now.getTime()
  const isPast = diffMs < 0
  const absDiff = Math.abs(diffMs)

  const hours = Math.floor(absDiff / (1000 * 60 * 60))
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60))

  let timeString = ''
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    timeString = `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    timeString = `${hours}h ${minutes}m`
  } else {
    timeString = `${minutes}m`
  }

  return { isPast, diffMs, text: isPast ? `${timeString} ago` : `${timeString} remaining` }
}

/**
 * Calculate progress percentage (0 - 100) between createdAt and resolutionDeadline
 */
function calculateSlaProgress(createdAt, deadline, isPast, isResolved) {
  if (isResolved) return 100
  if (isPast) return 100
  if (!createdAt || !deadline) return 0

  const start = new Date(createdAt).getTime()
  const end = new Date(deadline).getTime()
  const now = Date.now()

  if (end <= start) return 100
  const total = end - start
  const elapsed = Math.max(0, now - start)
  const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
  return pct
}

export function SlaIndicator({ ticket, compact = false, className = '' }) {
  if (!ticket) return null

  const {
    slaStatus = 'WITHIN_SLA',
    resolutionDeadline,
    responseDeadline,
    respondedAt,
    resolvedAt,
    createdAt,
    status,
  } = ticket

  const isResolvedOrClosed = status === 'RESOLVED' || status === 'CLOSED' || slaStatus === 'MET'

  // Determine active deadline context
  let remainingText = ''
  let isPastDeadline = false

  if (isResolvedOrClosed) {
    remainingText = resolvedAt ? 'Resolved' : 'Target Met'
  } else if (!respondedAt && responseDeadline) {
    const rel = getRelativeTime(responseDeadline)
    if (rel) {
      isPastDeadline = rel.isPast
      remainingText = rel.isPast ? `Response breached` : rel.text
    }
  } else if (resolutionDeadline) {
    const rel = getRelativeTime(resolutionDeadline)
    if (rel) {
      isPastDeadline = rel.isPast
      remainingText = rel.isPast ? `Breached ${rel.text}` : rel.text
    }
  }

  // Visual status icons and colors
  let statusIcon = '●'
  let statusColorClass = 'text-primary-600 dark:text-primary-400'
  let progressBgClass = 'bg-primary-500'

  if (slaStatus === 'MET' || isResolvedOrClosed) {
    statusIcon = '✓'
    statusColorClass = 'text-emerald-600 dark:text-emerald-400'
    progressBgClass = 'bg-emerald-500'
  } else if (slaStatus === 'BREACHED' || isPastDeadline) {
    statusIcon = '!'
    statusColorClass = 'text-rose-600 dark:text-rose-400'
    progressBgClass = 'bg-rose-500'
  } else if (slaStatus === 'APPROACHING') {
    statusIcon = '⚠'
    statusColorClass = 'text-amber-600 dark:text-amber-400'
    progressBgClass = 'bg-amber-500'
  }

  const badgeVariant = SLA_BADGE_VARIANTS[slaStatus] || 'neutral'
  const badgeLabel = SLA_LABELS[slaStatus] || slaStatus

  // Compact Mode (used in table rows and headers)
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
        <span className={`font-bold ${statusColorClass}`}>{statusIcon}</span>
        <span
          className={`font-medium ${
            slaStatus === 'BREACHED'
              ? 'text-rose-700 dark:text-rose-300'
              : slaStatus === 'APPROACHING'
              ? 'text-amber-700 dark:text-amber-300'
              : slaStatus === 'MET'
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {remainingText || badgeLabel}
        </span>
      </div>
    )
  }

  // Detailed Workspace Panel
  const progressPercent = calculateSlaProgress(
    createdAt,
    resolutionDeadline,
    isPastDeadline,
    isResolvedOrClosed
  )

  const formatTargetTime = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          SLA Compliance
        </span>
        <Badge variant={badgeVariant} size="sm" dot={true}>
          {badgeLabel}
        </Badge>
      </div>

      {/* Progress representation */}
      {resolutionDeadline && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Resolution SLA</span>
            <span className={`font-mono font-semibold ${statusColorClass}`}>
              {remainingText}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressBgClass}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* SLA Milestones Breakdown */}
      <div className="space-y-2 text-xs pt-1">
        {responseDeadline && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Response Target:</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className={respondedAt ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                {respondedAt ? '✓ Met' : formatTargetTime(responseDeadline)}
              </span>
            </div>
          </div>
        )}

        {resolutionDeadline && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Resolution Target:</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className={resolvedAt ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                {resolvedAt ? '✓ Resolved' : formatTargetTime(resolutionDeadline)}
              </span>
            </div>
          </div>
        )}

        {isPastDeadline && !isResolvedOrClosed && (
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1.5 mt-1">
            <span>🚨</span>
            <span>Target exceeded. High priority remediation required.</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SlaIndicator
