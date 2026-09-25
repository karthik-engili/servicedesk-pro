import React from 'react'
import { Link } from 'react-router-dom'

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  badgeVariant = 'neutral',
  to,
  className = '',
}) {
  const content = (
    <div
      className={`p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
        to ? 'cursor-pointer hover:shadow-xs hover:scale-[1.01]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value !== undefined ? value : '—'}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              badgeVariant === 'danger'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : badgeVariant === 'warning'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                : badgeVariant === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block no-underline">
        {content}
      </Link>
    )
  }

  return content
}

export default KpiCard
