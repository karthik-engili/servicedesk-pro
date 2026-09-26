import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

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
    <Card
      variant="kpi"
      className={`group relative flex flex-col justify-between ${
        to ? 'cursor-pointer hover:border-primary-300 dark:hover:border-primary-700' : ''
      } ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </span>
          {icon && (
            <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-400">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {value !== undefined ? value : '—'}
          </span>
          {badge && (
            <Badge variant={badgeVariant} size="xs" className="font-medium">
              {badge}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="truncate">{subtitle || 'View details'}</span>
        {to && (
          <svg
            className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </Card>
  )

  if (to) {
    return (
      <Link to={to} className="block no-underline select-none">
        {content}
      </Link>
    )
  }

  return content
}

export default KpiCard
