import React from 'react'
import { Link } from 'react-router-dom'
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
    retired = 0,
    warrantyExpiringSoon = 0,
    assetsByCategory = [],
  } = summary

  const statusItems = [
    {
      label: 'Available',
      count: available,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      to: '/assets?status=AVAILABLE',
    },
    {
      label: 'Assigned',
      count: assigned,
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      to: '/assets?status=ASSIGNED',
    },
    {
      label: 'Under Repair',
      count: underRepair,
      color: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      to: '/assets?status=UNDER_REPAIR',
    },
    {
      label: 'Lost',
      count: lost,
      color: 'bg-rose-500',
      textColor: 'text-rose-700 dark:text-rose-300',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      to: '/assets?status=LOST',
    },
  ]

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Asset & CMDB Health
            </h3>
          </div>
          <Link
            to="/assets"
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1"
          >
            <span>All assets ({totalAssets})</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Status Distribution Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {statusItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 ${item.bgColor} hover:opacity-90 transition-opacity no-underline block`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                  {item.label}
                </span>
              </div>
              <div className={`text-lg font-bold ${item.textColor}`}>
                {item.count}
              </div>
            </Link>
          ))}
        </div>

        {/* Warranty Attention Banner */}
        {warrantyExpiringSoon > 0 && (
          <Link
            to="/assets"
            className="p-3 mb-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 transition-colors no-underline"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-xs">
                <span className="font-semibold">{warrantyExpiringSoon} asset{warrantyExpiringSoon > 1 ? 's' : ''}</span> with warranty expiring in &le;30 days
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline shrink-0">
              Review
            </span>
          </Link>
        )}

        {/* Categories Bar Distribution */}
        {assetsByCategory.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Categories
            </div>
            <div className="space-y-2">
              {assetsByCategory.slice(0, 4).map((cat) => {
                const label = CATEGORY_LABELS[cat.category] || cat.category
                const percentage = totalAssets > 0 ? Math.round((cat.count / totalAssets) * 100) : 0
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>{label}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {cat.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
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
    </div>
  )
}

export default AssetOverviewWidget
