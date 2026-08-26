<template>
  <div>
    <AppHeader />
    <main class="wizard-page">
      <div class="shell wizard-shell">
        <template v-if="announcement">
          <nav class="breadcrumb" aria-label="현재 위치"><router-link :to="`/announcements/${announcement.id}`">공고 상세</router-link><span>›</span><span>청약 신청</span></nav>

          <div v-if="step < 5" class="wizard-heading">
            <div><span class="eyebrow">청약 신청</span><h1>{{ announcement.title }}</h1><p>입력 내용을 차례대로 확인해 주세요. 예상 소요시간은 약 3분입니다.</p></div>
            <span class="secure-mark"><span aria-hidden="true">●</span> 안전한 신청</span>
          </div>

          <ol v-if="step < 5" class="stepper" aria-label="청약 신청 단계">
            <li v-for="item in steps" :key="item.number" :class="{ active: step === item.number, done: step > item.number }" :aria-current="step === item.number ? 'step' : undefined">
              <span class="step-circle">{{ step > item.number ? '✓' : item.number }}</span><span class="step-label">{{ item.label }}</span>
            </li>
          </ol>

          <div v-if="step < 5" class="wizard-layout">
            <section class="wizard-panel panel">
              <template v-if="step === 1">
                <div class="panel-heading"><span>STEP 1</span><h2>신청할 주택형을 선택해 주세요</h2><p>주택형별 전용면적과 공급조건을 비교해 선택할 수 있습니다.</p></div>
                <div class="unit-list" role="radiogroup" aria-label="주택형 선택">
                  <label v-for="unit in announcement.units" :key="unit.type" class="unit-option" :class="{ selected: form.unitType === unit.type }">
                    <input v-model="form.unitType" type="radio" name="unit" :value="unit.type" />
                    <span class="radio-ui"></span>
                    <span class="unit-name"><strong>{{ unit.type }}</strong><small>{{ unit.area }}</small></span>
                    <span class="unit-count"><small>공급세대</small><strong>{{ unit.count }}세대</strong></span>
                    <span class="unit-price"><small>공급금액/보증금</small><strong>{{ unit.price }}</strong></span>
                  </label>
                </div>
                <p v-if="validationError" class="validation-error">{{ validationError }}</p>
              </template>

              <template v-else-if="step === 2">
                <div class="panel-heading"><span>STEP 2</span><h2>신청자격을 확인해 주세요</h2><p>아래 항목을 직접 확인하고 사실과 일치하는 경우 동의해 주세요.</p></div>
                <div class="qualification-summary">
                  <div v-for="item in announcement.eligibility" :key="item"><span aria-hidden="true">✓</span>{{ item }}</div>
                </div>
                <div class="agreement-list">
                  <label><input v-model="form.agreements.homeless" type="checkbox" /><span>본인은 입주자모집공고일 현재 무주택세대구성원임을 확인합니다.</span></label>
                  <label><input v-model="form.agreements.qualification" type="checkbox" /><span>선택한 공급유형의 소득·자산 및 기타 신청자격을 확인했습니다.</span></label>
                  <label><input v-model="form.agreements.penalty" type="checkbox" /><span>허위 또는 착오 신청에 따른 불이익 내용을 확인했습니다.</span></label>
                  <label class="all-agree"><input v-model="allAgreed" type="checkbox" /><strong>필수 확인사항에 모두 동의합니다.</strong></label>
                </div>
                <p v-if="validationError" class="validation-error">{{ validationError }}</p>
              </template>

              <template v-else-if="step === 3">
                <div class="panel-heading"><span>STEP 3</span><h2>신청자 정보를 확인해 주세요</h2><p>접수 결과 안내에 사용할 정보를 입력합니다.</p></div>
                <div class="form-grid applicant-form">
                  <label class="form-group"><span class="input-label">성명</span><input v-model.trim="form.name" class="input" autocomplete="name" /></label>
                  <label class="form-group"><span class="input-label">생년월일</span><input v-model="form.birthDate" class="input" type="date" /></label>
                  <label class="form-group"><span class="input-label">휴대전화</span><input v-model.trim="form.phone" class="input" type="tel" placeholder="010-0000-0000" autocomplete="tel" /></label>
                  <label class="form-group"><span class="input-label">이메일</span><input v-model.trim="form.email" class="input" type="email" autocomplete="email" /></label>
                  <label class="form-group full"><span class="input-label">현재 거주지역</span><select v-model="form.residence" class="select"><option value="" disabled>지역을 선택하세요</option><option v-for="region in store.regionOptions.slice(1)" :key="region" :value="region">{{ region }}</option></select></label>
                  <label class="form-group full consent-box"><input v-model="form.personalInfoConsent" type="checkbox" /><span><strong>개인정보 수집 및 이용에 동의합니다. (필수)</strong><small>청약 신청 접수와 결과 안내 목적으로만 사용됩니다.</small></span></label>
                </div>
                <p v-if="validationError" class="validation-error">{{ validationError }}</p>
              </template>

              <template v-else-if="step === 4">
                <div class="panel-heading"><span>STEP 4</span><h2>신청 내용을 최종 확인해 주세요</h2><p>신청 완료 후에는 일부 정보를 변경할 수 없습니다.</p></div>
                <div class="review-section"><h3>신청 공고</h3><dl><div><dt>공고명</dt><dd>{{ announcement.title }}</dd></div><div><dt>주택형</dt><dd>{{ selectedUnit?.type }} · {{ selectedUnit?.area }}</dd></div><div><dt>공급조건</dt><dd>{{ selectedUnit?.price }}</dd></div><div><dt>공급기관</dt><dd>{{ announcement.agency }}</dd></div></dl></div>
                <div class="review-section"><h3>신청자 정보</h3><dl><div><dt>성명</dt><dd>{{ form.name }}</dd></div><div><dt>생년월일</dt><dd>{{ form.birthDate }}</dd></div><div><dt>연락처</dt><dd>{{ form.phone }}</dd></div><div><dt>거주지역</dt><dd>{{ form.residence }}</dd></div></dl></div>
                <label class="final-confirm"><input v-model="form.finalConfirm" type="checkbox" /><span>공고문과 신청내용을 모두 확인했으며 위 내용으로 청약을 신청합니다.</span></label>
                <p v-if="validationError" class="validation-error">{{ validationError }}</p>
              </template>

              <div class="wizard-actions">
                <button v-if="step > 1" type="button" class="btn btn-ghost btn-lg" @click="previous">이전</button>
                <router-link v-else :to="`/announcements/${announcement.id}`" class="btn btn-ghost btn-lg">취소</router-link>
                <button v-if="step < 4" type="button" class="btn btn-primary btn-lg" @click="next">다음 단계</button>
                <button v-else type="button" class="btn btn-primary btn-lg" :disabled="applicationStore.submitting" @click="submit">
                  {{ applicationStore.submitting ? '접수 중...' : '청약 신청 완료' }}
                </button>
              </div>
            </section>

            <aside class="summary-card panel">
              <span class="summary-source">{{ announcement.sourceLabel }}</span><h2>{{ announcement.title }}</h2>
              <dl><div><dt>접수기간</dt><dd>{{ shortDate(announcement.applyStart) }} ~ {{ shortDate(announcement.applyEnd) }}</dd></div><div><dt>선택 주택형</dt><dd>{{ form.unitType || '선택 전' }}</dd></div><div><dt>현재 단계</dt><dd>{{ step }} / 4</dd></div></dl>
              <div class="security-note"><span aria-hidden="true">✓</span><p>입력하신 정보는 안전하게 암호화되어 처리됩니다.</p></div>
            </aside>
          </div>

          <section v-else class="complete-panel panel rise">
            <div class="complete-icon" aria-hidden="true">✓</div>
            <span class="complete-kicker">청약 신청 접수 완료</span>
            <h1>신청이 정상적으로 접수되었습니다.</h1>
            <p>접수내용은 내 청약에서 언제든지 확인할 수 있습니다.</p>
            <div class="receipt"><div><span>접수번호</span><strong>{{ completedApplication?.id }}</strong></div><div><span>공고명</span><strong>{{ announcement.title }}</strong></div><div><span>신청 주택형</span><strong>{{ completedApplication?.unitType }}</strong></div><div><span>접수일시</span><strong>{{ submittedDate }}</strong></div></div>
            <div class="complete-actions"><router-link to="/applications" class="btn btn-primary btn-lg">내 청약 확인</router-link><router-link to="/announcements" class="btn btn-outline btn-lg">다른 공고 보기</router-link></div>
          </section>
        </template>
        <div v-else class="loading-state"><div class="spinner"></div></div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAnnouncementStore } from '@/store/announcement.js'
