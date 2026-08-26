// 공고 화면 공통 상수·헬퍼
// 데이터 자체는 백엔드(GET /api/courses)에서만 가져옵니다. 목데이터 없음.

// courses.category 는 지역 코드로 재해석해 쓰고 있습니다.
// (Course.Category enum 을 못 바꾸므로 기존 값을 지역에 매핑)
export const REGION_BY_CATEGORY = {
  SECURITY: '서울',
  MOBILE: '경기',
  DATABASE: '인천',
  OTHER: '기타'
}

// users.id → 공급사. init-db/02_seed_suppliers.sql 과 일치해야 합니다.
export const SUPPLIERS = {
  101: { name: '한국토지주택공사', supplyType: '공공분양' },
  102: { name: '경기주택도시공사', supplyType: '공공분양' },
  103: { name: '포스코이앤씨', supplyType: '민간분양' },
  104: { name: '지에스건설', supplyType: '민간분양' },
  105: { name: '대우건설', supplyType: '민간분양' }
}

export const PUBLIC_SUPPLIER_IDS = [101, 102]

export const housingTypeOptions = ['전체', '공공분양', '민영분양']

export const sourceOptions = [
  { value: 'ALL', label: '전체 기관' },
  { value: 'APPLY_HOME', label: '청약홈' },
  { value: 'LH_PLUS', label: 'LH청약플러스' }
]

export const statusMeta = {
  OPEN: { label: '접수중', className: 'status-open' },
  UPCOMING: { label: '접수예정', className: 'status-upcoming' },
  CLOSED: { label: '접수마감', className: 'status-closed' }
}

export function formatKoreanDate(value, withYear = false) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    year: withYear ? 'numeric' : undefined,
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date)
}

export function getDaysRemaining(endDate) {
  if (!endDate) return -1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(end.getTime())) return -1
  return Math.ceil((end - today) / 86400000)
}

// courses.price 는 "만원" 단위입니다 (48560 = 4억 8,560만원).
// 원 단위로 착각해 그대로 찍으면 7억이 7만원으로 보입니다.
export function formatManwon(manwon) {
  const n = Number(manwon)
  if (!n || Number.isNaN(n)) return '분양가 미공개'
  const eok = Math.floor(n / 10000)
  const man = Math.round(n % 10000)
  if (eok > 0) return man ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`
  return `${man.toLocaleString()}만원`
}
