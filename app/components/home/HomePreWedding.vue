<script setup lang="ts">
// Pre-wedding preview: a teaser for /pre-wedding, between Films (dark) and Press. Transparent over HomeBackdrop.
// 1. Headline set large, with two small photos dropped into the words (reveal: lines rise, photos wipe open).
// 2. Editorial collage: tall 4:5 lead, a 1:1 that overlaps it and a 3:2, each drifting at its own scroll speed.
//    No captions (no couple names or places). Every photo opens the shared lightbox (with the "Inquire about your
//    date" link); the lead photo also links to its case study.
// Reduced motion: no reveal, no drift. ≤ 900px: no overlap, no drift.
// Copy is DRAFT for client sign-off.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import type { LightboxItem } from '~/composables/useLightbox'
import { preWeddingShoots, type PreWeddingShoot } from '~/data/portfolio'

const shoots: PreWeddingShoot[] = preWeddingShoots
// No captions: names and places stay off screen (lightbox included).
const items: LightboxItem[] = shoots.map((s, i) => ({
  src: s.src,
  alt: s.alt ?? `Pre-wedding photograph ${i + 1}`,
  ratio: s.ratio,
  story: s.caseStudySlug ? `/case-studies/${s.caseStudySlug}` : undefined
}))
// The two headline photos are crops of the second and third shoots (decorative: the collage carries the alt text).
const inline: Array<string | undefined> = [shoots[1]?.src, shoots[2]?.src]
// Drift strength per frame (% of its own height): the overlapping square moves most, so it reads as nearest.
const speeds: number[] = [4, 18, 9]