import { useApplicationStore } from '@/store/application.js'
import { useAuthStore } from '@/store/auth.js'

const route = useRoute()
const router = useRouter()
const store = useAnnouncementStore()
const applicationStore = useApplicationStore()
const auth = useAuthStore()
const step = ref(1)
const validationError = ref('')
const completedApplication = ref(null)
const steps = [{ number: 1, label: '주택형 선택' }, { number: 2, label: '자격 확인' }, { number: 3, label: '정보 입력' }, { number: 4, label: '최종 확인' }]
const announcement = computed(() => store.selectedAnnouncement)
const selectedUnit = computed(() => announcement.value?.units.find(unit => unit.type === form.unitType))
const submittedDate = computed(() => completedApplication.value ? new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(completedApplication.value.submittedAt)) : '')

const form = reactive({
  unitType: '',
  agreements: { homeless: false, qualification: false, penalty: false },
  name: auth.user?.name || '',
  birthDate: '',
  phone: '',
  email: auth.user?.email || '',
  residence: auth.user?.interestRegions?.[0] || '',
  personalInfoConsent: false,
  finalConfirm: false
})

const allAgreed = computed({
  get: () => Object.values(form.agreements).every(Boolean),
  set: value => Object.keys(form.agreements).forEach(key => { form.agreements[key] = value })
})

