import React from 'react'

export function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  const variantClasses = {
    default:
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs',
    bordered:
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg',
    elevated:
      'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-xs',
    panel:
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden',
    kpi:
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/40 dark:hover:bg-slate-800/30',
  }

  return (
    <div
      className={`${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', action = null, ...props }) {
  return (
    <div
      className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      <div>{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p
      className={`text-xs text-slate-500 dark:text-slate-400 mt-0.5 ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 text-sm ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
