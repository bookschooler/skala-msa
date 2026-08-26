<template>
  <div>
    <AppHeader />
    <main class="page-main">
      <div class="shell">
        <div class="page-heading heading-row">
          <div><span class="eyebrow">내 청약</span><h1 class="page-title">청약 신청내역</h1><p class="page-description">신청한 공고의 접수상태와 향후 일정을 확인할 수 있습니다.</p></div>
          <router-link to="/announcements" class="btn btn-primary">새 공고 찾기</router-link>
        </div>

        <div class="summary-grid">
          <div class="summary-item"><span class="summary-icon blue">✓</span><div><small>전체 신청</small><strong>{{ applicationStore.applications.length }}</strong></div></div>
          <div class="summary-item"><span class="summary-icon green">↻</span><div><small>진행 중</small><strong>{{ applicationStore.activeApplications.length }}</strong></div></div>
          <div class="summary-item"><span class="summary-icon orange">☆</span><div><small>결과 대기</small><strong>{{ awaitingResultCount }}</strong></div></div>
        </div>

        <section class="applications-panel panel">
          <div class="panel-toolbar"><h2>신청내역</h2><select v-model="statusFilter" class="sort-select" aria-label="신청상태 필터"><option value="ALL">전체 상태</option><option value="RECEIVED">접수완료</option><option value="CANCELLED">취소</option></select></div>
          <div v-if="filteredApplications.length" class="application-list">
            <article v-for="item in filteredApplications" :key="item.id" class="application-row">
              <div class="application-date"><strong>{{ datePart(item.submittedAt, 'day') }}</strong><span>{{ datePart(item.submittedAt, 'month') }}</span></div>
              <div class="application-main">
                <div class="row-badges"><span class="source-tag">{{ item.sourceLabel }}</span><span class="application-status" :class="statusInfo(item.status).className">{{ statusInfo(item.status).label }}</span></div>
                <router-link :to="`/announcements/${item.announcementId}`" class="application-title">{{ item.announcementTitle }}</router-link>
                <div class="application-meta"><span>{{ item.region }}</span><span>{{ item.housingType }}</span><span>주택형 {{ item.unitType }}</span><span>접수번호 {{ item.id }}</span></div>
              </div>
              <div class="application-schedule"><small>당첨자 발표</small><strong>{{ formatKoreanDate(item.resultDate, true) }}</strong></div>
              <div class="application-actions"><router-link :to="`/announcements/${item.announcementId}`" class="btn btn-ghost">상세보기</router-link><button v-if="item.status === 'RECEIVED'" type="button" class="cancel-link" @click="cancel(item)">신청취소</button></div>
            </article>
          </div>
          <div v-else class="empty-state"><div class="empty-icon">⌂</div><h3>청약 신청내역이 없습니다</h3><p>통합공고에서 나에게 맞는 청약을 찾아보세요.</p><router-link to="/announcements" class="btn btn-primary">통합공고 둘러보기</router-link></div>
        </section>

        <div class="help-banner"><span class="help-icon">i</span><div><strong>신청취소 전에 확인해 주세요</strong><p>청약 접수기간이 지난 공고는 취소할 수 없으며, 취소 후에는 되돌릴 수 없습니다.</p></div><a href="tel:16001004">고객센터 1600-1004</a></div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import { formatKoreanDate } from '@/data/mockAnnouncements.js'
import { useApplicationStore } from '@/store/application.js'

const applicationStore = useApplicationStore()
const statusFilter = ref('ALL')
const awaitingResultCount = computed(() => applicationStore.applications.filter(item => item.status === 'RECEIVED').length)
const filteredApplications = computed(() => statusFilter.value === 'ALL' ? applicationStore.applications : applicationStore.applications.filter(item => item.status === statusFilter.value))
const statusMap = { RECEIVED: { label: '접수완료', className: 'app-received' }, REVIEWING: { label: '자격검증중', className: 'app-reviewing' }, SELECTED: { label: '당첨', className: 'app-selected' }, CANCELLED: { label: '신청취소', className: 'app-cancelled' } }
function statusInfo(value) { return statusMap[value] || statusMap.RECEIVED }
function datePart(value, part) { const date = new Date(value); return part === 'day' ? String(date.getDate()).padStart(2, '0') : `${date.getMonth() + 1}월` }
async function cancel(item) { if (window.confirm(`${item.announcementTitle}\n청약 신청을 취소하시겠습니까?`)) await applicationStore.cancelApplication(item.id) }
</script>

