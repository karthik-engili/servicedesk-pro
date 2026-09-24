import React from 'react'
import { isStaff } from '../../constants/roles'

export function KnowledgeSummaryCards({ summary = {}, user, onFilterStatus }) {
  const staff = isStaff(user)

  const cards = [
    {
      title: 'Total Articles',
      value: summary.totalArticles ?? 0,
      icon: (
        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      bgClass: 'bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800/60',
      textColor: 'text-primary-900 dark:text-primary-100',
      onClick: onFilterStatus ? () => onFilterStatus('') : undefined,
    },
    {
      title: 'Published & Active',
      value: summary.published ?? 0,
      icon: (
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      textColor: 'text-emerald-900 dark:text-emerald-100',
      onClick: onFilterStatus ? () => onFilterStatus('PUBLISHED') : undefined,
    },
  ]

  if (staff) {
    cards.push(
      {
        title: 'Draft Articles',
        value: summary.drafts ?? 0,
        icon: (
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        ),
        bgClass: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
        textColor: 'text-slate-900 dark:text-slate-100',
        onClick: onFilterStatus ? () => onFilterStatus('DRAFT') : undefined,
      },
      {
        title: 'Archived Guides',
        value: summary.archived ?? 0,
        icon: (
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        ),
        bgClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
        textColor: 'text-amber-900 dark:text-amber-100',
        onClick: onFilterStatus ? () => onFilterStatus('ARCHIVED') : undefined,
      }
    )
  }

  // Calculate total views or highlight top category
  const topCategory = summary.articlesByCategory?.length
    ? [...summary.articlesByCategory].sort((a, b) => b.count - a.count)[0]?.category
    : null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          onClick={card.onClick}
          className={`p-3.5 rounded-xl border transition-all ${card.bgClass} ${
            card.onClick ? 'cursor-pointer hover:shadow-sm hover:scale-[1.01]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {card.title}
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-xs">
              {card.icon}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${card.textColor}`}>
              {card.value}
            </span>
            {idx === 0 && topCategory && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Top: {topCategory}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KnowledgeSummaryCards
