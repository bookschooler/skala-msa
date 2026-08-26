import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { announcementApi } from '@/api/announcement.js'
import {
  housingTypeOptions,
  mockAnnouncements,
  regionOptions,
  sourceOptions
} from '@/data/mockAnnouncements.js'

const legacyTypeMap = {
  BACKEND: '공공분양',
  FRONTEND: '민영분양',
  DEVOPS: '공공임대',
  DATA: '공공전세',
  DATA_SCIENCE: '공공전세',
  AI: '무순위'
}

function unwrapList(payload) {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

function unwrapItem(payload) {
  return payload?.data && typeof payload.data === 'object' ? payload.data : payload
}

function normalizeLegacyAnnouncement(item, index = 0) {
  const fallback = mockAnnouncements[index % mockAnnouncements.length]
  return {
    ...fallback,
    id: item.id,
    title: item.title || fallback.title,
    summary: item.description || fallback.summary,
    housingType: legacyTypeMap[item.category] || fallback.housingType,
    priceLabel: item.price ? `${Number(item.price).toLocaleString()}원` : fallback.priceLabel,
    applicantCount: Number(item.enrollmentCount ?? item.enrollment_count ?? 0),
    agency: item.instructorName || item.ownerName || fallback.agency,
    status: item.status === 'INACTIVE' ? 'CLOSED' : fallback.status
  }
}

export const useAnnouncementStore = defineStore('announcement', () => {
  const announcements = ref([...mockAnnouncements])
  const selectedAnnouncement = ref(null)
  const loading = ref(false)
  const error = ref('')
  const filters = reactive({
    query: '',
    source: 'ALL',
    housingType: '전체',
    region: '전체 지역',
    status: 'ALL',
    sort: 'deadline'
  })

  const useBackendData = import.meta.env.VITE_USE_BACKEND_DATA === 'true'

  const filteredAnnouncements = computed(() => {
    const keyword = filters.query.trim().toLowerCase()
    const items = announcements.value.filter(item => {
      const matchesKeyword = !keyword || [
        item.title,
        item.region,
        item.district,
        item.agency,
        item.housingType,
        item.supplyType
      ].some(value => String(value || '').toLowerCase().includes(keyword))

      return matchesKeyword
        && (filters.source === 'ALL' || item.source === filters.source)
        && (filters.housingType === '전체' || item.housingType === filters.housingType)
        && (filters.region === '전체 지역' || item.region === filters.region)
        && (filters.status === 'ALL' || item.status === filters.status)
    })

    return [...items].sort((a, b) => {
      if (filters.sort === 'latest') return b.announcementDate.localeCompare(a.announcementDate)
      if (filters.sort === 'popular') return b.views - a.views
      if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1
      if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1
      return a.applyEnd.localeCompare(b.applyEnd)
    })
  })

  const openCount = computed(() => announcements.value.filter(item => item.status === 'OPEN').length)

  async function fetchAnnouncements() {
    announcements.value = [...mockAnnouncements]
    if (!useBackendData) return

    loading.value = true
    error.value = ''
    try {
      const response = await announcementApi.getAll()
      const backendItems = unwrapList(response.data)
      if (backendItems.length) {
        announcements.value = backendItems.map(normalizeLegacyAnnouncement)
      }
    } catch (exception) {
      console.warn('[AnnouncementStore] 백엔드 연결 실패, Mock 데이터를 사용합니다.', exception)
      error.value = '현재 데모 데이터를 표시하고 있습니다.'
    } finally {
      loading.value = false
    }
  }

  async function fetchAnnouncement(id) {
    const numericId = Number(id)
    selectedAnnouncement.value = announcements.value.find(item => Number(item.id) === numericId)
      || mockAnnouncements.find(item => Number(item.id) === numericId)
      || null

    if (!useBackendData) return selectedAnnouncement.value

    loading.value = true
    try {
      const response = await announcementApi.getById(id)
      const raw = unwrapItem(response.data)
      if (raw?.id) selectedAnnouncement.value = normalizeLegacyAnnouncement(raw)
    } catch (exception) {
      console.warn('[AnnouncementStore] 공고 상세 API 대신 Mock 데이터를 사용합니다.', exception)
    } finally {
      loading.value = false
    }
    return selectedAnnouncement.value
  }

  function resetFilters() {
    Object.assign(filters, {
      query: '',
      source: 'ALL',
      housingType: '전체',
      region: '전체 지역',
      status: 'ALL',
      sort: 'deadline'
    })
  }

  return {
    announcements,
    selectedAnnouncement,
    loading,
    error,
    filters,
    housingTypeOptions,
    sourceOptions,
    regionOptions,
    filteredAnnouncements,
    openCount,
    fetchAnnouncements,
    fetchAnnouncement,
    resetFilters
  }
})