<style scoped>
.heading-row{display:flex;align-items:flex-end;justify-content:space-between;gap:24px}.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:23px}.summary-item{display:flex;align-items:center;gap:15px;padding:19px 22px;background:white;border:1px solid var(--border);border-radius:14px}.summary-icon{width:43px;height:43px;display:grid;place-items:center;border-radius:13px;font-weight:850}.summary-icon.blue{color:#2259af;background:#eaf1ff}.summary-icon.green{color:#087b70;background:#e6f8f5}.summary-icon.orange{color:#a05a00;background:#fff4df}.summary-item small,.summary-item strong{display:block}.summary-item small{color:var(--ink-faint);font-size:11px}.summary-item strong{font-size:21px}.applications-panel{overflow:hidden}.panel-toolbar{min-height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:1px solid var(--border)}.panel-toolbar h2{font-size:17px}.sort-select{padding:8px 27px 8px 10px;color:var(--ink-muted);background:#fff;border:1px solid var(--border);border-radius:8px;font-size:11px}.application-row{display:grid;grid-template-columns:60px minmax(0,1fr) 150px 100px;align-items:center;gap:20px;padding:22px 24px;border-bottom:1px solid var(--border)}.application-row:last-child{border:0}.application-row:hover{background:#fbfcfe}.application-date{padding-right:17px;text-align:center;border-right:1px solid var(--border)}.application-date strong,.application-date span{display:block}.application-date strong{font-size:22px}.application-date span{color:var(--ink-faint);font-size:10px}.row-badges{display:flex;gap:7px;margin-bottom:7px}.source-tag,.application-status{padding:3px 7px;border-radius:6px;font-size:9px;font-weight:800}.source-tag{color:#45607d;background:#edf2f7}.application-title{overflow:hidden;display:block;color:var(--ink);font-size:15px;font-weight:750;text-overflow:ellipsis;white-space:nowrap}.application-title:hover{color:var(--primary)}.application-meta{display:flex;gap:0;margin-top:7px;color:var(--ink-faint);font-size:10px}.application-meta span{padding:0 9px;border-right:1px solid var(--border)}.application-meta span:first-child{padding-left:0}.application-meta span:last-child{border:0}.application-schedule small,.application-schedule strong{display:block}.application-schedule small{color:var(--ink-faint);font-size:10px}.application-schedule strong{margin-top:4px;font-size:11px}.application-actions{display:grid;gap:5px}.application-actions .btn{min-height:35px;padding:6px 9px;font-size:10px}.cancel-link{padding:5px;color:var(--danger);background:transparent;font-size:10px}.help-banner{display:flex;align-items:center;gap:13px;margin-top:20px;padding:17px 20px;color:#536176;background:#eaf1f9;border-radius:13px}.help-icon{width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;color:white;background:#587ca6;border-radius:50%;font-size:12px;font-weight:850}.help-banner strong{display:block;font-size:11px}.help-banner p{margin-top:2px;font-size:10px}.help-banner a{margin-left:auto;color:#345f91;font-size:11px;font-weight:750}@media(max-width:820px){.application-row{grid-template-columns:50px minmax(0,1fr) 90px}.application-schedule{display:none}.summary-grid{grid-template-columns:1fr 1fr 1fr}}@media(max-width:600px){.heading-row{align-items:flex-start;flex-direction:column}.summary-grid{grid-template-columns:1fr}.application-row{grid-template-columns:1fr;padding:20px}.application-date{display:none}.application-title{white-space:normal}.application-meta{flex-wrap:wrap;gap:5px}.application-meta span{padding:0 6px}.application-actions{grid-template-columns:1fr 1fr}.help-banner{align-items:flex-start}.help-banner a{display:none}}
</style>
