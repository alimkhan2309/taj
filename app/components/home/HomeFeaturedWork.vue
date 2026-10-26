<script setup lang="ts">
// Figma 733:65: bracketed intro (540) + 3:2 lead image (740), then a full-bleed marquee of 4:3 tiles.
// The row slides in from the right once (one element, transform + opacity only); the inner track loops via CSS.
// Hover pauses the loop. Reduced motion: no entrance, no loop.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import type { LightboxItem } from '~/composables/useLightbox'

// Placeholders until real photography lands: add `src` per item and the tiles + lightbox pick it up.
const photos: LightboxItem[] = Array.from({ length: 10 }, (_, i) => ({ alt: `Featured photograph ${i + 1}`, ratio: '4/3' }))
// Rendered twice so the loop (translateX -50%) is seamless; the copy maps back to the same lightbox index.
const loop = Array.from({ length: photos.length * 2 }, (_, i) => i)

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const el = root.value
  if (!el) return

  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const row = el.querySelector('.fw__strip')
    if (!row) return
    gsap.from(row, {
      xPercent: 35,
      autoAlpha: 0,
      duration: 1.4,
      ease: 'power3.out',
      force3D: true,
      scrollTrigger: { trigger: row, start: 'top 90%', once: true }
    })
  })
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="root" class="section section--surface fw-section" id="featured-work">
    <div class="container">
      <div class="fw">
        <BracketFrame always class="fw__intro">
          <div class="fw__intro-body">
            <SectionHeader overline="Featured work" title="Featured Work" />
            <p class="fw__copy">A selection of weddings and films we're proud to capture.</p>
            <BaseButton to="/portfolio/photos" bracket>See more</BaseButton>
          </div>
        </BracketFrame>
        <BracketFrame class="fw__lead"><ImgPlaceholder ratio="3/2" label="Featured wedding" /></BracketFrame>
      </div>
    </div>

    <div class="fw__strip" aria-label="Featured photographs">
      <div class="fw__track">
        <PhotoTile v-for="n in loop" :key="n" :items="photos" :index="n % photos.length" :decorative="n >= photos.length" class="fw__tile" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.fw-section { overflow-x: clip; }

.fw {
  display: grid;
  grid-template-columns: 540fr 740fr;
  gap: var(--space-xl);
  align-items: stretch;

  // Large always-on corners hugging the box (BracketFrame defaults are 18px, offset outward).
  & &__intro.bracket { --size: 68px; --inset: 0px; height: 100%; }
  &__intro-body { height: 100%; display: grid; gap: var(--space-lg); align-content: center; justify-items: start; padding: var(--space-xl); :deep(.section-header) { margin-bottom: 0; } }
  &__copy { color: var(--color-text-secondary); font-size: var(--text-body-lg); max-width: 460px; }

  // Full-bleed marquee. Outer row = GSAP entrance; inner track = CSS loop, so the two transforms never fight.
  // Vertical padding leaves room for the PhotoTile hover pop inside the clipped row.
  &__strip { margin-top: var(--space-xl); padding-block: var(--space-md); overflow: hidden; }
  &__track {
    display: flex;
    gap: var(--space-2xs);
    padding-right: var(--space-2xs); // trailing gap so -50% lands exactly on the second copy
    width: max-content;
    animation: fw-marquee 50s linear infinite;
    &:hover { animation-play-state: paused; }
  }
  &__track &__tile { flex: none; width: clamp(160px, 16vw, 240px); } // beats PhotoTile's own width: 100%
}

@keyframes fw-marquee { to { transform: translate3d(-50%, 0, 0); } }

@media (width <= 900px) {
  .fw { grid-template-columns: 1fr; }
  .fw .fw__intro.bracket { --size: 40px; }
}
@media (prefers-reduced-motion: reduce) { .fw__track { animation: none; } }
</style>
