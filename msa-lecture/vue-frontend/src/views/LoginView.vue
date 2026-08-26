<template>
  <div class="login-page">
    <div class="login-brand-panel">
      <router-link to="/" class="login-brand"><span class="brand-symbol">⌂</span><span><strong>모아청약</strong><small>대한민국 통합 청약 플랫폼</small></span></router-link>
      <div class="brand-message rise"><span>하나의 계정, 하나의 청약 경험</span><h1>내 집을 향한 여정,<br><em>더 쉽고 분명하게.</em></h1><p>청약홈과 LH청약플러스의 공고부터 신청내역까지 한 번에 관리하세요.</p></div>
      <div class="brand-features"><div><span>01</span><p><strong>통합공고 검색</strong>기관 구분 없이 한 번에</p></div><div><span>02</span><p><strong>맞춤 청약 추천</strong>관심지역과 조건에 맞게</p></div><div><span>03</span><p><strong>신청내역 관리</strong>진행상태를 놓치지 않게</p></div></div>
      <div class="brand-decoration" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>

    <main class="login-form-panel">
      <div class="mobile-brand"><router-link to="/">모아청약</router-link></div>
      <div class="login-box rise">
        <router-link to="/" class="back-link">← 홈으로 돌아가기</router-link>
        <span class="login-kicker">통합 로그인</span><h2>안녕하세요!</h2><p class="login-description">본인인증 후 모든 청약 서비스를 이용할 수 있습니다.</p>
        <button type="button" class="certificate-button" @click="loginWithOAuth"><span class="certificate-icon"><svg viewBox="0 0 24 24"><path d="M12 3 4.5 6v5.5c0 4.5 3.2 7.7 7.5 9.5 4.3-1.8 7.5-5 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/></svg></span><span><strong>공동·금융인증서 로그인</strong><small>안전한 본인인증으로 로그인합니다</small></span><span>›</span></button>
        <div class="divider"><span>또는</span></div>
        <button type="button" class="demo-button" @click="loginDemo"><span class="demo-icon">D</span><span><strong>시연용 계정으로 둘러보기</strong><small>별도 인증 없이 전체 기능을 체험합니다</small></span><span>→</span></button>
        <div v-if="error" class="login-error">{{ error }}</div>
        <div class="login-notice"><strong>로그인 안내</strong><ul><li>인증서는 본인 명의로 발급된 인증서를 이용해 주세요.</li><li>개인정보 보호를 위해 30분간 미사용 시 자동 로그아웃됩니다.</li></ul></div>
        <p class="privacy-copy">로그인하면 <a href="#">이용약관</a> 및 <a href="#">개인정보처리방침</a>에 동의하게 됩니다.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
const auth = useAuthStore(); const route = useRoute(); const router = useRouter(); const error = ref('')
async function loginWithOAuth(){ error.value=''; try{ await auth.redirectToLogin() }catch{ error.value='인증 서버에 연결하지 못했습니다. 시연용 계정을 이용해 주세요.' } }
function loginDemo(){ auth.loginAsDemo(); router.push(String(route.query.redirect || '/')) }
</script>

