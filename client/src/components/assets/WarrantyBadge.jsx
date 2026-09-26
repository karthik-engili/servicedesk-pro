import React from 'react'
import { getWarrantyStatus } from '../../constants/assets'

export function WarrantyBadge({ warrantyExpiry, showDate = false, size = 'sm', className = '' }) {
  const info = getWarrantyStatus(warrantyExpiry)

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }[size] || 'px-2 py-0.5 text-xs'

  const variantClasses = {
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  }[info.variant] || 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'

  const formattedDate = warrantyExpiry
    ? new Date(warrantyExpiry).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <span
      title={formattedDate ? `Warranty Expiry: ${formattedDate}` : 'No warranty record'}
      className={`inline-flex items-center gap-1 font-mono font-medium rounded-md border shadow-2xs ${sizeClasses} ${variantClasses} ${className}`}
    >
      <span className="text-[11px]">🛡️</span>
      <span>{info.label}</span>
      {showDate && formattedDate && (
        <span className="font-normal opacity-80 ml-1">({formattedDate})</span>
      )}
    </span>
  )
}

export default WarrantyBadge
