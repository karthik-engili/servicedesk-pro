import React from 'react'

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  rounded = 'md',
  className = '',
}) {
  const variantClasses = {
    neutral:
      'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/80',
    info:
      'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    warning:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    danger:
      'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    purple:
      'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
  }

  const dotColorClasses = {
    neutral: 'bg-slate-400 dark:bg-slate-500',
    info: 'bg-blue-500 dark:bg-blue-400',
    success: 'bg-emerald-500 dark:bg-emerald-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    danger: 'bg-rose-500 dark:bg-rose-400',
    purple: 'bg-indigo-500 dark:bg-indigo-400',
  }

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium leading-none',
    sm: 'text-xs px-2 py-0.5 font-medium leading-none',
    md: 'text-xs px-2.5 py-1 font-medium leading-none',
    lg: 'text-sm px-3 py-1 font-semibold leading-none',
  }

  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 border tracking-wide font-medium select-none ${
        variantClasses[variant] || variantClasses.neutral
      } ${sizeClasses[size] || sizeClasses.md} ${
        roundedClasses[rounded] || roundedClasses.md
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColorClasses[variant] || dotColorClasses.neutral
          }`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export default Badge
