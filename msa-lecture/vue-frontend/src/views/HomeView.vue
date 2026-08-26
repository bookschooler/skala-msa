<template>
  <div>
    <AppHeader />

    <main>
      <section class="hero-section">
        <div class="hero-pattern" aria-hidden="true"></div>
        <div class="shell hero-inner">
          <div class="hero-copy rise">
            <span class="hero-kicker">청약정보, 이제 헤매지 마세요</span>
            <h1>흩어진 청약 정보를<br><em>한곳에서, 한 번에.</em></h1>
            <p>청약홈과 LH청약플러스의 공고를 통합 검색하고<br class="desktop-only"> 내 조건에 맞는 청약까지 빠르게 확인하세요.</p>

            <form class="hero-search" role="search" @submit.prevent="search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
              <label for="home-search" class="sr-only">통합 청약공고 검색</label>
              <input id="home-search" v-model="keyword" placeholder="지역, 공고명, 주택유형을 검색해 보세요" />
              <button type="submit">통합검색</button>
            </form>

            <div class="popular-searches">
              <span>추천 검색어</span>
              <button v-for="word in popularWords" :key="word" type="button" @click="quickSearch(word)">#{{ word }}</button>
            </div>
          </div>

          <div class="hero-dashboard rise" aria-label="청약 일정 요약">
            <div class="dashboard-head">
              <div>
                <span>오늘의 청약</span>
                <strong>2026. 08. 26. 수요일</strong>
              </div>
              <span class="live-dot">LIVE</span>
            </div>
            <div class="dashboard-stats">
              <div><strong>{{ store.openCount }}</strong><span>접수중 공고</span></div>
              <div><strong>2</strong><span>오늘 시작</span></div>
              <div><strong>1</strong><span>마감 임박</span></div>
            </div>
            <div class="schedule-list">
              <router-link v-for="item in todayItems" :key="item.id" :to="`/announcements/${item.id}`">
                <span class="schedule-time">{{ item.status === 'OPEN' ? '접수중' : '예정' }}</span>
                <span class="schedule-title">{{ item.title }}</span>
                <span aria-hidden="true">›</span>
              </router-link>
            </div>
            <router-link to="/announcements" class="dashboard-link">전체 공고 일정 보기 <span aria-hidden="true">→</span></router-link>
          </div>
        </div>
      </section>

      <section class="quick-section">
        <div class="shell quick-grid">
          <router-link v-for="item in quickMenus" :key="item.title" :to="item.to" class="quick-card">
            <span class="quick-icon" :class="item.color" v-html="item.icon"></span>
            <span><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
            <span class="quick-arrow" aria-hidden="true">→</span>
          </router-link>
        </div>
      </section>

      <section class="featured-section">
        <div class="shell">
          <div class="section-head">
            <div>
              <span class="eyebrow">추천 공고</span>
              <h2 class="section-title">지금 놓치면 아쉬운 청약</h2>
              <p class="section-subtitle">현재 접수 중이거나 곧 시작하는 주요 공고를 모았습니다.</p>
            </div>
            <router-link to="/announcements" class="more-link">통합공고 전체보기 <span aria-hidden="true">→</span></router-link>
          </div>
          <div class="featured-grid">
            <AnnouncementCard v-for="item in featured" :key="item.id" :announcement="item" />
          </div>
        </div>
      </section>

      <section class="guide-section">
        <div class="shell guide-inner">
          <div class="guide-copy">
            <span class="eyebrow light">처음이신가요?</span>
            <h2>복잡한 청약도<br>모아청약과 함께라면 쉽습니다.</h2>
            <p>공고 찾기부터 신청 완료까지 한 흐름으로 안내해 드립니다.</p>
            <router-link to="/announcements" class="btn guide-button">청약 시작하기 <span aria-hidden="true">→</span></router-link>
          </div>
          <ol class="guide-steps">
            <li><span>01</span><div><strong>통합공고 검색</strong><p>기관 구분 없이 조건에 맞는 공고를 찾습니다.</p></div></li>
            <li><span>02</span><div><strong>자격조건 확인</strong><p>복잡한 신청조건을 핵심만 쉽게 확인합니다.</p></div></li>
            <li><span>03</span><div><strong>한 번에 신청</strong><p>단계별 안내에 따라 빠짐없이 신청합니다.</p></div></li>
          </ol>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AnnouncementCard from '@/components/AnnouncementCard.vue'
import { useAnnouncementStore } from '@/store/announcement.js'

