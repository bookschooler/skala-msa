import api from './index.js'

// 기존 enrollment API를 청약 신청 도메인으로 감싼다.
export const applicationApi = {
  getMine() {
    return api.get('/api/enrollments/my')
  },
  submit(announcementId) {
    return api.post('/api/enrollments', { courseId: announcementId })
  },
  cancel(applicationId) {
    return api.delete(`/api/enrollments/${applicationId}`)
  }
}
