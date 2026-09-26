import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
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
    <Card variant="bordered" className={`flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Knowledge Base
          </h2>
        </div>
        <Link
          to="/knowledge"
          className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1 select-none"
        >
          <span>Browse articles</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Quick metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Published
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
              {published}
            </div>
          </div>
          {isStaff ? (
            <div className="p-2.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Draft Articles
              </span>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                {drafts}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Helpful Solutions
              </span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {mostHelpful.length}
              </div>
            </div>
          )}
        </div>

        {/* Most Viewed List */}
        <div>
          <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
            Top Articles
          </span>
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
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 -mx-1.5 px-1.5 rounded transition-colors no-underline group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {art.title}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize block mt-0.5">
                      {art.category?.toLowerCase() || 'general'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                    {art.viewCount || 0} views
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default KnowledgeOverviewWidget
