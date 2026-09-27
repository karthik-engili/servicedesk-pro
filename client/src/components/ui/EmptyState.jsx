import React from 'react'
import Button from './Button'

export function EmptyState({
  title = 'No items found',
  description = 'There are no records to display matching your criteria.',
  icon,
  action,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl ${className}`}
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-3.5">
        {icon || (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{description}</p>
      {action ? (
        <div className="mt-4">{action}</div>
      ) : actionLabel && onAction ? (
        <div className="mt-4">
          <Button variant="neutral" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default EmptyState
