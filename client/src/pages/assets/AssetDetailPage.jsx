import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import AssetStatusBadge from '../../components/assets/AssetStatusBadge'
import WarrantyBadge from '../../components/assets/WarrantyBadge'
import AssetActionBar from '../../components/assets/AssetActionBar'
import AssetHistoryTimeline from '../../components/assets/AssetHistoryTimeline'
import RelatedTickets from '../../components/assets/RelatedTickets'
import AssetFormModal from '../../components/assets/AssetFormModal'
import { Button, Spinner, ErrorState } from '../../components/ui'
import assetService from '../../services/assetService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'
import { CATEGORY_LABELS } from '../../constants/assets'

export function AssetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess } = useToast()

  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('history') // 'history' | 'tickets'
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isManager = ['system_admin', 'it_manager', 'asset_manager'].includes(user?.role)

  const fetchAsset = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await assetService.getAsset(id)
      if (!data) throw new Error('Asset not found.')
      setAsset(data)
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to retrieve asset details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAsset()
  }, [fetchAsset])

  const handleCopyTag = () => {
    if (!asset?.assetTag) return
    navigator.clipboard.writeText(asset.assetTag)
    setCopied(true)
    showSuccess('Asset tag copied to clipboard.')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0.00'
    return `$${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  if (loading) {
    return (
      <PageContainer title="Loading Asset...">
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Fetching asset records...
          </p>
        </div>
      </PageContainer>
    )
  }

  if (error || !asset) {
    return (
      <PageContainer title="Asset Inaccessible">
        <div className="max-w-2xl mx-auto py-12">
          <ErrorState
            title="Asset Record Inaccessible"
            message={error || 'This asset record does not exist or you do not have permission to view it.'}
            onRetry={fetchAsset}
          />
          <div className="mt-6 text-center">
            <Link to="/assets">
              <Button variant="outline" size="sm">
                &larr; Back to Asset Inventory
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    )
  }

  const categoryLabel = CATEGORY_LABELS[asset.category] || asset.category || 'Hardware'

  return (
    <PageContainer>
      {/* Top Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/assets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Asset Inventory
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopyTag}
                title="Click to copy asset tag"
                className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{asset.assetTag}</span>
                <span className="text-[10px] text-blue-500">{copied ? '✓' : '📋'}</span>
              </button>

              <AssetStatusBadge status={asset.status} size="md" />

              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                Category: <strong className="text-slate-700">{categoryLabel}</strong>
              </span>

              <WarrantyBadge warrantyExpiry={asset.warrantyExpiry} size="sm" showDate={true} />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {asset.name}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              {asset.manufacturer && (
                <span>
                  OEM: <strong className="text-slate-700">{asset.manufacturer}</strong>
                </span>
              )}
              {asset.model && (
                <>
                  <span>•</span>
                  <span>
                    Model: <strong className="text-slate-700">{asset.model}</strong>
                  </span>
                </>
              )}
              {asset.serialNumber && (
                <>
                  <span>•</span>
                  <span className="font-mono">
                    S/N: <strong className="text-slate-700">{asset.serialNumber}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {isManager && (
            <div className="self-start lg:self-center shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <span>✏️</span> Edit Metadata
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Specifications, Procurement, Vendor & Activity Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specifications Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Hardware Specifications & Details
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Asset Tag</span>
                <span className="font-mono font-bold text-slate-800">{asset.assetTag}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Category</span>
                <span className="font-semibold text-slate-800">{categoryLabel}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Sub-Type</span>
                <span className="font-medium text-slate-800">{asset.assetType || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Manufacturer</span>
                <span className="font-medium text-slate-800">{asset.manufacturer || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Model</span>
                <span className="font-medium text-slate-800">{asset.model || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Serial Number</span>
                <span className="font-mono text-slate-800">{asset.serialNumber || 'N/A'}</span>
              </div>
            </div>

            {asset.description && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 block mb-1">Configuration / Specifications</span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {asset.description}
                </p>
              </div>
            )}
          </div>

          {/* Procurement & Financials Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Procurement & Warranty Coverage
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Purchase Date</span>
                <span className="font-medium text-slate-800">{formatDate(asset.purchaseDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Purchase Cost</span>
                <span className="font-semibold text-slate-800">{formatCurrency(asset.purchaseCost)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Warranty Expiry</span>
                <span className="font-medium text-slate-800">{formatDate(asset.warrantyExpiry)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Location / Depot</span>
                <span className="font-medium text-slate-800">{asset.location || 'HQ'}</span>
              </div>
            </div>
          </div>

          {/* Supplier / Vendor Card */}
          {asset.vendor && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>🏢</span> Supplier & Support Contract
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Vendor Name</span>
                  <span className="font-semibold text-slate-800">{asset.vendor.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Contact Person</span>
                  <span className="font-medium text-slate-800">{asset.vendor.contactPerson || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Support Phone / Email</span>
                  <span className="font-medium text-slate-800">
                    {asset.vendor.phone || asset.vendor.email || '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Activity Section Tabs (History & Related Tickets) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'history'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                📜 Custody & State History
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'tickets'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🎫 Linked Tickets
              </button>
            </div>

            {activeTab === 'history' && <AssetHistoryTimeline assetId={asset._id} />}
            {activeTab === 'tickets' && <RelatedTickets assetId={asset._id} />}
          </div>
        </div>

        {/* Right Column: Lifecycle Actions, Custody, Notes */}
        <div className="space-y-6">
          {/* Lifecycle Action Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Lifecycle Operations
            </h3>
            <AssetActionBar asset={asset} onAssetUpdated={fetchAsset} />
          </div>

          {/* Custody & Assignment Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Custody & Assignment
            </h3>

            {asset.assignedTo ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Assigned Employee</span>
                  <div className="font-semibold text-slate-900 text-sm">{asset.assignedTo.name}</div>
                  <div className="text-slate-500">{asset.assignedTo.email}</div>
                </div>

                {asset.assignedDate && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Assignment Date</span>
                    <span className="font-medium text-slate-700">{formatDate(asset.assignedDate)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Asset is currently unassigned and in available stock.
              </div>
            )}

            {asset.department && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 block mb-0.5">Department Scoping</span>
                <span className="font-semibold text-slate-800">{asset.department.name}</span>
              </div>
            )}
          </div>

          {/* Notes Card */}
          {asset.notes && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2 text-xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Inventory Notes
              </h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {asset.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Metadata Modal */}
      <AssetFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        asset={asset}
        onSaved={fetchAsset}
      />
    </PageContainer>
  )
}

export default AssetDetailPage
