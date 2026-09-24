import React from 'react'
import Button from './Button'

export function ErrorState({
  title = 'Failed to load data',
  message = 'An error occurred while loading this section. Please check your connection and try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center bg-rose-50/50 border border-rose-200 rounded-xl ${className}`}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
      <p className="mt-1 text-xs text-rose-700 max-w-sm">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="danger" size="sm" onClick={onRetry}>
            Retry Request
          </Button>
        </div>
      )}
    </div>
  )
}

export default ErrorState
