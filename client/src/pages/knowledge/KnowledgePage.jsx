import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import { Spinner, Button, EmptyState, ErrorState } from '../../components/ui'
import {
  KnowledgeSummaryCards,
  ArticleSearch,
  ArticleFilters,
  ArticleCard,
  ArticleFormModal,
} from '../../components/knowledge'
import { isStaff } from '../../constants/roles'
import { useAuth } from '../../contexts/AuthContext'
import articleService from '../../services/articleService'

export function KnowledgePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const staff = isStaff(user)

  // URL state synchronization
  const searchParam = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || ''
  const statusParam = searchParams.get('status') || ''
  const visibilityParam = searchParams.get('visibility') || ''
  const departmentParam = searchParams.get('department') || ''
  const pageParam = parseInt(searchParams.get('page') || '1', 10)

  // Internal state
  const [articles, setArticles] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: pageParam, limit: 12, pages: 1 })
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // User's bookmarks set for instant card indicator
  const [userBookmarks, setUserBookmarks] = useState(new Set())

  // Filters state object
  const filters = {
    search: searchParam,
    category: categoryParam,
    status: statusParam,
    visibility: visibilityParam,
    department: departmentParam,
    page: pageParam,
  }

  // Update URL params helper
  const updateUrlParams = useCallback(
    (newFilters) => {
      const nextParams = new URLSearchParams()
      if (newFilters.search) nextParams.set('search', newFilters.search)
      if (newFilters.category) nextParams.set('category', newFilters.category)
      if (newFilters.status && staff) nextParams.set('status', newFilters.status)
      if (newFilters.visibility && staff) nextParams.set('visibility', newFilters.visibility)
      if (newFilters.department) nextParams.set('department', newFilters.department)
      if (newFilters.page && newFilters.page > 1) nextParams.set('page', newFilters.page.toString())

      setSearchParams(nextParams, { replace: true })
    },
    [setSearchParams, staff]
  )

  // Fetch KB aggregate statistics
  const fetchSummary = useCallback(async () => {
    try {
      const data = await articleService.getArticleSummary()
      setSummary(data)
    } catch (err) {
      console.error('Failed to load KB summary statistics', err)
    }
  }, [])

  // Fetch bookmarks of current user to show saved icon
  const fetchUserBookmarks = useCallback(async () => {
    try {
      const data = await articleService.getBookmarks({ limit: 100 })
      const idSet = new Set((data.articles || []).map((a) => a._id))
      setUserBookmarks(idSet)
    } catch (err) {
      // Non-critical, ignore
    }
  }, [])

  // Fetch articles based on active filters
  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (filters.search && filters.search.trim()) {
        // Use full-text search endpoint
        const results = await articleService.searchArticles({
          q: filters.search.trim(),
          category: filters.category || undefined,
          department: filters.department || undefined,
        })
        setArticles(results || [])
        setPagination({
          total: (results || []).length,
          page: 1,
          limit: 20,
          pages: 1,
        })
      } else {
        // Regular query endpoint with pagination and all filters
        const data = await articleService.getArticles({
          category: filters.category || undefined,
          status: staff && filters.status ? filters.status : undefined,
          visibility: staff && filters.visibility ? filters.visibility : undefined,
          department: filters.department || undefined,
          page: filters.page || 1,
          limit: 12,
        })
        setArticles(data.articles || [])
        setPagination(data.pagination || { total: 0, page: 1, limit: 12, pages: 1 })
      }
    } catch (err) {
      console.error('Failed to fetch articles', err)
      setError(err.response?.data?.message || 'Failed to retrieve knowledge base articles.')
    } finally {
      setLoading(false)
    }
  }, [filters.search, filters.category, filters.status, filters.visibility, filters.department, filters.page, staff])

  // Initial load
  useEffect(() => {
    fetchSummary()
    fetchUserBookmarks()
  }, [fetchSummary, fetchUserBookmarks])

  // Refetch when filters change
  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  // Filter change handlers
  const handleSearchChange = (term) => {
    updateUrlParams({
      ...filters,
      search: term,
      page: 1,
    })
  }

  const handleFiltersChange = (newFilters) => {
    updateUrlParams(newFilters)
  }

  const handleResetFilters = () => {
    updateUrlParams({
      search: '',
      category: '',
      status: '',
      visibility: '',
      department: '',
      page: 1,
    })
  }

  const handleFilterStatus = (statusValue) => {
    if (!staff) return
    updateUrlParams({
      ...filters,
      status: statusValue,
      page: 1,
    })
  }

  const handlePageChange = (newPage) => {
    updateUrlParams({
      ...filters,
      page: newPage,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBookmarkToggle = (articleId, isSaved) => {
    setUserBookmarks((prev) => {
      const next = new Set(prev)
      if (isSaved) next.add(articleId)
      else next.delete(articleId)
      return next
    })
  }

  return (
    <PageContainer
      title="Knowledge Base & Self-Service"
      description="Search documentation, standard operating procedures, and troubleshooting guides"
    >
      <div className="space-y-6">
        {/* Top Header Actions & Bookmarks Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/knowledge/bookmarks"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>My Saved Bookmarks</span>
              {userBookmarks.size > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                  {userBookmarks.size}
                </span>
              )}
            </Link>
          </div>

          {staff && (
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="shrink-0"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Article
            </Button>
          )}
        </div>

        {/* Summary Metrics Cards */}
        <KnowledgeSummaryCards
          summary={summary}
          user={user}
          onFilterStatus={staff ? handleFilterStatus : undefined}
        />

        {/* Search & Hero Input Section */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              How can we help you today?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type keywords, error messages, or questions to find tested resolutions.
            </p>
          </div>

          <ArticleSearch
            value={filters.search}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange('')}
          />

          {/* Filters Bar */}
          <ArticleFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            user={user}
          />
        </div>

        {/* Article Cards Grid / Results */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-500">Retrieving knowledge articles...</p>
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to Load Knowledge Base"
            description={error}
            actionLabel="Try Again"
            onAction={fetchArticles}
          />
        ) : articles.length === 0 ? (
          <EmptyState
            title="No Knowledge Articles Found"
            description={
              filters.search || filters.category || filters.status || filters.department
                ? 'No published articles match your current search criteria. Try modifying your search or clearing filters.'
                : 'There are currently no knowledge base articles published in this category.'
            }
            actionLabel={
              filters.search || filters.category || filters.status || filters.department
                ? 'Clear Filters'
                : staff
                ? 'Create First Article'
                : undefined
            }
            onAction={
              filters.search || filters.category || filters.status || filters.department
                ? handleResetFilters
                : staff
                ? () => setShowCreateModal(true)
                : undefined
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing {articles.length} of {pagination.total} {pagination.total === 1 ? 'article' : 'articles'}
                {filters.search && ` for "${filters.search}"`}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  showStatus={staff}
                  isBookmarked={userBookmarks.has(article._id)}
                  onBookmarkToggle={(isSaved) =>
                    handleBookmarkToggle(article._id, isSaved)
                  }
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {!filters.search && pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                <span className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="neutral"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="neutral"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Article Modal */}
      {showCreateModal && (
        <ArticleFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaved={(newArticle) => {
            fetchArticles()
            fetchSummary()
            if (newArticle?._id) {
              navigate(`/knowledge/${newArticle._id}`)
            }
          }}
        />
      )}
    </PageContainer>
  )
}

export default KnowledgePage
