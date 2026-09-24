import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import articleService from '../../services/articleService'
import { ARTICLE_CATEGORY_CONFIG } from '../../constants/articles'
import Spinner from '../ui/Spinner'

export function RecommendedArticles({ ticketId, className = '' }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ticketId) return

    let isMounted = true
    const fetchRecommendations = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await articleService.getRecommendations(ticketId)
        if (isMounted) {
          setRecommendations(data || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load recommendations.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchRecommendations()
    return () => {
      isMounted = false
    }
  }, [ticketId])

  if (!ticketId) return null

  if (loading) {
    return (
      <div className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Spinner size="xs" />
          <span>Analyzing ticket category and symptoms for solutions...</span>
        </div>
      </div>
    )
  }

  if (error || recommendations.length === 0) {
    return null // Keep UI clean if no high-confidence recommendation matches
  }

  return (
    <div className={`p-4 rounded-xl border border-primary-200 dark:border-primary-900/60 bg-primary-50/30 dark:bg-primary-950/20 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Recommended Knowledge Solutions ({recommendations.length})
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Auto-matched
        </span>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((rec, idx) => {
          const art = rec.article || {}
          const catConfig = ARTICLE_CATEGORY_CONFIG[art.category] || { shortLabel: art.category || 'General' }
          const relevanceScore = Math.min(100, Math.max(10, Math.round(rec.score || 0)))

          return (
            <div
              key={art._id || idx}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/knowledge/${art._id || art.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1 flex-1"
                >
                  {art.title}
                </Link>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {catConfig.shortLabel}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      relevanceScore >= 60
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
                    }`}
                  >
                    {relevanceScore} pts
                  </span>
                </div>
              </div>

              {art.summary && (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {art.summary}
                </p>
              )}

              {rec.rankingReasons && rec.rankingReasons.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {rec.rankingReasons.map((reason, rIdx) => (
                    <span
                      key={rIdx}
                      className="text-[9px] text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded border border-primary-200/50 dark:border-primary-800/40"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecommendedArticles
