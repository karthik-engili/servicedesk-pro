import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PageContainer from '../../components/layout/PageContainer'
import TicketFilters from '../../components/tickets/TicketFilters'
import TicketTable from '../../components/tickets/TicketTable'
import CreateTicketModal from '../../components/tickets/CreateTicketModal'
import { Button, Spinner, ErrorState } from '../../components/ui'
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
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments')
        const depts = res.data?.data?.departments || []
        setDepartments(depts)
      } catch (err) {
        console.error('Failed to load departments for filters', err)
      }
    }
    fetchDepartments()
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

  const activeFilterCount = [
    currentFilters.status,
    currentFilters.priority,
    currentFilters.category,
    currentFilters.department,
    currentFilters.search,
  ].filter(Boolean).length

  return (
    <PageContainer
      title="Tickets & Incidents"
      description="Manage enterprise support requests, SLAs, assignments, and resolution lifecycles"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 shadow-xs"
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
        {/* Filters Section */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <TicketFilters
            filters={currentFilters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            departments={departments}
          />
        </div>

        {/* Results Metadata & Ticket Count */}
        <div className="flex items-center justify-between px-1">
          <div className="text-xs text-slate-500 font-medium">
            {loading ? (
              <span>Updating results...</span>
            ) : (
              <span>
                Total Tickets: <strong className="text-slate-800">{pagination.total || 0}</strong>
                {activeFilterCount > 0 && (
                  <span className="text-blue-600 font-normal ml-1">
                    (filtered from active criteria)
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
            />

            {/* Pagination Controls */}
            {!loading && tickets.length > 0 && pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                <div className="text-xs text-slate-600">
                  Showing page <strong className="font-semibold text-slate-900">{pagination.page}</strong> of{' '}
                  <strong className="font-semibold text-slate-900">{pagination.totalPages}</strong> ({pagination.total} items)
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>

                  {/* Quick Page Jump/Indicator */}
                  <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md">
                    {pagination.page}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleTicketCreated}
        currentUser={user}
      />
    </PageContainer>
  )
}

export default TicketsPage
