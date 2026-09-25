import ticketService from './ticketService'
import assetService from './assetService'
import articleService from './articleService'
import notificationService from './notificationService'

class DashboardService {
  /**
   * Fetch tickets summary data with counts by status, priority, and SLA
   */
  async getTicketsSummary(filters = {}) {
    const res = await ticketService.getTickets({ limit: 100, ...filters })
    const tickets = res.tickets || []
    const total = res.pagination?.total || tickets.length

    // Calculate distributions from returned dataset
    const statusCounts = {
      OPEN: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0,
      REOPENED: 0,
    }

    const priorityCounts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    }

    const categoryCounts = {
      HARDWARE: 0,
      SOFTWARE: 0,
      NETWORK: 0,
      ACCESS: 0,
      GENERAL: 0,
    }

    const slaCounts = {
      WITHIN_SLA: 0,
      APPROACHING: 0,
      BREACHED: 0,
      MET: 0,
    }

    tickets.forEach((t) => {
      if (statusCounts[t.status] !== undefined) statusCounts[t.status]++
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++
      if (categoryCounts[t.category] !== undefined) categoryCounts[t.category]++
      if (slaCounts[t.slaStatus] !== undefined) slaCounts[t.slaStatus]++
    })

    return {
      total,
      tickets,
      statusCounts,
      priorityCounts,
      categoryCounts,
      slaCounts,
    }
  }

  /**
   * Fetch recent tickets for list display
   */
  async getRecentTickets(filters = {}, limit = 6) {
    const res = await ticketService.getTickets({
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...filters,
    })
    return res.tickets || []
  }

  /**
   * Fetch assets summary and expiring warranties
   */
  async getAssetsSummary() {
    const [summary, expiring] = await Promise.all([
      assetService.getAssetSummary().catch(() => ({})),
      assetService.getExpiringWarranties(30).catch(() => []),
    ])

    return {
      summary,
      expiringWarranties: expiring,
    }
  }

  /**
   * Fetch Knowledge Base summary metrics
   */
  async getKnowledgeSummary() {
    return articleService.getArticleSummary().catch(() => ({}))
  }

  /**
   * Fetch recent notifications preview
   */
  async getRecentNotifications(limit = 4) {
    const res = await notificationService
      .getNotifications({ limit })
      .catch(() => ({ notifications: [], unreadCount: 0 }))
    return {
      notifications: res.notifications || [],
      unreadCount: res.unreadCount || 0,
    }
  }

  /**
   * Employee specific dashboard data
   */
  async getEmployeeDashboardData(user) {
    const [ticketSummary, recentTickets, assignedAssets, kbSummary, notifs] =
      await Promise.all([
        this.getTicketsSummary({ createdBy: user._id }),
        this.getRecentTickets({ createdBy: user._id }, 5),
        assetService.getAssets({ limit: 10 }).catch(() => ({ assets: [] })),
        this.getKnowledgeSummary(),
        this.getRecentNotifications(4),
      ])

    return {
      ticketSummary,
      recentTickets,
      assignedAssets: assignedAssets.assets || [],
      kbSummary,
      notifications: notifs.notifications,
      unreadCount: notifs.unreadCount,
    }
  }

  /**
   * Technician dashboard data
   */
  async getTechnicianDashboardData(user) {
    const [myAssignedSummary, openTicketsSummary, recentTickets, notifs] =
      await Promise.all([
        this.getTicketsSummary({ assignedTo: user._id }),
        this.getTicketsSummary({ status: 'OPEN' }),
        this.getRecentTickets({ assignedTo: user._id }, 6),
        this.getRecentNotifications(4),
      ])

    return {
      myAssignedSummary,
      openTicketsSummary,
      recentTickets,
      notifications: notifs.notifications,
      unreadCount: notifs.unreadCount,
    }
  }

  /**
   * Asset Manager dashboard data
   */
  async getAssetManagerDashboardData() {
    const [assetsData, notifs] = await Promise.all([
      this.getAssetsSummary(),
      this.getRecentNotifications(4),
    ])

    return {
      assetsSummary: assetsData.summary,
      expiringWarranties: assetsData.expiringWarranties,
      notifications: notifs.notifications,
      unreadCount: notifs.unreadCount,
    }
  }

  /**
   * IT Manager & System Admin Executive dashboard data
   */
  async getExecutiveDashboardData() {
    const [ticketSummary, recentTickets, assetsData, kbSummary, notifs] =
      await Promise.all([
        this.getTicketsSummary(),
        this.getRecentTickets({}, 6),
        this.getAssetsSummary(),
        this.getKnowledgeSummary(),
        this.getRecentNotifications(4),
      ])

    return {
      ticketSummary,
      recentTickets,
      assetsSummary: assetsData.summary,
      expiringWarranties: assetsData.expiringWarranties,
      kbSummary,
      notifications: notifs.notifications,
      unreadCount: notifs.unreadCount,
    }
  }
}

export default new DashboardService()
