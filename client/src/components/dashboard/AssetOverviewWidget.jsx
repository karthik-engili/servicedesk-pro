import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import { CATEGORY_LABELS } from '../../constants/assets'

export function AssetOverviewWidget({
  summary = {},
  expiringWarranties = [],
  className = '',
}) {
  const {
    totalAssets = 0,
    available = 0,
    assigned = 0,
    underRepair = 0,
    lost = 0,
    warrantyExpiringSoon = 0,
    assetsByCategory = [],
  } = summary

  const statusItems = [
    {
      label: 'Available',
      count: available,
      color: 'bg-emerald-500',
      to: '/assets?status=AVAILABLE',
    },
    {
      label: 'Assigned',
      count: assigned,
      color: 'bg-blue-500',
      to: '/assets?status=ASSIGNED',
    },
    {
      label: 'Under Repair',
      count: underRepair,
      color: 'bg-amber-500',
      to: '/assets?status=UNDER_REPAIR',
    },
    {
      label: 'Lost',
      count: lost,
      color: 'bg-rose-500',
      to: '/assets?status=LOST',
    },
  ]

  return (
    <Card variant="bordered" className={`flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Asset & CMDB Health
          </h2>
        </div>
        <Link
          to="/assets"
          className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1 select-none"
        >
          <span>All assets ({totalAssets})</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Status Distribution Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {statusItems.map((item) => {
            const pct = totalAssets > 0 ? Math.round((item.count / totalAssets) * 100) : 0
            return (
              <Link
                key={item.label}
                to={item.to}
                className="p-2.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-colors no-underline block group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {pct}%
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Warranty Alert Banner */}
        {warrantyExpiringSoon > 0 && (
          <Link
            to="/assets"
            className="p-2.5 rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 transition-colors no-underline"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <p className="text-xs truncate">
                <span className="font-semibold font-mono">{warrantyExpiringSoon}</span> hardware asset{warrantyExpiringSoon > 1 ? 's' : ''} have warranties expiring in &le;30 days
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline shrink-0 select-none">
              Review
            </span>
          </Link>
        )}

        {/* Categories Bar Distribution */}
        {assetsByCategory.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Categories
            </span>
            <div className="space-y-2">
              {assetsByCategory.slice(0, 4).map((cat) => {
                const label = CATEGORY_LABELS[cat.category] || cat.category
                const percentage = totalAssets > 0 ? Math.round((cat.count / totalAssets) * 100) : 0
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>{label}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                        {cat.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default AssetOverviewWidget
