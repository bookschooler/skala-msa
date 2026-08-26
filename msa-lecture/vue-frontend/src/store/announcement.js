import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { announcementApi } from '@/api/announcement.js'
import {
  REGION_BY_CATEGORY,
  SUPPLIERS,
  formatManwon,
  getDaysRemaining,
  housingTypeOptions,
  sourceOptions
} from '@/data/announcementMeta.js'

// 백엔드 응답(courses)만 사용합니다. 목데이터는 쓰지 않습니다.

function unwrapList(payload) {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

function unwrapItem(payload) {
  return payload?.data && typeof payload.data === 'object' ? payload.data : payload
}

// courses.description 에는 화면용 값이 JSON 으로 들어 있습니다.
// (courses 스키마를 바꿀 수 없어 TEXT 컬럼에 구조화해 담았습니다)
function parseDetail(description) {
  if (!description) return {}
  try {
    const parsed = JSON.parse(description)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

// 접수 시작·마감일로 상태를 계산합니다. 날짜가 없으면 courses.status 를 씁니다.
function resolveStatus(course, detail) {
  if (course.status === 'INACTIVE') return 'CLOSED'
  const today = new Date().toISOString().slice(0, 10)
  if (detail.applyEnd && detail.applyEnd < today) return 'CLOSED'
  if (detail.applyStart && detail.applyStart > today) return 'UPCOMING'
  return 'OPEN'
}

function toAnnouncement(course) {
  const detail = parseDetail(course.description)
  const supplier = SUPPLIERS[course.instructorId] || {}
  const region = detail.region || REGION_BY_CATEGORY[course.category] || '기타'

  return {
    id: course.id,
    source: detail.source || 'APPLY_HOME',
    sourceLabel: detail.sourceLabel || '청약홈',
    title: course.title,
    summary: detail.summary || '',
    housingType: detail.housingType || supplier.supplyType || '분양',
    supplyType: detail.supplyType || '분양주택',
    region,
    district: '',
    status: resolveStatus(course, detail),
    announcementDate: detail.announcementDate || (course.createdAt || '').slice(0, 10),
    applyStart: detail.applyStart || '',
    applyEnd: detail.applyEnd || '',
    resultDate: detail.resultDate || '',
    agency: supplier.name || `공급사 #${course.instructorId}`,
    supplyCategory: supplier.supplyType || '',
    address: detail.address || '',
    unitType: detail.unitType || '',
    areaM2: detail.areaM2 || '',
    totalUnits: detail.totalUnits ? Number(detail.totalUnits) : null,
    applicantCount: Number(course.enrollmentCount ?? 0),
    priceManwon: Number(course.price ?? 0),
    priceLabel: formatManwon(course.price),
    contact: detail.contact || '',
    builder: detail.builder || '',
    detailUrl: detail.detailUrl || '',
    accent: course.instructorId % 2 === 0 ? 'blue' : 'green'
  }
}

export const useAnnouncementStore = defineStore('announcement', () => {
  const announcements = ref([])
  const selectedAnnouncement = ref(null)
  const loading = ref(false)
  const error = ref('')
  const loaded = ref(false)

  const filters = reactive({
    query: '',
    source: 'ALL',
    housingType: '전체',
    region: '전체 지역',
    status: 'ALL',
    sort: 'deadline'
  })

  // 실제로 들어온 데이터에서 지역 목록을 만듭니다 (고정 목록 아님)
  const regionOptions = computed(() => [
    '전체 지역',
    ...[...new Set(announcements.value.map(item => item.region).filter(Boolean))].sort()
  ])

  const filteredAnnouncements = computed(() => {
    const keyword = filters.query.trim().toLowerCase()
    const items = announcements.value.filter(item => {
      const matchesKeyword = !keyword || [
        item.title, item.region, item.agency, item.housingType, item.supplyType, item.address
      ].some(value => String(value || '').toLowerCase().includes(keyword))

      return matchesKeyword
        && (filters.source === 'ALL' || item.source === filters.source)
        && (filters.housingType === '전체' || item.housingType === filters.housingType)
        && (filters.region === '전체 지역' || item.region === filters.region)
        && (filters.status === 'ALL' || item.status === filters.status)
    })

    return [...items].sort((a, b) => {
      if (filters.sort === 'latest') return String(b.announcementDate).localeCompare(String(a.announcementDate))
      if (filters.sort === 'popular') return b.applicantCount - a.applicantCount
      if (filters.sort === 'price') return b.priceManwon - a.priceManwon
      if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1
      if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1
      return String(a.applyEnd).localeCompare(String(b.applyEnd))
    })
  })

  const openCount = computed(() => announcements.value.filter(item => item.status === 'OPEN').length)

  async function fetchAnnouncements() {
    loading.value = true
    error.value = ''
    try {
      const response = await announcementApi.getAll()
      announcements.value = unwrapList(response.data).map(toAnnouncement)
      loaded.value = true
      if (!announcements.value.length) {
        error.value = '등록된 분양공고가 없습니다.'
      }
    } catch (exception) {
      console.error('[AnnouncementStore] 공고 목록 조회 실패', exception)
      announcements.value = []
      error.value = '분양공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
    } finally {
      loading.value = false
    }
  }

  async function fetchAnnouncement(id) {
    const numericId = Number(id)
    selectedAnnouncement.value =
      announcements.value.find(item => Number(item.id) === numericId) || null

    loading.value = true
    error.value = ''
    try {
      const response = await announcementApi.getById(id)
      const raw = unwrapItem(response.data)
      if (raw?.id) selectedAnnouncement.value = toAnnouncement(raw)
    } catch (exception) {
      console.error('[AnnouncementStore] 공고 상세 조회 실패', exception)
      if (!selectedAnnouncement.value) error.value = '공고를 불러오지 못했습니다.'
    } finally {
      loading.value = false
    }
    return selectedAnnouncement.value
  }

  function resetFilters() {
    Object.assign(filters, {
      query: '', source: 'ALL', housingType: '전체',
      region: '전체 지역', status: 'ALL', sort: 'deadline'
    })
  }

  return {
    announcements, selectedAnnouncement, loading, error, loaded, filters,
    housingTypeOptions, sourceOptions, regionOptions,
    filteredAnnouncements, openCount,
    fetchAnnouncements, fetchAnnouncement, resetFilters,
    getDaysRemaining
  }
})
