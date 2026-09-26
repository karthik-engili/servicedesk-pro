import React, { useState, useEffect } from 'react'
import {
  TICKET_STATUSES,
  STATUS_LABELS,
  TICKET_PRIORITIES,
  PRIORITY_LABELS,
  TICKET_CATEGORIES,
  CATEGORY_LABELS,
  SLA_STATUSES,
  SLA_LABELS,
} from '../../constants/tickets'
import { SearchIcon, CloseIcon } from '../ui/Icons'

export function TicketFilters({
  filters,
  onChange,
  onReset,
  departments = [],
  className = '',
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  // Keep local search in sync with prop
  useEffect(() => {
    setLocalSearch(filters.search || '')
  }, [filters.search])

  // Debounced search trigger (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        onChange({ ...filters, search: localSearch, page: 1 })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [localSearch, filters, onChange])

  const handleFilterChange = (key, value) => {
    onChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page
    })
  }

  // Quick preset views mapping
  const setQuickView = (preset) => {
    switch (preset) {
      case 'ALL':
        onChange({
          search: filters.search || '',
          page: 1,
        })
        break
      case 'OPEN':
        onChange({
          ...filters,
          status: 'OPEN',
          priority: '',
          slaStatus: '',
          page: 1,
        })
        break
      case 'IN_PROGRESS':
        onChange({
          ...filters,
          status: 'IN_PROGRESS',
          priority: '',
          slaStatus: '',
          page: 1,
        })
        break
      case 'CRITICAL':
        onChange({
          ...filters,
          priority: 'CRITICAL',
          page: 1,
        })
        break
      case 'SLA_RISK':
        onChange({
          ...filters,
          slaStatus: 'APPROACHING',
          page: 1,
        })
        break
      case 'SLA_BREACHED':
        onChange({
          ...filters,
          slaStatus: 'BREACHED',
          page: 1,
        })
        break
      default:
        break
    }
  }

  // Count active filters
  const activeCount = [
    filters.status,
    filters.priority,
    filters.category,
    filters.department,
    filters.slaStatus,
    filters.search,
  ].filter(Boolean).length

  const isQuickViewActive = (preset) => {
    if (preset === 'ALL') {
      return !filters.status && !filters.priority && !filters.slaStatus
    }
    if (preset === 'OPEN') return filters.status === 'OPEN'
    if (preset === 'IN_PROGRESS') return filters.status === 'IN_PROGRESS'
    if (preset === 'CRITICAL') return filters.priority === 'CRITICAL'
    if (preset === 'SLA_RISK') return filters.slaStatus === 'APPROACHING'
    if (preset === 'SLA_BREACHED') return filters.slaStatus === 'BREACHED'
    return false
  }

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Top Row: Search & Quick Views */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search tickets by ID, title, requester..."
            className="block w-full pl-9 pr-8 h-9 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all shadow-2xs"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Clear search"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick View Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none select-none">
          <button
            type="button"
            onClick={() => setQuickView('ALL')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              isQuickViewActive('ALL')
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Tickets
          </button>
          <button
            type="button"
            onClick={() => setQuickView('OPEN')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              isQuickViewActive('OPEN')
                ? 'bg-primary-600 text-white dark:bg-primary-600 dark:text-white font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Open Queue
          </button>
          <button
            type="button"
            onClick={() => setQuickView('IN_PROGRESS')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              isQuickViewActive('IN_PROGRESS')
                ? 'bg-amber-600 text-white dark:bg-amber-600 dark:text-white font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => setQuickView('CRITICAL')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              isQuickViewActive('CRITICAL')
                ? 'bg-rose-600 text-white dark:bg-rose-600 dark:text-white font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Critical
          </button>
          <button
            type="button"
            onClick={() => setQuickView('SLA_RISK')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              isQuickViewActive('SLA_RISK')
                ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            SLA Risk
          </button>

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 ml-auto shrink-0"
          >
            Filters {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Strip */}
      <div
        className={`${
          mobileOpen ? 'flex' : 'hidden'
        } sm:flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80`}
      >
        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="h-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
        >
          <option value="">Status: All</option>
          {TICKET_STATUSES.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABELS[st] || st}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="h-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
        >
          <option value="">Priority: All</option>
          {TICKET_PRIORITIES.map((pri) => (
            <option key={pri} value={pri}>
              {PRIORITY_LABELS[pri] || pri}
            </option>
          ))}
        </select>

        {/* Category */}
        <select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="h-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
        >
          <option value="">Category: All</option>
          {TICKET_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] || cat}
            </option>
          ))}
        </select>

        {/* SLA Status */}
        <select
          value={filters.slaStatus || ''}
          onChange={(e) => handleFilterChange('slaStatus', e.target.value)}
          className="h-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
        >
          <option value="">SLA: All</option>
          {SLA_STATUSES.map((sla) => (
            <option key={sla} value={sla}>
              {SLA_LABELS[sla] || sla}
            </option>
          ))}
        </select>

        {/* Department */}
        {departments.length > 0 && (
          <select
            value={filters.department || ''}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="h-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
          >
            <option value="">Department: All</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters Button */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors ml-auto select-none"
          >
            <CloseIcon className="w-3.5 h-3.5" />
            <span>Clear filters ({activeCount})</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default TicketFilters
