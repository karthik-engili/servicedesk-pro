import React, { useState, useEffect } from 'react'
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_CONFIG, ARTICLE_STATUSES } from '../../constants/articles'
import { isStaff } from '../../constants/roles'
import api from '../../services/api'

export function ArticleFilters({
  filters,
  onChange,
  onReset,
  user,
  className = '',
}) {
  const staff = isStaff(user)
  const [departments, setDepartments] = useState([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments')
        const deptList = res.data?.data?.departments || []
        if (isMounted) setDepartments(deptList)
      } catch (err) {
        console.error('Failed to load departments for knowledge filters', err)
      }
    }
    fetchDepartments()
    return () => {
      isMounted = false
    }
  }, [])

  const handleCategorySelect = (category) => {
    onChange({
      ...filters,
      category: filters.category === category ? '' : category,
      page: 1,
    })
  }

  const handleFieldChange = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
      page: 1,
    })
  }

  const activeFiltersCount = [
    filters.category,
    staff && filters.status,
    staff && filters.visibility,
    filters.department,
    filters.tag,
  ].filter(Boolean).length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Pills Bar (Horizontal scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => handleCategorySelect('')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            !filters.category
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300'
          }`}
        >
          All Categories
        </button>

        {ARTICLE_CATEGORIES.map((cat) => {
          const config = ARTICLE_CATEGORY_CONFIG[cat] || { shortLabel: cat }
          const isSelected = filters.category === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-primary-600 text-white dark:bg-primary-500 shadow-xs ring-2 ring-primary-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {config.shortLabel}
            </button>
          )
        })}
      </div>

      {/* Filter Row: Mobile toggle & Advanced filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>

          {/* Desktop Filter Selects */}
          <div className={`flex flex-wrap items-center gap-2.5 ${showMobileFilters ? 'flex' : 'hidden md:flex'}`}>
            {staff && (
              <select
                value={filters.status || ''}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value={ARTICLE_STATUSES.PUBLISHED}>Published</option>
                <option value={ARTICLE_STATUSES.DRAFT}>Draft</option>
                <option value={ARTICLE_STATUSES.ARCHIVED}>Archived</option>
              </select>
            )}

            {staff && (
              <select
                value={filters.visibility || ''}
                onChange={(e) => handleFieldChange('visibility', e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Visibilities</option>
                <option value="PUBLIC">Public</option>
                <option value="INTERNAL">Internal</option>
                <option value="DEPARTMENT">Department</option>
              </select>
            )}

            {departments.length > 0 && (
              <select
                value={filters.department || ''}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Active Filters count and Reset button */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset Filters ({activeFiltersCount})
          </button>
        )}
      </div>
    </div>
  )
}

export default ArticleFilters
