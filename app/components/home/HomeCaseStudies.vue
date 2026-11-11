<script setup lang="ts">
// Case studies as a story switcher: one story on screen at a time, picked from numbered tabs.
// Replaces the sticky-scroll version (3 galleries x 6 images), which cost ~6 screens of scroll on desktop and ~4 on
// mobile for three stories. Now: ~1 screen on desktop, ~1.3 on mobile, and every story is one tap away.
// Desktop: 3-image mosaic (tall lead + two stacked) | story text. Mobile: mosaic over text, swipe the mosaic to page.
// a11y: WAI-ARIA tabs (automatic activation): ← → / Home / End move between stories, one tab stop.
import type { ComponentPublicInstance } from 'vue'
import { caseStudies, type CaseStudy } from '~/data/case-studies'

const stories: CaseStudy[] = caseStudies
const active = ref(0)
const story = computed<CaseStudy>(() => stories[active.value] ?? stories[0]!)
const pad = (n: number) => String(n).padStart(2, '0')

// Mosaic slots: tall lead, then two stacked on the right. Ratios are only the placeholder's intrinsic shape; the
// grid crops real photos to the cell with object-fit, so the three read as 4:5 / 3:2 / 3:2.
const slots: Array<'4/5' | '3/2'> = ['4/5', '3/2', '3/2']

const tabs: HTMLButtonElement[] = []
function setTab(el: Element | ComponentPublicInstance | null, i: number) {
  if (el instanceof HTMLButtonElement) tabs[i] = el
}

function select(i: number, focus = false) {
  const n = stories.length
  active.value = ((i % n) + n) % n
  if (focus) tabs[active.value]?.focus()
}

// Mobile: the tab row scrolls sideways. Keep the active tab in view when paging by swipe or arrows.
// Scrolls the row only (scrollIntoView could also nudge the page vertically).
watch(active, (i) => {
  const tab = tabs[i]
  const row = tab?.parentElement
  if (!tab || !row || row.scrollWidth <= row.clientWidth) return
  row.scrollTo({ left: tab.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft), behavior: 'smooth' })
})

function onKey(e: KeyboardEvent) {
  const to: Record<string, number> = { ArrowRight: active.value + 1, ArrowLeft: active.value - 1, Home: 0, End: stories.length - 1 }
  const next = to[e.key]
  if (next === undefined) return
  e.preventDefault()
  select(next, true)
}

// Touch: a mostly-horizontal swipe of 50px+ on the mosaic pages through stories.
let touch: { x: number; y: number } | null = null
function onTouchStart(e: TouchEvent) { const t = e.touches[0]; touch = t ? { x: t.clientX, y: t.clientY } : null }
function onTouchEnd(e: TouchEvent) {
  const t = e.changedTouches[0]
  if (!touch || !t) return
  const dx = t.clientX - touch.x
  const dy = t.clientY - touch.y
  touch = null
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) select(active.value + (dx < 0 ? 1 : -1))
}
</script>

