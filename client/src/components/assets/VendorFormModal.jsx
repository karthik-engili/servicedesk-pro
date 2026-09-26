import React, { useState, useEffect } from 'react'
import { Modal, Button } from '../ui'
import { VENDOR_STATUSES, VENDOR_STATUS_LABELS } from '../../constants/assets'
import vendorService from '../../services/vendorService'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'

export function VendorFormModal({ isOpen, onClose, vendor = null, onSaved }) {
  const isEditing = Boolean(vendor?._id)
  const { showSuccess, showError } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    status: 'ACTIVE',
    notes: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (vendor && isEditing) {
      setFormData({
        name: vendor.name || '',
        contactPerson: vendor.contactPerson || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        website: vendor.website || '',
        status: vendor.status || 'ACTIVE',
        notes: vendor.notes || '',
      })
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        status: 'ACTIVE',
        notes: '',
      })
    }
    setError('')
    setFieldErrors({})
  }, [vendor, isEditing, isOpen])

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

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFieldErrors((prev) => ({ ...prev, name: 'Vendor name must be at least 2 characters.' }))
      return
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }))
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        website: formData.website.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
      }

      let result
      if (isEditing) {
        result = await vendorService.updateVendor(vendor._id, payload)
        showSuccess(`Vendor '${result.name}' updated successfully.`)
      } else {
        result = await vendorService.createVendor(payload)
        showSuccess(`Vendor '${result.name}' registered successfully.`)
      }

      onSaved?.(result)
      onClose()
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to save vendor.')
      setFieldErrors(parsed.fieldErrors || {})
      showError(parsed.message || 'Failed to save vendor.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Vendor: ${vendor?.name}` : 'Register New Vendor / Supplier'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vendor / Supplier Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={submitting}
              placeholder="e.g. Dell Enterprise Direct, CDW Logistics"
              required
              className={`w-full text-xs bg-white dark:bg-slate-900 border rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                fieldErrors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {fieldErrors.name && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                disabled={submitting}
                placeholder="Account Representative"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={submitting}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {VENDOR_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {VENDOR_STATUS_LABELS[st] || st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Support / Sales Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={submitting}
                placeholder="support@vendor.com"
                className={`w-full text-xs bg-white dark:bg-slate-900 border rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  fieldErrors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={submitting}
                placeholder="+1 (800) 555-0199"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Website / Portal URL
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              disabled={submitting}
              placeholder="https://vendor-support.com"
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Depot / Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={submitting}
              placeholder="Headquarters or service depot address"
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Notes / SLA terms
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={submitting}
              placeholder="Customer contract #, premier support pin, renewal notes..."
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={submitting}>
            {isEditing ? 'Save Changes' : 'Register Vendor'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default VendorFormModal
