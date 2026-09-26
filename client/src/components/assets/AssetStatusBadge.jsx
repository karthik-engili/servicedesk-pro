import React from 'react'
import { STATUS_LABELS, STATUS_BADGE_VARIANTS } from '../../constants/assets'

export function AssetStatusBadge({ status, size = 'sm', className = '' }) {
  const variant = STATUS_BADGE_VARIANTS[status] || 'neutral'
  const label = STATUS_LABELS[status] || status || 'Unknown'

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }[size] || 'px-2 py-0.5 text-xs'

  const variantClasses = {
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    info: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  }[variant] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'

  const dotClasses = {
    success: 'bg-emerald-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
    neutral: 'bg-slate-400 dark:bg-slate-500',
  }[variant] || 'bg-slate-400'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs ${sizeClasses} ${variantClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses}`} />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  )
}

export default AssetStatusBadge