const { open } = useLightbox()

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const el = root.value
  if (!el) return

  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const head = el.querySelector('.pw__title')
    if (!head) return
    gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 80%', once: true } })
      .from(el.querySelectorAll('.pw__line-in'), { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.12 })
      .from(el.querySelectorAll('.pw__inline'), { clipPath: 'inset(0 50% 0 50%)', duration: 1, ease: 'power3.inOut', stagger: 0.12 }, 0.35)
      .from(el.querySelectorAll('.pw__inline-img'), { scale: 1.5, duration: 1.4, ease: 'power3.out', stagger: 0.12 }, 0.35)
  })

  // Drift: each frame moves from +s% to -s% of its own height while the collage crosses the viewport.
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const collage = el.querySelector('.pw__collage')
    if (!collage) return
    el.querySelectorAll<HTMLElement>('[data-speed]').forEach((frame) => {
      const s = Number(frame.dataset.speed)
      gsap.fromTo(frame, { yPercent: s }, { yPercent: -s, ease: 'none', scrollTrigger: { trigger: collage, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
  })
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="root" class="section pw" id="pre-wedding" aria-labelledby="pw-title">
    <div class="container">
      <header class="pw__head">
        <p class="overline pw__overline">Pre-wedding</p>
        <h2 id="pw-title" class="pw__title">
          <span class="pw__line"><span class="pw__line-in">Before the
            <span class="pw__inline" aria-hidden="true">
              <NuxtImg v-if="inline[0]" :src="inline[0]" alt="" class="pw__inline-img" sizes="160px" />
              <span v-else class="pw__inline-img pw__inline-img--ph" />
            </span> <span class="pw__seg">big day,</span></span></span>
          <span class="pw__line pw__line--2"><span class="pw__line-in">just the two
            <span class="pw__inline pw__inline--sq" aria-hidden="true">
              <NuxtImg v-if="inline[1]" :src="inline[1]" alt="" class="pw__inline-img" sizes="160px" />
              <span v-else class="pw__inline-img pw__inline-img--ph" />
            </span> <span class="pw__seg">of you.</span></span></span>
        </h2>
      </header>

      <div class="pw__collage">
        <div v-for="(s, i) in shoots" :key="i" class="pw__shot" :class="`pw__shot--${i}`" :data-speed="speeds[i]">
          <BracketFrame>
            <button type="button" class="pw__btn" :aria-label="`View larger: ${items[i]?.alt}`" @click="open(items, i, $event.currentTarget, { inquire: true })">
              <NuxtImg v-if="s.src" :src="s.src" :alt="items[i]?.alt" class="pw__img" :style="{ aspectRatio: s.ratio }" loading="lazy"
                :sizes="i === 0 ? 'xs:100vw md:520px' : 'xs:50vw md:420px'" />
              <ImgPlaceholder v-else :ratio="s.ratio" :label="items[i]?.alt" class="pw__img" />
            </button>
          </BracketFrame>
        </div>

        <div class="pw__text">
          <p class="pw__copy">
            A day or two that is only about the two of you, before the rituals and the guest lists. We find the place and
            the hour of light, plan the looks around them, then step back so the photographs feel like yours.
          </p>
          <div class="pw__ctas">
            <BaseButton to="/pre-wedding" bracket>Explore pre-weddings</BaseButton>
            <NuxtLink to="/contact" class="overline pw__link">Plan your shoot <span aria-hidden="true">→</span></NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pw {
  overflow-x: clip;

  // Headline
  &__head { margin-bottom: var(--space-4xl); }
  &__overline { color: var(--color-accent-on-light); margin-bottom: var(--space-lg); }
  &__title {
    font-size: var(--text-mega);
    font-weight: 500;
    line-height: 0.95;
    letter-spacing: -0.035em;
    text-wrap: initial;
  }
  // Each line is its own mask for the rise-in. Padding keeps descenders (y, g) inside the mask. Lines never wrap on
  // desktop (each is under 9.5em, and mega is 9vw), so the two-line shape holds.
  &__line { display: block; overflow: clip; padding-bottom: 0.12em; margin-bottom: -0.12em; }
  &__line--2 { padding-left: 1.2em; }
  &__line-in { display: block; white-space: nowrap; }
  &__inline {
    display: inline-block;
    width: 1.2em;
    height: 0.8em; // 3:2 (the second is 1:1)
    margin-inline: 0.04em;
    vertical-align: -0.04em;
    overflow: hidden;
    clip-path: inset(0 0 0 0);
  }
  &__inline--sq { width: 0.8em; }
  &__inline-img { display: block; width: 100%; height: 100%; object-fit: cover; }
  &__inline-img--ph { background: var(--color-placeholder); }

  // Collage (12 columns): lead 1–5 over two rows; text top right; the square overlaps the lead and hangs below it;
  // the 3:2 sits bottom right.
  &__collage {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: auto auto;
    column-gap: var(--gutter);
    row-gap: var(--space-2xl);
    padding-bottom: var(--space-2xl); // with the section padding, room for the hanging square
  }
  &__shot { margin: 0; will-change: transform; }
  &__shot--0 { grid-column: 1 / 6; grid-row: 1 / 3; }
  &__shot--1 { grid-column: 5 / 8; grid-row: 2; align-self: end; margin-bottom: calc(var(--space-3xl) * -1); z-index: 1; }
  &__shot--2 { grid-column: 9 / 13; grid-row: 2; align-self: end; }
  &__text { grid-column: 7 / 12; grid-row: 1; align-self: center; display: grid; gap: var(--space-xl); justify-items: start; }

  &__btn {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
    overflow: hidden;
    :deep(.ph), .pw__img { transition: transform 900ms var(--ease-out); }
    &:hover :deep(.ph), &:hover .pw__img, &:focus-visible :deep(.ph), &:focus-visible .pw__img { transform: scale(1.04); }
  }
  &__img { display: block; width: 100%; height: auto; object-fit: cover; }
  // The square overlaps the lead: the deeper shadow level lifts it off.
  &__shot--1 &__btn { box-shadow: var(--shadow-md); }

  &__copy { font-size: var(--text-body-lg); color: var(--color-text-secondary); max-width: 460px; }
  &__ctas { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-xl); }
  &__link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    min-height: 48px;
    color: var(--color-accent-on-light);
    span { transition: transform var(--duration-base) var(--ease-out); }
    &:hover span { transform: translateX(var(--space-2xs)); }
  }
}

// Tablet / mobile: lead full width, text, then the two smaller photos side by side. No overlap, no drift.
@media (width <= 900px) {
  .pw__head { margin-bottom: var(--space-2xl); }
  // Four deliberate lines instead of a wrap: "Before the ▭ / big day, / just the two ▭ / of you." (each ≤ 5.2em).
  .pw__line--2 { padding-left: 0; }
  .pw__seg { display: block; padding-left: 1.2em; }
  .pw__collage { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: none; row-gap: var(--space-xl); padding-bottom: 0; }
  .pw__shot--0 { grid-column: 1 / -1; grid-row: 1; }
  .pw__text { grid-column: 1 / -1; grid-row: 2; }
  .pw__shot--1 { grid-column: 1; grid-row: 3; margin-bottom: 0; align-self: start; }
  .pw__shot--2 { grid-column: 2; grid-row: 3; align-self: start; }
  .pw__shot--1 .pw__btn { box-shadow: none; }
}

@media (prefers-reduced-motion: reduce) {
  .pw__btn :deep(.ph), .pw__img { transition: none; }
}
</style>
