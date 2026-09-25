import React from 'react'

export function AiSourceBadge({ source = 'openrouter', aiAvailable = true, className = '' }) {
  const normalized = (source || '').toLowerCase()

  if (normalized.includes('fallback') || !aiAvailable) {
    return (
      <span
        title="Analysis generated via deterministic local support intelligence rules"
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Fallback Intelligence
      </span>
    )
  }

  const isMock = normalized.includes('mock')

  return (
    <span
      title={isMock ? 'Analysis generated via mock AI provider' : 'Analysis powered by OpenRouter LLM engine'}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      {isMock ? 'Mock AI' : 'AI Copilot'}
    </span>
  )
}

export default AiSourceBadge
