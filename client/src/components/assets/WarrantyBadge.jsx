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
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-500 border-slate-200',
  }[info.variant] || 'bg-slate-100 text-slate-500 border-slate-200'

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
      className={`inline-flex items-center gap-1 font-medium rounded-md border shadow-2xs ${sizeClasses} ${variantClasses} ${className}`}
    >
      <span>🛡️</span>
      <span>{info.label}</span>
      {showDate && formattedDate && (
        <span className="font-normal opacity-80 ml-1">({formattedDate})</span>
      )}
    </span>
  )
}

export default WarrantyBadge
