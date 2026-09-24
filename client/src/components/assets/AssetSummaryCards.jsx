import React from 'react'

export function AssetSummaryCards({ summary = {}, activeStatus = '', onStatusClick }) {
  const cards = [
    {
      key: 'TOTAL',
      statusValue: '',
      label: 'Total Assets',
      count: summary.totalAssets ?? 0,
      color: 'border-slate-200 text-slate-900 bg-white',
      accent: 'text-slate-900',
    },
    {
      key: 'AVAILABLE',
      statusValue: 'AVAILABLE',
      label: 'Available',
      count: summary.available ?? 0,
      color: 'border-emerald-200 text-emerald-800 bg-emerald-50/40',
      accent: 'text-emerald-700',
    },
    {
      key: 'ASSIGNED',
      statusValue: 'ASSIGNED',
      label: 'Assigned',
      count: summary.assigned ?? 0,
      color: 'border-blue-200 text-blue-800 bg-blue-50/40',
      accent: 'text-blue-700',
    },
    {
      key: 'UNDER_REPAIR',
      statusValue: 'UNDER_REPAIR',
      label: 'Under Repair',
      count: summary.underRepair ?? 0,
      color: 'border-amber-200 text-amber-800 bg-amber-50/40',
      accent: 'text-amber-700',
    },
    {
      key: 'REPLACED',
      statusValue: 'REPLACED',
      label: 'Replaced',
      count: summary.replaced ?? 0,
      color: 'border-purple-200 text-purple-800 bg-purple-50/40',
      accent: 'text-purple-700',
    },
    {
      key: 'RETIRED',
      statusValue: 'RETIRED',
      label: 'Retired',
      count: summary.retired ?? 0,
      color: 'border-slate-200 text-slate-600 bg-slate-50',
      accent: 'text-slate-600',
    },
    {
      key: 'LOST',
      statusValue: 'LOST',
      label: 'Lost',
      count: summary.lost ?? 0,
      color: 'border-rose-200 text-rose-800 bg-rose-50/40',
      accent: 'text-rose-700',
    },
  ]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((card) => {
          const isSelected =
            card.statusValue === activeStatus ||
            (!card.statusValue && !activeStatus)

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onStatusClick && onStatusClick(card.statusValue)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${card.color} ${
                isSelected
                  ? 'ring-2 ring-blue-500/80 shadow-xs'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                {card.label}
              </div>
              <div className={`text-xl font-bold mt-1 ${card.accent}`}>
                {card.count}
              </div>
            </button>
          )
        })}
      </div>

      {summary.warrantyExpiringSoon > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2 text-xs flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>{summary.warrantyExpiringSoon}</strong> asset(s) have warranties expiring within the next 30 days.
            </span>
          </div>
          <span className="text-[11px] font-medium text-amber-700">Attention Required</span>
        </div>
      )}
    </div>
  )
}

export default AssetSummaryCards
