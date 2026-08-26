<template>
  <article class="announcement-card" :class="`accent-${announcement.accent || 'blue'}`">
    <div class="card-ribbon"></div>
    <div class="card-head">
      <div class="badge-row">
        <span class="source-badge" :class="announcement.source === 'LH_PLUS' ? 'source-lh' : 'source-home'">
          {{ announcement.sourceLabel }}
        </span>
        <span class="status-badge" :class="status.className">{{ status.label }}</span>
      </div>
      <button
        type="button"
        class="bookmark-button"
        :class="{ active: bookmarked }"
        :aria-label="bookmarked ? '관심공고 해제' : '관심공고 등록'"
        @click.stop="toggleBookmark"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 4.75A1.75 1.75 0 0 1 8.25 3h7.5a1.75 1.75 0 0 1 1.75 1.75V21L12 17.6 6.5 21V4.75Z" />
        </svg>
      </button>
    </div>

    <router-link :to="`/announcements/${announcement.id}`" class="card-link">
      <div class="type-line">{{ announcement.housingType }} · {{ announcement.supplyType }}</div>
      <h3>{{ announcement.title }}</h3>
      <p class="card-summary">{{ announcement.summary }}</p>

      <dl class="meta-grid">
        <div>
          <dt>지역</dt>
          <dd>{{ announcement.region }}</dd>
        </div>
        <div>
          <dt>접수기간</dt>
          <dd>{{ shortDate(announcement.applyStart) }} ~ {{ shortDate(announcement.applyEnd) }}</dd>
        </div>
      </dl>

      <div class="card-footer">
        <div>
          <span class="price-label">공급조건</span>
          <strong>{{ announcement.priceLabel }}</strong>
        </div>
        <span v-if="announcement.status === 'OPEN'" class="deadline" :class="{ urgent: daysLeft <= 3 }">
          {{ daysLeft >= 0 ? `D-${daysLeft}` : '마감' }}
        </span>
        <span v-else class="detail-arrow">자세히 보기 <span aria-hidden="true">→</span></span>
      </div>
    </router-link>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getDaysRemaining, statusMeta } from '@/data/announcementMeta.js'

const props = defineProps({ announcement: { type: Object, required: true } })
const bookmarkKey = computed(() => `bookmark_${props.announcement.id}`)
const bookmarked = ref(localStorage.getItem(bookmarkKey.value) === 'true')
const status = computed(() => statusMeta[props.announcement.status] || statusMeta.CLOSED)
const daysLeft = computed(() => Math.max(0, getDaysRemaining(props.announcement.applyEnd)))

function shortDate(value) {
  return value?.slice(5).replace('-', '.') || '-'
}

function toggleBookmark() {
  bookmarked.value = !bookmarked.value
  localStorage.setItem(bookmarkKey.value, String(bookmarked.value))
}
</script>

<style scoped>
.announcement-card { position: relative; overflow: hidden; padding: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.announcement-card:hover { transform: translateY(-3px); border-color: #bfd3f7; box-shadow: var(--shadow-lg); }
.card-ribbon { position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--primary); }
.accent-teal .card-ribbon { background: #0f9f8f; }.accent-purple .card-ribbon { background: #7950c8; }.accent-orange .card-ribbon { background: #e87924; }.accent-gray .card-ribbon { background: #8892a3; }.accent-green .card-ribbon { background: #32945f; }
.card-head,.badge-row,.card-footer { display: flex; align-items: center; }.card-head { justify-content: space-between; margin-bottom: 18px; }.badge-row { gap: 8px; flex-wrap: wrap; }
.source-badge,.status-badge { display: inline-flex; align-items: center; min-height: 26px; padding: 4px 9px; border-radius: 7px; font-size: 12px; font-weight: 750; }
.source-home { color: #2259af; background: #eaf1ff; }.source-lh { color: #087b70; background: #e6f8f5; }.status-open { color: #137548; background: #e8f8ef; }.status-upcoming { color: #a05a00; background: #fff4df; }.status-closed { color: #677184; background: #eff1f5; }
.bookmark-button { width: 36px; height: 36px; display: grid; place-items: center; color: #8b95a7; background: #f7f8fa; border: 1px solid transparent; border-radius: 10px; }.bookmark-button:hover { border-color: var(--border-strong); }.bookmark-button.active { color: var(--primary); background: var(--primary-soft); }
.bookmark-button svg { width: 19px; fill: transparent; stroke: currentColor; stroke-width: 1.8; }.bookmark-button.active svg { fill: currentColor; }.card-link { display: block; }
.type-line { margin-bottom: 8px; color: var(--primary); font-size: 13px; font-weight: 750; }h3 { min-height: 58px; color: var(--ink); font-size: 20px; line-height: 1.45; letter-spacing: -.025em; }
.card-summary { min-height: 48px; margin: 10px 0 20px; overflow: hidden; color: var(--ink-muted); font-size: 14px; line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.meta-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 14px; padding: 16px; background: #f8fafd; border-radius: var(--radius-md); }.meta-grid div { min-width: 0; }dt { margin-bottom: 3px; color: var(--ink-faint); font-size: 11px; font-weight: 700; }dd { overflow: hidden; color: var(--ink); font-size: 13px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.card-footer { justify-content: space-between; gap: 16px; margin-top: 20px; }.price-label { display: block; margin-bottom: 2px; color: var(--ink-faint); font-size: 11px; }.card-footer strong { color: var(--ink); font-size: 15px; }.deadline { flex: 0 0 auto; padding: 7px 10px; color: #176945; background: #e7f8ef; border-radius: 9px; font-size: 13px; font-weight: 800; }.deadline.urgent { color: #c24135; background: #fff0ee; }.detail-arrow { color: var(--primary); font-size: 13px; font-weight: 750; }
@media (max-width:560px){.announcement-card{padding:20px}h3{min-height:auto;font-size:18px}.card-summary{min-height:auto}.meta-grid{grid-template-columns:1fr}}
</style>
