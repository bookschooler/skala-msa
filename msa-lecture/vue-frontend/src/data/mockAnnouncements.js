export const mockAnnouncements = [
  {
    id: 101,
    source: 'APPLY_HOME',
    sourceLabel: '청약홈',
    title: '서울 강동 고덕강일 A-3BL 공공분양주택',
    housingType: '공공분양',
    supplyType: '신혼희망타운',
    region: '서울특별시',
    district: '강동구',
    status: 'OPEN',
    announcementDate: '2026-08-18',
    applyStart: '2026-08-24',
    applyEnd: '2026-08-28',
    resultDate: '2026-09-04',
    agency: '한국토지주택공사',
    address: '서울특별시 강동구 고덕강일 공공주택지구 A-3BL',
    totalUnits: 498,
    applicantCount: 1248,
    priceLabel: '3억 8,400만원부터',
    contact: '1600-1004',
    views: 18420,
    summary: '한강과 인접한 고덕강일지구의 신혼희망타운 공공분양 공고입니다.',
    tags: ['신혼부부', '생애최초', '공공분양'],
    eligibility: ['무주택세대구성원', '서울·수도권 거주자', '소득 및 자산기준 충족'],
    units: [
      { type: '55A', area: '55.98㎡', count: 238, price: '384,000,000원' },
      { type: '59A', area: '59.99㎡', count: 260, price: '421,000,000원' }
    ],
    accent: 'blue'
  },
  {
    id: 102,
    source: 'LH_PLUS',
    sourceLabel: 'LH청약플러스',
    title: '화성동탄2 A-54BL 행복주택 입주자 모집',
    housingType: '공공임대',
    supplyType: '행복주택',
    region: '경기도',
    district: '화성시',
    status: 'OPEN',
    announcementDate: '2026-08-21',
    applyStart: '2026-08-25',
    applyEnd: '2026-09-02',
    resultDate: '2026-11-27',
    agency: '한국토지주택공사 경기남부지역본부',
    address: '경기도 화성시 동탄순환대로 일원',
    totalUnits: 820,
    applicantCount: 2366,
    priceLabel: '보증금 3,200만원부터',
    contact: '1600-1004',
    views: 22104,
    summary: '청년·신혼부부·고령자를 위한 동탄2신도시 행복주택 입주자 모집입니다.',
    tags: ['청년', '신혼부부', '행복주택'],
    eligibility: ['입주자모집공고일 현재 무주택자', '공급대상별 소득기준 충족', '총자산 및 자동차가액 기준 충족'],
    units: [
      { type: '26A', area: '26.41㎡', count: 310, price: '보증금 32,000,000원' },
      { type: '36A', area: '36.77㎡', count: 330, price: '보증금 48,000,000원' },
      { type: '44A', area: '44.82㎡', count: 180, price: '보증금 61,000,000원' }
    ],
    accent: 'teal'
  },
  {
    id: 103,
    source: 'LH_PLUS',
    sourceLabel: 'LH청약플러스',
    title: '부산명지 B-8BL 국민임대 예비입주자 모집',
    housingType: '공공임대',
    supplyType: '국민임대',
    region: '부산광역시',
    district: '강서구',
    status: 'UPCOMING',
    announcementDate: '2026-08-26',
    applyStart: '2026-09-03',
    applyEnd: '2026-09-09',
    resultDate: '2026-12-11',
    agency: '한국토지주택공사 부산울산지역본부',
    address: '부산광역시 강서구 명지국제신도시 B-8BL',
    totalUnits: 360,
    applicantCount: 0,
    priceLabel: '보증금 2,180만원부터',
    contact: '1600-1004',
    views: 8942,
    summary: '명지국제신도시 내 장기 거주 가능한 국민임대 예비입주자 모집입니다.',
    tags: ['국민임대', '예비입주자', '장기임대'],
    eligibility: ['부산·울산·경남 거주 무주택세대구성원', '가구원수별 월평균소득 기준 충족', '자산보유 기준 충족'],
    units: [
      { type: '39', area: '39.72㎡', count: 140, price: '보증금 21,800,000원' },
      { type: '46', area: '46.88㎡', count: 220, price: '보증금 31,400,000원' }
    ],
    accent: 'purple'
  },
  {
    id: 104,
    source: 'APPLY_HOME',
    sourceLabel: '청약홈',
    title: '인천 검단신도시 AA21BL 민영주택 일반분양',
    housingType: '민영분양',
    supplyType: 'APT 1·2순위',
    region: '인천광역시',
    district: '서구',
    status: 'UPCOMING',
    announcementDate: '2026-08-25',
    applyStart: '2026-09-01',
    applyEnd: '2026-09-03',
    resultDate: '2026-09-10',
    agency: '검단에코건설 주식회사',
    address: '인천광역시 서구 검단신도시 AA21BL',
    totalUnits: 672,
    applicantCount: 0,
    priceLabel: '4억 9,800만원부터',
    contact: '1588-2026',
    views: 32110,
    summary: '검단신도시 역세권 생활 인프라를 갖춘 민영주택 일반분양 공고입니다.',
    tags: ['민영주택', '일반공급', '특별공급'],
    eligibility: ['수도권 거주 만 19세 이상', '청약통장 가입기간 및 예치금 충족', '공급유형별 자격조건 충족'],
    units: [
      { type: '59A', area: '59.96㎡', count: 264, price: '498,000,000원' },
      { type: '74A', area: '74.91㎡', count: 196, price: '579,000,000원' },
      { type: '84A', area: '84.98㎡', count: 212, price: '642,000,000원' }
    ],
    accent: 'orange'
  },
  {
    id: 105,
    source: 'APPLY_HOME',
    sourceLabel: '청약홈',
    title: '대전 도안2-5지구 리버파크 무순위 청약',
    housingType: '무순위',
    supplyType: 'APT 잔여세대',
    region: '대전광역시',
    district: '유성구',
    status: 'CLOSED',
    announcementDate: '2026-08-06',
    applyStart: '2026-08-10',
    applyEnd: '2026-08-12',
    resultDate: '2026-08-19',
    agency: '도안리버파크 주식회사',
    address: '대전광역시 유성구 도안2-5지구',
    totalUnits: 18,
    applicantCount: 12830,
    priceLabel: '5억 2,100만원부터',
    contact: '1566-2525',
    views: 48772,
    summary: '계약 취소분을 대상으로 진행한 도안신도시 무순위 청약 공고입니다.',
    tags: ['무순위', '잔여세대'],
    eligibility: ['국내 거주 만 19세 이상', '재당첨 제한사항 확인', '공고문상 신청제한 대상이 아닐 것'],
    units: [
      { type: '84A', area: '84.95㎡', count: 18, price: '521,000,000원' }
    ],
    accent: 'gray'
  },
  {
    id: 106,
    source: 'LH_PLUS',
    sourceLabel: 'LH청약플러스',
    title: '세종 조치원 공공전세주택 입주자 모집',
    housingType: '공공전세',
    supplyType: '공공전세주택',
    region: '세종특별자치시',
    district: '조치원읍',
    status: 'OPEN',
    announcementDate: '2026-08-24',
    applyStart: '2026-08-26',
    applyEnd: '2026-09-11',
    resultDate: '2026-10-30',
    agency: '한국토지주택공사 세종특별본부',
    address: '세종특별자치시 조치원읍 일원',
    totalUnits: 124,
    applicantCount: 402,
    priceLabel: '전세금 1억 2,000만원부터',
    contact: '1600-1004',
    views: 6672,
    summary: '무주택 가구의 주거 안정을 위한 시세 이하 공공전세주택 모집입니다.',
    tags: ['공공전세', '무주택가구', '세종'],
    eligibility: ['무주택세대구성원', '세종·충청권 거주자 우선', '소득기준 없음'],
    units: [
      { type: '52A', area: '52.18㎡', count: 68, price: '전세금 120,000,000원' },
      { type: '59A', area: '59.74㎡', count: 56, price: '전세금 148,000,000원' }
    ],
    accent: 'green'
  }
]

export const housingTypeOptions = ['전체', '공공분양', '민영분양', '공공임대', '공공전세', '무순위']
export const sourceOptions = [
  { value: 'ALL', label: '전체 기관' },
  { value: 'APPLY_HOME', label: '청약홈' },
  { value: 'LH_PLUS', label: 'LH청약플러스' }
]
export const regionOptions = ['전체 지역', ...new Set(mockAnnouncements.map(item => item.region))]

export const statusMeta = {
  OPEN: { label: '접수중', className: 'status-open' },
  UPCOMING: { label: '접수예정', className: 'status-upcoming' },
  CLOSED: { label: '접수마감', className: 'status-closed' }
}

export function formatKoreanDate(value, withYear = false) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('ko-KR', {
    year: withYear ? 'numeric' : undefined,
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date)
}

export function getDaysRemaining(endDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(`${endDate}T00:00:00`)
  return Math.ceil((end - today) / 86400000)
}
