import React, { useState, useEffect } from 'react'
import {
  TICKET_STATUSES,
  STATUS_LABELS,
  TICKET_PRIORITIES,
  PRIORITY_LABELS,
  TICKET_CATEGORIES,
  CATEGORY_LABELS,
} from '../../constants/tickets'
import Button from '../ui/Button'

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
      page: 1, // Reset to first page whenever filter changes
    })
  }

  // Count active non-default filters
  const activeCount = [
    filters.status,
    filters.priority,
    filters.category,
    filters.department,
    filters.search,
  ].filter(Boolean).length

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search and Mobile Toggle Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search tickets by title or number (e.g. SD-101)..."
            className="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border cursor-pointer ${
              activeCount > 0
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters {activeCount > 0 && `(${activeCount})`}</span>
          </button>

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns (Desktop visible, Mobile toggleable) */}
      <div
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } sm:flex flex-wrap items-center gap-2.5 pt-1 sm:pt-0`}
      >
        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
        >
          <option value="">All Statuses</option>
          {TICKET_STATUSES.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABELS[st] || st}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
        >
          <option value="">All Priorities</option>
          {TICKET_PRIORITIES.map((pri) => (
            <option key={pri} value={pri}>
              {PRIORITY_LABELS[pri] || pri}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
        >
          <option value="">All Categories</option>
          {TICKET_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] || cat}
            </option>
          ))}
        </select>

        {/* Department Filter */}
        {departments.length > 0 && (
          <select
            value={filters.department || ''}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="">All Departments</option>
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
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 cursor-pointer transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters ({activeCount})
          </button>
        )}
      </div>
    </div>
  )
}

export default TicketFilters
