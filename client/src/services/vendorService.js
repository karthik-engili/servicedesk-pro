import api from './api'

class VendorService {
  async getVendors(params = {}) {
    const res = await api.get('/vendors', { params })
    return res.data?.data || { vendors: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } }
  }

  async getVendor(id) {
    const res = await api.get(`/vendors/${id}`)
    return res.data?.data?.vendor
  }

  async createVendor(data) {
    const res = await api.post('/vendors', data)
    return res.data?.data?.vendor
  }

  async updateVendor(id, data) {
    const res = await api.patch(`/vendors/${id}`, data)
    return res.data?.data?.vendor
  }

  async deleteVendor(id) {
    const res = await api.delete(`/vendors/${id}`)
    return res.data?.data
  }
}

export default new VendorService()
