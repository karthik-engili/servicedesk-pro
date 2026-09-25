import React from 'react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'

export function AttentionRequiredWidget({
  tickets = [],
  expiringWarranties = [],
  lostAssetsCount = 0,
  className = '',
}) {
  const items = []

  // Breached SLA tickets
  const breachedTickets = tickets.filter(
    (t) => t.slaStatus === 'BREACHED' && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  )
  breachedTickets.slice(0, 3).forEach((t) => {
    items.push({
      id: `breach-${t._id}`,
      type: 'SLA_BREACH',
      title: `SLA Breached: ${t.ticketNumber}`,
      subtitle: t.title,
      badgeText: 'BREACHED',
      badgeVariant: 'danger',
      to: `/tickets/${t._id}`,
      icon: (
        <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    })
  })

  // Approaching SLA tickets
  const approachingTickets = tickets.filter(
    (t) => t.slaStatus === 'APPROACHING' && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  )
  approachingTickets.slice(0, 2).forEach((t) => {
    items.push({
      id: `approach-${t._id}`,
      type: 'SLA_APPROACHING',
      title: `SLA Approaching: ${t.ticketNumber}`,
      subtitle: t.title,
      badgeText: 'APPROACHING',
      badgeVariant: 'warning',
      to: `/tickets/${t._id}`,
      icon: (
        <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    })
  })

  // Critical Priority Tickets not yet handled
  const criticalTickets = tickets.filter(
    (t) =>
      t.priority === 'CRITICAL' &&
      t.status !== 'RESOLVED' &&
      t.status !== 'CLOSED' &&
      !items.some((i) => i.to === `/tickets/${t._id}`)
  )
  criticalTickets.slice(0, 2).forEach((t) => {
    items.push({
      id: `critical-${t._id}`,
      type: 'CRITICAL_TICKET',
      title: `Critical Incident: ${t.ticketNumber}`,
      subtitle: t.title,
      badgeText: 'CRITICAL',
      badgeVariant: 'danger',
      to: `/tickets/${t._id}`,
      icon: (
        <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    })
  })

  // AI Escalation recommendations (only if present in dataset)
  const aiEscalations = tickets.filter(
    (t) =>
      t.aiAnalysis?.escalationRecommended &&
      t.status !== 'RESOLVED' &&
      t.status !== 'CLOSED' &&
      !items.some((i) => i.to === `/tickets/${t._id}`)
  )
  aiEscalations.slice(0, 2).forEach((t) => {
    items.push({
      id: `ai-${t._id}`,
      type: 'AI_ESCALATION',
      title: `AI Escalation: ${t.ticketNumber}`,
      subtitle: t.aiAnalysis?.escalationReason || t.title,
      badgeText: 'AI ESCALATE',
      badgeVariant: 'purple',
      to: `/tickets/${t._id}`,
      icon: (
        <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    })
  })

  // Lost Assets Alert
  if (lostAssetsCount > 0) {
    items.push({
      id: 'lost-assets',
      type: 'LOST_ASSETS',
      title: 'Lost Equipment Reported',
      subtitle: `${lostAssetsCount} asset${lostAssetsCount > 1 ? 's' : ''} currently marked LOST in inventory`,
      badgeText: 'ASSET ALERT',
      badgeVariant: 'danger',
      to: '/assets?status=LOST',
      icon: (
        <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    })
  }

  // Expiring Warranties (up to 2)
  if (expiringWarranties.length > 0) {
    items.push({
      id: 'expiring-warranties',
      type: 'WARRANTY_EXPIRING',
      title: 'Upcoming Warranty Expirations',
      subtitle: `${expiringWarranties.length} device${expiringWarranties.length > 1 ? 's' : ''} reach warranty end within 30 days`,
      badgeText: 'WARRANTY',
      badgeVariant: 'warning',
      to: '/assets',
      icon: (
        <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    })
  }

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Attention Required
            </h3>
            {items.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                {items.length} item{items.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Operational status normal"
            description="No active SLA breaches, critical incidents, or urgent asset alerts."
            className="py-6"
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors no-underline group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.title}
                    </span>
                    <Badge variant={item.badgeVariant} size="xs">
                      {item.badgeText}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {item.subtitle}
                  </p>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5 shrink-0 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AttentionRequiredWidget
