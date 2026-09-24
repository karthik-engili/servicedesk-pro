import React from 'react'
import Badge from '../ui/Badge'
import { STATUS_LABELS, STATUS_BADGE_VARIANTS } from '../../constants/tickets'

export function TicketStatusBadge({ status, size = 'sm', className = '' }) {
  const label = STATUS_LABELS[status] || status || 'Unknown'
  const variant = STATUS_BADGE_VARIANTS[status] || 'neutral'

  return (
    <Badge variant={variant} size={size} dot={true} className={className}>
      {label}
    </Badge>
  )
}

export default TicketStatusBadge