<template>
  <section class="section section--surface cs" id="case-studies">
    <div class="container">
      <header class="cs__head">
        <SectionHeader overline="Case studies" title="Stories We've Covered" subtext="Whole weddings, start to finish, in the couple's own words." />
        <BaseButton to="/case-studies" variant="secondary" class="cs__all">All stories</BaseButton>
      </header>

      <div class="cs__tabs" role="tablist" aria-label="Case studies" @keydown="onKey">
        <button v-for="(s, i) in stories" :id="`cs-tab-${i}`" :key="s.slug" :ref="(el) => setTab(el, i)" type="button" role="tab"
          class="cs__tab" :class="{ 'is-active': i === active }" :aria-selected="i === active" aria-controls="cs-panel"
          :tabindex="i === active ? 0 : -1" @click="select(i)">
          <span class="overline cs__tab-no">{{ pad(i + 1) }}</span>
          <span class="cs__tab-name">{{ s.names }}</span>
          <span class="overline cs__tab-type">{{ s.type }}</span>
        </button>
      </div>

      <div id="cs-panel" class="cs__panel" role="tabpanel" :aria-labelledby="`cs-tab-${active}`">
        <!-- Old and new story share one grid cell and crossfade (no out-in gap), so the section never collapses
             mid-switch and the page below never jumps. -->
        <div class="cs__stage" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
          <Transition name="cs-media" :duration="{ enter: 900, leave: 300 }">
            <div :key="active" class="cs__media">
              <BracketFrame v-for="(r, j) in slots" :key="j" class="cs__shot" :class="`cs__shot--${j}`">
                <NuxtImg v-if="story.images?.[j]" :src="story.images[j]" :alt="`${story.names}, photo ${j + 1}`" class="cs__img"
                  loading="lazy" :sizes="j ? 'xs:40vw md:300px' : 'xs:60vw md:440px'" />
                <ImgPlaceholder v-else :ratio="r" :label="`${story.names}, photo ${j + 1}`" class="cs__img" />
              </BracketFrame>
            </div>
          </Transition>
        </div>

        <div class="cs__text">
          <!-- Pager sits outside the transition: the focused arrow survives the switch, and it never moves under the pointer. -->
          <div class="cs__pager">
            <p class="overline cs__count" aria-hidden="true">{{ pad(active + 1) }} / {{ pad(stories.length) }}</p>
            <div class="cs__arrows">
              <button type="button" class="cs__arrow" aria-label="Previous story" @click="select(active - 1)"><span aria-hidden="true">←</span></button>
              <button type="button" class="cs__arrow" aria-label="Next story" @click="select(active + 1)"><span aria-hidden="true">→</span></button>
            </div>
          </div>

          <div class="cs__stack">
            <Transition name="cs-story">
              <div :key="active" class="cs__story">
                <p class="overline cs__meta">{{ story.type }}<template v-if="story.place"> · {{ story.place }}</template></p>
                <h3 class="cs__names">{{ story.names }}</h3>
                <blockquote class="cs__quote"><p><span aria-hidden="true">“</span>{{ story.quote }}<span aria-hidden="true">”</span></p></blockquote>
                <p class="cs__caption">{{ story.caption }}</p>
                <BaseButton :to="`/case-studies/${story.slug}`" variant="secondary" bracket class="cs__cta">Read the full story →</BaseButton>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cs {
  &__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-xl);
    margin-bottom: var(--space-2xl);
    :deep(.section-header) { margin-bottom: 0; }
  }
  &__all { flex-shrink: 0; }

  // Tabs: a ruled index. The active one gets a cyan bar that draws in along the rule.
  &__tabs { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--gutter); margin-bottom: var(--space-2xl); } // relative: offsetLeft is measured from the row
  &__tab {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    gap: var(--space-3xs) var(--space-sm);
    padding: var(--space-md) 0 0;
    border: 0;
    border-top: 1px solid var(--color-border-strong);
    background: none;
    color: var(--color-text-secondary);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: color var(--duration-base);

    &::before {
      content: '';
      position: absolute;
      inset: -2px 0 auto;
      height: 3px;
      background: var(--color-accent-brand);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 600ms var(--ease-out);
    }
    &:hover { color: var(--color-text-primary); }
    &.is-active { color: var(--color-text-primary); &::before { transform: scaleX(1); } }
  }
  &__tab-no { color: var(--color-accent-on-light); }
  &__tab-name { font-family: var(--font-serif); font-size: var(--text-h4); font-weight: 500; line-height: 1.3; }
  &__tab-type { grid-column: 2; color: var(--color-text-secondary); }

  // Top-aligned (not centred): stories differ in length, and centring would move the pager on every switch.
  &__panel { display: grid; grid-template-columns: 7fr 5fr; gap: var(--space-3xl); align-items: start; }

  // Stage holds the box; outgoing and incoming mosaics overlap in its single cell.
  &__stage { display: grid; aspect-ratio: 3 / 2; }
  // Mosaic: lead fills the left column, two shots stack on the right. Cells crop whatever sits in them.
  &__media {
    grid-area: 1 / 1;
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-template-rows: 1fr 1fr;
    gap: var(--space-sm);
    min-height: 0;
  }
  &__shot { min-height: 0; }
  &__shot--0 { grid-row: 1 / -1; }
  &__img { display: block; width: 100%; height: 100%; object-fit: cover; aspect-ratio: auto !important; } // fill the cell, not the placeholder's ratio

  &__text { display: grid; gap: var(--space-xl); padding-top: var(--space-md); }
  &__pager { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-border-subtle); }
  &__count { color: var(--color-text-secondary); }
  &__stack { display: grid; }
  &__story { grid-area: 1 / 1; display: grid; gap: var(--space-lg); justify-items: start; align-content: start; }
  &__meta { color: var(--color-text-secondary); }
  &__names { font-size: var(--text-h1); }
  &__quote {
    margin: 0;
    padding-left: var(--space-lg);
    border-left: 2px solid var(--color-accent-brand);
    font-family: var(--font-serif);
    font-size: var(--text-h4);
    font-style: italic;
    line-height: 1.45;
    color: var(--color-text-primary);
  }
  &__caption { color: var(--color-text-secondary); }
  &__cta { margin-top: var(--space-xs); }
  &__arrows { display: flex; gap: var(--space-xs); }
  &__arrow {
    width: 48px;
    height: 48px;
    border: 1px solid var(--color-border-strong);
    background: none;
    color: var(--color-text-primary);
    font: inherit;
    font-size: var(--text-body-lg);
    cursor: pointer;
    transition: border-color var(--duration-base), color var(--duration-base);
    &:hover { border-color: var(--color-accent-on-light); color: var(--color-accent-on-light); }
  }
}

