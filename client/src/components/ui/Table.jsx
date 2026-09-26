import React from 'react'

export function Table({ children, className = '', containerClassName = '', ...props }) {
  return (
    <div
      className={`w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-3xs ${containerClassName}`}
    >
      <table className={`w-full text-left border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead
      className={`bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
}

export function TableHead({ children, className = '', align = 'left', ...props }) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <th
      className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none whitespace-nowrap ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody
      className={`divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  )
}

export function TableRow({ children, className = '', isSelected = false, ...props }) {
  return (
    <tr
      className={`transition-colors duration-150 ${
        isSelected
          ? 'bg-primary-50/60 dark:bg-primary-950/40'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '', align = 'left', ...props }) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <td
      className={`py-3 px-4 text-sm text-slate-700 dark:text-slate-300 align-middle ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}

export function TableEmpty({ colSpan = 1, message = 'No records found', children, className = '' }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={`py-12 px-4 text-center text-sm text-slate-500 dark:text-slate-400 ${className}`}
      >
        {children || message}
      </td>
    </tr>
  )
}

Table.Header = TableHeader
Table.Head = TableHead
Table.Body = TableBody
Table.Row = TableRow
Table.Cell = TableCell
Table.Empty = TableEmpty

export default Table
