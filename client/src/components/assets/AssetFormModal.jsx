import React, { useState, useEffect } from 'react'
import { Drawer, Button } from '../ui'
import { ASSET_CATEGORIES, CATEGORY_LABELS } from '../../constants/assets'
import assetService from '../../services/assetService'
import vendorService from '../../services/vendorService'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'

export function AssetFormModal({ isOpen, onClose, asset = null, onSaved }) {
  const isEditing = Boolean(asset?._id)
  const { showSuccess, showError } = useToast()

  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    description: '',
    category: 'LAPTOP',
    assetType: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    purchaseDate: '',
    purchaseCost: '',
    warrantyExpiry: '',
    location: '',
    department: '',
    vendor: '',
    notes: '',
  })

  const [departments, setDepartments] = useState([])
  const [vendors, setVendors] = useState([])
  const [loadingLookups, setLoadingLookups] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Populate data when editing
  useEffect(() => {
    if (asset && isEditing) {
      setFormData({
        assetTag: asset.assetTag || '',
        name: asset.name || '',
        description: asset.description || '',
        category: asset.category || 'LAPTOP',
        assetType: asset.assetType || '',
        serialNumber: asset.serialNumber || '',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
        purchaseCost: asset.purchaseCost !== undefined ? String(asset.purchaseCost) : '',
        warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
        location: asset.location || '',
        department: asset.department?._id || asset.department || '',
        vendor: asset.vendor?._id || asset.vendor || '',
        notes: asset.notes || '',
      })
    } else {
      setFormData({
        assetTag: '',
        name: '',
        description: '',
        category: 'LAPTOP',
        assetType: '',
        serialNumber: '',
        manufacturer: '',
        model: '',
        purchaseDate: '',
        purchaseCost: '',
        warrantyExpiry: '',
        location: '',
        department: '',
        vendor: '',
        notes: '',
      })
    }
    setError('')
    setFieldErrors({})
  }, [asset, isEditing, isOpen])

  // Fetch departments and vendors
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const fetchLookups = async () => {
      setLoadingLookups(true)
      try {
        const [deptRes, vendorRes] = await Promise.all([
          api.get('/departments'),
          vendorService.getVendors({ limit: 100 }),
        ])

        if (isMounted) {
          const depts = deptRes.data?.data?.departments || []
          setDepartments(depts.filter((d) => d.status === 'active'))

          const vList = vendorRes.vendors || []
          setVendors(vList.filter((v) => v.status === 'ACTIVE'))
        }
      } catch (err) {
        console.error('Failed to load lookup data', err)
      } finally {
        if (isMounted) setLoadingLookups(false)
      }
    }

    fetchLookups()
  }, [isOpen])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!isEditing && (!formData.assetTag.trim() || formData.assetTag.trim().length < 2)) {
      setFieldErrors((prev) => ({ ...prev, assetTag: 'Asset tag must be at least 2 characters.' }))
      return
    }

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFieldErrors((prev) => ({ ...prev, name: 'Asset name must be at least 2 characters.' }))
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        assetType: formData.assetType.trim(),
        serialNumber: formData.serialNumber.trim() || undefined,
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        location: formData.location.trim(),
        purchaseDate: formData.purchaseDate || null,
        purchaseCost: formData.purchaseCost ? Number(formData.purchaseCost) : 0,
        warrantyExpiry: formData.warrantyExpiry || null,
        department: formData.department || null,
        vendor: formData.vendor || null,
        notes: formData.notes.trim(),
      }

      let result
      if (isEditing) {
        result = await assetService.updateAsset(asset._id, payload)
        showSuccess(`Asset ${result.assetTag} updated successfully.`)
      } else {
        payload.assetTag = formData.assetTag.toUpperCase().trim()
        result = await assetService.createAsset(payload)
        showSuccess(`Asset ${result.assetTag} created successfully.`)
      }

      onSaved?.(result)
      onClose()
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to save asset record.')
      setFieldErrors(parsed.fieldErrors || {})
      showError(parsed.message || 'Failed to save asset record.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Asset: ${asset?.assetTag}` : 'Add IT Asset to CMDB'}
      description={
        isEditing
          ? 'Update hardware specifications, procurement details, and department scoping.'
          : 'Register a new hardware or infrastructure asset into the enterprise inventory.'
      }
      width="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={submitting}
            onClick={handleSubmit}
          >
            {isEditing ? 'Save Changes' : 'Create Asset'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* SECTION 1: BASIC INFORMATION */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              1. Basic Information
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Asset Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asset Tag / ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.assetTag}
                onChange={(e) => handleChange('assetTag', e.target.value)}
                disabled={isEditing || submitting}
                placeholder="e.g. AST-1002"
                required={!isEditing}
                className={`w-full text-xs font-mono border rounded-lg p-2.5 uppercase transition-colors ${
                  isEditing
                    ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500'
                } ${fieldErrors.assetTag ? 'border-rose-500' : ''}`}
              />
              {fieldErrors.assetTag && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{fieldErrors.assetTag}</p>
              )}
              {isEditing && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Asset identifier is authoritative and immutable.
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Device / Asset Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={submitting}
                placeholder="e.g. Dell Latitude 5440"
                required
                className={`w-full text-xs bg-white dark:bg-slate-900 border rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                  fieldErrors.name
                    ? 'border-rose-500'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                disabled={submitting}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Type / Form Factor
              </label>
              <input
                type="text"
                value={formData.assetType}
                onChange={(e) => handleChange('assetType', e.target.value)}
                disabled={submitting}
                placeholder="e.g. Ultrabook, Rackmount, AP"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturer / OEM
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                disabled={submitting}
                placeholder="e.g. Dell, Lenovo, Apple, Cisco"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Model / Part Number
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                disabled={submitting}
                placeholder="e.g. 5440, ThinkPad X1 Gen 11"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Serial Number */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                disabled={submitting}
                placeholder="Unique OEM hardware serial"
                className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: OWNERSHIP & LOCATION */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              2. Ownership & Location
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                disabled={loadingLookups || submitting}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">-- No Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supplier / Vendor
              </label>
              <select
                value={formData.vendor}
                onChange={(e) => handleChange('vendor', e.target.value)}
                disabled={loadingLookups || submitting}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">-- No Vendor --</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location / Facility
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={submitting}
                placeholder="e.g. Building A, Floor 2, Server Room 104"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PROCUREMENT & WARRANTY */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              3. Procurement & Warranty
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Purchase Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                disabled={submitting}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Purchase Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purchase Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.purchaseCost}
                onChange={(e) => handleChange('purchaseCost', e.target.value)}
                disabled={submitting}
                placeholder="0.00"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Warranty Expiry */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Warranty Expiry Date
              </label>
              <input
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => handleChange('warrantyExpiry', e.target.value)}
                disabled={submitting}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: TECHNICAL SPECIFICATIONS & NOTES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              4. Specifications & Notes
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hardware Specifications
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={submitting}
              placeholder="Processor, RAM, SSD capacity, display specs, OS edition..."
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Inventory Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={submitting}
              placeholder="PO reference, custody conditions, deployment history..."
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </form>
    </Drawer>
  )
}

export default AssetFormModal