// Mosaic enter: each photo "develops" upward, staggered. Leave: a quick fade. (Durations set on <Transition>.)
.cs-media-enter-active .cs__img { transition: clip-path 700ms var(--ease-out); }
.cs-media-enter-active .cs__shot--1 .cs__img { transition-delay: 100ms; }
.cs-media-enter-active .cs__shot--2 .cs__img { transition-delay: 200ms; }
.cs-media-enter-from .cs__img { clip-path: inset(100% 0 0 0); }
.cs-media-leave-active { transition: opacity 300ms ease; }
.cs-media-leave-to { opacity: 0; }

.cs-story-enter-active { transition: opacity 400ms ease 120ms, transform 400ms var(--ease-out) 120ms; }
.cs-story-leave-active { transition: opacity 200ms ease, transform 200ms var(--ease-out); }
.cs-story-enter-from { opacity: 0; transform: translateY(8px); }
.cs-story-leave-to { opacity: 0; transform: translateY(-8px); }

@media (width <= 900px) {
  .cs {
    &__panel { grid-template-columns: 1fr; gap: var(--space-xl); }
    &__stage { aspect-ratio: 5 / 4; }
    &__text { padding-top: 0; }
    &__names { font-size: var(--text-h2); }
  }
}

@media (width <= 720px) {
  .cs {
    &__head { flex-direction: column; align-items: flex-start; gap: var(--space-lg); margin-bottom: var(--space-xl); }
    &__all { display: none; } // the full-story button and footer carry the link on small screens
    // Tabs become a swipeable index (the script scrolls the active one into view).
    &__tabs {
      display: flex;
      gap: var(--space-md);
      overflow-x: auto;
      margin-inline: calc(var(--page-margin) * -1);
      padding-inline: var(--page-margin);
      scroll-padding-inline: var(--page-margin);
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      margin-bottom: var(--space-lg);
    }
    &__tab { flex: 0 0 62%; scroll-snap-align: start; }
    &__tab-name { font-size: var(--text-body-lg); }
    &__quote { font-size: var(--text-body-lg); }
    &__text { gap: var(--space-lg); }
  }
}
</style>
