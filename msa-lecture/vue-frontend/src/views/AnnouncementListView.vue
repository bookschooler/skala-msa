<template>
  <div>
    <AppHeader />
    <main class="page-main">
      <div class="shell">
        <div class="page-heading">
          <span class="eyebrow">통합공고</span>
          <h1 class="page-title">모든 청약공고를 한곳에서</h1>
          <p class="page-description">청약홈과 LH청약플러스의 공고를 출처 구분 없이 비교하고 검색할 수 있습니다.</p>
        </div>

        <section class="search-panel panel" aria-label="공고 검색 필터">
          <form @submit.prevent>
            <div class="main-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
              <label for="announcement-search" class="sr-only">공고명 검색</label>
              <input id="announcement-search" v-model="store.filters.query" placeholder="공고명, 지역, 공급기관으로 검색" />
              <button type="button" class="btn btn-primary" @click="applySearch">검색</button>
            </div>
            <div class="filter-grid">
              <label><span>공급기관</span><select v-model="store.filters.source" class="select"><option v-for="option in store.sourceOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label>
              <label><span>주택유형</span><select v-model="store.filters.housingType" class="select"><option v-for="option in store.housingTypeOptions" :key="option" :value="option">{{ option }}</option></select></label>
              <label><span>지역</span><select v-model="store.filters.region" class="select"><option v-for="option in store.regionOptions" :key="option" :value="option">{{ option }}</option></select></label>
              <label><span>접수상태</span><select v-model="store.filters.status" class="select"><option value="ALL">전체 상태</option><option value="OPEN">접수중</option><option value="UPCOMING">접수예정</option><option value="CLOSED">접수마감</option></select></label>
              <button type="button" class="reset-button" @click="resetFilters"><span aria-hidden="true">↻</span> 초기화</button>
            </div>
          </form>
        </section>

        <div class="result-toolbar">
          <div>총 <strong>{{ store.filteredAnnouncements.length }}</strong>개의 공고</div>
          <select v-model="store.filters.sort" class="sort-select" aria-label="공고 정렬">
            <option value="deadline">마감일 빠른순</option>
            <option value="latest">최신 공고순</option>
            <option value="popular">조회 많은순</option>
          </select>
        </div>

        <div v-if="store.filteredAnnouncements.length" class="result-grid">
          <AnnouncementCard v-for="item in store.filteredAnnouncements" :key="item.id" :announcement="item" />
        </div>
        <div v-else class="panel empty-state">
          <div class="empty-icon">⌕</div><h3>조건에 맞는 공고가 없습니다</h3><p>검색어 또는 필터 조건을 변경해 보세요.</p><button class="btn btn-outline" @click="resetFilters">검색조건 초기화</button>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AnnouncementCard from '@/components/AnnouncementCard.vue'
import { useAnnouncementStore } from '@/store/announcement.js'

const store = useAnnouncementStore()
const route = useRoute()
const router = useRouter()

function applySearch() {
  router.replace({ query: store.filters.query ? { q: store.filters.query } : {} })
}

function resetFilters() {
  store.resetFilters()
  router.replace({ query: {} })
}

onMounted(() => {
  if (route.query.q) store.filters.query = String(route.query.q)
  if (route.query.sort) store.filters.sort = String(route.query.sort)
  store.fetchAnnouncements()
})
</script>

<style scoped>
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.search-panel{padding:22px}.main-search{height:54px;display:flex;align-items:center;gap:12px;padding:5px 5px 5px 15px;background:#f8fafd;border:1px solid var(--border-strong);border-radius:12px}.main-search:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(31,95,196,.1)}.main-search svg{width:21px;flex:0 0 auto;fill:none;stroke:#7d899b;stroke-width:2}.main-search input{min-width:0;flex:1;background:transparent;border:0;outline:0;font-size:15px}.main-search .btn{min-height:42px}.filter-grid{display:grid;grid-template-columns:repeat(4,1fr) auto;align-items:end;gap:14px;margin-top:17px}.filter-grid label>span{display:block;margin-bottom:6px;color:var(--ink-faint);font-size:11px;font-weight:750}.filter-grid .select{min-height:42px;font-size:13px}.reset-button{height:42px;padding:0 12px;color:var(--ink-muted);background:#fff;font-size:12px;font-weight:700}.result-toolbar{display:flex;align-items:center;justify-content:space-between;margin:31px 0 16px;color:var(--ink-muted);font-size:14px}.result-toolbar strong{color:var(--primary);font-size:17px}.sort-select{padding:8px 28px 8px 10px;color:var(--ink-muted);background:white;border:1px solid var(--border);border-radius:9px;font-size:12px}.result-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}@media(max-width:1020px){.filter-grid{grid-template-columns:1fr 1fr}.reset-button{justify-self:start}.result-grid{grid-template-columns:1fr 1fr}}@media(max-width:640px){.search-panel{padding:16px}.main-search .btn{padding:8px 14px}.filter-grid{grid-template-columns:1fr}.result-grid{grid-template-columns:1fr}.result-toolbar{margin-top:24px}}
</style>
