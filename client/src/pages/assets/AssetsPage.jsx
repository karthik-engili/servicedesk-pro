import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import AssetSummaryCards from '../../components/assets/AssetSummaryCards'
import AssetFilters from '../../components/assets/AssetFilters'
import AssetTable from '../../components/assets/AssetTable'
import AssetFormModal from '../../components/assets/AssetFormModal'
import VendorTable from '../../components/assets/VendorTable'
import VendorFormModal from '../../components/assets/VendorFormModal'
import WarrantyBadge from '../../components/assets/WarrantyBadge'
import AssetStatusBadge from '../../components/assets/AssetStatusBadge'
import { Button, Spinner, ErrorState } from '../../components/ui'
import assetService from '../../services/assetService'
import vendorService from '../../services/vendorService'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'

export function AssetsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  const isManager = ['system_admin', 'it_manager', 'asset_manager'].includes(user?.role)

  // Active view tab: 'inventory' | 'warranty' | 'vendors'
  const activeTab = searchParams.get('tab') || 'inventory'

  // Inventory state
  const [assets, setAssets] = useState([])
  const [summary, setSummary] = useState({})
  const [departments, setDepartments] = useState([])
  const [vendorsList, setVendorsList] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createAssetOpen, setCreateAssetOpen] = useState(false)

  // Warranty tab state
  const [expiringAssets, setExpiringAssets] = useState([])
  const [loadingWarranty, setLoadingWarranty] = useState(false)

  // Vendors tab state
  const [vendors, setVendors] = useState([])
  const [vendorPagination, setVendorPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loadingVendors, setLoadingVendors] = useState(false)
  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorModalOpen, setVendorModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)

  // Parse inventory filters from URL
  const currentFilters = useMemo(() => {
    return {
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      category: searchParams.get('category') || '',
      department: searchParams.get('department') || '',
      vendor: searchParams.get('vendor') || '',
      page: parseInt(searchParams.get('page'), 10) || 1,
      limit: parseInt(searchParams.get('limit'), 10) || 20,
    }
  }, [searchParams])

  // Switch tab
  const setTab = (newTab) => {
    const params = new URLSearchParams()
    if (newTab !== 'inventory') params.set('tab', newTab)
    setSearchParams(params)
  }

  // Load lookup options (departments, vendors, summary)
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [deptRes, vRes, sumData] = await Promise.all([
          api.get('/departments'),
          vendorService.getVendors({ limit: 100 }),
          assetService.getAssetSummary().catch(() => ({})),
        ])

        const depts = deptRes.data?.data?.departments || []
        setDepartments(depts.filter((d) => d.status === 'active'))

        const vList = vRes.vendors || []
        setVendorsList(vList)

        setSummary(sumData)
      } catch (err) {
        console.error('Failed to load asset lookup data', err)
      }
    }

    fetchLookups()
  }, [])

  // Fetch Inventory Assets
  const fetchAssets = useCallback(async () => {
    if (activeTab !== 'inventory') return
    try {
      setLoading(true)
      setError(null)

      const query = {
        page: currentFilters.page,
        limit: currentFilters.limit,
      }
      if (currentFilters.search) query.search = currentFilters.search
      if (currentFilters.status) query.status = currentFilters.status
      if (currentFilters.category) query.category = currentFilters.category
      if (currentFilters.department) query.department = currentFilters.department
      if (currentFilters.vendor) query.vendor = currentFilters.vendor

      const res = await assetService.getAssets(query)
      const list = res.assets || []
      const pag = res.pagination || {
        page: currentFilters.page,
        limit: currentFilters.limit,
        total: list.length,
        pages: 1,
      }

      setAssets(list)
      setPagination(pag)
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to retrieve asset records.')
    } finally {
      setLoading(false)
    }
  }, [currentFilters, activeTab])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  // Fetch Expiring Warranties
  const fetchExpiringWarranties = useCallback(async () => {
    if (activeTab !== 'warranty') return
    try {
      setLoadingWarranty(true)
      const data = await assetService.getExpiringWarranties(30)
      setExpiringAssets(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load expiring warranties', err)
    } finally {
      setLoadingWarranty(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchExpiringWarranties()
  }, [fetchExpiringWarranties])

  // Fetch Vendors
  const fetchVendors = useCallback(async () => {
    if (activeTab !== 'vendors') return
    try {
      setLoadingVendors(true)
      const res = await vendorService.getVendors({
        search: vendorSearch || undefined,
        limit: 20,
      })
      setVendors(res.vendors || [])
      setVendorPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
    } catch (err) {
      console.error('Failed to load vendors', err)
    } finally {
      setLoadingVendors(false)
    }
  }, [activeTab, vendorSearch])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  // Filter updates
  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams()
    if (activeTab !== 'inventory') params.set('tab', activeTab)
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.status) params.set('status', newFilters.status)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.department) params.set('department', newFilters.department)
    if (newFilters.vendor) params.set('vendor', newFilters.vendor)

    const pageVal = newFilters.page || 1
    if (pageVal > 1) params.set('page', String(pageVal))

    setSearchParams(params)
  }

  const handleResetFilters = () => {
    const params = new URLSearchParams()
    if (activeTab !== 'inventory') params.set('tab', activeTab)
    setSearchParams(params)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages || newPage === pagination.page) return
    const params = new URLSearchParams(searchParams)
    if (newPage > 1) {
      params.set('page', String(newPage))
    } else {
      params.delete('page')
    }
    setSearchParams(params)
  }

  // Quick summary card click
  const handleSummaryStatusClick = (statusValue) => {
    handleFilterChange({
      ...currentFilters,
      status: statusValue,
      page: 1,
    })
  }

  // Callback on asset created
  const handleAssetCreated = (newAsset) => {
    fetchAssets()
    assetService.getAssetSummary().then(setSummary).catch(() => {})
    if (newAsset?._id) {
      navigate(`/assets/${newAsset._id}`)
    }
  }

  // Vendor actions
  const handleOpenCreateVendor = () => {
    setEditingVendor(null)
    setVendorModalOpen(true)
  }

  const handleEditVendor = (v) => {
    setEditingVendor(v)
    setVendorModalOpen(true)
  }

  const handleDeleteVendor = async (v) => {
    if (!window.confirm(`Are you sure you want to delete vendor '${v.name}'?`)) return
    try {
      await vendorService.deleteVendor(v._id)
      showSuccess(`Vendor '${v.name}' deleted successfully.`)
      fetchVendors()
    } catch (err) {
      const parsed = handleApiError(err)
      if (err.response?.status === 400 || (parsed.message && parsed.message.toLowerCase().includes('associated'))) {
        showError('Vendor cannot be deleted: This vendor is still associated with active assets.')
      } else {
        showError(parsed.message || 'Failed to delete vendor.')
      }
    }
  }

  return (
    <PageContainer
      title="IT Assets & CMDB"
      description="Manage enterprise hardware inventory, assignments, maintenance, and lifecycle operations"
      actions={
        <div className="flex items-center gap-2">
          {activeTab === 'vendors' && isManager && (
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreateVendor}
              className="flex items-center gap-2 shadow-xs"
            >
              <span>🏢</span>
              <span>Register Vendor</span>
            </Button>
          )}

          {activeTab === 'inventory' && isManager && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCreateAssetOpen(true)}
              className="flex items-center gap-2 shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Asset</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>💻</span>
            <span>Asset Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('warranty')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'warranty'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>🛡️</span>
            <span>Expiring Warranties</span>
            {summary.warrantyExpiringSoon > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {summary.warrantyExpiringSoon}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab('vendors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'vendors'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>🏢</span>
            <span>Vendors & Suppliers</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* KPI Summary Strip */}
            <AssetSummaryCards
              summary={summary}
              activeStatus={currentFilters.status}
              onStatusClick={handleSummaryStatusClick}
              onWarrantyClick={() => setTab('warranty')}
            />

            {/* Filter Toolbar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <AssetFilters
                filters={currentFilters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                departments={departments}
                vendors={vendorsList}
              />
            </div>

            {/* Results Counter Header */}
            <div className="flex items-center justify-between px-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {loading ? (
                  <span>Updating assets...</span>
                ) : (
                  <span>
                    Total Assets: <strong className="text-slate-800 dark:text-slate-200 font-mono">{pagination.total || 0}</strong>
                    {currentFilters.status && (
                      <span className="text-blue-600 dark:text-blue-400 font-normal ml-1">
                        (filtered by: {currentFilters.status})
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Inventory Table */}
            {error ? (
              <ErrorState title="Error Loading Assets" message={error} onRetry={fetchAssets} />
            ) : (
              <div className="space-y-4">
                <AssetTable
                  assets={assets}
                  isLoading={loading}
                  onRowClick={(id) => navigate(`/assets/${id}`)}
                />

                {/* Pagination Controls */}
                {!loading && assets.length > 0 && pagination.pages > 1 && (
                  <div className="bg-white dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Showing page <strong className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{pagination.page}</strong> of{' '}
                      <strong className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{pagination.pages}</strong> ({pagination.total} assets)
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                      >
                        Previous
                      </Button>

                      <span className="px-3 py-1 text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                        {pagination.page}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPIRING WARRANTIES */}
        {activeTab === 'warranty' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Warranties Expiring Within 30 Days
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Critical hardware nearing support contract expiration requiring warranty extension or retirement
                </p>
              </div>
              <button
                type="button"
                onClick={fetchExpiringWarranties}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                Refresh
              </button>
            </div>

            {loadingWarranty ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : expiringAssets.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <div className="text-2xl">🛡️</div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">All Warranties Current</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No registered active hardware has warranty expiration dates within the next 30 days.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Asset ID</th>
                      <th className="py-3 px-4">Name / Model</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Warranty Deadline</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {expiringAssets.map((a) => (
                      <tr key={a._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {a.assetTag}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{a.name}</td>
                        <td className="py-3.5 px-4">
                          <AssetStatusBadge status={a.status} size="xs" />
                        </td>
                        <td className="py-3.5 px-4">
                          <WarrantyBadge warrantyExpiry={a.warrantyExpiry} showDate={true} size="xs" />
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{a.assignedTo?.name || 'Unassigned'}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{a.vendor?.name || '—'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/assets/${a._id}`)}
                            className="text-xs"
                          >
                            View &rarr;
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VENDORS */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <input
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Search vendors by name or contact..."
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total Vendors: <strong className="text-slate-800 dark:text-slate-200 font-mono">{vendorPagination.total}</strong>
              </div>
            </div>

            <VendorTable
              vendors={vendors}
              isLoading={loadingVendors}
              onEdit={handleEditVendor}
              onDelete={handleDeleteVendor}
            />
          </div>
        )}
      </div>

      {/* Asset Form Modal / Drawer (Create) */}
      <AssetFormModal
        isOpen={createAssetOpen}
        onClose={() => setCreateAssetOpen(false)}
        onSaved={handleAssetCreated}
      />

      {/* Vendor Form Modal (Create & Edit) */}
      <VendorFormModal
        isOpen={vendorModalOpen}
        onClose={() => {
          setVendorModalOpen(false)
          setEditingVendor(null)
        }}
        vendor={editingVendor}
        onSaved={() => {
          fetchVendors()
          vendorService.getVendors({ limit: 100 }).then((r) => setVendorsList(r.vendors || []))
        }}
      />
    </PageContainer>
  )
}

export default AssetsPage