function shortDate(value) { return value?.slice(5).replace('-', '.') || '-' }
function validate() {
  validationError.value = ''
  if (step.value === 1 && !form.unitType) validationError.value = '신청할 주택형을 선택해 주세요.'
  if (step.value === 2 && !allAgreed.value) validationError.value = '필수 확인사항에 모두 동의해 주세요.'
  if (step.value === 3 && (!form.name || !form.birthDate || !/^01\d-?\d{3,4}-?\d{4}$/.test(form.phone) || !form.email || !form.residence || !form.personalInfoConsent)) validationError.value = '필수 신청자 정보를 정확하게 입력해 주세요.'
  if (step.value === 4 && !form.finalConfirm) validationError.value = '최종 확인에 동의해 주세요.'
  return !validationError.value
}
function next() { if (validate()) { step.value += 1; window.scrollTo({ top: 0, behavior: 'smooth' }) } }
function previous() { validationError.value = ''; step.value -= 1; window.scrollTo({ top: 0, behavior: 'smooth' }) }
async function submit() {
  if (!validate()) return
  if (applicationStore.hasApplied(announcement.value.id)) { router.push('/applications'); return }
  try {
    completedApplication.value = await applicationStore.submitApplication({ announcementId: announcement.value.id, announcementTitle: announcement.value.title, sourceLabel: announcement.value.sourceLabel, housingType: announcement.value.housingType, region: announcement.value.region, applyEnd: announcement.value.applyEnd, resultDate: announcement.value.resultDate, unitType: form.unitType, applicantName: form.name })
    step.value = 5
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch { validationError.value = applicationStore.error }
}

onMounted(async () => {
  await store.fetchAnnouncement(route.params.id)
  if (!store.selectedAnnouncement || store.selectedAnnouncement.status !== 'OPEN') router.replace(`/announcements/${route.params.id}`)
})
</script>

<style scoped>
.wizard-page{min-height:calc(100vh - 110px);padding:30px 0 80px;background:#f4f6f9}.breadcrumb{display:flex;gap:8px;margin-bottom:23px;color:var(--ink-faint);font-size:11px}.breadcrumb a:hover{color:var(--primary)}.wizard-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}.wizard-heading .eyebrow{margin-bottom:8px}.wizard-heading h1{max-width:800px;font-size:28px;line-height:1.4;letter-spacing:-.04em}.wizard-heading p{margin-top:8px;color:var(--ink-muted);font-size:13px}.secure-mark{display:flex;align-items:center;gap:7px;padding:8px 11px;color:#137548;background:#e8f8ef;border-radius:9px;font-size:11px;font-weight:750}.secure-mark span{font-size:7px}.stepper{display:grid;grid-template-columns:repeat(4,1fr);margin:31px 0 22px;padding:21px 35px;background:white;border:1px solid var(--border);border-radius:16px}.stepper li{position:relative;display:flex;align-items:center;justify-content:center;gap:9px;color:var(--ink-faint);font-size:12px;font-weight:700}.stepper li:not(:last-child)::after{content:'';position:absolute;top:50%;right:-22%;width:44%;height:1px;background:var(--border-strong)}.step-circle{width:29px;height:29px;display:grid;place-items:center;background:#edf0f4;border-radius:50%;font-size:11px}.stepper li.active{color:var(--primary)}.stepper li.active .step-circle{color:white;background:var(--primary);box-shadow:0 0 0 5px var(--primary-soft)}.stepper li.done{color:#168054}.stepper li.done .step-circle{color:white;background:#168054}.stepper li.done::after{background:#74b99b}.wizard-layout{display:grid;grid-template-columns:minmax(0,1fr) 285px;align-items:start;gap:22px}.wizard-panel{min-height:540px;padding:32px}.panel-heading{margin-bottom:26px;padding-bottom:21px;border-bottom:1px solid var(--border)}.panel-heading>span{color:var(--primary);font-size:10px;font-weight:850}.panel-heading h2{margin-top:4px;font-size:22px;letter-spacing:-.035em}.panel-heading p{margin-top:6px;color:var(--ink-muted);font-size:12px}.unit-list{display:grid;gap:11px}.unit-option{display:grid;grid-template-columns:25px 100px 1fr 1.4fr;align-items:center;gap:12px;padding:17px;border:1px solid var(--border);border-radius:12px;cursor:pointer;transition:.16s ease}.unit-option:hover{border-color:#9eb9e7;background:#fbfcff}.unit-option.selected{border-color:var(--primary);background:var(--primary-soft);box-shadow:0 0 0 1px var(--primary)}.unit-option input{position:absolute;opacity:0}.radio-ui{width:20px;height:20px;border:2px solid #b8c1ce;border-radius:50%}.selected .radio-ui{border:6px solid var(--primary)}.unit-name strong,.unit-name small,.unit-count strong,.unit-count small,.unit-price strong,.unit-price small{display:block}.unit-name strong{font-size:16px}.unit-name small,.unit-count small,.unit-price small{color:var(--ink-faint);font-size:10px}.unit-count strong,.unit-price strong{margin-top:2px;font-size:12px}.qualification-summary{display:grid;gap:9px;margin-bottom:23px}.qualification-summary div{display:flex;align-items:center;gap:9px;padding:12px;color:#34506d;background:#f4f8fd;border-radius:9px;font-size:12px}.qualification-summary span{color:var(--secondary);font-weight:900}.agreement-list{display:grid;gap:10px}.agreement-list label,.consent-box,.final-confirm{display:flex;align-items:flex-start;gap:11px;padding:14px;background:#fafbfc;border:1px solid var(--border);border-radius:10px;color:#45536a;font-size:12px;cursor:pointer}.agreement-list input,.consent-box input,.final-confirm input{width:18px;height:18px;flex:0 0 auto;accent-color:var(--primary)}.agreement-list .all-agree{margin-top:6px;color:var(--ink);background:var(--primary-soft);border-color:#c3d5f5}.consent-box{align-items:center}.consent-box strong,.consent-box small{display:block}.consent-box small{margin-top:3px;color:var(--ink-faint);font-size:10px}.review-section{margin-bottom:24px}.review-section h3{margin-bottom:10px;font-size:14px}.review-section dl{border-top:1px solid var(--border)}.review-section dl>div{display:grid;grid-template-columns:125px 1fr;padding:12px;border-bottom:1px solid var(--border);font-size:12px}.review-section dt{color:var(--ink-faint)}.review-section dd{font-weight:650}.final-confirm{color:var(--ink);background:#fff8e9;border-color:#ecd6a8}.validation-error{margin-top:15px;padding:11px 13px;color:var(--danger);background:#fff1ef;border-radius:8px;font-size:11px;font-weight:700}.wizard-actions{display:flex;justify-content:space-between;gap:12px;margin-top:30px;padding-top:22px;border-top:1px solid var(--border)}.summary-card{position:sticky;top:130px;padding:23px}.summary-source{color:var(--primary);font-size:10px;font-weight:800}.summary-card h2{margin:7px 0 19px;font-size:16px;line-height:1.55}.summary-card dl{border-top:1px solid var(--border)}.summary-card dl>div{display:flex;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid var(--border);font-size:11px}.summary-card dt{color:var(--ink-faint)}.summary-card dd{text-align:right;font-weight:700}.security-note{display:flex;gap:8px;margin-top:16px;padding:12px;color:#4c657b;background:#f1f6fb;border-radius:9px;font-size:10px}.security-note span{color:var(--secondary);font-weight:900}.complete-panel{max-width:760px;margin:30px auto 0;padding:55px;text-align:center}.complete-icon{width:72px;height:72px;display:grid;place-items:center;margin:0 auto 18px;color:white;background:linear-gradient(145deg,#139a78,#087d69);border-radius:50%;box-shadow:0 13px 30px rgba(11,143,132,.25);font-size:32px}.complete-kicker{color:var(--secondary);font-size:12px;font-weight:850}.complete-panel h1{margin-top:7px;font-size:30px;letter-spacing:-.045em}.complete-panel>p{margin-top:9px;color:var(--ink-muted);font-size:13px}.receipt{margin:30px 0;padding:4px 22px;text-align:left;background:#f7f9fc;border-radius:14px}.receipt>div{display:grid;grid-template-columns:120px 1fr;padding:13px 0;border-bottom:1px solid var(--border);font-size:12px}.receipt>div:last-child{border:0}.receipt span{color:var(--ink-faint)}.receipt strong{font-weight:700}.complete-actions{display:flex;justify-content:center;gap:11px}@media(max-width:850px){.wizard-layout{grid-template-columns:1fr}.summary-card{display:none}.stepper{padding:18px 15px}.step-label{display:none}.stepper li:not(:last-child)::after{right:-40%;width:80%}}@media(max-width:600px){.wizard-page{padding-top:22px}.wizard-heading{flex-direction:column}.wizard-heading h1{font-size:23px}.stepper{margin-top:22px}.wizard-panel{min-height:auto;padding:22px}.unit-option{grid-template-columns:23px 1fr 1fr}.unit-price{grid-column:2 / -1}.applicant-form{grid-template-columns:1fr}.review-section dl>div{grid-template-columns:90px 1fr}.wizard-actions .btn{flex:1;padding:10px}.complete-panel{padding:35px 20px}.complete-panel h1{font-size:25px}.receipt{padding:4px 14px}.receipt>div{grid-template-columns:90px 1fr}.complete-actions{flex-direction:column}}
@media(max-width:600px){.wizard-heading h1{font-size:21px}}
</style>
