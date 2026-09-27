import React, { useState, useEffect, useRef } from 'react'

export function ArticleSearch({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search articles, troubleshooting guides, procedures, error codes...',
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState(value)
  const inputRef = useRef(null)

  // Sync internal state when external value changes
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

  // Optional keyboard shortcut listener ('/' focuses search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClear = () => {
    setSearchTerm('')
    if (onClear) onClear()
    else onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        aria-label="Search knowledge base articles"
        className="w-full pl-12 pr-20 py-3.5 text-sm sm:text-base bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 dark:focus:border-primary-400 transition-all shadow-xs"
      />

      {/* Right controls: Clear button and keyboard shortcut */}
      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
        {searchTerm ? (
          <button
            type="button"
            onClick={handleClear}
            title="Clear search query"
            aria-label="Clear search"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 select-none">
            /
          </span>
        )}
      </div>
    </div>
  )
}

export default ArticleSearch
