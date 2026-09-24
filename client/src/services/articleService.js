import api from './api'

class ArticleService {
  /**
   * List articles with filtering, searching, and pagination
   */
  async getArticles(params = {}) {
    const res = await api.get('/articles', { params })
    return res.data?.data || { articles: [], pagination: { total: 0, page: 1, limit: 20, pages: 1 } }
  }

  /**
   * Full-text search for articles with category and department filters
   */
  async searchArticles(params = {}) {
    const res = await api.get('/articles/search', { params })
    return res.data?.data?.articles || []
  }

  /**
   * Get single article by MongoDB ID or slug (increments view count on backend)
   */
  async getArticle(idOrSlug) {
    const res = await api.get(`/articles/${idOrSlug}`)
    return res.data?.data?.article
  }

  /**
   * Create a new draft article (Staff only)
   */
  async createArticle(data) {
    const res = await api.post('/articles', data)
    return res.data?.data?.article
  }

  /**
   * Update article content/metadata (creates a new version)
   */
  async updateArticle(id, data) {
    const res = await api.patch(`/articles/${id}`, data)
    return res.data?.data?.article
  }

  /**
   * Delete article and all revisions/bookmarks/feedbacks (Admin / Manager only)
   */
  async deleteArticle(id) {
    const res = await api.delete(`/articles/${id}`)
    return res.data?.data
  }

  /**
   * Publish a draft article
   */
  async publishArticle(id) {
    const res = await api.post(`/articles/${id}/publish`)
    return res.data?.data?.article
  }

  /**
   * Archive a published article
   */
  async archiveArticle(id) {
    const res = await api.post(`/articles/${id}/archive`)
    return res.data?.data?.article
  }

  /**
   * Revert a published or archived article back to draft
   */
  async unpublishArticle(id) {
    const res = await api.post(`/articles/${id}/unpublish`)
    return res.data?.data?.article
  }

  /**
   * Record helpful feedback on an article
   */
  async markHelpful(id) {
    const res = await api.post(`/articles/${id}/helpful`)
    return res.data?.data || {}
  }

  /**
   * Record not helpful feedback on an article
   */
  async markNotHelpful(id) {
    const res = await api.post(`/articles/${id}/not-helpful`)
    return res.data?.data || {}
  }

  /**
   * Bookmark an article for current user
   */
  async bookmarkArticle(id) {
    const res = await api.post(`/articles/${id}/bookmark`)
    return res.data
  }

  /**
   * Remove a bookmark for current user
   */
  async removeBookmark(id) {
    const res = await api.delete(`/articles/${id}/bookmark`)
    return res.data
  }

  /**
   * Get user's saved bookmarked articles
   */
  async getBookmarks(params = {}) {
    const res = await api.get('/articles/bookmarks/me', { params })
    return res.data?.data || { articles: [], pagination: { total: 0, page: 1, limit: 20, pages: 1 } }
  }

  /**
   * Get article revision history (Staff only)
   */
  async getVersions(id) {
    const res = await api.get(`/articles/${id}/versions`)
    return res.data?.data?.versions || []
  }

  /**
   * Get knowledge base aggregate statistics
   */
  async getArticleSummary() {
    const res = await api.get('/articles/summary')
    return res.data?.data || {}
  }

  /**
   * Get recommended knowledge base articles for a ticket
   */
  async getRecommendations(ticketId) {
    const res = await api.get('/articles/recommendations', { params: { ticketId } })
    return res.data?.data?.recommendations || []
  }
}

export default new ArticleService()
