import React from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../ui/EmptyState'

export function KnowledgeOverviewWidget({
  summary = {},
  isStaff = false,
  className = '',
}) {
  const published = summary.published || 0
  const drafts = summary.drafts || 0
  const mostViewed = summary.mostViewed || []
  const mostHelpful = summary.mostHelpful || []

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Knowledge Base
            </h3>
          </div>
          <Link
            to="/knowledge"
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1"
          >
            <span>Browse KB</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Published
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {published}
            </div>
          </div>
          {isStaff ? (
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Drafts
              </span>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {drafts}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Helpful Articles
              </span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {mostHelpful.length}
              </div>
            </div>
          )}
        </div>

        {/* Popular Articles Preview */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Top Articles
          </div>
          {mostViewed.length === 0 ? (
            <EmptyState
              title="No articles yet"
              description="Published solutions will be featured here."
              className="py-4"
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {mostViewed.slice(0, 3).map((art) => (
                <Link
                  key={art._id || art.slug}
                  to={`/knowledge/${art.slug || art._id}`}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors no-underline group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {art.title}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                      {art.category?.toLowerCase() || 'general'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{art.viewCount || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KnowledgeOverviewWidget
