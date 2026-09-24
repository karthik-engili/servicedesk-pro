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
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[variant] || 'bg-slate-100 text-slate-700 border-slate-200'

  const dotClasses = {
    success: 'bg-emerald-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
    neutral: 'bg-slate-400',
  }[variant] || 'bg-slate-400'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs ${sizeClasses} ${variantClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses}`} />
      <span>{label}</span>
    </span>
  )
}

export default AssetStatusBadge
