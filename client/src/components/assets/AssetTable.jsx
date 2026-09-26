import React from 'react'
import { useNavigate } from 'react-router-dom'
import AssetStatusBadge from './AssetStatusBadge'
import WarrantyBadge from './WarrantyBadge'
import { CATEGORY_LABELS } from '../../constants/assets'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'

function AssetTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Asset Tag</th>
              <th className="py-3 px-4">Device & Model</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Warranty</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Vendor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-3.5 px-4">
                  <Skeleton width="75px" height="18px" className="rounded" />
                </td>
                <td className="py-3.5 px-4 space-y-1.5">
                  <Skeleton width="180px" height="16px" className="rounded" />
                  <Skeleton width="120px" height="12px" className="rounded" />
                </td>
                <td className="py-3.5 px-4">
                  <Skeleton width="70px" height="16px" className="rounded" />
                </td>
                <td className="py-3.5 px-4">
                  <Skeleton width="80px" height="22px" className="rounded-md" />
                </td>
                <td className="py-3.5 px-4">
                  <Skeleton width="90px" height="20px" className="rounded-md" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <Skeleton width="22px" height="22px" className="rounded-full shrink-0" />
                    <Skeleton width="90px" height="14px" className="rounded" />
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <Skeleton width="85px" height="14px" className="rounded" />
                </td>
                <td className="py-3.5 px-4">
                  <Skeleton width="75px" height="14px" className="rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Skeleton */}
      <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800 p-3 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 space-y-2.5 animate-pulse">
            <div className="flex justify-between items-center">
              <Skeleton width="80px" height="16px" className="rounded" />
              <Skeleton width="70px" height="20px" className="rounded-md" />
            </div>
            <Skeleton width="160px" height="18px" className="rounded" />
            <Skeleton width="100px" height="12px" className="rounded" />
            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <Skeleton width="90px" height="14px" className="rounded" />
              <Skeleton width="80px" height="14px" className="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AssetTable({ assets = [], isLoading = false, onRowClick }) {
  const navigate = useNavigate()

  if (isLoading) {
    return <AssetTableSkeleton />
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs p-8">
        <EmptyState
          title="No Assets Found"
          description="No hardware or software assets match your search or filter parameters. Try adjusting your query or resetting filters."
        />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Asset ID</th>
              <th className="py-3 px-4">Device & Specifications</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Warranty</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Vendor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {assets.map((a) => {
              const categoryLabel = CATEGORY_LABELS[a.category] || a.category || 'Hardware'

              return (
                <tr
                  key={a._id}
                  onClick={() => (onRowClick ? onRowClick(a._id) : navigate(`/assets/${a._id}`))}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 whitespace-nowrap">
                    {a.assetTag}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {a.name}
                    </div>
                    {(a.manufacturer || a.model) && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {[a.manufacturer, a.model].filter(Boolean).join(' • ')}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                    {categoryLabel}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <AssetStatusBadge status={a.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <WarrantyBadge warrantyExpiry={a.warrantyExpiry} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {a.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                          {a.assignedTo.name?.slice(0, 1) || 'U'}
                        </span>
                        <div className="truncate max-w-[130px]">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {a.assignedTo.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {a.department?.name || '—'}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                    {a.vendor?.name || '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Cards View */}
      <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {assets.map((a) => (
          <div
            key={a._id}
            onClick={() => (onRowClick ? onRowClick(a._id) : navigate(`/assets/${a._id}`))}
            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer space-y-2.5 active:bg-slate-100 dark:active:bg-slate-800/60"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                {a.assetTag}
              </span>
              <AssetStatusBadge status={a.status} size="xs" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                {a.name}
              </h4>
              {(a.manufacturer || a.model) && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {[a.manufacturer, a.model].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span>Assigned to:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {a.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <WarrantyBadge warrantyExpiry={a.warrantyExpiry} size="xs" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AssetTable
