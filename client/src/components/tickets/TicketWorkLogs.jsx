import React, { useState, useEffect, useCallback } from 'react'
import ticketService from '../../services/ticketService'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'
import { ROLES, hasAnyRole, ROLE_LABELS } from '../../constants/roles'
import { Button, Spinner, Input } from '../ui'

export function TicketWorkLogs({ ticketId, currentUser }) {
  const [workLogs, setWorkLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeSpentMinutes, setTimeSpentMinutes] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)

  const { showToast } = useToast()

  const isStaff = hasAnyRole(currentUser, [
    ROLES.SYSTEM_ADMIN,
    ROLES.IT_MANAGER,
    ROLES.TECHNICIAN,
  ])

  const fetchWorkLogs = useCallback(async () => {
    if (!ticketId || !isStaff) return
    try {
      setLoading(true)
      setError(null)
      const data = await ticketService.getWorkLogs(ticketId)
      setWorkLogs(Array.isArray(data) ? data : [])
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to load work logs.')
    } finally {
      setLoading(false)
    }
  }, [ticketId, isStaff])

  useEffect(() => {
    if (isStaff) {
      fetchWorkLogs()
    }
  }, [fetchWorkLogs, isStaff])

  if (!isStaff) {
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const minutes = parseInt(timeSpentMinutes, 10)
    if (isNaN(minutes) || minutes <= 0) {
      showToast('Please enter a valid positive number of minutes.', 'error')
      return
    }

    const trimmedDesc = description.trim()
    if (!trimmedDesc || trimmedDesc.length < 3) {
      showToast('Description must be at least 3 characters long.', 'error')
      return
    }

    try {
      setSubmitting(true)
      const newLog = await ticketService.addWorkLog(ticketId, trimmedDesc, minutes)
      showToast('Work time logged successfully.', 'success')
      setTimeSpentMinutes('')
      setDescription('')

      if (newLog) {
        setWorkLogs((prev) => [newLog, ...prev])
      } else {
        fetchWorkLogs()
      }
    } catch (err) {
      const parsed = handleApiError(err)
      showToast(parsed.message || 'Failed to record work log.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDuration = (mins) => {
    if (!mins && mins !== 0) return '0m'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    return `${m}m`
  }

  const totalMinutes = workLogs.reduce((acc, log) => acc + (Number(log.timeSpentMinutes) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            Technician Work Logs
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
              Total: {formatDuration(totalMinutes)}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal activity and time tracking records for support technicians
          </p>
        </div>
        <button
          type="button"
          onClick={fetchWorkLogs}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Add Work Log Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
          Record Work Session
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <Input
              label="Time Spent (mins)"
              type="number"
              min="1"
              step="1"
              value={timeSpentMinutes}
              onChange={(e) => setTimeSpentMinutes(e.target.value)}
              placeholder="e.g. 30"
              disabled={submitting}
              required
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              label="Description of Work Performed"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Diagnostics, patch deployment, hardware replacement, etc."
              disabled={submitting}
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            disabled={!timeSpentMinutes || !description.trim() || submitting}
          >
            Log Time
          </Button>
        </div>
      </form>

      {/* Work Logs List */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchWorkLogs}>
            Retry
          </Button>
        </div>
      ) : workLogs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
          <svg
            className="w-10 h-10 text-slate-300 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-slate-600">No work logged yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Technicians can record time spent and troubleshooting steps above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workLogs.map((log) => {
            const techName = log.technician?.name || 'Staff'
            const techRole = log.technician?.role
            const roleLabel = ROLE_LABELS[techRole] || techRole || 'Technician'

            return (
              <div
                key={log._id}
                className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{techName}</span>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {roleLabel}
                    </span>
                    <span className="text-xs text-slate-400">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{log.description}</p>
                </div>
                <div className="self-start sm:self-center shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ⏱ {formatDuration(log.timeSpentMinutes)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TicketWorkLogs
