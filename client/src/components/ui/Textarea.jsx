import React, { useId } from 'react'

export function Textarea({
  label,
  error,
  helperText,
  id: customId,
  rows = 3,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const generatedId = useId()
  const inputId = customId || generatedId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-3xs">
        <textarea
          id={inputId}
          rows={rows}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg text-sm transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900 px-3.5 py-2
            ${
              error
                ? 'border-rose-400 dark:border-rose-600 text-rose-900 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-primary-600 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            }
            border focus:outline-none
            disabled:bg-slate-50 dark:disabled:bg-slate-800/60 disabled:text-slate-500 dark:disabled:text-slate-500 disabled:border-slate-200 dark:disabled:border-slate-800 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  )
}

export default Textarea
