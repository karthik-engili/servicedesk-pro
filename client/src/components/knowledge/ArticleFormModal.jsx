import React, { useState, useEffect } from 'react'
import { Drawer, Button, Input } from '../ui'
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_CONFIG, ARTICLE_VISIBILITIES } from '../../constants/articles'
import articleService from '../../services/articleService'
import assetService from '../../services/assetService'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import MarkdownRenderer from './MarkdownRenderer'

export function ArticleFormModal({
  isOpen,
  onClose,
  article = null, // null for create, object for edit
  onSaved,
}) {
  const isEdit = Boolean(article && article._id)

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [visibility, setVisibility] = useState('PUBLIC')
  const [department, setDepartment] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [relatedAssets, setRelatedAssets] = useState([])
  const [changeNote, setChangeNote] = useState('')
  const [editorTab, setEditorTab] = useState('write') // 'write' | 'preview'

  const [departments, setDepartments] = useState([])
  const [availableAssets, setAvailableAssets] = useState([])
  const [loadingLookups, setLoadingLookups] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const { showSuccess, showError } = useToast()

  // Load departments and assets
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const fetchLookups = async () => {
      setLoadingLookups(true)
      try {
        const [deptRes, assetsData] = await Promise.all([
          api.get('/departments').catch(() => ({ data: { data: { departments: [] } } })),
          assetService.getAssets({ limit: 100 }).catch(() => ({ assets: [] })),
        ])

        if (isMounted) {
          const depts = deptRes.data?.data?.departments || []
          setDepartments(depts.filter((d) => d.status === 'active'))
          setAvailableAssets(assetsData.assets || [])
        }
      } catch (err) {
        console.error('Failed to load lookup data for article form', err)
      } finally {
        if (isMounted) setLoadingLookups(false)
      }
    }

    fetchLookups()
    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Populate form if editing
  useEffect(() => {
    if (article) {
      setTitle(article.title || '')
      setSummary(article.summary || '')
      setContent(article.content || '')
      setCategory(article.category || 'GENERAL')
      setVisibility(article.visibility || 'PUBLIC')
      setDepartment(article.department?._id || article.department || '')
      setTagsInput(Array.isArray(article.tags) ? article.tags.join(', ') : '')
      setRelatedAssets(
        Array.isArray(article.relatedAssets)
          ? article.relatedAssets.map((a) => (a._id ? a._id : a))
          : []
      )
      setChangeNote('')
    } else {
      setTitle('')
      setSummary('')
      setContent('')
      setCategory('GENERAL')
      setVisibility('PUBLIC')
      setDepartment('')
      setTagsInput('')
      setRelatedAssets([])
      setChangeNote('')
    }
    setEditorTab('write')
    setErrors({})
  }, [article, isOpen])

  const validate = () => {
    const errs = {}
    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.'
    } else if (title.trim().length > 200) {
      errs.title = 'Title cannot exceed 200 characters.'
    }

    if (!content.trim() || content.trim().length < 10) {
      errs.content = 'Content must be at least 10 characters long.'
    }

    if (summary && summary.trim().length > 500) {
      errs.summary = 'Summary cannot exceed 500 characters.'
    }

    if (visibility === 'DEPARTMENT' && !department) {
      errs.department = 'Department is required for department-restricted articles.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)

      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
        visibility,
        department: visibility === 'DEPARTMENT' && department ? department : null,
        tags: parsedTags,
        relatedAssets,
      }

      if (isEdit) {
        if (changeNote.trim()) {
          payload.changeNote = changeNote.trim()
        }
        const updated = await articleService.updateArticle(article._id, payload)
        showSuccess('Article updated successfully. A new revision has been recorded.')
        if (onSaved) onSaved(updated)
      } else {
        const created = await articleService.createArticle(payload)
        showSuccess('Knowledge article created as draft.')
        if (onSaved) onSaved(created)
      }
      onClose()
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {}
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message
        })
        setErrors(fieldErrors)
      } else {
        showError(err.response?.data?.message || 'Failed to save knowledge base article.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAssetLink = (assetId) => {
    if (relatedAssets.includes(assetId)) {
      setRelatedAssets(relatedAssets.filter((id) => id !== assetId))
    } else {
      setRelatedAssets([...relatedAssets, assetId])
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Article: ${article?.title}` : 'Author Knowledge Base Article'}
      description={
        isEdit
          ? 'Update technical steps and troubleshooting instructions. Changes record a new revision.'
          : 'Write self-service documentation or standard operating procedures for the enterprise.'
      }
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={submitting}
            onClick={handleSubmit}
          >
            {isEdit ? 'Save Revision' : 'Create Draft Article'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Article Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How to Configure Corporate VPN on Windows & macOS"
            disabled={submitting}
            required
            className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-[11px] text-rose-500">{errors.title}</p>
          )}
        </div>

        {/* Category & Visibility Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              {ARTICLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {ARTICLE_CATEGORY_CONFIG[cat]?.label || cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Audience / Visibility <span className="text-rose-500">*</span>
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              disabled={submitting}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              <option value="PUBLIC">Public (All Employees & Staff)</option>
              <option value="INTERNAL">Internal (IT Staff Only)</option>
              <option value="DEPARTMENT">Department Restricted</option>
            </select>
          </div>
        </div>

        {/* Department (If Department-Restricted) */}
        {visibility === 'DEPARTMENT' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={submitting || loadingLookups}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              <option value="">Select target department...</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.department}</p>
            )}
          </div>
        )}

        {/* Executive Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Executive Summary / Quick Resolution
          </label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A concise synopsis or 1-2 sentence solution shown on search result tiles..."
            disabled={submitting}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {errors.summary && (
            <p className="mt-1 text-[11px] text-rose-500">{errors.summary}</p>
          )}
        </div>

        {/* Content with Write / Preview Tabs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Documentation Content & Steps <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setEditorTab('write')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  editorTab === 'write'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Write (Markdown)
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('preview')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  editorTab === 'preview'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Live Preview
              </button>
            </div>
          </div>

          {editorTab === 'write' ? (
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`# Overview\nProvide context on the issue.\n\n## Step 1: Open the Application\nExplain the procedure...\n\n\`\`\`bash\nsudo systemctl restart openvpn\n\`\`\`\n\n## Troubleshooting\nIf you receive Error 403, verify gateway.`}
              disabled={submitting}
              className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 leading-relaxed"
              required
            />
          ) : (
            <div className="min-h-[240px] p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-y-auto">
              {content.trim() ? (
                <MarkdownRenderer content={content} />
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Nothing to preview. Switch to Write to add documentation.
                </span>
              )}
            </div>
          )}
          {errors.content && (
            <p className="mt-1 text-[11px] text-rose-500">{errors.content}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Search Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="vpn, macos, cisco, anyconnect, remote-access"
            disabled={submitting}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Related Assets (Optional) */}
        {availableAssets.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link Relevant IT Assets (Optional)
            </label>
            <div className="max-h-28 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1 bg-slate-50 dark:bg-slate-900/40">
              {availableAssets.slice(0, 15).map((ast) => {
                const checked = relatedAssets.includes(ast._id)
                return (
                  <label
                    key={ast._id}
                    className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-white dark:hover:bg-slate-800 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAssetLink(ast._id)}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="font-mono font-medium text-primary-600 dark:text-primary-400">
                      {ast.assetTag}
                    </span>
                    <span className="truncate">{ast.name}</span>
                    <span className="text-[10px] text-slate-400">({ast.category})</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Revision Note (Only when editing) */}
        {isEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Revision / Change Note (Optional)
            </label>
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="e.g. Updated VPN gateway addresses and credentials instructions"
              disabled={submitting}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        )}
      </form>
    </Drawer>
  )
}

export default ArticleFormModal
