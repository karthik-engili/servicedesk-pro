import React from 'react'
import { Link } from 'react-router-dom'
import { ARTICLE_CATEGORY_CONFIG, ARTICLE_STATUSES } from '../../constants/articles'
import ArticleStatusBadge from './ArticleStatusBadge'
import BookmarkButton from './BookmarkButton'

export function ArticleCard({
  article,
  showStatus = false,
  isBookmarked = false,
  onBookmarkToggle,
  className = '',
}) {
  if (!article) return null

  const categoryConfig = ARTICLE_CATEGORY_CONFIG[article.category] || {
    shortLabel: article.category || 'General',
  }

  const publishedDate = article.publishedAt || article.createdAt
  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Draft'

  const authorName = article.author?.name || 'IT Support'

  return (
    <div
      className={`group relative p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary-400 dark:hover:border-primary-600 transition-all hover:shadow-sm flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Header: Category, Status, Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {categoryConfig.shortLabel}
            </span>

            {(showStatus || article.status !== ARTICLE_STATUSES.PUBLISHED) && (
              <ArticleStatusBadge status={article.status} size="xs" />
            )}

            {article.visibility === 'DEPARTMENT' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {article.department?.name ? `${article.department.name} only` : 'Dept Restricted'}
              </span>
            )}
            {article.visibility === 'INTERNAL' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Staff Only
              </span>
            )}
          </div>

          <BookmarkButton
            articleId={article._id}
            initialBookmarked={isBookmarked}
            onToggle={onBookmarkToggle}
            size="sm"
          />
        </div>

        {/* Title */}
        <Link
          to={`/knowledge/${article._id || article.slug}`}
          className="block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
        >
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
            {article.title}
          </h3>
        </Link>

        {/* Summary */}
        {article.summary && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {article.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-[10px] text-slate-400">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Metadata */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="truncate">{authorName}</span>
          <span>•</span>
          <span className="shrink-0">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Views */}
          <span className="inline-flex items-center gap-1" title="Views">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{article.viewCount || 0}</span>
          </span>

          {/* Helpful count */}
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium" title="Helpful votes">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{article.helpfulCount || 0}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default ArticleCard
