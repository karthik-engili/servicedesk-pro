import React from 'react'
import { VENDOR_STATUS_LABELS, VENDOR_STATUS_BADGE_VARIANTS } from '../../constants/assets'
import { Button, Spinner, EmptyState } from '../ui'
import { useAuth } from '../../contexts/AuthContext'

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
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-8 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading vendors directory...
          </p>
        </div>
      </div>
    )
  }

  if (!vendors || vendors.length === 0) {
    return (
      <EmptyState
        title="No Vendors Found"
        description="No suppliers or maintenance vendors are currently registered in the CMDB."
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Vendor Name</th>
              <th className="py-3 px-4">Contact Person</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Website</th>
              <th className="py-3 px-4">Status</th>
              {isManager && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {vendors.map((v) => {
              const label = VENDOR_STATUS_LABELS[v.status] || v.status
              const isStatusActive = v.status === 'ACTIVE'

              return (
                <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {v.name}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {v.contactPerson || '-'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {v.email ? (
                      <a href={`mailto:${v.email}`} className="text-blue-600 hover:underline">
                        {v.email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {v.phone || '-'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {v.website ? (
                      <a
                        href={v.website.startsWith('http') ? v.website : `https://${v.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-[140px] block"
                      >
                        {v.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        isStatusActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
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
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete?.(v)}
                            className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50"
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
