import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import { Button, EmptyState, ErrorState, Skeleton } from '../../components/ui'
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

function ArticleListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
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
      status: filters.status === statusValue ? '' : statusValue,
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
      description="Find answers, troubleshooting procedures, and IT support documentation"
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            to="/knowledge/bookmarks"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>Saved Articles</span>
            {userBookmarks.size > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                {userBookmarks.size}
              </span>
            )}
          </Link>

          {staff && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Article</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Operational KPI Strip */}
        <KnowledgeSummaryCards
          summary={summary}
          user={user}
          activeStatus={filters.status}
          onFilterStatus={staff ? handleFilterStatus : undefined}
        />

        {/* Primary Search Centerpiece & Filter Area */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Find Answers & Troubleshooting
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Type error codes, symptoms, or keywords to discover verified IT solutions.
            </p>
          </div>

          {/* Large prominent search field */}
          <ArticleSearch
            value={filters.search}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange('')}
          />

          {/* Categories & Filter Bar */}
          <ArticleFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            user={user}
          />
        </div>

        {/* Results Header / Counter */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>
            {loading ? (
              'Searching documentation...'
            ) : filters.search ? (
              <>
                Search results: <strong className="text-slate-800 dark:text-slate-200 font-mono">{articles.length}</strong> {articles.length === 1 ? 'article' : 'articles'} matching "{filters.search}"
              </>
            ) : (
              <>
                Documentation: <strong className="text-slate-800 dark:text-slate-200 font-mono">{pagination.total}</strong> {pagination.total === 1 ? 'article' : 'articles'}
                {filters.category && (
                  <span className="text-primary-600 dark:text-primary-400 ml-1">
                    in {filters.category}
                  </span>
                )}
              </>
            )}
          </span>
        </div>

        {/* Article Cards Grid / Results */}
        {loading ? (
          <ArticleListSkeleton />
        ) : error ? (
          <ErrorState
            title="Unable to Load Knowledge Base"
            description={error}
            actionLabel="Try Again"
            onAction={fetchArticles}
          />
        ) : articles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xs">
            <EmptyState
              title={filters.search ? 'No Articles Found' : 'No Documentation Available'}
              description={
                filters.search || filters.category || filters.status || filters.department
                  ? 'No knowledge articles match your current search query or filter parameters. Try broadening your keywords or resetting filters.'
                  : 'There are currently no published knowledge base articles available in this department.'
              }
              actionLabel={
                filters.search || filters.category || filters.status || filters.department
                  ? 'Reset Filters'
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
          </div>
        ) : (
          <div className="space-y-6">
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
                    onClick={() => handlePageChange(pagination.page - 1)}
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

      {/* Create Article Drawer */}
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
