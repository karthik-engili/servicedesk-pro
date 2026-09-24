import React from 'react'
import PageContainer from '../../components/layout/PageContainer'
import EmptyState from '../../components/ui/EmptyState'

export function AssetsPage() {
  return (
    <PageContainer
      title="IT Asset & Vendor Inventory"
      description="Track company hardware, assignments, repair transitions, and supplier contracts"
    >
      <EmptyState
        title="Asset Management Foundation Ready"
        description="The IT asset inventory and vendor lifecycle endpoints are operational in the backend. Dedicated list and assignment UI will be rendered here."
      />
    </PageContainer>
  )
}

export default AssetsPage