<style scoped>
.login-page{min-height:100vh;display:grid;grid-template-columns:minmax(430px,.9fr) minmax(520px,1.1fr);background:white}.login-brand-panel{position:relative;overflow:hidden;display:flex;flex-direction:column;padding:44px clamp(42px,6vw,90px);color:white;background:linear-gradient(145deg,#153c81,#1f63c8)}.login-brand{position:relative;z-index:2;display:flex;align-items:center;gap:11px;align-self:flex-start}.brand-symbol{width:40px;height:40px;display:grid;place-items:center;color:#1f5fc4;background:white;border-radius:13px;font-size:21px}.login-brand strong,.login-brand small{display:block}.login-brand strong{font-size:20px}.login-brand small{color:#c8d8ef;font-size:10px}.brand-message{position:relative;z-index:2;margin:auto 0 55px}.brand-message>span{display:inline-block;padding:5px 9px;color:#cfe0f7;background:rgba(255,255,255,.1);border-radius:7px;font-size:11px;font-weight:750}.brand-message h1{margin-top:17px;font-size:clamp(36px,4vw,52px);line-height:1.3;letter-spacing:-.06em}.brand-message em{color:#8fe3d8;font-style:normal}.brand-message p{max-width:480px;margin-top:18px;color:#d1def0;font-size:14px;line-height:1.8}.brand-features{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding-top:23px;border-top:1px solid rgba(255,255,255,.16)}.brand-features div{display:flex;gap:9px}.brand-features div>span{color:#8fe3d8;font-size:10px;font-weight:850}.brand-features p{color:#c6d4e9;font-size:10px}.brand-features strong{display:block;margin-bottom:2px;color:white;font-size:11px}.brand-decoration{position:absolute;inset:0}.brand-decoration span{position:absolute;border:1px solid rgba(255,255,255,.08);border-radius:50%}.brand-decoration span:nth-child(1){width:440px;height:440px;right:-180px;top:8%}.brand-decoration span:nth-child(2){width:620px;height:620px;right:-260px;top:-2%}.brand-decoration span:nth-child(3){width:220px;height:220px;right:-60px;top:24%;background:rgba(255,255,255,.03)}.login-form-panel{display:grid;place-items:center;padding:45px;background:#fbfcfe}.login-box{width:min(430px,100%)}.back-link{display:inline-block;margin-bottom:44px;color:var(--ink-faint);font-size:11px}.back-link:hover{color:var(--primary)}.login-kicker{color:var(--primary);font-size:11px;font-weight:850}.login-box h2{margin-top:5px;font-size:34px;letter-spacing:-.05em}.login-description{margin:8px 0 28px;color:var(--ink-muted);font-size:13px}.certificate-button,.demo-button{width:100%;display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:13px;padding:16px;text-align:left;background:white;border:1px solid var(--border-strong);border-radius:13px;transition:.18s ease}.certificate-button:hover{border-color:var(--primary);box-shadow:var(--shadow-md)}.certificate-icon,.demo-icon{width:44px;height:44px;display:grid;place-items:center;color:white;background:var(--primary);border-radius:12px}.certificate-icon svg{width:25px;fill:none;stroke:currentColor;stroke-width:1.8}.certificate-button strong,.certificate-button small,.demo-button strong,.demo-button small{display:block}.certificate-button strong,.demo-button strong{font-size:13px}.certificate-button small,.demo-button small{margin-top:3px;color:var(--ink-faint);font-size:10px}.divider{position:relative;margin:18px 0;text-align:center}.divider::before{content:'';position:absolute;top:50%;right:0;left:0;height:1px;background:var(--border)}.divider span{position:relative;padding:0 11px;color:var(--ink-faint);background:#fbfcfe;font-size:10px}.demo-button{background:#f1f6ff;border-color:#cedcf4}.demo-button:hover{border-color:#8dacdf}.demo-icon{color:var(--primary);background:white;border:1px solid #b9ceef;font-weight:900}.login-error{margin-top:12px;padding:10px;color:var(--danger);background:#fff1ef;border-radius:8px;font-size:11px}.login-notice{margin-top:25px;padding:15px 17px;color:#58667a;background:#f4f6f9;border-radius:11px}.login-notice strong{display:block;margin-bottom:5px;color:#455267;font-size:10px}.login-notice li{position:relative;padding-left:10px;font-size:9px;line-height:1.8}.login-notice li::before{content:'·';position:absolute;left:0}.privacy-copy{margin-top:17px;color:var(--ink-faint);text-align:center;font-size:9px}.privacy-copy a{color:#566a85;text-decoration:underline}.mobile-brand{display:none}@media(max-width:900px){.login-page{grid-template-columns:1fr}.login-brand-panel{display:none}.login-form-panel{min-height:100vh;padding:30px 20px}.mobile-brand{position:absolute;top:24px;left:24px;display:block;color:var(--primary);font-size:19px;font-weight:850}.back-link{margin-bottom:36px}}@media(max-width:480px){.login-box h2{font-size:30px}.certificate-button,.demo-button{padding:13px}}
</style>
