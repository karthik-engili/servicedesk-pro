import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import TicketFilters from '../../components/tickets/TicketFilters'
import TicketTable from '../../components/tickets/TicketTable'
import CreateTicketModal from '../../components/tickets/CreateTicketModal'
import { Button, ErrorState } from '../../components/ui'
import ticketService from '../../services/ticketService'
import api from '../../services/api'
import { handleApiError } from '../../utils/errorHandler'
import { useAuth } from '../../contexts/AuthContext'

export function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tickets, setTickets] = useState([])
  const [departments, setDepartments] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Parse filters from URL search params
  const currentFilters = useMemo(() => {
    return {
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      priority: searchParams.get('priority') || '',
      category: searchParams.get('category') || '',
      department: searchParams.get('department') || '',
      slaStatus: searchParams.get('slaStatus') || '',
      page: parseInt(searchParams.get('page'), 10) || 1,
      limit: parseInt(searchParams.get('limit'), 10) || 15,
    }
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateModalOpen(true)
    }
  }, [searchParams])

  // Load departments once for the filter bar
  useEffect(() => {
    let isMounted = true
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments')
        const depts = res.data?.data?.departments || []
        if (isMounted) {
          setDepartments(depts)
        }
      } catch (err) {
        console.error('Failed to load departments for filters', err)
      }
    }
    fetchDepartments()
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch tickets based on current URL params
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const query = {
        page: currentFilters.page,
        limit: currentFilters.limit,
      }
      if (currentFilters.search) query.search = currentFilters.search
      if (currentFilters.status) query.status = currentFilters.status
      if (currentFilters.priority) query.priority = currentFilters.priority
      if (currentFilters.category) query.category = currentFilters.category
      if (currentFilters.department) query.department = currentFilters.department
      if (currentFilters.slaStatus) query.slaStatus = currentFilters.slaStatus

      const res = await ticketService.getTickets(query)
      const ticketList = res.tickets || []
      const pag = res.pagination || {
        page: currentFilters.page,
        limit: currentFilters.limit,
        total: ticketList.length,
        totalPages: 1,
      }

      setTickets(ticketList)
      setPagination(pag)
    } catch (err) {
      const parsed = handleApiError(err)
      setError(parsed.message || 'Failed to retrieve tickets.')
    } finally {
      setLoading(false)
    }
  }, [currentFilters])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Update URL search parameters when filters change
  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams()
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.status) params.set('status', newFilters.status)
    if (newFilters.priority) params.set('priority', newFilters.priority)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.department) params.set('department', newFilters.department)
    if (newFilters.slaStatus) params.set('slaStatus', newFilters.slaStatus)

    // Reset or set page
    const pageVal = newFilters.page || 1
    if (pageVal > 1) {
      params.set('page', String(pageVal))
    }
    if (newFilters.limit && newFilters.limit !== 15) {
      params.set('limit', String(newFilters.limit))
    }

    setSearchParams(params)
  }

  // Clear all filters back to page 1
  const handleResetFilters = () => {
    setSearchParams({})
  }

  // Handle page pagination clicks
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === pagination.page) {
      return
    }
    const params = new URLSearchParams(searchParams)
    if (newPage > 1) {
      params.set('page', String(newPage))
    } else {
      params.delete('page')
    }
    setSearchParams(params)
  }

  // Callback after ticket creation
  const handleTicketCreated = (newTicket) => {
    fetchTickets()
    if (newTicket?._id) {
      navigate(`/tickets/${newTicket._id}`)
    }
  }

  // Derive queue summary metrics from active ticket list
  const queueStats = useMemo(() => {
    const openCount = tickets.filter((t) => t.status === 'OPEN').length
    const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length
    const unassignedCount = tickets.filter((t) => !t.assignedTo).length
    const slaRiskCount = tickets.filter(
      (t) => t.slaStatus === 'APPROACHING' || t.slaStatus === 'BREACHED'
    ).length

    return {
      open: openCount,
      inProgress: inProgressCount,
      unassigned: unassignedCount,
      slaRisk: slaRiskCount,
    }
  }, [tickets])

  const activeFilterCount = [
    currentFilters.status,
    currentFilters.priority,
    currentFilters.category,
    currentFilters.department,
    currentFilters.slaStatus,
    currentFilters.search,
  ].filter(Boolean).length

  // Calculate slice range for pagination display
  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <PageContainer
      title="Tickets"
      description="Track and manage employee support requests"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 shadow-2xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Ticket</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Ticket Queue Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => handleFilterChange({ ...currentFilters, status: 'OPEN', page: 1 })}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              currentFilters.status === 'OPEN'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Open Queue
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {queueStats.open}
            </div>
          </div>

          <div
            onClick={() => handleFilterChange({ ...currentFilters, status: 'IN_PROGRESS', page: 1 })}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              currentFilters.status === 'IN_PROGRESS'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              In Progress
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {queueStats.inProgress}
            </div>
          </div>

          <div
            onClick={() => handleFilterChange({ ...currentFilters, status: 'OPEN', page: 1 })}
            className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Unassigned
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {queueStats.unassigned}
            </div>
          </div>

          <div
            onClick={() => handleFilterChange({ ...currentFilters, slaStatus: 'APPROACHING', page: 1 })}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              currentFilters.slaStatus === 'APPROACHING' || currentFilters.slaStatus === 'BREACHED'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SLA Risk
            </div>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              {queueStats.slaRisk}
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <TicketFilters
            filters={currentFilters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            departments={departments}
          />
        </div>

        {/* Results Metadata & Ticket Count */}
        <div className="flex items-center justify-between px-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {loading ? (
              <span>Updating queue...</span>
            ) : (
              <span>
                Total Tickets: <strong className="font-semibold text-slate-900 dark:text-slate-100">{pagination.total || 0}</strong>
                {activeFilterCount > 0 && (
                  <span className="text-primary-600 dark:text-primary-400 font-normal ml-1">
                    (filtered by {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'})
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Tickets Table / List */}
        {error ? (
          <ErrorState
            title="Error Loading Tickets"
            message={error}
            onRetry={fetchTickets}
          />
        ) : (
          <div className="space-y-4">
            <TicketTable
              tickets={tickets}
              isLoading={loading}
              onRowClick={(id) => navigate(`/tickets/${id}`)}
              onResetFilters={handleResetFilters}
              hasActiveFilters={activeFilterCount > 0}
            />

            {/* Pagination Controls */}
            {!loading && tickets.length > 0 && (
              <div className="bg-white dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left">
                  Showing <strong className="font-semibold text-slate-900 dark:text-slate-100">{startItem}–{endItem}</strong> of{' '}
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">{pagination.total}</strong> tickets
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="text-xs"
                  >
                    ← Previous
                  </Button>

                  {/* Page Jump / Indicator */}
                  <span className="px-3 py-1 text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                    {pagination.page} / {pagination.totalPages || 1}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="text-xs"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Ticket Drawer */}
      <CreateTicketModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleTicketCreated}
      />
    </PageContainer>
  )
}

export default TicketsPage
