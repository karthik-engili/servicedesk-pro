import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import { Spinner, Button, Modal, ErrorState } from '../../components/ui'
import {
  ArticleStatusBadge,
  BookmarkButton,
  ArticleFeedback,
  ArticleVersionHistory,
  ArticleFormModal,
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
  const [showEditModal, setShowEditModal] = useState(false)
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
          <p className="text-xs text-slate-500">Loading knowledge article...</p>
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
            actionLabel="Back to Knowledge Base"
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/knowledge"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Knowledge Base
          </Link>

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
              >
                <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </Button>
            )}
            {canEdit && (
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
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

        {/* Staff Workflow Lifecycle Action Bar (If staff) */}
        {staff && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Current Status:
              </span>
              <ArticleStatusBadge status={article.status} />
              {article.visibility && (
                <span className="text-xs text-slate-500">
                  • {article.visibility}
                  {article.department?.name && ` (${article.department.name})`}
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

        {/* Article Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              {categoryConfig.label}
            </span>

            {article.status !== ARTICLE_STATUSES.PUBLISHED && (
              <ArticleStatusBadge status={article.status} />
            )}

            {article.visibility === 'DEPARTMENT' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Department Restricted: {article.department?.name || 'Department'}
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

          {/* Author & Metrics Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 pt-1 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                {(article.author?.name || 'IT').charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {article.author?.name || 'IT Support Team'}
              </span>
            </div>

            <span>•</span>
            <span>Published on {formattedDate}</span>

            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.viewCount || 0} views
            </span>

            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              {article.helpfulCount || 0} helpful
            </span>
          </div>

          {/* Summary / Executive Abstract */}
          {article.summary && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-l-4 border-primary-500 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold block text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                Summary & Quick Resolution
              </span>
              {article.summary}
            </div>
          )}

          {/* Article Main Content (Documentation-style typography) */}
          <div className="pt-2">
            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {article.content}
            </div>
          </div>

          {/* Related Assets (If linked) */}
          {article.relatedAssets && article.relatedAssets.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Related IT Assets & Hardware
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {article.relatedAssets.map((asset) => (
                  <Link
                    key={asset._id}
                    to={`/assets/${asset._id}`}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary-400 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-primary-600 dark:text-primary-400 mr-2">
                        {asset.assetTag}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">{asset.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">{asset.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
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
        </div>

        {/* Feedback Section */}
        <ArticleFeedback
          articleId={article._id}
          initialHelpful={article.helpfulCount || 0}
          initialNotHelpful={article.notHelpfulCount || 0}
        />
      </div>

      {/* Edit Article Modal */}
      {showEditModal && (
        <ArticleFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
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
