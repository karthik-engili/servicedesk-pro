import React, { useId } from 'react'

export function Input({
  label,
  error,
  helperText,
  id: customId,
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  leftIcon,
  ...props
}) {
  const generatedId = useId()
  const inputId = customId || generatedId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold tracking-wide text-slate-700 uppercase mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-2xs">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg text-sm transition-colors placeholder:text-slate-400 bg-white
            ${leftIcon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2
            ${
              error
                ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500'
            }
            border focus:outline-none focus:ring-1
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

export default Input
