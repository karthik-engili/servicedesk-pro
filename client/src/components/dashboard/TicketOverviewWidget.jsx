import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
} from '../../constants/tickets'

export function TicketOverviewWidget({
  total = 0,
  statusCounts = {},
  priorityCounts = {},
  categoryCounts = {},
  title = 'Ticket Operations Overview',
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('status') // 'status' | 'priority' | 'category'

  // Colors mapping for status
  const statusColors = {
    OPEN: 'bg-blue-500',
    ASSIGNED: 'bg-purple-500',
    IN_PROGRESS: 'bg-amber-500',
    RESOLVED: 'bg-emerald-500',
    CLOSED: 'bg-slate-400',
    REOPENED: 'bg-rose-500',
  }

  // Colors mapping for priority
  const priorityColors = {
    CRITICAL: 'bg-rose-600',
    HIGH: 'bg-amber-500',
    MEDIUM: 'bg-blue-500',
    LOW: 'bg-slate-400',
  }

  // Colors mapping for category
  const categoryColors = {
    HARDWARE: 'bg-indigo-500',
    SOFTWARE: 'bg-emerald-500',
    NETWORK: 'bg-cyan-500',
    ACCESS: 'bg-purple-500',
    GENERAL: 'bg-slate-500',
  }

  const renderDistribution = () => {
    let items = []
    let filterKey = 'status'
    let colorMap = statusColors
    let labelMap = STATUS_LABELS

    if (activeTab === 'priority') {
      filterKey = 'priority'
      colorMap = priorityColors
      labelMap = PRIORITY_LABELS
      items = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((key) => ({
        key,
        label: labelMap[key] || key,
        count: priorityCounts[key] || 0,
        color: colorMap[key] || 'bg-slate-400',
      }))
    } else if (activeTab === 'category') {
      filterKey = 'category'
      colorMap = categoryColors
      labelMap = CATEGORY_LABELS
      items = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'GENERAL'].map((key) => ({
        key,
        label: labelMap[key] || key,
        count: categoryCounts[key] || 0,
        color: colorMap[key] || 'bg-slate-400',
      }))
    } else {
      filterKey = 'status'
      colorMap = statusColors
      labelMap = STATUS_LABELS
      items = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((key) => ({
        key,
        label: labelMap[key] || key,
        count: statusCounts[key] || 0,
        color: colorMap[key] || 'bg-slate-400',
      }))
    }

    const itemsWithValues = items.filter((i) => i.count > 0 || total === 0)

    return (
      <div className="space-y-3.5">
        {/* Compact stacked bar */}
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {total > 0 ? (
            items.map((item) => {
              if (item.count === 0) return null
              const pct = (item.count / total) * 100
              return (
                <div
                  key={item.key}
                  className={`${item.color} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${item.count} (${Math.round(pct)}%)`}
                />
              )
            })
          ) : (
            <div className="bg-slate-200 dark:bg-slate-700 w-full" />
          )}
        </div>

        {/* Legend / clickable breakdown grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <Link
                key={item.key}
                to={`/tickets?${filterKey}=${item.key}`}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition-colors no-underline block group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {pct}%
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {title}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              ({total} active/recent)
            </span>
          </div>

          {/* Dimension Selector Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'status'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-3xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Status
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('priority')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'priority'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-3xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Priority
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('category')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'category'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-3xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Category
            </button>
          </div>
        </div>

        {renderDistribution()}
      </div>
    </div>
  )
}

export default TicketOverviewWidget
