import api from './api'

class TicketService {
  async getTickets(params = {}) {
    const res = await api.get('/tickets', { params })
    return res.data?.data || { tickets: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } }
  }

  async getTicket(id) {
    const res = await api.get(`/tickets/${id}`)
    return res.data?.data?.ticket
  }

  async createTicket(data) {
    const res = await api.post('/tickets', data)
    return res.data?.data?.ticket
  }

  async updateTicket(id, data) {
    const res = await api.patch(`/tickets/${id}`, data)
    return res.data?.data?.ticket
  }

  async assignTicket(id, assignedTo) {
    const res = await api.post(`/tickets/${id}/assign`, { assignedTo })
    return res.data?.data?.ticket
  }

  async startTicket(id) {
    const res = await api.post(`/tickets/${id}/start`)
    return res.data?.data?.ticket
  }

  async resolveTicket(id, resolutionNotes) {
    const res = await api.post(`/tickets/${id}/resolve`, { resolutionNotes })
    return res.data?.data?.ticket
  }

  async reopenTicket(id, reason) {
    const res = await api.post(`/tickets/${id}/reopen`, { reason })
    return res.data?.data?.ticket
  }

  async closeTicket(id) {
    const res = await api.post(`/tickets/${id}/close`)
    return res.data?.data?.ticket
  }

  async getComments(ticketId) {
    const res = await api.get(`/tickets/${ticketId}/comments`)
    return res.data?.data?.comments || []
  }

  async addComment(ticketId, message, isInternal = false) {
    const res = await api.post(`/tickets/${ticketId}/comments`, { message, isInternal })
    return res.data?.data?.comment
  }

  async getWorkLogs(ticketId) {
    const res = await api.get(`/tickets/${ticketId}/worklogs`)
    return res.data?.data?.workLogs || res.data?.data || []
  }

  async addWorkLog(ticketId, description, timeSpentMinutes) {
    const res = await api.post(`/tickets/${ticketId}/worklogs`, {
      description,
      timeSpentMinutes: Number(timeSpentMinutes),
    })
    return res.data?.data?.workLog || res.data?.data
  }

  async getAuditLogs(ticketId, params = {}) {
    const res = await api.get(`/tickets/${ticketId}/audit`, { params })
    return res.data?.data || { logs: [], total: 0 }
  }
}

export default new TicketService()
