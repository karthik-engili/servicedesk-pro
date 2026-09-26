import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import ticketService from '../../services/ticketService'
import api from '../../services/api'
import { Drawer, Button, Input, Select } from '../ui'
import {
  TICKET_CATEGORIES,
  CATEGORY_LABELS,
  TICKET_PRIORITIES,
  PRIORITY_LABELS,
} from '../../constants/tickets'
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler'

export function CreateTicketModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const { showSuccess } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    department: user?.department?._id || user?.department || '',
    asset: '',
  })

  const [departments, setDepartments] = useState([])
  const [assets, setAssets] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Fetch departments and user assets when drawer opens
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const fetchOptions = async () => {
      setLoadingOptions(true)
      try {
        const [deptRes, assetRes] = await Promise.all([
          api.get('/departments'),
          api.get('/assets').catch(() => ({ data: { data: { assets: [] } } })),
        ])

        if (isMounted) {
          if (deptRes.data?.success && deptRes.data?.data?.departments) {
            setDepartments(deptRes.data.data.departments.filter((d) => d.status === 'active'))
          }
          const loadedAssets = assetRes.data?.data?.assets || assetRes.data?.data || []
          if (Array.isArray(loadedAssets)) {
            setAssets(loadedAssets.filter((a) => a.status !== 'RETIRED'))
          }
        }
      } catch (err) {
        console.error('Failed to load ticket options:', err)
      } finally {
        if (isMounted) setLoadingOptions(false)
      }
    }

    fetchOptions()
    return () => {
      isMounted = false
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setFieldErrors((prev) => ({ ...prev, title: 'Title must be at least 3 characters.' }))
      return
    }

    if (!formData.description.trim() || formData.description.trim().length < 5) {
      setFieldErrors((prev) => ({
        ...prev,
        description: 'Description must be at least 5 characters.',
      }))
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      }
      if (formData.department) payload.department = formData.department
      if (formData.asset) payload.asset = formData.asset

      const ticket = await ticketService.createTicket(payload)
      showSuccess(`Ticket ${ticket.ticketNumber} created successfully!`)
      onSuccess?.(ticket)
      handleClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create ticket. Please check the fields and try again.'))
      setFieldErrors(getFieldErrors(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'GENERAL',
      priority: 'MEDIUM',
      department: user?.department?._id || user?.department || '',
      asset: '',
    })
    setError('')
    setFieldErrors({})
    onClose()
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Support Ticket"
      description="Submit a new incident or service request to the IT service desk."
      width="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-ticket-form"
            variant="primary"
            size="sm"
            isLoading={submitting}
          >
            Create Ticket
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form id="create-ticket-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject / Title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          error={fieldErrors.title}
          placeholder="Brief summary of the issue (e.g. Cannot connect to Office VPN)"
          helperText="Minimum 3 characters"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            error={fieldErrors.category}
            options={TICKET_CATEGORIES.map((cat) => ({
              value: cat,
              label: CATEGORY_LABELS[cat] || cat,
            }))}
          />

          <Select
            label="Priority"
            name="priority"
            required
            value={formData.priority}
            onChange={handleChange}
            error={fieldErrors.priority}
            options={TICKET_PRIORITIES.map((pri) => ({
              value: pri,
              label: PRIORITY_LABELS[pri] || pri,
            }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder={loadingOptions ? 'Loading departments...' : 'Select department'}
            error={fieldErrors.department}
            options={departments.map((d) => ({ value: d._id, label: d.name }))}
          />

          <Select
            label="Linked Asset (Optional)"
            name="asset"
            value={formData.asset}
            onChange={handleChange}
            placeholder={loadingOptions ? 'Loading assets...' : 'No hardware asset'}
            error={fieldErrors.asset}
            options={assets.map((a) => ({
              value: a._id,
              label: `${a.assetTag} - ${a.name} (${a.category})`,
            }))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            rows="5"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the symptoms, error messages, and any steps you have already taken..."
            className={`block w-full rounded-lg text-sm border p-3 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-colors ${
              fieldErrors.description
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500'
            }`}
          />
          {fieldErrors.description ? (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">{fieldErrors.description}</p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Provide thorough details to assist technical staff in quick diagnosis.
            </p>
          )}
        </div>
      </form>
    </Drawer>
  )
}

export default CreateTicketModal
