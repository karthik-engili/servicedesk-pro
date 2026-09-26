import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import dashboardService from '../../services/dashboardService'
import { ErrorState, Card, Skeleton } from '../../components/ui'
import PageContainer from '../../components/layout/PageContainer'
import {
  ExecutiveHeader,
  KpiCard,
  QuickActionsWidget,
  RecentTicketsWidget,
  RecentNotificationsWidget,
  KnowledgeOverviewWidget,
  AssetOverviewWidget,
  SlaOverviewWidget,
  TicketOverviewWidget,
  AttentionRequiredWidget,
  AiInsightsWidget,
} from '../../components/dashboard'
import {
  TicketIcon,
  AssetIcon,
  HealthIcon,
} from '../../components/ui/Icons'

function DashboardSkeleton({ role = 'employee' }) {
  const isExec = role === 'it_manager' || role === 'system_admin'
  const kpiCount = isExec ? 6 : 4

  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="space-y-2">
          <Skeleton variant="text" width="220px" height="28px" />
          <Skeleton variant="text" width="320px" height="16px" />
        </div>
        <Skeleton variant="rect" width="100px" height="34px" />
      </div>

      {/* KPI strip skeleton */}
      <div className={`grid grid-cols-2 md:grid-cols-3 ${isExec ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-3.5`}>
        {Array.from({ length: kpiCount }).map((_, idx) => (
          <Card key={idx} variant="kpi" className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width="80px" height="12px" />
              <Skeleton variant="rect" width="24px" height="24px" />
            </div>
            <Skeleton variant="text" width="60px" height="28px" />
            <Skeleton variant="text" width="110px" height="12px" />
          </Card>
        ))}
      </div>

      {/* Mid sections skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="bordered" className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width="140px" height="16px" />
            <Skeleton variant="badge" />
          </div>
          <Skeleton variant="rect" height="180px" />
        </Card>
        <Card variant="bordered" className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width="140px" height="16px" />
            <Skeleton variant="badge" />
          </div>
          <Skeleton variant="rect" height="180px" />
        </Card>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Dashboard Data State
  const [data, setData] = useState({
    ticketSummary: null,
    recentTickets: [],
    myAssignedSummary: null,
    openTicketsSummary: null,
    assignedAssets: [],
    assetsSummary: null,
    expiringWarranties: [],
    kbSummary: null,
    notifications: [],
    unreadCount: 0,
  })

  const role = user?.role || 'employee'

  const loadDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (!user) return

    if (isSilentRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      if (role === 'employee') {
        const empData = await dashboardService.getEmployeeDashboardData(user)
        setData(empData)
      } else if (role === 'technician') {
        const techData = await dashboardService.getTechnicianDashboardData(user)
        setData(techData)
      } else if (role === 'asset_manager') {
        const assetData = await dashboardService.getAssetManagerDashboardData()
        setData(assetData)
      } else {
        // IT Manager or System Admin
        const execData = await dashboardService.getExecutiveDashboardData()
        setData(execData)
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err)
      setError('Failed to load operations dashboard. Please check connection and try again.')
      if (isSilentRefresh) {
        toast.error('Failed to refresh dashboard metrics.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user, role, toast])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (loading && !data.ticketSummary && !data.assetsSummary) {
    return (
      <PageContainer>
        <DashboardSkeleton role={role} />
      </PageContainer>
    )
  }

  if (error && !data.ticketSummary && !data.assetsSummary) {
    return (
      <PageContainer>
        <div className="py-8">
          <ErrorState
            title="Operations Dashboard Unavailable"
            message={error}
            onRetry={() => loadDashboardData(false)}
          />
        </div>
      </PageContainer>
    )
  }

  // ---------------------------------------------------------------------------
  // 1. EMPLOYEE DASHBOARD VIEW
  // ---------------------------------------------------------------------------
  if (role === 'employee') {
    const {
      ticketSummary = { statusCounts: {}, priorityCounts: {}, slaCounts: {}, tickets: [] },
      recentTickets = [],
      assignedAssets = [],
      kbSummary = {},
      notifications = [],
      unreadCount = 0,
    } = data

    const openCount = ticketSummary?.statusCounts?.OPEN || 0
    const inProgressCount =
      (ticketSummary?.statusCounts?.IN_PROGRESS || 0) + (ticketSummary?.statusCounts?.ASSIGNED || 0)
    const resolvedCount =
      (ticketSummary?.statusCounts?.RESOLVED || 0) + (ticketSummary?.statusCounts?.CLOSED || 0)
    const slaRiskCount =
      (ticketSummary?.slaCounts?.APPROACHING || 0) + (ticketSummary?.slaCounts?.BREACHED || 0)

    return (
      <PageContainer>
        <div className="space-y-6">
          <ExecutiveHeader
            user={user}
            title="Dashboard"
            subtitle="Operational overview of your support requests"
            onRefresh={() => loadDashboardData(true)}
            refreshing={refreshing}
            showCreateTicket={true}
          />

          {/* Employee KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <KpiCard
              title="My Open Tickets"
              value={openCount}
              subtitle="Awaiting technician review"
              to="/tickets?status=OPEN"
              icon={<TicketIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />
            <KpiCard
              title="In Progress"
              value={inProgressCount}
              subtitle="Currently being resolved"
              to="/tickets?status=IN_PROGRESS"
              icon={<TicketIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            />
            <KpiCard
              title="Resolved"
              value={resolvedCount}
              subtitle="Completed requests"
              to="/tickets?status=RESOLVED"
              badge="Normal"
              badgeVariant="success"
              icon={<TicketIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            />
            <KpiCard
              title="SLA Attention"
              value={slaRiskCount}
              subtitle={slaRiskCount > 0 ? 'Approaching target deadline' : 'All tickets on track'}
              badge={slaRiskCount > 0 ? 'At Risk' : 'Normal'}
              badgeVariant={slaRiskCount > 0 ? 'warning' : 'neutral'}
              to="/tickets?slaStatus=APPROACHING"
              icon={<HealthIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            />
          </div>

          {/* Operational Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <AttentionRequiredWidget
                tickets={ticketSummary?.tickets || []}
              />

              <SlaOverviewWidget
                slaCounts={ticketSummary?.slaCounts}
                title="My Tickets SLA Status"
                isEmployee={true}
              />

              <RecentTicketsWidget
                tickets={recentTickets}
                title="My Recent Tickets"
                viewAllUrl="/tickets"
              />
            </div>

            <div className="space-y-5">
              <QuickActionsWidget role="employee" />

              {/* My Assigned Hardware Equipment */}
              {assignedAssets.length > 0 && (
                <Card variant="bordered" className="flex flex-col justify-between overflow-hidden">
                  <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      My Assigned Equipment
                    </h2>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {assignedAssets.length} item{assignedAssets.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 p-0">
                    {assignedAssets.slice(0, 3).map((item) => (
                      <div
                        key={item._id}
                        className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                            {item.name}
                          </p>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 block">
                            {item.assetTag} &bull; {item.category}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                          Assigned
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <KnowledgeOverviewWidget summary={kbSummary} isStaff={false} />

              <RecentNotificationsWidget
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  // ---------------------------------------------------------------------------
  // 2. TECHNICIAN DASHBOARD VIEW
  // ---------------------------------------------------------------------------
  if (role === 'technician') {
    const {
      myAssignedSummary = { statusCounts: {}, priorityCounts: {}, slaCounts: {}, total: 0, tickets: [] },
      openTicketsSummary = { total: 0 },
      recentTickets = [],
      notifications = [],
      unreadCount = 0,
    } = data

    const assignedCount = myAssignedSummary.total || 0
    const criticalCount = myAssignedSummary.priorityCounts?.CRITICAL || 0
    const inProgressCount = myAssignedSummary.statusCounts?.IN_PROGRESS || 0
    const slaAtRiskCount =
      (myAssignedSummary.slaCounts?.APPROACHING || 0) + (myAssignedSummary.slaCounts?.BREACHED || 0)

    return (
      <PageContainer>
        <div className="space-y-6">
          <ExecutiveHeader
            user={user}
            title="Dashboard"
            subtitle="Incident Triage & Daily Work Queue"
            onRefresh={() => loadDashboardData(true)}
            refreshing={refreshing}
            showCreateTicket={true}
          />

          {/* Technician KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <KpiCard
              title="Assigned to Me"
              value={assignedCount}
              subtitle="Active workload in queue"
              to="/tickets"
              icon={<TicketIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
            />
            <KpiCard
              title="In Progress"
              value={inProgressCount}
              subtitle="Tickets currently being worked"
              to="/tickets?status=IN_PROGRESS"
              icon={<TicketIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            />
            <KpiCard
              title="Critical Incidents"
              value={criticalCount}
              subtitle={criticalCount > 0 ? 'Urgent attention required' : 'No critical incidents'}
              badge={criticalCount > 0 ? 'Critical' : 'Clear'}
              badgeVariant={criticalCount > 0 ? 'danger' : 'neutral'}
              to="/tickets?priority=CRITICAL"
              icon={<HealthIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            />
            <KpiCard
              title="SLA at Risk"
              value={slaAtRiskCount}
              subtitle="Approaching or breached SLAs"
              badge={slaAtRiskCount > 0 ? 'At Risk' : 'Normal'}
              badgeVariant={slaAtRiskCount > 0 ? 'warning' : 'neutral'}
              to="/tickets?slaStatus=APPROACHING"
              icon={<HealthIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            />
          </div>

          {/* Attention & SLA Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AttentionRequiredWidget
              tickets={myAssignedSummary.tickets || []}
            />

            <SlaOverviewWidget
              slaCounts={myAssignedSummary.slaCounts}
              title="Assigned SLA Compliance"
            />
          </div>

          {/* Workload, Recent Tickets, AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <TicketOverviewWidget
                total={assignedCount}
                statusCounts={myAssignedSummary.statusCounts}
                priorityCounts={myAssignedSummary.priorityCounts}
                categoryCounts={myAssignedSummary.categoryCounts}
                title="My Ticket Distribution"
              />

              <RecentTicketsWidget
                tickets={recentTickets}
                title="Assigned Tickets Queue"
                viewAllUrl="/tickets"
              />
            </div>

            <div className="space-y-5">
              <QuickActionsWidget role="technician" />

              <AiInsightsWidget tickets={myAssignedSummary.tickets || []} />

              <RecentNotificationsWidget
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  // ---------------------------------------------------------------------------
  // 3. ASSET MANAGER DASHBOARD VIEW
  // ---------------------------------------------------------------------------
  if (role === 'asset_manager') {
    const {
      assetsSummary = {},
      expiringWarranties = [],
      notifications = [],
      unreadCount = 0,
    } = data

    const totalAssets = assetsSummary.totalAssets || 0
    const available = assetsSummary.available || 0
    const underRepair = assetsSummary.underRepair || 0
    const warrantyExpiringSoon = assetsSummary.warrantyExpiringSoon || 0

    return (
      <PageContainer>
        <div className="space-y-6">
          <ExecutiveHeader
            user={user}
            title="Dashboard"
            subtitle="CMDB & Hardware Asset Lifecycle Management"
            onRefresh={() => loadDashboardData(true)}
            refreshing={refreshing}
            showCreateTicket={false}
          />

          {/* Asset Manager KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <KpiCard
              title="Total Assets"
              value={totalAssets}
              subtitle="Registered CMDB inventory"
              to="/assets"
              icon={<AssetIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
            />
            <KpiCard
              title="Available Stock"
              value={available}
              subtitle="Ready for deployment"
              badge="Ready"
              badgeVariant="success"
              to="/assets?status=AVAILABLE"
              icon={<AssetIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            />
            <KpiCard
              title="Under Repair"
              value={underRepair}
              subtitle="Hardware in service"
              badge={underRepair > 0 ? 'Service' : 'Zero'}
              badgeVariant={underRepair > 0 ? 'warning' : 'neutral'}
              to="/assets?status=UNDER_REPAIR"
              icon={<AssetIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            />
            <KpiCard
              title="Expiring Warranties"
              value={warrantyExpiringSoon}
              subtitle="Expiring in &le;30 days"
              badge={warrantyExpiringSoon > 0 ? 'Alert' : 'Current'}
              badgeVariant={warrantyExpiringSoon > 0 ? 'warning' : 'neutral'}
              to="/assets"
              icon={<HealthIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            />
          </div>

          {/* Asset Details & Attention */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <AssetOverviewWidget
                summary={assetsSummary}
                expiringWarranties={expiringWarranties}
              />

              <AttentionRequiredWidget
                expiringWarranties={expiringWarranties}
                lostAssetsCount={assetsSummary.lost || 0}
              />
            </div>

            <div className="space-y-5">
              <QuickActionsWidget role="asset_manager" />

              <RecentNotificationsWidget
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  // ---------------------------------------------------------------------------
  // 4. IT MANAGER & SYSTEM ADMIN EXECUTIVE DASHBOARD VIEW
  // ---------------------------------------------------------------------------
  const {
    ticketSummary = { statusCounts: {}, priorityCounts: {}, categoryCounts: {}, slaCounts: {}, total: 0, tickets: [] },
    recentTickets = [],
    assetsSummary = {},
    expiringWarranties = [],
    kbSummary = {},
    notifications = [],
    unreadCount = 0,
  } = data

  const openTickets = ticketSummary.statusCounts?.OPEN || 0
  const inProgressTickets =
    (ticketSummary.statusCounts?.IN_PROGRESS || 0) + (ticketSummary.statusCounts?.ASSIGNED || 0)
  const criticalTickets = ticketSummary.priorityCounts?.CRITICAL || 0
  const slaRiskCount =
    (ticketSummary.slaCounts?.APPROACHING || 0) + (ticketSummary.slaCounts?.BREACHED || 0)
  const totalAssets = assetsSummary.totalAssets || 0
  const warrantyAlerts = assetsSummary.warrantyExpiringSoon || expiringWarranties.length || 0

  return (
    <PageContainer>
      <div className="space-y-6">
        <ExecutiveHeader
          user={user}
          title="Dashboard"
          subtitle="IT Operations Command Center & Service Overview"
          onRefresh={() => loadDashboardData(true)}
          refreshing={refreshing}
          showCreateTicket={true}
        />

        {/* Executive KPI Cards (6 columns on lg) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard
            title="Open Tickets"
            value={openTickets}
            subtitle="Awaiting triage"
            to="/tickets?status=OPEN"
            icon={<TicketIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          />
          <KpiCard
            title="In Progress"
            value={inProgressTickets}
            subtitle="Active work"
            to="/tickets?status=IN_PROGRESS"
            icon={<TicketIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          />
          <KpiCard
            title="SLA at Risk"
            value={slaRiskCount}
            subtitle="Approaching / Breached"
            badge={slaRiskCount > 0 ? 'Warning' : 'Normal'}
            badgeVariant={slaRiskCount > 0 ? 'warning' : 'neutral'}
            to="/tickets?slaStatus=APPROACHING"
            icon={<HealthIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          />
          <KpiCard
            title="Critical Issues"
            value={criticalTickets}
            subtitle="P1 priority incidents"
            badge={criticalTickets > 0 ? 'Critical' : 'None'}
            badgeVariant={criticalTickets > 0 ? 'danger' : 'neutral'}
            to="/tickets?priority=CRITICAL"
            icon={<HealthIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          />
          <KpiCard
            title="Total Assets"
            value={totalAssets}
            subtitle="CMDB inventory"
            to="/assets"
            icon={<AssetIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
          />
          <KpiCard
            title="Warranty Due"
            value={warrantyAlerts}
            subtitle="&le; 30 days renewal"
            badge={warrantyAlerts > 0 ? 'Expiring' : 'Current'}
            badgeVariant={warrantyAlerts > 0 ? 'warning' : 'neutral'}
            to="/assets"
            icon={<AssetIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          />
        </div>

        {/* Attention Required & SLA Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AttentionRequiredWidget
            tickets={ticketSummary.tickets || []}
            expiringWarranties={expiringWarranties}
            lostAssetsCount={assetsSummary.lost || 0}
          />

          <SlaOverviewWidget
            slaCounts={ticketSummary.slaCounts}
            title="SLA Compliance & Service Targets"
          />
        </div>

        {/* Ticket Operations Breakdown & CMDB Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TicketOverviewWidget
            total={ticketSummary.total || 0}
            statusCounts={ticketSummary.statusCounts}
            priorityCounts={ticketSummary.priorityCounts}
            categoryCounts={ticketSummary.categoryCounts}
            title="Ticket Operations Distribution"
          />

          <AssetOverviewWidget
            summary={assetsSummary}
            expiringWarranties={expiringWarranties}
          />
        </div>

        {/* Recent Tickets Table, AI Copilot Escalations, Knowledge & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <RecentTicketsWidget
              tickets={recentTickets}
              title="Recent Service Desk Tickets"
              viewAllUrl="/tickets"
            />

            <AiInsightsWidget tickets={ticketSummary.tickets || []} />
          </div>

          <div className="space-y-5">
            <QuickActionsWidget role={role} />

            <KnowledgeOverviewWidget summary={kbSummary} isStaff={true} />

            <RecentNotificationsWidget
              notifications={notifications}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default Dashboard
