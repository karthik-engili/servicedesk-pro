import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
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
  title = 'Ticket Operations',
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('status') // 'status' | 'priority' | 'category'

  // Semantic color mappings
  const statusColors = {
    OPEN: 'bg-slate-400 dark:bg-slate-500',
    ASSIGNED: 'bg-blue-500 dark:bg-blue-400',
    IN_PROGRESS: 'bg-amber-500 dark:bg-amber-400',
    RESOLVED: 'bg-emerald-500 dark:bg-emerald-400',
    CLOSED: 'bg-slate-500 dark:bg-slate-600',
    REOPENED: 'bg-rose-500 dark:bg-rose-400',
  }

  const priorityColors = {
    CRITICAL: 'bg-rose-600 dark:bg-rose-500',
    HIGH: 'bg-amber-500 dark:bg-amber-400',
    MEDIUM: 'bg-blue-500 dark:bg-blue-400',
    LOW: 'bg-slate-400 dark:bg-slate-500',
  }

  const categoryColors = {
    HARDWARE: 'bg-indigo-500 dark:bg-indigo-400',
    SOFTWARE: 'bg-emerald-500 dark:bg-emerald-400',
    NETWORK: 'bg-cyan-500 dark:bg-cyan-400',
    ACCESS: 'bg-purple-500 dark:bg-purple-400',
    GENERAL: 'bg-slate-500 dark:bg-slate-400',
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

    return (
      <div className="space-y-4">
        {/* CSS-based Segmented Progress Bar */}
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
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

        {/* Breakdown Items List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <Link
                key={item.key}
                to={`/tickets?${filterKey}=${item.key}`}
                className="p-2.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-colors no-underline block group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
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
    <Card variant="bordered" className={`flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header with Dimension Switcher */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {title}
          </h2>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            ({total} total)
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex items-center p-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              activeTab === 'status'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('priority')}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              activeTab === 'priority'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Priority
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              activeTab === 'category'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Category
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {renderDistribution()}
      </div>
    </Card>
  )
}

export default TicketOverviewWidget
