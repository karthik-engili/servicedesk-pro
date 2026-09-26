import React, { useState, useEffect, useCallback } from 'react'
import ticketService from '../../services/ticketService'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'
import { ROLES, hasAnyRole, ROLE_LABELS } from '../../constants/roles'
import { Button, Spinner } from '../ui'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function TicketComments({ ticketId, currentUser }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [error, setError] = useState(null)

  const { showToast } = useToast()

  const canPostInternal = hasAnyRole(currentUser, [
    ROLES.SYSTEM_ADMIN,
    ROLES.IT_MANAGER,
    ROLES.TECHNICIAN,
  ])

  const fetchComments = useCallback(async () => {
    if (!ticketId) return
    try {
      setLoading(true)
      setError(null)
      const data = await ticketService.getComments(ticketId)
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to load comments.')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) {
      showToast('Comment message cannot be empty.', 'error')
      return
    }

    try {
      setSubmitting(true)
      const newComment = await ticketService.addComment(
        ticketId,
        trimmed,
        canPostInternal && isInternal
      )

      showToast(
        isInternal ? 'Internal note added.' : 'Comment posted successfully.',
        'success'
      )
      setMessage('')
      setIsInternal(false)

      if (newComment) {
        setComments((prev) => [...prev, newComment])
      } else {
        fetchComments()
      }
    } catch (err) {
      const parsed = handleApiError(err)
      showToast(parsed.message || 'Failed to submit comment.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Conversation & Activity
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {comments.length}
          </span>
        </h3>
        <button
          type="button"
          onClick={fetchComments}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchComments}>
            Retry
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          <svg
            className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No conversation yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Post an update, instruction, or query using the response composer below.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isInternalNote = Boolean(comment.isInternal)
            const authorName = comment.author?.name || 'Unknown User'
            const authorRole = comment.author?.role
            const roleLabel = ROLE_LABELS[authorRole] || authorRole || 'Staff'
            const initials = getInitials(authorName)

            return (
              <div
                key={comment._id}
                className={`rounded-xl border p-4 transition-all ${
                  isInternalNote
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Author Initials Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                        isInternalNote
                          ? 'bg-amber-200 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {initials}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {authorName}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {roleLabel}
                        </span>
                        {isInternalNote && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                            🔒 Internal Note
                          </span>
                        )}
                      </div>
                      {isInternalNote && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                          Only visible to support staff
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>

                <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pl-9">
                  {comment.message}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="ticket-comment-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {isInternal ? 'Internal Note' : 'Public Response'}
            </label>
            {canPostInternal && (
              <span className="text-[11px] text-slate-400">
                {isInternal ? 'Hidden from requester' : 'Visible to requester'}
              </span>
            )}
          </div>
          <textarea
            id="ticket-comment-input"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isInternal
                ? 'Document internal troubleshooting steps, gateway diagnostic output, or technician notes...'
                : 'Write a response to the requester with updates or instructions...'
            }
            disabled={submitting}
            className={`w-full rounded-xl border text-sm p-3.5 focus:outline-none focus:ring-1 transition-colors ${
              isInternal
                ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-amber-500 placeholder:text-amber-700/50 dark:placeholder:text-amber-400/40'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-primary-500 focus:ring-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500'
            }`}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {canPostInternal ? (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                disabled={submitting}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>🔒 Mark as Internal Note</span>
              </span>
            </label>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Responses are visible to ticket assignees and the requester.
            </span>
          )}

          <Button
            type="submit"
            variant={isInternal ? 'warning' : 'primary'}
            size="sm"
            isLoading={submitting}
            disabled={!message.trim() || submitting}
          >
            {isInternal ? 'Post Internal Note' : 'Send Response'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default TicketComments
