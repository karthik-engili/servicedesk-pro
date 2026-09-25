import React from 'react'

export function AiConfidenceBadge({ confidence, showLabel = true, size = 'sm', className = '' }) {
  if (confidence === undefined || confidence === null) return null

  // Ensure confidence is between 0 and 1, or percentage between 0 and 100
  const normalized = confidence > 1 ? confidence / 100 : confidence
  const percentage = Math.round(normalized * 100)

  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  let label = 'Confidence'

  if (percentage >= 85) {
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    label = 'High confidence'
  } else if (percentage >= 65) {
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
    label = 'Moderate confidence'
  } else {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    label = 'Low confidence'
  }

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.2',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border ${sizeClasses[size] || sizeClasses.sm} ${badgeColor} ${className}`}
      title={`${percentage}% estimated confidence`}
    >
      <span>{percentage}%</span>
      {showLabel && (
        <span className="font-normal text-[11px] opacity-80">
          • {label}
        </span>
      )}
    </span>
  )
}

export default AiConfidenceBadge
