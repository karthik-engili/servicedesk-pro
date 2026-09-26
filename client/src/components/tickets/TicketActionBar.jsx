import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import ticketService from '../../services/ticketService'
import { Button, Modal } from '../ui'
import AssignTicketModal from './AssignTicketModal'
import { getErrorMessage } from '../../utils/errorHandler'

export function TicketActionBar({ ticket, onTicketUpdated, className = '' }) {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  const [assignOpen, setAssignOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [reopenOpen, setReopenOpen] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)

  if (!ticket || !user) return null

  const isPrivileged = ['system_admin', 'it_manager'].includes(user.role)
  const isAssignee =
    ticket.assignedTo?._id === user._id || ticket.assignedTo === user._id
  const isOwner =
    ticket.createdBy?._id === user._id || ticket.createdBy === user._id

  // 1. Assign / Reassign
  const canAssign = isPrivileged && ticket.status !== 'CLOSED'

  // 2. Start Work
  const canStart =
    (isAssignee || isPrivileged) &&
    (ticket.status === 'ASSIGNED' || ticket.status === 'REOPENED')

  // 3. Resolve
  const canResolve =
    (isAssignee || isPrivileged) && ticket.status === 'IN_PROGRESS'

  // 4. Reopen
  const canReopen = (isOwner || isPrivileged) && ticket.status === 'RESOLVED'

  // 5. Close
  const canClose = (isOwner || isPrivileged) && ticket.status === 'RESOLVED'

  // Action Handlers
  const handleStartWork = async () => {
    setLoadingAction(true)
    try {
      const updated = await ticketService.startTicket(ticket._id)
      showSuccess(`Work started on ticket ${ticket.ticketNumber}!`)
      onTicketUpdated?.(updated)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to start ticket.'))
    } finally {
      setLoadingAction(false)
    }
  }

  const handleResolve = async (e) => {
    e.preventDefault()
    if (!resolutionNotes.trim() || resolutionNotes.trim().length < 5) {
      showError('Resolution notes must be at least 5 characters.')
      return
    }

    setLoadingAction(true)
    try {
      const updated = await ticketService.resolveTicket(ticket._id, resolutionNotes.trim())
      showSuccess(`Ticket ${ticket.ticketNumber} marked as Resolved!`)
      onTicketUpdated?.(updated)
      setResolveOpen(false)
      setResolutionNotes('')
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to resolve ticket.'))
    } finally {
      setLoadingAction(false)
    }
  }

  const handleReopen = async (e) => {
    e.preventDefault()
    setLoadingAction(true)
    try {
      const updated = await ticketService.reopenTicket(ticket._id, reopenReason.trim())
      showSuccess(`Ticket ${ticket.ticketNumber} reopened.`)
      onTicketUpdated?.(updated)
      setReopenOpen(false)
      setReopenReason('')
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to reopen ticket.'))
    } finally {
      setLoadingAction(false)
    }
  }

  const handleClose = async () => {
    setLoadingAction(true)
    try {
      const updated = await ticketService.closeTicket(ticket._id)
      showSuccess(`Ticket ${ticket.ticketNumber} closed successfully.`)
      onTicketUpdated?.(updated)
      setCloseConfirmOpen(false)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to close ticket.'))
    } finally {
      setLoadingAction(false)
    }
  }

  // If no action is available to current user in current state
  if (!canAssign && !canStart && !canResolve && !canReopen && !canClose) {
    return null
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Assign / Reassign */}
      {canAssign && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAssignOpen(true)}
          disabled={loadingAction}
          className="text-xs"
        >
          {ticket.assignedTo ? 'Reassign' : 'Assign Technician'}
        </Button>
      )}

      {/* Start Work */}
      {canStart && (
        <Button
          variant="primary"
          size="sm"
          onClick={handleStartWork}
          isLoading={loadingAction}
          className="text-xs"
        >
          Start Work
        </Button>
      )}

      {/* Resolve */}
      {canResolve && (
        <Button
          variant="primary"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
          onClick={() => setResolveOpen(true)}
          disabled={loadingAction}
        >
          Resolve Ticket
        </Button>
      )}

      {/* Reopen */}
      {canReopen && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReopenOpen(true)}
          disabled={loadingAction}
          className="text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
        >
          Reopen Ticket
        </Button>
      )}

      {/* Close Ticket */}
      {canClose && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCloseConfirmOpen(true)}
          disabled={loadingAction}
          className="text-xs"
        >
          Close Ticket
        </Button>
      )}

      {/* Assign Technician Modal */}
      {canAssign && (
        <AssignTicketModal
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          ticket={ticket}
          onSuccess={onTicketUpdated}
        />
      )}

      {/* Resolve Dialog */}
      <Modal
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Resolve Ticket"
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please document the root cause resolution and actions performed before marking this ticket as resolved.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Resolution Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Reconfigured user VPN certificate and flushed local DNS cache. Verified connection restored."
              className="block w-full rounded-lg text-sm border border-slate-300 dark:border-slate-700 p-2.5 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Minimum 5 characters required.</p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setResolveOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={loadingAction}>
              Confirm Resolution
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reopen Dialog */}
      <Modal
        isOpen={reopenOpen}
        onClose={() => setReopenOpen(false)}
        title="Reopen Support Ticket"
      >
        <form onSubmit={handleReopen} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            If the problem persists or new symptoms have appeared, explain why this ticket is being reopened.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Reason for Reopening (Optional)
            </label>
            <textarea
              rows="3"
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. The issue reoccurred after rebooting the laptop."
              className="block w-full rounded-lg text-sm border border-slate-300 dark:border-slate-700 p-2.5 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setReopenOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={loadingAction}>
              Reopen Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Confirmation Dialog */}
      <Modal
        isOpen={closeConfirmOpen}
        onClose={() => setCloseConfirmOpen(false)}
        title="Permanently Close Ticket"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Are you sure you want to mark ticket <strong className="font-mono text-slate-900 dark:text-slate-100">{ticket.ticketNumber}</strong> as closed? Once closed, no further state transitions can be performed.
          </p>
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setCloseConfirmOpen(false)}>
              Keep Resolved
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClose}
              isLoading={loadingAction}
            >
              Confirm Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TicketActionBar
