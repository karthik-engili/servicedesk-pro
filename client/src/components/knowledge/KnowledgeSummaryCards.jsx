import React from 'react'
import { isStaff } from '../../constants/roles'

export function KnowledgeSummaryCards({ summary = {}, user, onFilterStatus, activeStatus = '' }) {
  const staff = isStaff(user)

  const cards = [
    {
      id: '',
      title: 'Total Articles',
      value: summary.totalArticles ?? 0,
      icon: (
        <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      active: activeStatus === '',
      onClick: onFilterStatus ? () => onFilterStatus('') : undefined,
    },
    {
      id: 'PUBLISHED',
      title: 'Published',
      value: summary.published ?? 0,
      icon: (
        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      active: activeStatus === 'PUBLISHED',
      onClick: onFilterStatus ? () => onFilterStatus('PUBLISHED') : undefined,
    },
  ]

  if (staff) {
    cards.push(
      {
        id: 'DRAFT',
        title: 'Drafts',
        value: summary.drafts ?? 0,
        icon: (
          <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        active: activeStatus === 'DRAFT',
        onClick: onFilterStatus ? () => onFilterStatus('DRAFT') : undefined,
      },
      {
        id: 'ARCHIVED',
        title: 'Archived',
        value: summary.archived ?? 0,
        icon: (
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        active: activeStatus === 'ARCHIVED',
        onClick: onFilterStatus ? () => onFilterStatus('ARCHIVED') : undefined,
      }
    )
  }

  return (
    <div className={`grid grid-cols-2 ${staff ? 'sm:grid-cols-4' : 'sm:grid-cols-2'} gap-3`}>
      {cards.map((card) => (
        <div
          key={card.id || 'all'}
          onClick={card.onClick}
          className={`p-3.5 rounded-xl border transition-all select-none ${
            card.onClick ? 'cursor-pointer hover:shadow-xs' : ''
          } ${
            card.active && card.onClick
              ? 'bg-slate-50 dark:bg-slate-800/80 border-primary-500 ring-1 ring-primary-500 shadow-2xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {card.title}
            </span>
            <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800">
              {card.icon}
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
              {card.value}
            </span>
            {card.active && (
              <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400">
                Filtered
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KnowledgeSummaryCards
