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

  return { isPast, text: isPast ? `${timeString} ago` : `in ${timeString}` }
}

export function SlaIndicator({ ticket, compact = false, className = '' }) {
  if (!ticket) return null

  const {
    slaStatus = 'WITHIN_SLA',
    resolutionDeadline,
    responseDeadline,
    respondedAt,
    resolvedAt,
    status,
  } = ticket

  const badgeVariant = SLA_BADGE_VARIANTS[slaStatus] || 'neutral'
  const badgeLabel = SLA_LABELS[slaStatus] || slaStatus

  // Determine active deadline context
  let timingLabel = ''
  if (status === 'RESOLVED' || status === 'CLOSED' || slaStatus === 'MET') {
    timingLabel = resolvedAt ? 'Resolved' : 'Target Met'
  } else if (!respondedAt && responseDeadline) {
    const rel = getRelativeTime(responseDeadline)
    if (rel) {
      timingLabel = rel.isPast ? `Response breached ${rel.text}` : `Response due ${rel.text}`
    }
  } else if (resolutionDeadline) {
    const rel = getRelativeTime(resolutionDeadline)
    if (rel) {
      timingLabel = rel.isPast ? `Breached ${rel.text}` : `Due ${rel.text}`
    }
  }

  if (compact) {
    return (
      <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
        <Badge variant={badgeVariant} size="sm">
          {badgeLabel}
        </Badge>
        {timingLabel && (
          <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
            {timingLabel}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`p-3.5 rounded-xl border bg-white shadow-2xs ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          SLA Compliance
        </span>
        <Badge variant={badgeVariant} size="sm" dot={true}>
          {badgeLabel}
        </Badge>
      </div>

      <div className="space-y-2 text-xs">
        {responseDeadline && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">First Response:</span>
            <span
              className={`font-mono font-medium ${
                respondedAt ? 'text-emerald-700' : 'text-slate-800'
              }`}
            >
              {respondedAt ? 'Responded' : new Date(responseDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {resolutionDeadline && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Resolution Due:</span>
            <span className="font-mono font-medium text-slate-800">
              {new Date(resolutionDeadline).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {timingLabel && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Status Detail:</span>
            <span
              className={`font-semibold font-mono ${
                slaStatus === 'BREACHED'
                  ? 'text-rose-600'
                  : slaStatus === 'APPROACHING'
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }`}
            >
              {timingLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SlaIndicator