const router = useRouter()
const store = useAnnouncementStore()
const keyword = ref('')
const popularWords = ['서울', '행복주택', '신혼부부', '무순위']

const todayItems = computed(() => store.announcements.filter(item => ['OPEN', 'UPCOMING'].includes(item.status)).slice(0, 3))
const featured = computed(() => store.announcements.filter(item => item.status !== 'CLOSED').slice(0, 3))

const quickMenus = [
  { title: '통합공고 찾기', description: '기관별 공고를 한 번에 검색', to: '/announcements', color: 'blue', icon: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>' },
  { title: '내 청약 확인', description: '신청내역과 진행상태 확인', to: '/applications', color: 'green', icon: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>' },
  { title: '청약자격 가이드', description: '나에게 맞는 조건 알아보기', to: '/mypage', color: 'purple', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="m17 5 1 1 2-2"/></svg>' },
  { title: '청약 일정', description: '다가오는 접수일 한눈에 보기', to: '/announcements?sort=deadline', color: 'orange', icon: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>' }
]

function search() {
  store.filters.query = keyword.value
  router.push({ path: '/announcements', query: keyword.value ? { q: keyword.value } : {} })
}

function quickSearch(word) {
  keyword.value = word
  search()
}

onMounted(() => store.fetchAnnouncements())
</script>

<style scoped>
.sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
.hero-section { position:relative;overflow:hidden;color:white;background:linear-gradient(128deg,#173f89 0%,#1d5fc5 56%,#2077d9 100%); }.hero-pattern { position:absolute;inset:0;background-image:radial-gradient(circle at 78% 20%,rgba(255,255,255,.12) 0 2px,transparent 3px),linear-gradient(120deg,transparent 58%,rgba(255,255,255,.05) 58% 59%,transparent 59%);background-size:34px 34px,100% 100%;mask-image:linear-gradient(to left,#000,transparent 75%); }
.hero-inner { position:relative;min-height:470px;display:grid;grid-template-columns:1.2fr .8fr;align-items:center;gap:70px;padding-top:48px;padding-bottom:48px; }.hero-kicker { display:inline-block;margin-bottom:17px;padding:6px 11px;color:#d7e6ff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:8px;font-size:12px;font-weight:750; }.hero-copy h1 { font-size:clamp(38px,4.6vw,58px);line-height:1.2;letter-spacing:-.06em; }.hero-copy h1 em { color:#8fe3d8;font-style:normal; }.hero-copy>p { margin-top:18px;color:#d8e4f6;font-size:16px;line-height:1.8; }
.hero-search { max-width:650px;height:62px;display:flex;align-items:center;gap:12px;margin-top:30px;padding:7px 7px 7px 18px;background:white;border-radius:14px;box-shadow:0 18px 40px rgba(8,30,72,.24); }.hero-search svg { width:21px;flex:0 0 auto;fill:none;stroke:#75849a;stroke-width:2; }.hero-search input { min-width:0;flex:1;border:0;outline:0;color:var(--ink);font-size:15px; }.hero-search button { height:48px;padding:0 22px;color:white;background:#0a8f83;border-radius:10px;font-size:14px;font-weight:800; }.popular-searches { margin-top:13px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;color:#cedbf0;font-size:12px; }.popular-searches button { color:white;background:transparent;font-size:12px;opacity:.88; }.popular-searches button:hover { text-decoration:underline;opacity:1; }
.hero-dashboard { padding:23px;background:rgba(255,255,255,.96);border:1px solid rgba(255,255,255,.55);border-radius:22px;box-shadow:0 24px 60px rgba(8,30,72,.25);animation-delay:.12s; }.dashboard-head { display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:17px;border-bottom:1px solid var(--border); }.dashboard-head span,.dashboard-head strong { display:block; }.dashboard-head>div>span { color:var(--ink-faint);font-size:11px;font-weight:750; }.dashboard-head strong { margin-top:3px;color:var(--ink);font-size:16px; }.live-dot { padding:4px 8px;color:#0f7c51;background:#e8f8ef;border-radius:7px;font-size:10px!important;font-weight:850; }.dashboard-stats { display:grid;grid-template-columns:repeat(3,1fr);padding:19px 0; }.dashboard-stats div { text-align:center;border-right:1px solid var(--border); }.dashboard-stats div:last-child { border:0; }.dashboard-stats strong,.dashboard-stats span { display:block; }.dashboard-stats strong { color:var(--primary);font-size:23px; }.dashboard-stats span { margin-top:1px;color:var(--ink-faint);font-size:10px; }
.schedule-list { border-top:1px solid var(--border); }.schedule-list a { min-height:51px;display:grid;grid-template-columns:53px 1fr auto;align-items:center;gap:9px;color:var(--ink);border-bottom:1px solid #edf0f4;font-size:12px; }.schedule-list a:hover .schedule-title { color:var(--primary); }.schedule-time { color:var(--primary);font-size:10px;font-weight:800; }.schedule-title { overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:650; }.dashboard-link { display:block;padding-top:16px;color:var(--primary);text-align:center;font-size:12px;font-weight:750; }
.quick-section { position:relative;z-index:2;margin-top:-1px;padding:22px 0;background:white;border-bottom:1px solid var(--border); }.quick-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:12px; }.quick-card { min-width:0;display:grid;grid-template-columns:48px 1fr auto;align-items:center;gap:12px;padding:14px;border:1px solid transparent;border-radius:14px;transition:.18s ease; }.quick-card:hover { background:#f8fafd;border-color:var(--border);transform:translateY(-2px); }.quick-icon { width:46px;height:46px;display:grid;place-items:center;border-radius:14px; }.quick-icon:deep(svg) { width:23px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.8; }.quick-icon.blue { color:#2463c7;background:#eaf1ff; }.quick-icon.green { color:#0b887a;background:#e4f7f4; }.quick-icon.purple { color:#7352b8;background:#f0ebfb; }.quick-icon.orange { color:#cc681c;background:#fff0e5; }.quick-card strong,.quick-card small { display:block; }.quick-card strong { font-size:14px; }.quick-card small { margin-top:2px;color:var(--ink-faint);font-size:10px; }.quick-arrow { color:#9da7b5; }
.featured-section { padding:76px 0 88px; }.section-head { display:flex;align-items:flex-end;justify-content:space-between;gap:30px;margin-bottom:28px; }.more-link { color:var(--primary);font-size:13px;font-weight:750; }.featured-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:20px; }
.guide-section { overflow:hidden;color:white;background:#172a49; }.guide-inner { min-height:390px;display:grid;grid-template-columns:.8fr 1.2fr;align-items:center;gap:90px;padding-top:55px;padding-bottom:55px; }.eyebrow.light { color:#88d9cf; }.eyebrow.light::before { background:#88d9cf; }.guide-copy h2 { font-size:clamp(28px,3vw,38px);line-height:1.4;letter-spacing:-.045em; }.guide-copy p { margin:13px 0 24px;color:#b6c4d8;font-size:14px; }.guide-button { color:#172a49;background:white; }.guide-steps { position:relative;display:grid;gap:17px; }.guide-steps::before { content:'';position:absolute;top:34px;bottom:34px;left:26px;width:1px;background:rgba(255,255,255,.16); }.guide-steps li { position:relative;display:grid;grid-template-columns:54px 1fr;gap:17px;align-items:center;padding:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:15px; }.guide-steps li>span { width:54px;height:54px;display:grid;place-items:center;color:#8fe3d8;background:#213d65;border:1px solid rgba(143,227,216,.28);border-radius:50%;font-size:12px;font-weight:850; }.guide-steps strong { font-size:15px; }.guide-steps p { margin-top:3px;color:#aebdd1;font-size:12px; }
@media(max-width:980px){.hero-inner{grid-template-columns:1fr;gap:35px;padding-top:65px;padding-bottom:65px}.hero-dashboard{max-width:620px}.quick-grid{grid-template-columns:1fr 1fr}.featured-grid{grid-template-columns:1fr 1fr}.featured-grid>*:last-child{display:none}.guide-inner{grid-template-columns:1fr;gap:40px}}
@media(max-width:640px){.hero-inner{min-height:auto;padding-top:52px;padding-bottom:52px}.desktop-only{display:none}.hero-copy h1{font-size:38px}.hero-copy>p{font-size:14px}.hero-search{height:auto;padding:6px 6px 6px 14px}.hero-search button{height:46px;padding:0 15px}.popular-searches>span{width:100%}.hero-dashboard{padding:18px}.quick-grid{grid-template-columns:1fr}.quick-card{padding:11px}.featured-section{padding:56px 0 64px}.section-head{align-items:flex-start;flex-direction:column}.featured-grid{grid-template-columns:1fr}.featured-grid>*:last-child{display:block}.guide-inner{padding-top:52px;padding-bottom:60px}.guide-steps li{grid-template-columns:46px 1fr}.guide-steps li>span{width:46px;height:46px}.guide-steps::before{left:23px}}
</style>
