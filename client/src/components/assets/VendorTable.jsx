import React from 'react'
import { VENDOR_STATUS_LABELS } from '../../constants/assets'
import { Button, EmptyState } from '../ui'
import { useAuth } from '../../contexts/AuthContext'
import Skeleton from '../ui/Skeleton'

function VendorTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 animate-pulse">
            <div className="space-y-1">
              <Skeleton width="160px" height="18px" className="rounded" />
              <Skeleton width="100px" height="12px" className="rounded" />
            </div>
            <Skeleton width="80px" height="14px" className="rounded" />
            <Skeleton width="70px" height="20px" className="rounded-md" />
            <Skeleton width="60px" height="24px" className="rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function VendorTable({
  vendors = [],
  isLoading = false,
  onEdit,
  onDelete,
}) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'system_admin'
  const isManager = ['system_admin', 'it_manager', 'asset_manager'].includes(user?.role)

  if (isLoading) {
    return <VendorTableSkeleton />
  }

  if (!vendors || vendors.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs p-8">
        <EmptyState
          title="No Vendors Found"
          description="No suppliers or maintenance vendors are currently registered in the CMDB."
        />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Vendor Name</th>
              <th className="py-3 px-4">Contact Person</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Website</th>
              <th className="py-3 px-4">Status</th>
              {isManager && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {vendors.map((v) => {
              const label = VENDOR_STATUS_LABELS[v.status] || v.status
              const isStatusActive = v.status === 'ACTIVE'

              return (
                <tr key={v._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {v.name}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {v.contactPerson || '—'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {v.email ? (
                      <a href={`mailto:${v.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {v.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {v.phone || '—'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {v.website ? (
                      <a
                        href={v.website.startsWith('http') ? v.website : `https://${v.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[140px] block"
                      >
                        {v.website}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        isStatusActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {label}
                    </span>
                  </td>

                  {isManager && (
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit?.(v)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Edit
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete?.(v)}
                            className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VendorTable
