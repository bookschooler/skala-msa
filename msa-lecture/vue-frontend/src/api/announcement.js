import api from './index.js'

// 백엔드 DB와 엔드포인트는 유지하고 프론트에서 공고 도메인으로 감싼다.
export const announcementApi = {
  getAll(params) {
    return api.get('/api/courses', { params })
  },
  getById(id) {
    return api.get(`/api/courses/${id}`)
  },
  create(data) {
    return api.post('/api/courses', data)
  }
}
