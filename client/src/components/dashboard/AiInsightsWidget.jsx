import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'

export function AiInsightsWidget({
  tickets = [],
  className = '',
}) {
  // Extract real tickets with AI risk detection or escalation recommendations
  const aiTickets = tickets.filter(
    (t) =>
      t.aiAnalysis &&
      (t.aiAnalysis.escalationRecommended ||
        t.aiAnalysis.riskLevel === 'CRITICAL' ||
        t.aiAnalysis.riskLevel === 'HIGH') &&
      t.status !== 'RESOLVED' &&
      t.status !== 'CLOSED'
  )

  const criticalRiskCount = aiTickets.filter(
    (t) => t.aiAnalysis?.riskLevel === 'CRITICAL'
  ).length

  return (
    <Card variant="bordered" className={`flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            AI Operational Insights
          </h2>
          {aiTickets.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-mono">
              {aiTickets.length} flagged
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {criticalRiskCount > 0 ? `${criticalRiskCount} Critical Risk` : 'Heuristic & LLM Guard'}
        </span>
      </div>

      {/* Content */}
      <div className="p-0">
        {aiTickets.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No critical AI risks detected"
              description="The AI Ticket Copilot has evaluated active incidents and found no urgent escalation triggers."
              className="py-6"
            />
          </div>
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
                  className="px-4 sm:px-5 py-2.5 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors no-underline group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {t.ticketNumber}
                      </span>
                      <Badge variant={riskVariant} size="xs">
                        Risk: {risk}
                      </Badge>
                      {t.aiAnalysis?.escalationRecommended && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          Escalation Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {t.title}
                    </p>
                    {t.aiAnalysis?.escalationReason && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {t.aiAnalysis.escalationReason}
                      </p>
                    )}
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all shrink-0 self-center"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

export default AiInsightsWidget
