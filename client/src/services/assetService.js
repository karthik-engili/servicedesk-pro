import api from './api'

class AssetService {
  async getAssets(params = {}) {
    const res = await api.get('/assets', { params })
    return res.data?.data || { assets: [], pagination: { total: 0, page: 1, limit: 20, pages: 1 } }
  }

  async getAsset(id) {
    const res = await api.get(`/assets/${id}`)
    return res.data?.data?.asset
  }

  async createAsset(data) {
    const res = await api.post('/assets', data)
    return res.data?.data?.asset
  }

  async updateAsset(id, data) {
    const res = await api.patch(`/assets/${id}`, data)
    return res.data?.data?.asset
  }

  async deleteAsset(id) {
    const res = await api.delete(`/assets/${id}`)
    return res.data?.data
  }

  async assignAsset(id, { assignedTo, notes = '' }) {
    const res = await api.post(`/assets/${id}/assign`, { assignedTo, notes })
    return res.data?.data?.asset
  }

  async unassignAsset(id, { notes = '' } = {}) {
    const res = await api.post(`/assets/${id}/unassign`, { notes })
    return res.data?.data?.asset
  }

  async sendForRepair(id, { notes = '' } = {}) {
    const res = await api.post(`/assets/${id}/repair`, { notes })
    return res.data?.data?.asset
  }

  async returnFromRepair(id, { notes = '' } = {}) {
    const res = await api.post(`/assets/${id}/return`, { notes })
    return res.data?.data?.asset
  }

  async replaceAsset(id, { replacementAssetId, notes = '' }) {
    const res = await api.post(`/assets/${id}/replace`, { replacementAssetId, notes })
    return res.data?.data?.asset
  }

  async retireAsset(id, { notes = '' } = {}) {
    const res = await api.post(`/assets/${id}/retire`, { notes })
    return res.data?.data?.asset
  }

  async reportLost(id, { notes = '' } = {}) {
    const res = await api.post(`/assets/${id}/report-lost`, { notes })
    return res.data?.data?.asset
  }

  async recoverAsset(id, { notes = '' } = {}) {
    const res = await api.post(`/assets/${id}/recover`, { notes })
    return res.data?.data?.asset
  }

  async getAssetHistory(id) {
    const res = await api.get(`/assets/${id}/history`)
    return res.data?.data?.history || []
  }

  async getAssetTickets(id) {
    const res = await api.get(`/assets/${id}/tickets`)
    return res.data?.data?.tickets || []
  }

  async getAssetSummary() {
    const res = await api.get('/assets/summary')
    return res.data?.data || {}
  }

  async getExpiringWarranties(days = 30) {
    const res = await api.get('/assets/warranty/expiring', { params: { days } })
    return res.data?.data?.assets || []
  }
}

export default new AssetService()
