<template>
  <div>
    <AppHeader />
    <main v-if="announcement" class="detail-page">
      <div class="detail-top">
        <div class="shell">
          <nav class="breadcrumb" aria-label="현재 위치">
            <router-link to="/">홈</router-link><span>›</span><router-link to="/announcements">통합공고</router-link><span>›</span><span>공고 상세</span>
          </nav>
          <div class="detail-heading">
            <div>
              <div class="badge-row">
                <span class="source-badge" :class="announcement.source === 'LH_PLUS' ? 'source-lh' : 'source-home'">{{ announcement.sourceLabel }}</span>
                <span class="status-badge" :class="status.className">{{ status.label }}</span>
                <span class="type-badge">{{ announcement.housingType }}</span>
              </div>
              <h1>{{ announcement.title }}</h1>
              <p>{{ announcement.agency }}</p>
            </div>
            <button type="button" class="share-button" @click="copyLink">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.3 10.8 7.4-4.5M8.3 13.2l7.4 4.5"/></svg>
              {{ copied ? '링크 복사됨' : '공유' }}
            </button>
          </div>
        </div>
      </div>

      <div class="shell detail-layout">
        <div class="detail-content">
          <section class="summary-panel panel">
            <dl>
              <div><dt>공급지역</dt><dd>{{ announcement.region }}</dd></div>
              <div><dt>공급유형</dt><dd>{{ announcement.supplyType }}</dd></div>
              <div><dt>공급규모</dt><dd>{{ announcement.totalUnits ? `총 ${announcement.totalUnits.toLocaleString()}세대` : '공고문 참조' }}</dd></div>
              <div><dt>공급조건</dt><dd>{{ announcement.priceLabel }}</dd></div>
              <div><dt>접수기간</dt><dd>{{ formatKoreanDate(announcement.applyStart, true) }} ~<br>{{ formatKoreanDate(announcement.applyEnd, true) }}</dd></div>
              <div v-if="announcement.resultDate"><dt>당첨자 발표</dt><dd>{{ formatKoreanDate(announcement.resultDate, true) }}</dd></div>
            </dl>
          </section>

          <nav class="section-tabs" aria-label="상세정보 바로가기">
            <a href="#overview">공고개요</a><a href="#eligibility">신청자격</a><a href="#units">주택형 정보</a><a href="#documents">공고문</a>
          </nav>

          <section id="overview" class="content-section panel">
            <div class="section-heading"><span class="section-number">01</span><h2>공고개요</h2></div>
            <p class="lead">{{ announcement.summary }}</p>
            <dl class="info-list">
              <div><dt>소재지</dt><dd>{{ announcement.address }}</dd></div>
              <div><dt>공고일</dt><dd>{{ formatKoreanDate(announcement.announcementDate, true) }}</dd></div>
              <div v-if="announcement.contact"><dt>문의처</dt><dd>{{ announcement.contact }}</dd></div>
              <div v-if="announcement.builder"><dt>시공사</dt><dd>{{ announcement.builder }}</dd></div>
              <div><dt>공급기관</dt><dd>{{ announcement.agency }}</dd></div>
            </dl>
            <div class="notice-box"><strong>꼭 확인하세요</strong><p>본 화면의 정보는 이해를 돕기 위한 요약입니다. 청약 신청 전 반드시 원문 공고문을 확인해 주세요.</p></div>
          </section>

          <section id="eligibility" class="content-section panel">
            <div class="section-heading"><span class="section-number">02</span><h2>공급 구분</h2></div>
            <ul class="check-list">
              <li><span aria-hidden="true">✓</span>{{ announcement.housingType }} · {{ announcement.supplyType }}</li>
              <li><span aria-hidden="true">✓</span>공급기관 {{ announcement.agency }} ({{ announcement.supplyCategory }})</li>
              <li><span aria-hidden="true">✓</span>공급지역 {{ announcement.region }}</li>
            </ul>
            <p class="section-note">세부 소득·자산기준과 우선공급 조건은 원문 공고문을 확인해 주세요.</p>
          </section>

          <section id="units" class="content-section panel">
            <div class="section-heading"><span class="section-number">03</span><h2>주택형 정보</h2></div>
            <div class="table-scroll">
              <table>
                <thead><tr><th>주택형</th><th>전용면적</th><th>총 공급세대</th><th>공급금액</th></tr></thead>
                <tbody>
                  <tr>
                    <td><strong>{{ announcement.unitType || '-' }}</strong></td>
                    <td>{{ announcement.areaM2 ? `${announcement.areaM2}㎡` : '-' }}</td>
                    <td>{{ announcement.totalUnits ? `${announcement.totalUnits.toLocaleString()}세대` : '-' }}</td>
                    <td>{{ announcement.priceLabel }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="section-note">주택형별로 공고가 분리되어 있습니다. 같은 단지의 다른 주택형은 목록에서 확인하세요.</p>
          </section>

          <section id="documents" class="content-section panel">
            <div class="section-heading"><span class="section-number">04</span><h2>원문 공고</h2></div>
            <a v-if="announcement.detailUrl" class="document-row" :href="announcement.detailUrl" target="_blank" rel="noopener">
              <span class="pdf-icon">WEB</span><span><strong>{{ announcement.sourceLabel }} 원문 공고 보기</strong><small>{{ announcement.title }}</small></span><span class="download-icon">↗</span>
            </a>
            <p v-else class="section-note">원문 링크가 제공되지 않은 공고입니다.</p>
          </section>
        </div>

        <aside class="apply-sidebar">
          <div class="apply-card panel">
            <span class="sidebar-label">청약 접수기간</span>
            <strong class="apply-period">{{ shortDate(announcement.applyStart) }} ~ {{ shortDate(announcement.applyEnd) }}</strong>
            <div v-if="announcement.status === 'OPEN'" class="deadline-box"><span>마감까지</span><strong>D-{{ daysLeft }}</strong></div>
            <div v-else-if="announcement.status === 'UPCOMING'" class="deadline-box upcoming"><span>접수 시작</span><strong>{{ shortDate(announcement.applyStart) }}</strong></div>
            <div v-else class="deadline-box closed"><span>접수상태</span><strong>마감</strong></div>

            <template v-if="existingApplication">
              <router-link to="/applications" class="btn btn-outline btn-lg btn-block">신청내역 확인</router-link>
              <p class="apply-help">이미 신청한 공고입니다.</p>
            </template>
            <template v-else>
              <router-link v-if="announcement.status === 'OPEN'" :to="`/apply/${announcement.id}`" class="btn btn-primary btn-lg btn-block">청약 신청하기</router-link>
              <button v-else class="btn btn-ghost btn-lg btn-block" disabled>{{ announcement.status === 'UPCOMING' ? '접수 시작 전입니다' : '접수가 마감되었습니다' }}</button>
              <p class="apply-help">신청 전 자격조건과 원문 공고문을 확인해 주세요.</p>
            </template>

            <div class="sidebar-divider"></div>
            <dl class="sidebar-meta"><div><dt>공고일</dt><dd>{{ formatKoreanDate(announcement.announcementDate) }}</dd></div><div><dt>신청건수</dt><dd>{{ announcement.applicantCount.toLocaleString() }}건</dd></div></dl>
          </div>
          <div class="support-card"><span aria-hidden="true">?</span><div><strong>신청이 어려우신가요?</strong><p>청약상담 1600-1004</p></div></div>
        </aside>
      </div>
    </main>

    <div v-else-if="store.loading" class="loading-state"><div class="spinner" aria-label="공고 불러오는 중"></div></div>

    <!-- 없는 공고 / 조회 실패: 스피너가 무한히 돌지 않도록 -->
    <div v-else class="loading-state" style="flex-direction:column;gap:16px;text-align:center;padding:80px 20px">
      <strong style="font-size:18px">공고를 찾을 수 없습니다</strong>
      <p style="color:#64748b">{{ store.error || '삭제되었거나 존재하지 않는 공고입니다.' }}</p>
      <router-link to="/announcements" class="btn btn-primary">통합공고 목록으로</router-link>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import { formatKoreanDate, getDaysRemaining, statusMeta } from '@/data/announcementMeta.js'
import { useAnnouncementStore } from '@/store/announcement.js'
import { useApplicationStore } from '@/store/application.js'

const route = useRoute()
const store = useAnnouncementStore()
const applicationStore = useApplicationStore()
const copied = ref(false)
const announcement = computed(() => store.selectedAnnouncement)
const status = computed(() => statusMeta[announcement.value?.status] || statusMeta.CLOSED)
const daysLeft = computed(() => announcement.value ? Math.max(0, getDaysRemaining(announcement.value.applyEnd)) : 0)
const existingApplication = computed(() => announcement.value ? applicationStore.getByAnnouncementId(announcement.value.id) : null)

function shortDate(value) { return value?.slice(5).replace('-', '.') || '-' }
async function copyLink() {
  try { await navigator.clipboard.writeText(window.location.href); copied.value = true; setTimeout(() => { copied.value = false }, 1600) } catch { copied.value = false }
}
function downloadNotice() { window.alert('교육용 시연 화면입니다. 실제 서비스에서는 원문 공고문을 다운로드합니다.') }
onMounted(() => store.fetchAnnouncement(route.params.id))
</script>

<style scoped>
.detail-page{padding-bottom:80px}.detail-top{padding:23px 0 34px;background:#fff;border-bottom:1px solid var(--border)}.breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:24px;color:var(--ink-faint);font-size:11px}.breadcrumb a:hover{color:var(--primary)}.detail-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:30px}.badge-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:13px}.source-badge,.status-badge,.type-badge{padding:5px 10px;border-radius:7px;font-size:11px;font-weight:800}.source-home{color:#2259af;background:#eaf1ff}.source-lh{color:#087b70;background:#e6f8f5}.type-badge{color:#66519b;background:#f0ebfb}.detail-heading h1{max-width:850px;font-size:clamp(27px,3vw,38px);line-height:1.35;letter-spacing:-.045em}.detail-heading p{margin-top:10px;color:var(--ink-muted);font-size:14px}.share-button{display:flex;align-items:center;gap:7px;padding:10px 13px;color:var(--ink-muted);background:#f6f8fa;border:1px solid var(--border);border-radius:10px;font-size:12px;font-weight:700}.share-button svg{width:17px;fill:none;stroke:currentColor;stroke-width:1.8}.detail-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:26px;margin-top:28px}.detail-content{min-width:0}.summary-panel{padding:25px}.summary-panel dl{display:grid;grid-template-columns:repeat(3,1fr);gap:0}.summary-panel dl>div{min-height:80px;padding:13px 22px;border-right:1px solid var(--border)}.summary-panel dl>div:nth-child(3n){border:0}.summary-panel dl>div:nth-child(n+4){border-top:1px solid var(--border)}.summary-panel dt{color:var(--ink-faint);font-size:11px;font-weight:700}.summary-panel dd{margin-top:5px;color:var(--ink);font-size:14px;font-weight:750;line-height:1.55}.section-tabs{position:sticky;z-index:20;top:110px;display:grid;grid-template-columns:repeat(4,1fr);margin:20px 0;background:white;border:1px solid var(--border);border-radius:13px;box-shadow:var(--shadow-sm)}.section-tabs a{padding:14px;text-align:center;color:var(--ink-muted);border-right:1px solid var(--border);font-size:12px;font-weight:700}.section-tabs a:last-child{border:0}.section-tabs a:hover{color:var(--primary);background:var(--primary-soft)}.content-section{margin-bottom:18px;padding:30px}.section-heading{display:flex;align-items:center;gap:11px;margin-bottom:22px}.section-number{width:30px;height:30px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border-radius:9px;font-size:10px;font-weight:850}.section-heading h2{font-size:20px;letter-spacing:-.025em}.lead{color:var(--ink-muted);font-size:14px;line-height:1.8}.info-list{margin-top:22px;border-top:1px solid var(--border)}.info-list>div{display:grid;grid-template-columns:125px 1fr;padding:14px 5px;border-bottom:1px solid var(--border);font-size:13px}.info-list dt{color:var(--ink-faint);font-weight:700}.info-list dd{color:var(--ink);font-weight:650}.notice-box{margin-top:22px;padding:16px 18px;background:#fff7e9;border-left:4px solid #e59b31;border-radius:8px}.notice-box strong{display:block;color:#8a570d;font-size:13px}.notice-box p{margin-top:4px;color:#785f3b;font-size:12px}.check-list{display:grid;gap:11px}.check-list li{display:flex;align-items:flex-start;gap:10px;padding:14px;background:#f7fafc;border-radius:10px;color:#344258;font-size:13px}.check-list li span{width:21px;height:21px;display:grid;place-items:center;flex:0 0 auto;color:#fff;background:var(--secondary);border-radius:50%;font-size:10px;font-weight:900}.section-note{margin-top:15px;color:var(--ink-faint);font-size:11px}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:12px}th{padding:12px;color:var(--ink-muted);background:#f4f6f9;border-top:1px solid var(--border);border-bottom:1px solid var(--border);text-align:left;white-space:nowrap}td{padding:14px 12px;border-bottom:1px solid var(--border);white-space:nowrap}.document-row{width:100%;display:grid;grid-template-columns:45px 1fr auto;align-items:center;gap:13px;padding:15px;text-align:left;background:#f8fafd;border:1px solid var(--border);border-radius:11px}.pdf-icon{width:43px;height:43px;display:grid;place-items:center;color:#c3483e;background:#fff0ee;border-radius:10px;font-size:10px;font-weight:900}.document-row strong,.document-row small{display:block}.document-row strong{font-size:13px}.document-row small{margin-top:3px;color:var(--ink-faint);font-size:10px}.download-icon{color:var(--primary);font-size:22px}.apply-sidebar{position:relative}.apply-card{position:sticky;top:130px;padding:24px}.sidebar-label{color:var(--ink-faint);font-size:11px;font-weight:700}.apply-period{display:block;margin:5px 0 18px;font-size:17px}.deadline-box{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding:13px 14px;color:#166b48;background:#e8f8ef;border-radius:10px}.deadline-box span{font-size:11px}.deadline-box strong{font-size:18px}.deadline-box.upcoming{color:#925503;background:#fff3dc}.deadline-box.closed{color:#677184;background:#edf0f4}.apply-help{margin-top:10px;color:var(--ink-faint);font-size:10px;line-height:1.6;text-align:center}.sidebar-divider{height:1px;margin:20px 0;background:var(--border)}.sidebar-meta{display:grid;grid-template-columns:1fr 1fr}.sidebar-meta div:last-child{padding-left:14px;border-left:1px solid var(--border)}.sidebar-meta dt{color:var(--ink-faint);font-size:10px}.sidebar-meta dd{margin-top:3px;font-size:12px;font-weight:750}.support-card{display:flex;align-items:center;gap:11px;margin-top:13px;padding:15px;color:#536176;background:#eef3fa;border-radius:13px}.support-card>span{width:32px;height:32px;display:grid;place-items:center;background:#fff;border-radius:50%;font-weight:850}.support-card strong{display:block;font-size:11px}.support-card p{margin-top:2px;font-size:10px}@media(max-width:900px){.detail-layout{grid-template-columns:1fr}.apply-sidebar{grid-row:1}.apply-card{position:static}.summary-panel dl{grid-template-columns:1fr 1fr}.summary-panel dl>div{border-right:1px solid var(--border)!important;border-top:1px solid var(--border)}.summary-panel dl>div:nth-child(2n){border-right:0!important}.summary-panel dl>div:nth-child(-n+2){border-top:0}.support-card{display:none}.section-tabs{top:99px}}@media(max-width:600px){.detail-top{padding-bottom:26px}.detail-heading{flex-direction:column}.detail-heading h1{font-size:27px}.share-button{align-self:flex-end}.detail-layout{margin-top:18px}.summary-panel{padding:12px}.summary-panel dl{grid-template-columns:1fr}.summary-panel dl>div{min-height:auto;padding:13px;border-right:0!important;border-top:1px solid var(--border)!important}.summary-panel dl>div:first-child{border-top:0!important}.section-tabs{top:99px;overflow-x:auto;grid-template-columns:repeat(4,minmax(90px,1fr))}.section-tabs a{padding:12px 8px;white-space:nowrap}.content-section{padding:22px}.info-list>div{grid-template-columns:90px 1fr}.apply-period{font-size:16px}}
</style>
