import React from 'react'
import PageContainer from '../../components/layout/PageContainer'
import EmptyState from '../../components/ui/EmptyState'

export function NotificationsPage() {
  return (
    <PageContainer
      title="Notifications"
      description="Real-time alert center for ticket assignments, SLA breaches, and system updates"
    >
      <EmptyState
        title="Notification Center Foundation Ready"
        description="In-app alerts and mark-as-read endpoints are ready in the backend."
      />
    </PageContainer>
  )
}

export default NotificationsPage
