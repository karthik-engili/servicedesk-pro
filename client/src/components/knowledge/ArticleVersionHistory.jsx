import React, { useState, useEffect } from 'react'
import { Modal, Spinner, EmptyState } from '../ui'
import articleService from '../../services/articleService'
import { ROLE_LABELS } from '../../constants/roles'

export function ArticleVersionHistory({ isOpen, onClose, articleId, articleTitle }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedVersionId, setExpandedVersionId] = useState(null)

  useEffect(() => {
    if (!isOpen || !articleId) return

    let isMounted = true
    const fetchVersions = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await articleService.getVersions(articleId)
        if (isMounted) {
          setVersions(data || [])
          if (data && data.length > 0) {
            setExpandedVersionId(data[0]._id)
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load version history.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchVersions()
    return () => {
      isMounted = false
    }
  }, [isOpen, articleId])

  const toggleExpand = (id) => {
    setExpandedVersionId(expandedVersionId === id ? null : id)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revision & Version History"
      size="lg"
    >
      <div className="space-y-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          Tracking all historical revisions and author modifications for <span className="font-semibold text-slate-800 dark:text-slate-200">{articleTitle}</span>.
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <Spinner size="md" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
            {error}
          </div>
        ) : versions.length === 0 ? (
          <EmptyState
            title="No Versions Recorded"
            description="Revisions will appear here each time authorized staff modifies this article."
          />
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {versions.map((ver, idx) => {
              const isExpanded = expandedVersionId === ver._id
              const isLatest = idx === 0
              const formattedDate = new Date(ver.createdAt).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={ver._id || idx}
                  className={`border rounded-xl transition-all ${
                    isLatest
                      ? 'border-primary-300 dark:border-primary-800 bg-primary-50/20 dark:bg-primary-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  {/* Version Header */}
                  <div
                    onClick={() => toggleExpand(ver._id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          isLatest
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        v{ver.versionNumber} {isLatest && '(Current)'}
                      </span>

                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {ver.changeNote || 'Content revision'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          By {ver.changedBy?.name || 'Staff User'} ({ROLE_LABELS[ver.changedBy?.role] || ver.changedBy?.role || 'Staff'}) • {formattedDate}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      aria-label={isExpanded ? 'Collapse version' : 'Expand version'}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Content Preview */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-2">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        Title: <span className="font-normal">{ver.title}</span>
                      </div>
                      {ver.summary && (
                        <div className="text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-slate-800 dark:text-slate-200">Summary: </span>
                          {ver.summary}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                          Content Snapshot:
                        </div>
                        <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800">
                          {ver.content}
                        </pre>
                      </div>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <span>Category: {ver.category || 'General'}</span>
                        <span>•</span>
                        <span>Visibility: {ver.visibility || 'Public'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ArticleVersionHistory
