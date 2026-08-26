<template>
  <div>
    <AppHeader />
    <main class="page-main">
      <div class="shell profile-layout">
        <aside class="profile-card panel">
          <div class="profile-avatar">{{ auth.user?.name?.charAt(0) || '나' }}</div><h1>{{ auth.user?.name || '사용자' }}</h1><p>{{ auth.user?.email }}</p><span class="member-badge">일반 신청자</span>
          <dl><div><dt>관심지역</dt><dd>{{ selectedRegions.length }}개</dd></div><div><dt>청약신청</dt><dd>{{ applicationStore.applications.length }}건</dd></div></dl>
          <button type="button" class="btn btn-ghost btn-block" @click="logout">로그아웃</button>
        </aside>
        <div class="profile-content">
          <div class="page-heading"><span class="eyebrow">맞춤정보</span><h2 class="page-title">{{ auth.user?.name }}님을 위한 청약</h2><p class="page-description">관심지역과 선호유형을 설정하면 더 잘 맞는 공고를 보여드릴게요.</p></div>
          <section class="setting-panel panel"><div class="setting-heading"><div><h3>관심조건 설정</h3><p>복수 선택할 수 있으며 브라우저에 안전하게 저장됩니다.</p></div><span v-if="saved" class="saved-message">저장되었습니다</span></div><div class="setting-group"><strong>관심지역</strong><div class="chip-list"><label v-for="region in store.regionOptions.slice(1)" :key="region" :class="{ selected: selectedRegions.includes(region) }"><input v-model="selectedRegions" type="checkbox" :value="region" />{{ region }}</label></div></div><div class="setting-group"><strong>관심 주택유형</strong><div class="chip-list"><label v-for="type in store.housingTypeOptions.slice(1)" :key="type" :class="{ selected: selectedTypes.includes(type) }"><input v-model="selectedTypes" type="checkbox" :value="type" />{{ type }}</label></div></div><button type="button" class="btn btn-primary" @click="savePreferences">관심조건 저장</button></section>
          <section class="recommend-section"><div class="recommend-head"><div><h3>조건에 맞는 추천공고</h3><p>선택한 관심지역과 주택유형을 기준으로 추천합니다.</p></div><router-link to="/announcements">전체보기 →</router-link></div><div class="recommend-grid"><AnnouncementCard v-for="item in recommendations" :key="item.id" :announcement="item" /></div><div v-if="!recommendations.length" class="panel empty-state"><div class="empty-icon">☆</div><h3>추천 조건을 선택해 주세요</h3><p>관심지역 또는 주택유형을 설정하면 추천공고가 표시됩니다.</p></div></section>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AnnouncementCard from '@/components/AnnouncementCard.vue'
import { useAnnouncementStore } from '@/store/announcement.js'
import { useApplicationStore } from '@/store/application.js'
import { useAuthStore } from '@/store/auth.js'
const auth=useAuthStore();const store=useAnnouncementStore();const applicationStore=useApplicationStore();const router=useRouter();const saved=ref(false)
function loadPreferences(){try{return JSON.parse(localStorage.getItem('moa_preferences')||'{}')}catch{return {}}}
const preferences=loadPreferences();const selectedRegions=ref(preferences.regions||auth.user?.interestRegions||[]);const selectedTypes=ref(preferences.types||['공공분양','공공임대'])
const recommendations=computed(()=>store.announcements.filter(item=>(!selectedRegions.value.length||selectedRegions.value.includes(item.region))&&(!selectedTypes.value.length||selectedTypes.value.includes(item.housingType))).slice(0,2))
function savePreferences(){localStorage.setItem('moa_preferences',JSON.stringify({regions:selectedRegions.value,types:selectedTypes.value}));saved.value=true;setTimeout(()=>{saved.value=false},1800)}
function logout(){auth.logout(false);router.push('/')}
</script>

<style scoped>
.profile-layout{display:grid;grid-template-columns:250px minmax(0,1fr);align-items:start;gap:25px}.profile-card{position:sticky;top:130px;padding:28px;text-align:center}.profile-avatar{width:70px;height:70px;display:grid;place-items:center;margin:0 auto 14px;color:white;background:linear-gradient(145deg,#2468d6,#174797);border-radius:22px;font-size:27px;font-weight:850}.profile-card h1{font-size:19px}.profile-card>p{margin-top:4px;color:var(--ink-faint);font-size:10px}.member-badge{display:inline-block;margin-top:11px;padding:4px 9px;color:var(--primary);background:var(--primary-soft);border-radius:7px;font-size:10px;font-weight:750}.profile-card dl{display:grid;grid-template-columns:1fr 1fr;margin:24px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}.profile-card dl div{padding:13px 4px}.profile-card dl div+div{border-left:1px solid var(--border)}.profile-card dt{color:var(--ink-faint);font-size:9px}.profile-card dd{margin-top:3px;font-size:15px;font-weight:800}.setting-panel{padding:27px}.setting-heading,.recommend-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.setting-heading h3,.recommend-head h3{font-size:18px}.setting-heading p,.recommend-head p{margin-top:4px;color:var(--ink-faint);font-size:11px}.saved-message{padding:5px 8px;color:#137548;background:#e8f8ef;border-radius:7px;font-size:10px;font-weight:750}.setting-group{margin:24px 0}.setting-group>strong{display:block;margin-bottom:10px;font-size:12px}.chip-list{display:flex;gap:8px;flex-wrap:wrap}.chip-list label{padding:8px 12px;color:var(--ink-muted);background:#f7f8fa;border:1px solid var(--border);border-radius:9px;font-size:11px;font-weight:650;cursor:pointer}.chip-list label.selected{color:var(--primary);background:var(--primary-soft);border-color:#aac2eb}.chip-list input{position:absolute;opacity:0}.recommend-section{margin-top:32px}.recommend-head{align-items:flex-end;margin-bottom:15px}.recommend-head a{color:var(--primary);font-size:11px;font-weight:750}.recommend-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}@media(max-width:900px){.profile-layout{grid-template-columns:1fr}.profile-card{position:static;display:grid;grid-template-columns:70px 1fr auto;gap:15px;text-align:left}.profile-avatar{grid-row:1/4;margin:0}.profile-card dl{display:none}.profile-card .btn{grid-column:3;grid-row:1/3;align-self:center}.member-badge{justify-self:start}}@media(max-width:650px){.profile-card{display:block;text-align:center}.profile-avatar{margin:0 auto 14px}.profile-card .btn{margin-top:18px}.setting-panel{padding:21px}.recommend-grid{grid-template-columns:1fr}.setting-heading{flex-direction:column}}
</style>
