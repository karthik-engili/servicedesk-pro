import React from 'react'
import Badge from '../ui/Badge'
import { PRIORITY_LABELS, PRIORITY_BADGE_VARIANTS } from '../../constants/tickets'

export function TicketPriorityBadge({ priority, size = 'sm', className = '' }) {
  const label = PRIORITY_LABELS[priority] || priority || 'Medium'
  const variant = PRIORITY_BADGE_VARIANTS[priority] || 'info'

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  )
}

export default TicketPriorityBadge
