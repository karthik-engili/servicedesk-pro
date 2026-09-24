import React from 'react'
import { ARTICLE_STATUS_CONFIG } from '../../constants/articles'

export function ArticleStatusBadge({ status, size = 'sm', className = '' }) {
  const config = ARTICLE_STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    colorClasses: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[11px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size] || sizeClasses.sm} ${config.colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 currentColor bg-current opacity-70" />
      {config.label}
    </span>
  )
}

export default ArticleStatusBadge
