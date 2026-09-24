import React, { useState, useEffect } from 'react'
import { Modal, Button, Select } from '../ui'
import assetService from '../../services/assetService'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'

export function AssignAssetModal({ isOpen, onClose, asset, onAssigned }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [notes, setNotes] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { showSuccess, showError } = useToast()

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        const res = await api.get('/users', { params: { limit: 100 } })
        const userList = res.data?.data?.users || res.data?.data || []
        if (isMounted) {
          const activeUsers = userList.filter((u) => u.status === 'active')
          setUsers(activeUsers)
        }
      } catch (err) {
        console.error('Failed to load users for assignment', err)
      } finally {
        if (isMounted) setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [isOpen])

  const handleClose = () => {
    setSelectedUser('')
    setNotes('')
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedUser) {
      setError('Please select an employee to assign this asset to.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const updatedAsset = await assetService.assignAsset(asset._id, {
        assignedTo: selectedUser,
        notes: notes.trim(),
      })

      showSuccess(`Asset ${asset.assetTag} assigned successfully.`)
      onAssigned?.(updatedAsset)
      handleClose()
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to assign asset.')
      showError(parsed.message || 'Failed to assign asset.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!asset) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Assign Asset: ${asset.assetTag}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
          <div className="font-semibold text-slate-800">{asset.name}</div>
          <div className="text-slate-500 font-mono">Tag: {asset.assetTag}</div>
          {asset.serialNumber && (
            <div className="text-slate-500 font-mono">S/N: {asset.serialNumber}</div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assign To Employee <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={loadingUsers || submitting}
            required
            className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="">
              {loadingUsers ? 'Loading employees...' : '-- Select Employee --'}
            </option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email}) - {u.role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assignment Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Primary development laptop provided upon onboarding..."
            disabled={submitting}
            className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            disabled={!selectedUser || submitting}
          >
            Confirm Assignment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AssignAssetModal
