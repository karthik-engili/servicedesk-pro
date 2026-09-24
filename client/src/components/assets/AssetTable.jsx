import React from 'react'
import { useNavigate } from 'react-router-dom'
import AssetStatusBadge from './AssetStatusBadge'
import WarrantyBadge from './WarrantyBadge'
import { CATEGORY_LABELS } from '../../constants/assets'
import EmptyState from '../ui/EmptyState'

export function AssetTable({ assets = [], isLoading = false, onRowClick }) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-8 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading asset inventory...
          </p>
        </div>
      </div>
    )
  }

  if (!assets || assets.length === 0) {
    return (
      <EmptyState
        title="No Assets Found"
        description="No hardware or software assets match your search or filter parameters."
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Asset Tag</th>
              <th className="py-3 px-4">Asset Name & Model</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Warranty</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Vendor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {assets.map((a) => {
              const categoryLabel = CATEGORY_LABELS[a.category] || a.category || 'Hardware'

              return (
                <tr
                  key={a._id}
                  onClick={() => onRowClick ? onRowClick(a._id) : navigate(`/assets/${a._id}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 group-hover:text-blue-700 whitespace-nowrap">
                    {a.assetTag}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{a.name}</div>
                    {(a.manufacturer || a.model) && (
                      <div className="text-[11px] text-slate-400 truncate">
                        {[a.manufacturer, a.model].filter(Boolean).join(' • ')}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
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
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {a.assignedTo.name?.slice(0, 1) || 'U'}
                        </span>
                        <div className="truncate max-w-[120px]">
                          <span className="font-medium text-slate-800">{a.assignedTo.name}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {a.department?.name || '-'}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 truncate max-w-[120px]">
                    {a.vendor?.name || '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Cards View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {assets.map((a) => (
          <div
            key={a._id}
            onClick={() => onRowClick ? onRowClick(a._id) : navigate(`/assets/${a._id}`)}
            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-blue-600">
                {a.assetTag}
              </span>
              <div className="flex items-center gap-1.5">
                <AssetStatusBadge status={a.status} size="sm" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">{a.name}</h4>
              {(a.manufacturer || a.model) && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {[a.manufacturer, a.model].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span>Assignee: </span>
                <span className="font-medium text-slate-700">
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
