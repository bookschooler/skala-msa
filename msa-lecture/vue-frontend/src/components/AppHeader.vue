<template>
  <div class="gov-strip">
      <div class="shell gov-strip-inner">
        <span class="flag-mark" aria-hidden="true">🇰🇷</span>
        <span>이 누리집은 대한민국 공식 전자정부 누리집입니다.</span>
      </div>
    </div>
    <header class="site-header">
      <div class="shell header-inner">
        <router-link to="/" class="brand" aria-label="모아청약 홈">
          <span class="brand-symbol" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <path d="M6 19.5 20 7l14 12.5v13A2.5 2.5 0 0 1 31.5 35h-23A2.5 2.5 0 0 1 6 32.5v-13Z" />
              <path d="M15 35V24h10v11M12 16h16" />
            </svg>
          </span>
          <span>
            <strong>모아청약</strong>
            <small>대한민국 통합 청약 플랫폼</small>
          </span>
        </router-link>

        <nav class="desktop-nav" aria-label="주요 메뉴">
          <router-link to="/announcements">통합공고</router-link>
          <router-link v-if="auth.isAuthenticated" to="/applications">내 청약</router-link>
          <router-link v-if="auth.isAuthenticated" to="/mypage">맞춤정보</router-link>
        </nav>

        <div class="header-actions">
          <template v-if="auth.isAuthenticated">
            <router-link to="/mypage" class="user-chip">
              <span class="avatar">{{ auth.user?.name?.charAt(0) || '나' }}</span>
              <span class="user-name">{{ auth.user?.name }}</span>
            </router-link>
            <button type="button" class="logout-button" @click="logout">로그아웃</button>
          </template>
          <router-link v-else to="/login" class="login-button">로그인</router-link>
          <button
            type="button"
            class="menu-button"
            :aria-expanded="mobileOpen"
            aria-label="모바일 메뉴 열기"
            @click="mobileOpen = !mobileOpen"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <nav v-if="mobileOpen" class="mobile-nav" aria-label="모바일 메뉴">
        <router-link to="/announcements" @click="mobileOpen = false">통합공고</router-link>
        <router-link v-if="auth.isAuthenticated" to="/applications" @click="mobileOpen = false">내 청약</router-link>
        <router-link v-if="auth.isAuthenticated" to="/mypage" @click="mobileOpen = false">맞춤정보</router-link>
        <router-link v-if="!auth.isAuthenticated" to="/login" @click="mobileOpen = false">로그인</router-link>
      </nav>
    </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'

const auth = useAuthStore()
const router = useRouter()
const mobileOpen = ref(false)

function logout() {
  auth.logout(false)
  router.push('/')
}
</script>

<style scoped>
.gov-strip { color: #4d596a; background: #f1f4f8; border-bottom: 1px solid #e4e8ef; font-size: 12px; }
.gov-strip-inner { min-height: 34px; display: flex; align-items: center; gap: 8px; }.flag-mark { font-size: 15px; }
.site-header { position: sticky; z-index: 50; top: 0; background: rgba(255,255,255,.96); border-bottom: 1px solid var(--border); backdrop-filter: blur(14px); }
.header-inner { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
.brand { flex: 0 0 auto; display: flex; align-items: center; gap: 11px; }.brand-symbol { width: 40px; height: 40px; display: grid; place-items: center; color: white; background: linear-gradient(145deg,#1f64d8,#1649a5); border-radius: 13px; box-shadow: 0 7px 18px rgba(30,87,190,.22); }.brand-symbol svg { width: 25px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.2; }
.brand strong,.brand small { display: block; }.brand strong { color: #172846; font-size: 20px; line-height: 1.2; letter-spacing: -.04em; }.brand small { margin-top: 2px; color: #788397; font-size: 10px; font-weight: 600; }
.desktop-nav { display: flex; align-self: stretch; align-items: center; gap: 36px; }.desktop-nav a { position: relative; height: 100%; display: flex; align-items: center; color: #48566d; font-size: 15px; font-weight: 700; }.desktop-nav a::after { content:''; position:absolute; right:0; bottom:-1px; left:0; height:3px; background:var(--primary); transform:scaleX(0); transition:transform .18s ease; }.desktop-nav a:hover,.desktop-nav a.router-link-active { color: var(--primary); }.desktop-nav a.router-link-active::after { transform:scaleX(1); }
.header-actions { margin-left: auto; display: flex; align-items: center; gap: 10px; }.user-chip { display: flex; align-items: center; gap: 8px; padding: 5px 10px 5px 5px; background:#f5f7fa; border-radius:999px; }.avatar { width:30px;height:30px;display:grid;place-items:center;color:#fff;background:var(--primary);border-radius:50%;font-size:12px;font-weight:800; }.user-name { color:#344258;font-size:13px;font-weight:700; }.logout-button { padding:8px;color:#758095;background:transparent;font-size:12px;font-weight:650; }.login-button { padding:10px 18px;color:#fff;background:var(--primary);border-radius:10px;font-size:13px;font-weight:750; }.login-button:hover { background:var(--primary-dark); }
.menu-button { width:42px;height:42px;display:none;place-items:center;background:#f4f6f9;border-radius:10px; }.menu-button span { width:18px;height:2px;display:block;margin:2px 0;background:#344258;border-radius:2px; }
.mobile-nav { display:none;padding:10px 20px 20px;background:white;border-top:1px solid var(--border); }.mobile-nav a { display:block;padding:13px 4px;color:#344258;border-bottom:1px solid #eff2f6;font-weight:700; }
@media(max-width:760px){.gov-strip-inner{padding:0 18px}.header-inner{min-height:66px;padding:0 18px}.brand small,.desktop-nav,.user-name,.logout-button{display:none}.brand strong{font-size:18px}.brand-symbol{width:36px;height:36px}.login-button{display:none}.menu-button{display:block}.mobile-nav{display:block}}
</style>
