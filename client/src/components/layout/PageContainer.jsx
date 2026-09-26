import React from 'react'

export function PageContainer({
  title,
  description,
  badge,
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-7xl mx-auto w-full ${className}`}>
      {(title || actions || badge) && (
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              {title && (
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                  {title}
                </h1>
              )}
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
              {actions}
            </div>
          )}
        </header>
      )}
      {children}
    </div>
  )
}

export default PageContainer
