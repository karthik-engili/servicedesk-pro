import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

export function SlaOverviewWidget({
  slaCounts = { WITHIN_SLA: 0, APPROACHING: 0, BREACHED: 0, MET: 0 },
  title = 'SLA Health',
  isEmployee = false,
  className = '',
}) {
  const {
    WITHIN_SLA = 0,
    APPROACHING = 0,
    BREACHED = 0,
    MET = 0,
  } = slaCounts

  const totalEvaluated = WITHIN_SLA + APPROACHING + BREACHED + MET
  const compliantCount = WITHIN_SLA + MET
  const complianceRate = totalEvaluated > 0 ? Math.round((compliantCount / totalEvaluated) * 100) : 100

  const items = [
    {
      label: 'Within SLA',
      count: WITHIN_SLA,
      color: 'bg-emerald-500 dark:bg-emerald-400',
      badgeVariant: 'success',
      to: '/tickets?slaStatus=WITHIN_SLA',
    },
    {
      label: 'Approaching',
      count: APPROACHING,
      color: 'bg-amber-500 dark:bg-amber-400',
      badgeVariant: 'warning',
      to: '/tickets?slaStatus=APPROACHING',
    },
    {
      label: 'Breached',
      count: BREACHED,
      color: 'bg-rose-500 dark:bg-rose-400',
      badgeVariant: 'danger',
      to: '/tickets?slaStatus=BREACHED',
    },
    {
      label: 'SLA Met',
      count: MET,
      color: 'bg-blue-500 dark:bg-blue-400',
      badgeVariant: 'info',
      to: '/tickets?slaStatus=MET',
    },
  ]

  const healthBadgeVariant =
    complianceRate >= 90 ? 'success' : complianceRate >= 75 ? 'warning' : 'danger'

  return (
    <Card variant="bordered" className={`flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {title}
          </h2>
        </div>
        <Badge variant={healthBadgeVariant} size="xs" className="font-mono">
          {totalEvaluated > 0 ? `${complianceRate}% Compliance` : 'No Active SLAs'}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Compliance Headline & Segmented Bar */}
        <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {complianceRate}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                {isEmployee ? 'My Tickets within SLA' : 'Service Desk Compliance Rate'}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {compliantCount} / {totalEvaluated} compliant
            </span>
          </div>

          {/* Segmented bar */}
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
            {totalEvaluated > 0 ? (
              <>
                <div
                  className="bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(WITHIN_SLA / totalEvaluated) * 100}%` }}
                  title={`Within SLA: ${WITHIN_SLA}`}
                />
                <div
                  className="bg-blue-500 transition-all duration-300"
                  style={{ width: `${(MET / totalEvaluated) * 100}%` }}
                  title={`SLA Met: ${MET}`}
                />
                <div
                  className="bg-amber-500 transition-all duration-300"
                  style={{ width: `${(APPROACHING / totalEvaluated) * 100}%` }}
                  title={`Approaching Breach: ${APPROACHING}`}
                />
                <div
                  className="bg-rose-500 transition-all duration-300"
                  style={{ width: `${(BREACHED / totalEvaluated) * 100}%` }}
                  title={`Breached: ${BREACHED}`}
                />
              </>
            ) : (
              <div className="bg-slate-300 dark:bg-slate-700 w-full" />
            )}
          </div>
        </div>

        {/* 4-Item Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="p-2.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-colors no-underline block group"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {item.count}
                </span>
                {totalEvaluated > 0 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {Math.round((item.count / totalEvaluated) * 100)}%
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default SlaOverviewWidget
