import React, { useState, useEffect } from 'react'
import {
  ASSET_STATUSES,
  STATUS_LABELS,
  ASSET_CATEGORIES,
  CATEGORY_LABELS,
} from '../../constants/assets'
import Button from '../ui/Button'

export function AssetFilters({
  filters,
  onChange,
  onReset,
  departments = [],
  vendors = [],
  className = '',
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.search || '')

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
      page: 1,
    })
  }

  const activeCount = [
    filters.status,
    filters.category,
    filters.department,
    filters.vendor,
    filters.search,
  ].filter(Boolean).length

  // Quick preset views
  const quickViews = [
    { label: 'All Assets', status: '' },
    { label: 'Available', status: 'AVAILABLE' },
    { label: 'Assigned', status: 'ASSIGNED' },
    { label: 'Under Repair', status: 'UNDER_REPAIR' },
    { label: 'Lost', status: 'LOST' },
  ]

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Search and Quick Preset Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by asset ID, device, model, serial number..."
            className="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 shadow-2xs transition-colors"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick View Presets (Desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
          {quickViews.map((qv) => {
            const isSelected = filters.status === qv.status
            return (
              <button
                key={qv.label}
                type="button"
                onClick={() => handleFilterChange('status', qv.status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                {qv.label}
              </button>
            )
          })}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border cursor-pointer ${
              activeCount > 0
                ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800 font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
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

      {/* Filter Dropdowns Toolbar */}
      <div
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } sm:flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0`}
      >
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">
          Filters:
        </span>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium cursor-pointer shadow-2xs"
        >
          <option value="">Status: Any</option>
          {ASSET_STATUSES.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABELS[st] || st}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium cursor-pointer shadow-2xs"
        >
          <option value="">Category: Any</option>
          {ASSET_CATEGORIES.map((cat) => (
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
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium cursor-pointer shadow-2xs"
          >
            <option value="">Department: Any</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        )}

        {/* Vendor Filter */}
        {vendors.length > 0 && (
          <select
            value={filters.vendor || ''}
            onChange={(e) => handleFilterChange('vendor', e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium cursor-pointer shadow-2xs"
          >
            <option value="">Vendor: Any</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters Button */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
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

export default AssetFilters
