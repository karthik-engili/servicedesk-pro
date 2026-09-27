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
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)

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
  ].filter(Boolean).length

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Category Pills Bar (Horizontal scrollable with smooth scrollbar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        <button
          type="button"
          onClick={() => handleCategorySelect('')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !filters.category
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          All Documentation
        </button>

        {ARTICLE_CATEGORIES.map((cat) => {
          const config = ARTICLE_CATEGORY_CONFIG[cat] || { shortLabel: cat }
          const isSelected = filters.category === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary-600 text-white dark:bg-primary-500 shadow-2xs font-semibold ring-1 ring-primary-500'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {config.shortLabel}
            </button>
          )
        })}
      </div>

      {/* Filter Toolbar: Desktop Selects & Mobile Sheet Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setShowMobileDrawer(true)}
            className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Desktop Filter Dropdowns */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {staff && (
              <select
                value={filters.status || ''}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-2xs"
              >
                <option value="">Status: All</option>
                <option value={ARTICLE_STATUSES.PUBLISHED}>Status: Published</option>
                <option value={ARTICLE_STATUSES.DRAFT}>Status: Draft</option>
                <option value={ARTICLE_STATUSES.ARCHIVED}>Status: Archived</option>
              </select>
            )}

            {staff && (
              <select
                value={filters.visibility || ''}
                onChange={(e) => handleFieldChange('visibility', e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-2xs"
              >
                <option value="">Visibility: All</option>
                <option value="PUBLIC">Public (All Users)</option>
                <option value="INTERNAL">Internal (Staff)</option>
                <option value="DEPARTMENT">Department Restricted</option>
              </select>
            )}

            {departments.length > 0 && (
              <select
                value={filters.department || ''}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-2xs"
              >
                <option value="">Department: All</option>
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
            </span>
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filters Drawer / Sheet Modal */}
      {showMobileDrawer && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-2xl p-5 border-t border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Filter Documentation
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileDrawer(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {staff && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Statuses</option>
                    <option value={ARTICLE_STATUSES.PUBLISHED}>Published</option>
                    <option value={ARTICLE_STATUSES.DRAFT}>Draft</option>
                    <option value={ARTICLE_STATUSES.ARCHIVED}>Archived</option>
                  </select>
                </div>
              )}

              {staff && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience / Visibility
                  </label>
                  <select
                    value={filters.visibility || ''}
                    onChange={(e) => handleFieldChange('visibility', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Visibilities</option>
                    <option value="PUBLIC">Public (All Users)</option>
                    <option value="INTERNAL">Internal (Staff)</option>
                    <option value="DEPARTMENT">Department Restricted</option>
                  </select>
                </div>
              )}

              {departments.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department Scoping
                  </label>
                  <select
                    value={filters.department || ''}
                    onChange={(e) => handleFieldChange('department', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onReset()
                  setShowMobileDrawer(false)
                }}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowMobileDrawer(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticleFilters
