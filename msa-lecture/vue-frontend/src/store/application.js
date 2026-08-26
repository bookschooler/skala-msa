import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { applicationApi } from '@/api/application.js'
import { useAuthStore } from '@/store/auth.js'

const STORAGE_KEY = 'moa_applications'

function loadSavedApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export const useApplicationStore = defineStore('application', () => {
  const applications = ref(loadSavedApplications())
  const submitting = ref(false)
  const error = ref('')

  const activeApplications = computed(() =>
    applications.value.filter(item => !['CANCELLED', 'REJECTED'].includes(item.status))
  )

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications.value))
  }

  function hasApplied(announcementId) {
    return applications.value.some(item =>
      Number(item.announcementId) === Number(announcementId) && item.status !== 'CANCELLED'
    )
  }

  function getByAnnouncementId(announcementId) {
    return applications.value.find(item =>
      Number(item.announcementId) === Number(announcementId) && item.status !== 'CANCELLED'
    )
  }

  async function submitApplication(payload) {
    const auth = useAuthStore()
    submitting.value = true
    error.value = ''

    try {
      if (auth.accessToken && auth.accessToken !== 'demo-token') {
        await applicationApi.submit(payload.announcementId)
      }

      const application = {
        id: `AP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        ...payload,
        status: 'RECEIVED',
        submittedAt: new Date().toISOString()
      }
      applications.value.unshift(application)
      persist()
      return application
    } catch (exception) {
      error.value = exception.response?.data?.message || '청약 신청을 접수하지 못했습니다.'
      throw exception
    } finally {
      submitting.value = false
    }
  }

  async function cancelApplication(id) {
    const target = applications.value.find(item => item.id === id)
    if (!target) return

    if (typeof target.id === 'number') await applicationApi.cancel(target.id)
    target.status = 'CANCELLED'
    target.cancelledAt = new Date().toISOString()
    persist()
  }

  return {
    applications,
    activeApplications,
    submitting,
    error,
    hasApplied,
    getByAnnouncementId,
    submitApplication,
    cancelApplication
  }
})
