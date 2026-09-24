import React, { useState } from 'react'
import articleService from '../../services/articleService'
import { useToast } from '../../contexts/ToastContext'

export function BookmarkButton({
  articleId,
  initialBookmarked = false,
  onToggle,
  size = 'md',
  showLabel = false,
  className = '',
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError, showInfo } = useToast()

  const handleToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) return
    setLoading(true)

    try {
      if (bookmarked) {
        await articleService.removeBookmark(articleId)
        setBookmarked(false)
        showInfo('Article removed from your bookmarks.')
        if (onToggle) onToggle(false)
      } else {
        await articleService.bookmarkArticle(articleId)
        setBookmarked(true)
        showSuccess('Article saved to your bookmarks.')
        if (onToggle) onToggle(true)
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // Already bookmarked
        setBookmarked(true)
        showInfo('Article is already in your bookmarks.')
        if (onToggle) onToggle(true)
      } else {
        showError(err.response?.data?.message || 'Failed to update bookmark.')
      }
    } finally {
      setLoading(false)
    }
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
      className={`inline-flex items-center gap-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 ${
        bookmarked
          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/50 dark:hover:bg-primary-900/50'
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${size === 'sm' ? 'p-1 text-xs' : 'p-2 text-sm'} ${className}`}
    >
      <svg
        className={`${iconSizes[size] || iconSizes.md} transition-transform ${bookmarked ? 'scale-105' : ''}`}
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {showLabel && (
        <span className="font-medium text-xs">
          {bookmarked ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}

export default BookmarkButton
