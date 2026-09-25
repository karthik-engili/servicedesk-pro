import api from './api'

class AiService {
  /**
   * Run full AI or deterministic local rule analysis on a ticket
   */
  async analyzeTicket(ticketId, options = {}) {
    const res = await api.post(`/ai/tickets/${ticketId}/analyze`, options)
    return res.data?.data
  }

  /**
   * Retrieve historical AI analysis runs for a ticket (Staff only)
   */
  async getAnalysisHistory(ticketId, params = {}) {
    const res = await api.get(`/ai/tickets/${ticketId}/history`, { params })
    return res.data?.data || { history: [], pagination: { total: 0, page: 1, limit: 20, pages: 1 } }
  }

  /**
   * Retrieve AI-refined Knowledge Base article recommendations for a ticket
   */
  async getRecommendations(ticketId) {
    const res = await api.get(`/ai/tickets/${ticketId}/recommendations`)
    return res.data?.data?.recommendations || []
  }

  /**
   * Generate an automated troubleshooting solution draft grounded in KB articles
   */
  async generateSolutionDraft(ticketId) {
    const res = await api.post(`/ai/tickets/${ticketId}/solution-draft`)
    return res.data?.data
  }

  /**
   * Apply AI-recommended category to the ticket (Author, Tech, or Manager)
   */
  async applyCategory(ticketId, category) {
    const res = await api.post(`/ai/tickets/${ticketId}/apply-category`, { category })
    return res.data?.data?.ticket
  }

  /**
   * Apply AI-recommended priority to the ticket & recalculate SLA (Manager or Admin only)
   */
  async applyPriority(ticketId, priority) {
    const res = await api.post(`/ai/tickets/${ticketId}/apply-priority`, { priority })
    return res.data?.data?.ticket
  }
}

export default new AiService()
