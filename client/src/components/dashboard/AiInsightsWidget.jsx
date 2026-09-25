import React from 'react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'

export function AiInsightsWidget({
  tickets = [],
  className = '',
}) {
  // Find tickets with existing AI analysis recommendations
  const aiTickets = tickets.filter(
    (t) =>
      t.aiAnalysis &&
      (t.aiAnalysis.escalationRecommended ||
        t.aiAnalysis.riskLevel === 'CRITICAL' ||
        t.aiAnalysis.riskLevel === 'HIGH') &&
      t.status !== 'RESOLVED' &&
      t.status !== 'CLOSED'
  )

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              AI Copilot Escalations
            </h3>
            {aiTickets.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
                {aiTickets.length} flagged
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            Passive Insights
          </span>
        </div>

        {aiTickets.length === 0 ? (
          <EmptyState
            title="No AI escalations"
            description="The AI Copilot has not detected critical risk or escalation requirements in active tickets."
            className="py-6"
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {aiTickets.slice(0, 4).map((t) => {
              const risk = t.aiAnalysis?.riskLevel || 'MEDIUM'
              const riskVariant =
                risk === 'CRITICAL' ? 'danger' : risk === 'HIGH' ? 'warning' : 'info'

              return (
                <Link
                  key={t._id}
                  to={`/tickets/${t._id}`}
                  className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors no-underline group"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {t.ticketNumber}
                      </span>
                      <Badge variant={riskVariant} size="xs">
                        Risk: {risk}
                      </Badge>
                      {t.aiAnalysis?.escalationRecommended && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
                          Escalation Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {t.title}
                    </p>
                    {t.aiAnalysis?.escalationReason && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {t.aiAnalysis.escalationReason}
                      </p>
                    )}
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5 shrink-0 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AiInsightsWidget
