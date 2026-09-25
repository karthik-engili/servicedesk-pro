import React from 'react'
import { Link } from 'react-router-dom'

export function SlaOverviewWidget({
  slaCounts = { WITHIN_SLA: 0, APPROACHING: 0, BREACHED: 0, MET: 0 },
  title = 'SLA Compliance & Health',
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
      color: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      to: '/tickets?slaStatus=WITHIN_SLA',
    },
    {
      label: 'Approaching',
      count: APPROACHING,
      color: 'bg-amber-500',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      to: '/tickets?slaStatus=APPROACHING',
    },
    {
      label: 'Breached',
      count: BREACHED,
      color: 'bg-rose-500',
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      to: '/tickets?slaStatus=BREACHED',
    },
    {
      label: 'SLA Met',
      count: MET,
      color: 'bg-blue-500',
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
      to: '/tickets?slaStatus=MET',
    },
  ]

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {title}
            </h3>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              complianceRate >= 90
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : complianceRate >= 75
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            {totalEvaluated > 0 ? `${complianceRate}% Compliance` : 'No Active SLAs'}
          </span>
        </div>

        {/* Visual Compliance Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>
              {isEmployee ? 'My Tickets SLA Health' : 'Service Desk SLA Adherence'}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {compliantCount} of {totalEvaluated} compliant
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
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

        {/* SLA Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition-colors no-underline block group"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {item.count}
                </span>
                {totalEvaluated > 0 && (
                  <span className="text-[10px] text-slate-400">
                    {Math.round((item.count / totalEvaluated) * 100)}%
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SlaOverviewWidget
