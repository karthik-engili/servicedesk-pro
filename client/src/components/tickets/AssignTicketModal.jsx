import React, { useState, useEffect } from 'react'
import { useToast } from '../../contexts/ToastContext'
import ticketService from '../../services/ticketService'
import api from '../../services/api'
import { Modal, Button, Select } from '../ui'
import { ROLE_LABELS } from '../../constants/roles'
import { getErrorMessage } from '../../utils/errorHandler'

export function AssignTicketModal({ isOpen, onClose, ticket, onSuccess }) {
  const { showSuccess } = useToast()
  const [technicians, setTechnicians] = useState([])
  const [selectedTech, setSelectedTech] = useState('')
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const fetchStaff = async () => {
      setLoadingStaff(true)
      setError('')
      try {
        const res = await api.get('/users?limit=100')
        if (isMounted && res.data?.success && res.data?.data?.users) {
          const staff = res.data.data.users.filter((u) =>
            ['technician', 'it_manager', 'system_admin'].includes(u.role)
          )
          setTechnicians(staff)
          // Preselect current assignee if exists
          if (ticket?.assignedTo?._id) {
            setSelectedTech(ticket.assignedTo._id)
          } else if (staff.length > 0) {
            setSelectedTech(staff[0]._id)
          }
        }
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, 'Failed to load technician roster.'))
      } finally {
        if (isMounted) setLoadingStaff(false)
      }
    }

    fetchStaff()
    return () => {
      isMounted = false
    }
  }, [isOpen, ticket])

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!selectedTech) {
      setError('Please select a technician to assign.')
      return
    }

    setAssigning(true)
    setError('')

    try {
      const updatedTicket = await ticketService.assignTicket(ticket._id, selectedTech)
      showSuccess(`Ticket ${ticket.ticketNumber} assigned successfully!`)
      onSuccess?.(updatedTicket)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to assign ticket.'))
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Ticket ${ticket?.ticketNumber || ''}`}>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleAssign} className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 mb-3">
            Assigning will transition this ticket to <strong>ASSIGNED</strong> status, notify the technician, and set the first-response SLA timestamp.
          </p>

          <Select
            label="Select Support Personnel"
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            disabled={loadingStaff || assigning}
            placeholder={loadingStaff ? 'Loading staff members...' : 'Choose technician'}
            options={technicians.map((tech) => ({
              value: tech._id,
              label: `${tech.name} (${ROLE_LABELS[tech.role] || tech.role}${
                tech.department?.name ? ` - ${tech.department.name}` : ''
              })`,
            }))}
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={assigning}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={assigning}>
            Confirm Assignment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AssignTicketModal
