import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import dashboardService from '../../services/dashboardService'
import { Spinner, ErrorState, EmptyState } from '../../components/ui'
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

  // Section error states so a single failure does not break the entire dashboard
  const [sectionErrors, setSectionErrors] = useState({
    tickets: null,
    assets: null,
    knowledge: null,
    notifications: null,
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
    setSectionErrors({
      tickets: null,
      assets: null,
      knowledge: null,
      notifications: null,
    })

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <Spinner size="lg" />
        <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          Loading operations dashboard...
        </p>
      </div>
    )
  }

  if (error && !data.ticketSummary && !data.assetsSummary) {
    return (
      <div className="py-8">
        <ErrorState
          title="Dashboard Unavailable"
          message={error}
          onRetry={() => loadDashboardData(false)}
        />
      </div>
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
      <div className="space-y-6">
        <ExecutiveHeader
          user={user}
          subtitle="Employee Self-Service & Ticket Support"
          onRefresh={() => loadDashboardData(true)}
          refreshing={refreshing}
        />

        {/* Employee KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="My Open Tickets"
            value={openCount}
            subtitle="Awaiting technician review"
            to="/tickets?status=OPEN"
            icon={
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <KpiCard
            title="In Progress"
            value={inProgressCount}
            subtitle="Currently being resolved"
            to="/tickets?status=IN_PROGRESS"
            icon={
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <KpiCard
            title="Resolved"
            value={resolvedCount}
            subtitle="Completed ticket requests"
            to="/tickets?status=RESOLVED"
            badge="Healthy"
            badgeVariant="success"
            icon={
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <KpiCard
            title="SLA Attention"
            value={slaRiskCount}
            subtitle={slaRiskCount > 0 ? 'Target time approaching/breached' : 'All tickets on track'}
            badge={slaRiskCount > 0 ? 'At Risk' : 'Normal'}
            badgeVariant={slaRiskCount > 0 ? 'warning' : 'neutral'}
            to="/tickets?slaStatus=APPROACHING"
            icon={
              <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
        </div>

        {/* SLA and Recent Tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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

          <div className="space-y-6">
            <QuickActionsWidget role="employee" />

            {/* My Assigned Hardware */}
            {assignedAssets.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      My Assigned Equipment
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {assignedAssets.length} item{assignedAssets.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {assignedAssets.slice(0, 3).map((item) => (
                    <div key={item._id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {item.assetTag} &bull; {item.category}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                        Assigned
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <KnowledgeOverviewWidget summary={kbSummary} isStaff={false} />

            <RecentNotificationsWidget
              notifications={notifications}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // 2. TECHNICIAN DASHBOARD VIEW
  // ---------------------------------------------------------------------------
  if (role === 'technician') {
    const {
      myAssignedSummary = { statusCounts: {}, priorityCounts: {}, slaCounts: {}, total: 0 },
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
      <div className="space-y-6">
        <ExecutiveHeader
          user={user}
          subtitle="IT Service Queue & Incident Triage"
          onRefresh={() => loadDashboardData(true)}
          refreshing={refreshing}
        />

        {/* Technician KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Assigned to Me"
            value={assignedCount}
            subtitle="Active workload in queue"
            to="/tickets"
            icon={
              <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <KpiCard
            title="In Progress"
            value={inProgressCount}
            subtitle="Tickets currently being worked"
            to="/tickets?status=IN_PROGRESS"
            icon={
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <KpiCard
            title="Critical Incidents"
            value={criticalCount}
            subtitle={criticalCount > 0 ? 'Urgent attention required' : 'No critical incidents'}
            badge={criticalCount > 0 ? 'Critical' : 'Clear'}
            badgeVariant={criticalCount > 0 ? 'danger' : 'neutral'}
            to="/tickets?priority=CRITICAL"
            icon={
              <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          <KpiCard
            title="SLA at Risk"
            value={slaAtRiskCount}
            subtitle="Approaching or breached SLAs"
            badge={slaAtRiskCount > 0 ? 'At Risk' : 'Normal'}
            badgeVariant={slaAtRiskCount > 0 ? 'warning' : 'neutral'}
            to="/tickets?slaStatus=APPROACHING"
            icon={
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Attention & SLA Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttentionRequiredWidget
            tickets={myAssignedSummary.tickets || []}
          />

          <SlaOverviewWidget
            slaCounts={myAssignedSummary.slaCounts}
            title="Assigned SLA Compliance"
          />
        </div>

        {/* Workload, Recent Tickets, AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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

          <div className="space-y-6">
            <QuickActionsWidget role="technician" />

            <AiInsightsWidget tickets={myAssignedSummary.tickets || []} />

            <RecentNotificationsWidget
              notifications={notifications}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>
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
      <div className="space-y-6">
        <ExecutiveHeader
          user={user}
          subtitle="CMDB, Hardware Lifecycle & Inventory Management"
          onRefresh={() => loadDashboardData(true)}
          refreshing={refreshing}
        />

        {/* Asset Manager KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Assets"
            value={totalAssets}
            subtitle="Registered inventory"
            to="/assets"
            icon={
              <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <KpiCard
            title="Available Stock"
            value={available}
            subtitle="Ready for deployment"
            badge="Ready"
            badgeVariant="success"
            to="/assets?status=AVAILABLE"
            icon={
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <KpiCard
            title="Under Repair"
            value={underRepair}
            subtitle="Hardware in service"
            badge={underRepair > 0 ? 'Maintenance' : 'Zero'}
            badgeVariant={underRepair > 0 ? 'warning' : 'neutral'}
            to="/assets?status=UNDER_REPAIR"
            icon={
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <KpiCard
            title="Expiring Warranties"
            value={warrantyExpiringSoon}
            subtitle="Expiring in &le;30 days"
            badge={warrantyExpiringSoon > 0 ? 'Alert' : 'Current'}
            badgeVariant={warrantyExpiringSoon > 0 ? 'warning' : 'neutral'}
            to="/assets"
            icon={
              <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Asset Details & Attention */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AssetOverviewWidget
              summary={assetsSummary}
              expiringWarranties={expiringWarranties}
            />

            <AttentionRequiredWidget
              expiringWarranties={expiringWarranties}
              lostAssetsCount={assetsSummary.lost || 0}
            />
          </div>

          <div className="space-y-6">
            <QuickActionsWidget role="asset_manager" />

            <RecentNotificationsWidget
              notifications={notifications}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>
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
    <div className="space-y-6">
      <ExecutiveHeader
        user={user}
        subtitle="IT Operations Overview & Executive Control Center"
        onRefresh={() => loadDashboardData(true)}
        refreshing={refreshing}
      />

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          title="Open Tickets"
          value={openTickets}
          subtitle="Awaiting triage"
          to="/tickets?status=OPEN"
          icon={
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <KpiCard
          title="In Progress"
          value={inProgressTickets}
          subtitle="Active work"
          to="/tickets?status=IN_PROGRESS"
          icon={
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          title="SLA at Risk"
          value={slaRiskCount}
          subtitle="Breached / Approaching"
          badge={slaRiskCount > 0 ? 'Warning' : 'Normal'}
          badgeVariant={slaRiskCount > 0 ? 'warning' : 'neutral'}
          to="/tickets?slaStatus=APPROACHING"
          icon={
            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Critical Issues"
          value={criticalTickets}
          subtitle="P1 priority incidents"
          badge={criticalTickets > 0 ? 'Critical' : 'None'}
          badgeVariant={criticalTickets > 0 ? 'danger' : 'neutral'}
          to="/tickets?priority=CRITICAL"
          icon={
            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <KpiCard
          title="Total Assets"
          value={totalAssets}
          subtitle="CMDB tracked"
          to="/assets"
          icon={
            <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <KpiCard
          title="Warranty Due"
          value={warrantyAlerts}
          subtitle="&le; 30 days remaining"
          badge={warrantyAlerts > 0 ? 'Expiring' : 'OK'}
          badgeVariant={warrantyAlerts > 0 ? 'warning' : 'neutral'}
          to="/assets"
          icon={
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Critical Attention & Active SLA Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* AI Escalations, Knowledge Base, and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentTicketsWidget
            tickets={recentTickets}
            title="Recent Service Desk Tickets"
            viewAllUrl="/tickets"
          />

          <AiInsightsWidget tickets={ticketSummary.tickets || []} />
        </div>

        <div className="space-y-6">
          <QuickActionsWidget role={role} />

          <KnowledgeOverviewWidget summary={kbSummary} isStaff={true} />

          <RecentNotificationsWidget
            notifications={notifications}
            unreadCount={unreadCount}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
