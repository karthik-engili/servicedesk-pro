import React from 'react'
import { cn } from '../../lib/utils'

export function Label({ className = '', children, htmlFor, required = false, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide select-none',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
    </label>
  )
}

export default Label
