import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import { EmptyState, ErrorState, Button, Skeleton } from '../../components/ui'
import { ArticleCard } from '../../components/knowledge'
import articleService from '../../services/articleService'

function BookmarksSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 animate-pulse shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton width="70px" height="18px" className="rounded" />
            <Skeleton width="20px" height="20px" className="rounded-md" />
          </div>
          <Skeleton width="85%" height="22px" className="rounded" />
          <div className="space-y-1.5 pt-1">
            <Skeleton width="100%" height="14px" className="rounded" />
            <Skeleton width="75%" height="14px" className="rounded" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <Skeleton width="100px" height="14px" className="rounded" />
            <Skeleton width="60px" height="14px" className="rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function BookmarksPage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterQuery, setFilterQuery] = useState('')

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

  // Client-side quick filter within saved bookmarks
  const filteredArticles = useMemo(() => {
    if (!filterQuery.trim()) return articles
    const q = filterQuery.toLowerCase().trim()
    return articles.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
    )
  }, [articles, filterQuery])

  return (
    <PageContainer
      title="Saved Articles & Bookmarks"
      description="Quick self-service access to pinned procedures, guides, and troubleshooting steps"
      actions={
        <Link to="/knowledge">
          <Button variant="neutral" size="sm" className="flex items-center gap-1.5">
            <span>&larr;</span>
            <span>All Documentation</span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Search & Header Strip */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search saved articles..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {pagination.total} {pagination.total === 1 ? 'article saved' : 'articles saved'}
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <BookmarksSkeleton />
        ) : error ? (
          <ErrorState
            title="Error Loading Bookmarks"
            description={error}
            actionLabel="Try Again"
            onAction={() => fetchBookmarks(pagination.page)}
          />
        ) : articles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xs">
            <EmptyState
              title="No Bookmarked Articles Yet"
              description="When reading knowledge base articles or guides, click the bookmark icon to save them here for quick self-service reference."
              actionLabel="Browse Knowledge Base"
              onAction={() => navigate('/knowledge')}
            />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xs">
            <EmptyState
              title="No Matching Bookmarks"
              description={`No saved articles match "${filterQuery}".`}
              actionLabel="Clear Search"
              onAction={() => setFilterQuery('')}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((article) => (
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
            {!filterQuery && pagination.pages > 1 && (
              <div className="bg-white dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-2xs">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Showing page <strong className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{pagination.page}</strong> of{' '}
                  <strong className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{pagination.pages}</strong> ({pagination.total} articles)
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="neutral"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchBookmarks(pagination.page - 1)}
                  >
                    Previous
                  </Button>

                  <span className="px-3 py-1 text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                    {pagination.page}
                  </span>

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
