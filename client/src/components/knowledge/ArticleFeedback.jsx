import React, { useState } from 'react'
import articleService from '../../services/articleService'
import { useToast } from '../../contexts/ToastContext'

export function ArticleFeedback({
  articleId,
  initialHelpful = 0,
  initialNotHelpful = 0,
  className = '',
}) {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpful)
  const [notHelpfulCount, setNotHelpfulCount] = useState(initialNotHelpful)
  const [userVote, setUserVote] = useState(null) // 'HELPFUL' | 'NOT_HELPFUL' | null
  const [submitting, setSubmitting] = useState(false)

  const { showSuccess, showInfo, showError } = useToast()

  const handleVote = async (isHelpful) => {
    const targetVote = isHelpful ? 'HELPFUL' : 'NOT_HELPFUL'
    if (userVote === targetVote) {
      showInfo('You have already submitted this feedback for this article.')
      return
    }

    setSubmitting(true)
    try {
      let res
      if (isHelpful) {
        res = await articleService.markHelpful(articleId)
        showSuccess('Thank you! Your feedback helps us improve.')
      } else {
        res = await articleService.markNotHelpful(articleId)
        showInfo('Feedback received. We will review this article for clarity.')
      }

      if (res && res.helpfulCount !== undefined) {
        setHelpfulCount(res.helpfulCount)
        setNotHelpfulCount(res.notHelpfulCount)
      }
      setUserVote(targetVote)
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already recorded')) {
        setUserVote(targetVote)
        showInfo('You have already submitted this feedback.')
      } else {
        showError(err.response?.data?.message || 'Failed to record feedback.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={`p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          Was this article helpful?
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your feedback helps our IT team refine documentation and self-service troubleshooting.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleVote(true)}
          disabled={submitting}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 ${
            userVote === 'HELPFUL'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-400'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>Yes</span>
          <span className="ml-1 px-1.5 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
            {helpfulCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleVote(false)}
          disabled={submitting}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 ${
            userVote === 'NOT_HELPFUL'
              ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300 ring-1 ring-amber-400'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-9h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
            />
          </svg>
          <span>No</span>
          <span className="ml-1 px-1.5 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
            {notHelpfulCount}
          </span>
        </button>
      </div>
    </div>
  )
}

export default ArticleFeedback
