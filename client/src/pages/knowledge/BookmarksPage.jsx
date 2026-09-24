import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import { Spinner, EmptyState, ErrorState, Button } from '../../components/ui'
import { ArticleCard } from '../../components/knowledge'
import articleService from '../../services/articleService'

export function BookmarksPage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBookmarks = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const data = await articleService.getBookmarks({ page, limit: 12 })
      setArticles(data.articles || [])
      setPagination(data.pagination || { total: 0, page: 1, limit: 12, pages: 1 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your bookmarked articles.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookmarks(1)
  }, [fetchBookmarks])

  const handleBookmarkToggle = (articleId, isBookmarked) => {
    if (!isBookmarked) {
      // Optimistically remove from list
      setArticles((prev) => prev.filter((a) => a._id !== articleId))
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }))
    }
  }

  return (
    <PageContainer
      title="Saved Articles & Bookmarks"
      description="Quick access to procedures, guides, and troubleshooting steps you have pinned"
    >
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/knowledge"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Knowledge Articles
          </Link>

          <span className="text-xs text-slate-500">
            {pagination.total} {pagination.total === 1 ? 'article saved' : 'articles saved'}
          </span>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState
            title="Error Loading Bookmarks"
            description={error}
            actionLabel="Try Again"
            onAction={() => fetchBookmarks(pagination.page)}
          />
        ) : articles.length === 0 ? (
          <EmptyState
            title="No Bookmarked Articles Yet"
            description="When reading knowledge base articles or guides, click the bookmark icon to save them here for fast self-service access."
            actionLabel="Browse Knowledge Base"
            onAction={() => navigate('/knowledge')}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  isBookmarked={true}
                  onBookmarkToggle={(isBookmarked) =>
                    handleBookmarkToggle(article._id, isBookmarked)
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                <span className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="neutral"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchBookmarks(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="neutral"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => fetchBookmarks(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default BookmarksPage
