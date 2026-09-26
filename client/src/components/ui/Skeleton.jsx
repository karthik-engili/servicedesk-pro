import React from 'react'

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  ...props
}) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    rect: 'w-full rounded-lg',
    circle: 'rounded-full shrink-0',
    badge: 'h-5 w-16 rounded-md',
  }

  const style = {}
  if (width) style.width = width
  if (height) style.height = height

  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 ${
        variantClasses[variant] || variantClasses.text
      } ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  )
}

export default Skeleton
