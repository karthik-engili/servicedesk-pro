import React from 'react'

export function AssetSummaryCards({ summary = {}, activeStatus = '', onStatusClick, onWarrantyClick }) {
  const cards = [
    {
      key: 'TOTAL',
      statusValue: '',
      label: 'Total Assets',
      count: summary.totalAssets ?? 0,
      icon: '💻',
      color: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
      accent: 'text-slate-900 dark:text-slate-100',
    },
    {
      key: 'AVAILABLE',
      statusValue: 'AVAILABLE',
      label: 'Available',
      count: summary.available ?? 0,
      icon: '🟢',
      color: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-emerald-800 dark:text-emerald-300',
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'ASSIGNED',
      statusValue: 'ASSIGNED',
      label: 'Assigned',
      count: summary.assigned ?? 0,
      icon: '👤',
      color: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-blue-800 dark:text-blue-300',
      accent: 'text-primary-600 dark:text-primary-400',
    },
    {
      key: 'UNDER_REPAIR',
      statusValue: 'UNDER_REPAIR',
      label: 'In Repair',
      count: summary.underRepair ?? 0,
      icon: '🔧',
      color: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-800 dark:text-amber-300',
      accent: 'text-amber-600 dark:text-amber-400',
    },
    {
      key: 'LOST',
      statusValue: 'LOST',
      label: 'Lost',
      count: summary.lost ?? 0,
      icon: '⚠️',
      color: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-rose-800 dark:text-rose-300',
      accent: 'text-rose-600 dark:text-rose-400',
    },
    {
      key: 'WARRANTY_RISK',
      isWarrantyRisk: true,
      label: 'Warranty Risk',
      count: summary.warrantyExpiringSoon ?? 0,
      icon: '🛡️',
      color: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-900 dark:text-amber-200',
      accent: 'text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className="space-y-3">
      {/* Metric Tiles Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => {
          const isSelected =
            !card.isWarrantyRisk &&
            ((card.statusValue === activeStatus) || (!card.statusValue && !activeStatus))

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => {
                if (card.isWarrantyRisk) {
                  onWarrantyClick?.()
                } else {
                  onStatusClick?.(card.statusValue)
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${card.color} ${
                isSelected
                  ? 'ring-2 ring-primary-500/80 dark:ring-primary-400/80 border-primary-400 dark:border-primary-600'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                  {card.label}
                </span>
                <span className="text-xs opacity-75">{card.icon}</span>
              </div>
              <div className={`text-xl font-bold font-mono ${card.accent}`}>
                {Number(card.count).toLocaleString()}
              </div>
            </button>
          )
        })}
      </div>

      {/* Warranty Attention Banner (if any) */}
      {summary.warrantyExpiringSoon > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 rounded-xl px-4 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-amber-900 dark:text-amber-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 text-sm">⚠️</span>
            <span>
              <strong>WARRANTY ATTENTION:</strong> {summary.warrantyExpiringSoon} active asset{summary.warrantyExpiringSoon > 1 ? 's have warranties' : ' has a warranty'} expiring within 30 days.
            </span>
          </div>
          {onWarrantyClick && (
            <button
              type="button"
              onClick={onWarrantyClick}
              className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 hover:underline cursor-pointer self-start sm:self-auto"
            >
              View affected assets &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AssetSummaryCards
