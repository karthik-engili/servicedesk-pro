import React, { useState, useEffect, useCallback } from 'react'
import ticketService from '../../services/ticketService'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'
import { ROLES, hasAnyRole, ROLE_LABELS } from '../../constants/roles'
import { Button, Spinner, Badge } from '../ui'

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
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          Conversation & Notes
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {comments.length}
          </span>
        </h3>
        <button
          type="button"
          onClick={fetchComments}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50"
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchComments}>
            Retry
          </Button>
        </div>
      ) : comments.length === 0 ? (
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-sm font-medium text-slate-600">No comments yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Start the conversation by posting an update or asking a question.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isInternalNote = Boolean(comment.isInternal)
            const authorName = comment.author?.name || 'Unknown User'
            const authorRole = comment.author?.role
            const roleLabel = ROLE_LABELS[authorRole] || authorRole || 'Staff'

            return (
              <div
                key={comment._id}
                className={`rounded-lg border p-4 transition-colors ${
                  isInternalNote
                    ? 'bg-amber-50/60 border-amber-300/80 shadow-xs'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900">
                      {authorName}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                      {roleLabel}
                    </span>
                    {isInternalNote && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-200 text-amber-900 border border-amber-300">
                        🔒 Internal Note
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>

                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {comment.message}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-4 space-y-3">
        <div>
          <label htmlFor="ticket-comment-input" className="block text-xs font-medium text-slate-700 mb-1">
            Leave a response
          </label>
          <textarea
            id="ticket-comment-input"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isInternal
                ? 'Write an internal note (only visible to support staff)...'
                : 'Write a public update to the requester...'
            }
            disabled={submitting}
            className={`w-full rounded-md border text-sm p-3 focus:outline-none focus:ring-2 transition-all ${
              isInternal
                ? 'border-amber-300 bg-amber-50/30 focus:border-amber-500 focus:ring-amber-200'
                : 'border-slate-300 bg-white focus:border-primary-500 focus:ring-primary-100'
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
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                🔒 Mark as Internal Note
                <span className="text-[11px] text-slate-400 font-normal">
                  (Hidden from requester)
                </span>
              </span>
            </label>
          ) : (
            <span className="text-xs text-slate-400">
              Responses are visible to ticket assignees and requester.
            </span>
          )}

          <Button
            type="submit"
            variant={isInternal ? 'warning' : 'primary'}
            size="sm"
            loading={submitting}
            disabled={!message.trim() || submitting}
          >
            {isInternal ? 'Add Internal Note' : 'Post Response'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default TicketComments
