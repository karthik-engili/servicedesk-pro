import React from 'react'
import Spinner from './Spinner'

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer'

  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-500 focus:ring-primary-500/20 border border-transparent shadow-xs',
    secondary:
      'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:bg-slate-100 dark:active:bg-slate-700 border border-slate-300 dark:border-slate-700 focus:ring-slate-400/20 shadow-xs',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:bg-slate-200/50 border border-slate-300 dark:border-slate-700 focus:ring-slate-400/20',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent focus:ring-slate-400/20',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 dark:bg-rose-600 focus:ring-rose-500/20 border border-transparent shadow-xs',
  }

  const sizeClasses = {
    xs: 'text-xs px-2 py-1 gap-1 rounded-md',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-3.5 py-2 gap-2 rounded-lg',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-lg',
    icon: 'p-2 rounded-lg',
    'icon-sm': 'p-1.5 rounded-md',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner
            size="sm"
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'slate'}
          />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}

export default Button
