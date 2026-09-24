import React, { useId } from 'react'

export function Select({
  label,
  error,
  helperText,
  id: customId,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const generatedId = useId()
  const selectId = customId || generatedId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold tracking-wide text-slate-700 uppercase mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-2xs">
        <select
          id={selectId}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg text-sm transition-colors bg-white appearance-none
            pl-3.5 pr-10 py-2
            ${
              error
                ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500'
            }
            border focus:outline-none focus:ring-1
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => {
                const value = typeof opt === 'object' ? opt.value : opt
                const optLabel = typeof opt === 'object' ? opt.label : opt
                return (
                  <option key={value} value={value}>
                    {optLabel}
                  </option>
                )
              })
            : children}
        </select>

        {/* Dropdown Chevron */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

export default Select
