import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import { PRIORITY_BADGE_VARIANTS } from '../../constants/tickets'

export function AttentionRequiredWidget({
  tickets = [],
  expiringWarranties = [],
  lostAssetsCount = 0,
  className = '',
}) {
  const items = []

  // 1. Breached SLA Tickets (Highest urgency)
  const breachedTickets = tickets.filter(
    (t) => t.slaStatus === 'BREACHED' && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  )
  breachedTickets.slice(0, 3).forEach((t) => {
    items.push({
      id: `breach-${t._id}`,
      ticketId: t._id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      priority: t.priority,
      slaStatus: 'BREACHED',
      badgeText: 'SLA BREACHED',
      badgeVariant: 'danger',
      assignee: t.assignedTo?.name || 'Unassigned',
      to: `/tickets/${t._id}`,
      type: 'TICKET',
    })
  })

  // 2. Approaching SLA Tickets (High urgency)
  const approachingTickets = tickets.filter(
    (t) => t.slaStatus === 'APPROACHING' && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  )
  approachingTickets.slice(0, 3).forEach((t) => {
    if (!items.some((i) => i.ticketId === t._id)) {
      items.push({
        id: `approach-${t._id}`,
        ticketId: t._id,
        ticketNumber: t.ticketNumber,
        title: t.title,
        priority: t.priority,
        slaStatus: 'APPROACHING',
        badgeText: 'SLA RISK',
        badgeVariant: 'warning',
        assignee: t.assignedTo?.name || 'Unassigned',
        to: `/tickets/${t._id}`,
        type: 'TICKET',
      })
    }
  })

  // 3. Unassigned Critical or High Tickets
  const unassignedTickets = tickets.filter(
    (t) =>
      !t.assignedTo &&
      (t.priority === 'CRITICAL' || t.priority === 'HIGH') &&
      t.status !== 'RESOLVED' &&
      t.status !== 'CLOSED' &&
      !items.some((i) => i.ticketId === t._id)
  )
  unassignedTickets.slice(0, 2).forEach((t) => {
    items.push({
      id: `unassigned-${t._id}`,
      ticketId: t._id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      priority: t.priority,
      badgeText: 'UNASSIGNED',
      badgeVariant: 'warning',
      assignee: 'Needs Assignment',
      to: `/tickets/${t._id}`,
      type: 'TICKET',
    })
  })

  // 4. Critical Priority Tickets not yet included
  const criticalTickets = tickets.filter(
    (t) =>
      t.priority === 'CRITICAL' &&
      t.status !== 'RESOLVED' &&
      t.status !== 'CLOSED' &&
      !items.some((i) => i.ticketId === t._id)
  )
  criticalTickets.slice(0, 2).forEach((t) => {
    items.push({
      id: `critical-${t._id}`,
      ticketId: t._id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      priority: t.priority,
      badgeText: 'P1 CRITICAL',
      badgeVariant: 'danger',
      assignee: t.assignedTo?.name || 'Unassigned',
      to: `/tickets/${t._id}`,
      type: 'TICKET',
    })
  })

  // 5. AI Escalation Recommendations
  const aiEscalations = tickets.filter(
    (t) =>
      t.aiAnalysis?.escalationRecommended &&
      t.status !== 'RESOLVED' &&
      t.status !== 'CLOSED' &&
      !items.some((i) => i.ticketId === t._id)
  )
  aiEscalations.slice(0, 2).forEach((t) => {
    items.push({
      id: `ai-${t._id}`,
      ticketId: t._id,
      ticketNumber: t.ticketNumber,
      title: t.aiAnalysis?.escalationReason || t.title,
      priority: t.priority,
      badgeText: 'AI ESCALATE',
      badgeVariant: 'purple',
      assignee: t.assignedTo?.name || 'Unassigned',
      to: `/tickets/${t._id}`,
      type: 'TICKET',
    })
  })

  // 6. Lost Assets Alert
  if (lostAssetsCount > 0) {
    items.push({
      id: 'lost-assets',
      ticketNumber: 'CMDB',
      title: `${lostAssetsCount} asset${lostAssetsCount > 1 ? 's' : ''} currently flagged as LOST in inventory`,
      badgeText: 'LOST ASSETS',
      badgeVariant: 'danger',
      assignee: 'Hardware Security',
      to: '/assets?status=LOST',
      type: 'ASSET',
    })
  }

  // 7. Expiring Warranties
  if (expiringWarranties.length > 0) {
    items.push({
      id: 'expiring-warranties',
      ticketNumber: 'WARRANTY',
      title: `${expiringWarranties.length} hardware device${
        expiringWarranties.length > 1 ? 's' : ''
      } expire within 30 days`,
      badgeText: 'RENEWAL DUE',
      badgeVariant: 'warning',
      assignee: 'Vendor Support',
      to: '/assets',
      type: 'ASSET',
    })
  }

  return (
    <Card variant="bordered" className={`flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Attention Required
          </h2>
          {items.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono">
              {items.length}
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
          Immediate incident & SLA priorities
        </span>
      </div>

      {/* Content */}
      <div className="p-0">
        {items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="All systems normal"
              description="No tickets currently breached, approaching SLA risk, or pending critical triage."
              className="py-4"
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.slice(0, 5).map((item) => {
              const priorityVariant = item.priority
                ? PRIORITY_BADGE_VARIANTS[item.priority] || 'neutral'
                : 'neutral'

              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors no-underline group"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.ticketNumber}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        <span>Assignee: {item.assignee}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.priority && (
                      <Badge variant={priorityVariant} size="xs" className="hidden sm:inline-flex">
                        {item.priority}
                      </Badge>
                    )}
                    <Badge variant={item.badgeVariant} size="xs">
                      {item.badgeText}
                    </Badge>
                    <svg
                      className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

export default AttentionRequiredWidget
