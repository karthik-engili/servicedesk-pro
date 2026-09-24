import React, { useState, useEffect } from 'react'

export function ArticleSearch({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search troubleshooting guides, articles, error codes, tags...',
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState(value)

  // Sync internal state when external value changes (e.g. from URL or reset)
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm)
      }
    }, 350)

    return () => clearTimeout(handler)
  }, [searchTerm, value, onChange])

  const handleClear = () => {
    setSearchTerm('')
    if (onClear) onClear()
    else onChange('')
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all shadow-xs"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          title="Clear search"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default ArticleSearch
