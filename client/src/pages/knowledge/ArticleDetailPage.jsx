import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import { Spinner, Button, Modal, ErrorState } from '../../components/ui'
import {
  ArticleStatusBadge,
  BookmarkButton,
  ArticleFeedback,
  ArticleVersionHistory,
  ArticleFormModal,
  MarkdownRenderer,
  extractHeadings,
} from '../../components/knowledge'
import {
  ARTICLE_CATEGORY_CONFIG,
  ARTICLE_STATUSES,
  canTransitionArticle,
} from '../../constants/articles'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { isStaff, isAdminOrManager } from '../../constants/roles'
import articleService from '../../services/articleService'

export function ArticleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusErrorCode, setStatusErrorCode] = useState(null)

  // Modals & Action States
  const [showEditDrawer, setShowEditDrawer] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false)

  const fetchArticle = useCallback(async () => {
    setLoading(true)
    setError(null)
    setStatusErrorCode(null)
    try {
      const data = await articleService.getArticle(id)
      setArticle(data)
    } catch (err) {
      console.error('Failed to load article details', err)
      const code = err.response?.status
      setStatusErrorCode(code)
      setError(
        err.response?.data?.message ||
          (code === 404
            ? 'The requested knowledge base article could not be found or is not published.'
            : code === 403
            ? 'Access restricted. You do not have permission to view this department article.'
            : 'An unexpected error occurred while loading this article.')
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchArticle()
  }, [fetchArticle])

  // Extract table of contents headings safely from markdown
  const tableOfContents = useMemo(() => {
    if (!article?.content) return []
    return extractHeadings(article.content)
  }, [article?.content])

  // Lifecycle Workflow Handlers
  const handlePublish = async () => {
    if (!article) return
    setWorkflowActionLoading(true)
    try {
      const updated = await articleService.publishArticle(article._id)
      setArticle(updated)
      showSuccess('Article has been published successfully.')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to publish article.')
    } finally {
      setWorkflowActionLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!article) return
    setWorkflowActionLoading(true)
    try {
      const updated = await articleService.archiveArticle(article._id)
      setArticle(updated)
      showInfo('Article has been archived.')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to archive article.')
    } finally {
      setWorkflowActionLoading(false)
    }
  }

  const handleUnpublish = async () => {
    if (!article) return
    setWorkflowActionLoading(true)
    try {
      const updated = await articleService.unpublishArticle(article._id)
      setArticle(updated)
      showInfo('Article unpublished and reverted to Draft.')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to unpublish article.')
    } finally {
      setWorkflowActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!article) return
    setWorkflowActionLoading(true)
    try {
      await articleService.deleteArticle(article._id)
      showSuccess('Article deleted successfully.')
      navigate('/knowledge')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete article.')
      setWorkflowActionLoading(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading knowledge article...</p>
        </div>
      </PageContainer>
    )
  }

  if (error || !article) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto py-12">
          <ErrorState
            title={statusErrorCode === 403 ? 'Access Restricted' : statusErrorCode === 404 ? 'Article Not Found' : 'Error Loading Article'}
            description={error}
            actionLabel="Return to Knowledge Base"
            onAction={() => navigate('/knowledge')}
          />
        </div>
      </PageContainer>
    )
  }

  const staff = isStaff(user)
  const privileged = isAdminOrManager(user)
  const isAuthor = article.author?._id === user?._id || article.author === user?._id
  const canEdit = privileged || isAuthor
  const canDelete = privileged

  const categoryConfig = ARTICLE_CATEGORY_CONFIG[article.category] || {
    label: article.category || 'General IT Help',
    shortLabel: article.category || 'General',
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(article.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  return (
    <PageContainer>
      {/* Top Breadcrumb Navigation & Action Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/knowledge"
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium flex items-center gap-1"
          >
            <span>&larr;</span>
            <span>Knowledge Base</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Link
            to={`/knowledge?category=${article.category}`}
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {categoryConfig.shortLabel}
          </Link>
        </nav>

        {/* Global Article Actions */}
        <div className="flex items-center gap-2">
          <BookmarkButton
            articleId={article._id}
            showLabel
            size="sm"
          />
          {staff && (
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setShowVersionHistory(true)}
              className="flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
            </Button>
          )}
          {canEdit && (
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setShowEditDrawer(true)}
              className="flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Staff Editorial Workflow Action Bar (If Staff) */}
      {staff && (
        <div className="mb-6 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Editorial Status:
            </span>
            <ArticleStatusBadge status={article.status} />
            {article.visibility && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • {article.visibility}
                {article.department?.name && ` (${article.department.name})`}
              </span>
            )}
            {article.version && (
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                • Rev {article.version}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Draft -> Publish */}
            {canTransitionArticle(article.status, 'PUBLISHED') && (
              <Button
                variant="primary"
                size="sm"
                loading={workflowActionLoading}
                onClick={handlePublish}
              >
                Publish Article
              </Button>
            )}

            {/* Published -> Archive */}
            {canTransitionArticle(article.status, 'ARCHIVED') && (
              <Button
                variant="warning"
                size="sm"
                loading={workflowActionLoading}
                onClick={handleArchive}
              >
                Archive
              </Button>
            )}

            {/* Published or Archived -> Unpublish (Draft) */}
            {canTransitionArticle(article.status, 'DRAFT') && (
              <Button
                variant="neutral"
                size="sm"
                loading={workflowActionLoading}
                onClick={handleUnpublish}
              >
                Unpublish to Draft
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Article Body + Table of Contents/Metadata Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Main Reading Column */}
        <main className="lg:col-span-3 space-y-6">
          <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-9 space-y-6 shadow-2xs">
            {/* Metadata Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                {categoryConfig.label}
              </span>

              {article.status !== ARTICLE_STATUSES.PUBLISHED && (
                <ArticleStatusBadge status={article.status} />
              )}

              {article.visibility === 'DEPARTMENT' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Restricted: {article.department?.name || 'Department'}
                </span>
              )}
              {article.visibility === 'INTERNAL' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Internal Staff Only
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {article.title}
            </h1>

            {/* Author Attribution & Live Metrics */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 pt-1 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-[10px]">
                  {(article.author?.name || 'IT').charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {article.author?.name || 'IT Support Team'}
                </span>
              </div>

              <span>•</span>
              <span>Updated on {formattedDate}</span>

              <span>•</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px]" title="Total views">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.viewCount || 0} views
              </span>

              <span>•</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium" title="Helpful votes">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                {article.helpfulCount || 0} found helpful
              </span>
            </div>

            {/* Executive Summary Callout */}
            {article.summary && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border-l-4 border-primary-500 text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-2xs">
                <span className="font-semibold block text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                  Summary & Quick Resolution
                </span>
                {article.summary}
              </div>
            )}

            {/* Full Markdown Documentation Body */}
            <div className="pt-2">
              <MarkdownRenderer content={article.content} />
            </div>

            {/* Related IT Assets (If linked) */}
            {article.relatedAssets && article.relatedAssets.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Referenced IT Hardware & Assets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {article.relatedAssets.map((asset) => (
                    <Link
                      key={asset._id}
                      to={`/assets/${asset._id}`}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs transition-colors shadow-2xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-primary-600 dark:text-primary-400 mr-2">
                          {asset.assetTag}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{asset.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase">{asset.status}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Article Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Tags:</span>
                {article.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Feedback Area */}
          <ArticleFeedback
            articleId={article._id}
            initialHelpful={article.helpfulCount || 0}
            initialNotHelpful={article.notHelpfulCount || 0}
          />
        </main>

        {/* Right Sidebar: Table of Contents & Article Metadata */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
          {/* Table of Contents (If headings exist in markdown) */}
          {tableOfContents.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                On This Page
              </h3>
              <nav className="space-y-1.5 text-xs">
                {tableOfContents.map((heading, hIdx) => (
                  <a
                    key={hIdx}
                    href={`#${heading.id}`}
                    className={`block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1 ${
                      heading.level === 1
                        ? 'font-semibold text-slate-800 dark:text-slate-200'
                        : heading.level === 2
                        ? 'pl-2'
                        : 'pl-4'
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Contextual Article Metadata */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3 text-xs">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Article Properties
            </h3>

            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 block mb-0.5">Category</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {categoryConfig.label}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Lifecycle Status</span>
                <ArticleStatusBadge status={article.status} size="xs" />
              </div>

              {article.version && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Revision</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    Version {article.version}
                  </span>
                </div>
              )}

              <div>
                <span className="text-slate-400 block mb-0.5">Target Audience</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {article.visibility === 'PUBLIC'
                    ? 'Public (All Users)'
                    : article.visibility === 'INTERNAL'
                    ? 'Internal Staff Only'
                    : `Department: ${article.department?.name || 'Department Restricted'}`}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Primary Author</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {article.author?.name || 'IT Support Team'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Edit Article Drawer */}
      {showEditDrawer && (
        <ArticleFormModal
          isOpen={showEditDrawer}
          onClose={() => setShowEditDrawer(false)}
          article={article}
          onSaved={(updated) => setArticle(updated)}
        />
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <ArticleVersionHistory
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          articleId={article._id}
          articleTitle={article.title}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Knowledge Article"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{article.title}"</span>? All revision history, feedbacks, and user bookmarks will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="neutral"
                onClick={() => setShowDeleteModal(false)}
                disabled={workflowActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={workflowActionLoading}
                onClick={handleDelete}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}

export default ArticleDetailPage
