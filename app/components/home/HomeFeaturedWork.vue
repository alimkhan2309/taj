<script setup lang="ts">
// Figma 733:65: bracketed intro (540) + 3:2 lead image (740), then a filmstrip of consistent 4:5 portrait tiles
// that bleeds off the right edge. On first view the strip swooshes in from the right, each tile skewed and
// stretched while moving, then settles flat.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const strip = Array.from({ length: 10 }, (_, i) => i)

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const el = root.value
  if (!el) return

  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const q = gsap.utils.selector(el)
    const track = q('.fw__strip')[0] as HTMLElement
    const tiles = q('.fw__tile')

    gsap.timeline({
      scrollTrigger: { trigger: track, start: 'top 85%', once: true },
      onStart: () => { gsap.set(track, { overflowX: 'hidden' }) }, // no scrollbar flicker while tiles are off to the right
      onComplete: () => { gsap.set(track, { clearProps: 'overflowX' }) }
    })
      .from(tiles, {
        x: () => window.innerWidth,
        skewX: -24,
        scaleX: 1.35,
        transformOrigin: 'left center',
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.06,
        ease: 'expo.out'
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

      <div class="fw__strip">
        <ImgPlaceholder v-for="i in strip" :key="i" ratio="4/5" class="fw__tile" :label="`Featured photograph ${i + 1}`" />
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

  // Consistent 4:5 tiles; the row bleeds past the right page margin like the Figma frame.
  &__strip {
    display: flex;
    gap: var(--space-2xs);
    margin-top: var(--space-2xl);
    margin-right: calc(50% - 50vw);
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
  }
  &__tile { flex: 0 0 clamp(120px, 11vw, 160px); scroll-snap-align: start; }
}

@media (width <= 900px) {
  .fw { grid-template-columns: 1fr; }
  .fw .fw__intro.bracket { --size: 40px; }
}
</style>
