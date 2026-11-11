<script setup lang="ts">
// Hero -> Transition as one pinned, scrubbed scene (Figma 733:130 hero, 733:154 sign). Reference: landonorris.com.
// 1. Full-bleed hero photo shrinks into the centred 480x253 card; the viewfinder corners travel and shrink with it.
// 2. Rows of 2:3 portraits slide in above and below the card and run sideways in opposite directions; oversized
//    text lines and the card brackets fade in around the card; text lines drift sideways.
// 3. Past ~72% of the pin, the signature draws on (played, not scrubbed) and un-draws on the way back up.
// Reduced motion: no pin, the scene renders in its final state.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { LightboxItem } from '~/composables/useLightbox'

// Horizontal marquee: one row of portraits above the card, one below, running in opposite directions at slightly
// different speeds. Each track is 14 tiles rendered three times, so the CSS loop (translateX by one set) is seamless
// on screens up to ~4000px wide.
// Tiles are black and white at rest. Hovering (or focusing) any tile pauses both rows and brings that one tile back
// to colour; clicking opens it in the shared lightbox, which pages through all portraits.
type Row = { id: string; side: 't' | 'b'; left: boolean; speed: string; offset: string; first: number }
const rows: Row[] = [
  { id: 'top', side: 't', left: true, speed: '90s', offset: '0s', first: 0 },
  { id: 'bottom', side: 'b', left: false, speed: '110s', offset: '-40s', first: 14 }
]
const PER_ROW = 14
const COPIES = 3 // keep in sync with the slide-x keyframe

// Portraits for the rows: 14 each, top row first. Add `src` (a /public path or CMS URL) to swap a placeholder for a
// photo; keep them 2:3 portrait.
const portraits: LightboxItem[] = Array.from({ length: PER_ROW * rows.length }, (_, i) => ({
  alt: `Wedding portrait ${i + 1}`,
  ratio: '2/3'
}))
// Only the first copy of each set is reachable by keyboard / screen readers; the repeats are decorative.
const loop = Array.from({ length: PER_ROW * COPIES }, (_, i) => i)

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const el = root.value
  if (!el) return

  // Read spacing / colour tokens so JS geometry stays in sync with _tokens.scss.
  const css = getComputedStyle(el)
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const space = (name: string) => parseFloat(css.getPropertyValue(name)) * rem
  const color = (name: string) => css.getPropertyValue(name).trim()

  mm = gsap.matchMedia()
  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', small: '(width <= 720px)' },
    (ctx) => {
      const { motion, small } = ctx.conditions as { motion: boolean; small: boolean }
      const q = gsap.utils.selector(el)
      const stage = q('.intro__stage')[0] as HTMLElement

      const pad = space('--space-md') // hero frame inset from the viewport
      const gap = space('--space-sm') // bracket gap around the final card
      // Mirrors --card-w. Narrower on phones so the overhanging signature (145% of the card) still fits.
      const cardW = () => Math.min(480, stage.clientWidth * (small ? 0.62 : 0.8))
      const cardH = () => (cardW() * 253) / 480

      // Handwriting: the client's signature writes itself stroke by stroke at a constant pen speed (~2s).
      const sig = signatureTimeline(q('.intro__sig')[0])

      // Signature trigger: once the pin passes SIG_AT (card settled, rows in), play; scrolling back above it un-draws.
      const SIG_AT = 0.72
      let drawn = false
      const onUpdate = (self: ScrollTrigger) => {
        if (self.progress >= SIG_AT && !drawn) { drawn = true; sig.timeScale(1).play() }
        else if (self.progress < SIG_AT && drawn) { drawn = false; sig.timeScale(2).reverse() }
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: motion
          // refreshPriority: this pin's 200% spacer moves every trigger below it, so it must be measured first. Declaring
          // it also makes ScrollTrigger sort all triggers into document order before each refresh. Without it, a pin
          // re-created after a later one (hot reload, a matchMedia re-run) left Our Journey pinning ~1800px too early,
          // over Films and the press strip.
          ? { trigger: el, start: 'top top', end: '+=200%', pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1, onUpdate }
          : undefined
      })

      tl.fromTo(q('.intro__frame'),
          { width: () => stage.clientWidth - pad * 2, height: () => stage.clientHeight - pad * 2,
            '--corner': small ? '64px' : '176px', '--corner-w': '4px', '--corner-color': color('--color-text-on-dark') },
          { width: () => cardW() + gap * 2, height: () => cardH() + gap * 2,
            '--corner': small ? '32px' : '64px', '--corner-w': '2px', '--corner-color': color('--color-text-primary'), duration: 0.6 }, 0)
        .fromTo(q('.intro__media'),
          { top: -pad, right: -pad, bottom: -pad, left: -pad },
          { top: gap, right: gap, bottom: gap, left: gap, duration: 0.6 }, 0)
        .fromTo(q('.intro__img'), { scale: 1.15 }, { scale: 1, duration: 0.6 }, 0)
        .fromTo(q('.intro__row'), { autoAlpha: 0, y: (_: number, t: HTMLElement) => (t.dataset.side === 'b' ? 60 : -60) }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }, 0.3)
        .fromTo(q('.intro__lines'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none' }, 0.35)
        .fromTo(q('.intro__line--a'), { xPercent: 8 }, { xPercent: -8, duration: 1, ease: 'none' }, 0)
        .fromTo(q('.intro__line--b'), { xPercent: -8 }, { xPercent: 8, duration: 1, ease: 'none' }, 0)

      if (!motion) {
        tl.progress(1)
        sig.progress(1)
      }
    },
    el
  )
})

onBeforeUnmount(() => { mm?.revert() })
</script>

<template>
  <section ref="root" class="intro" aria-label="The Taj Studio">
    <!-- Minimal hero for now: photo and viewfinder corners only. The page heading stays for screen readers and SEO. -->
    <h1 class="visually-hidden">The Taj Studio: wedding photography &amp; films in Surat</h1>
    <div class="intro__stage paper">
      <!-- Text lines sit behind the rows: they read in the gaps between the rows and the card. -->
      <div class="intro__lines">
        <h2 class="intro__line intro__line--a">Surat’s premium wedding photographers</h2>
        <p class="intro__line intro__line--b" aria-hidden="true">Big weddings, raw emotions</p>
      </div>

      <div v-for="r in rows" :key="r.id" class="intro__row" :class="`intro__row--${r.side}`" :data-side="r.side">
        <div class="intro__track" :class="{ 'intro__track--right': !r.left }" :style="{ animationDuration: r.speed, animationDelay: r.offset }">
          <PhotoTile v-for="n in loop" :key="n" :items="portraits" :index="r.first + (n % PER_ROW)" :decorative="n >= PER_ROW"
            class="intro__tile" />
        </div>
      </div>

      <div class="intro__frame">
        <div class="intro__media">
          <NuxtImg
            src="/images/hero/hero.png"
            alt="A photographer frames a wedding guest on a camera's live view screen"
            class="intro__img"
            sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw"
            loading="eager"
            fetchpriority="high"
            preload
          />
          <div class="intro__scrim" aria-hidden="true" />
        </div>

        <span class="intro__corner intro__corner--tl" aria-hidden="true" />
        <span class="intro__corner intro__corner--tr" aria-hidden="true" />
        <span class="intro__corner intro__corner--bl" aria-hidden="true" />
        <span class="intro__corner intro__corner--br" aria-hidden="true" />

        <div class="intro__card" aria-hidden="true">
          <TajSignature class="intro__sig" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.intro {
  position: relative;

  &__stage {
    --card-w: min(480px, 80vw);
    --card-h: calc(var(--card-w) * 253 / 480);
    // Row height: what fits between the nav and the card, capped. Tiles are 2:3, so width follows.
    --row: clamp(120px, calc((100svh - var(--card-h)) / 2 - var(--nav-height) - var(--space-2xl)), 220px);
    --row-gap: calc(var(--card-h) / 2 + var(--space-sm) + var(--space-lg)); // centre to row edge: card + bracket gap + air
    position: relative;
    height: 100svh;
    min-height: 560px;
    overflow: hidden;
    background-color: var(--color-bg-base); // + .paper: the pinned stage carries its own sheet, so paper never slides behind it
  }

  // Marquee rows: the row is GSAP's (fade/slide in), the inner track is the CSS loop. Keeps the two transforms apart.
  &__row {
    position: absolute;
    left: 0;
    height: var(--row);
    opacity: 0;
    &--t { bottom: calc(50% + var(--row-gap)); }
    &--b { top: calc(50% + var(--row-gap)); }
  }
  // padding-right = gap, so the tripled track is exactly three sets and -1/3 lands seamlessly.
  &__track {
    display: flex;
    width: max-content;
    height: 100%;
    gap: var(--space-xs);
    padding-right: var(--space-xs);
    animation: slide-x 90s linear infinite;
    &--right { animation-direction: reverse; }
  }
  // Black and white at rest; the hovered / focused tile returns to colour (PhotoTile adds the lift + zoom cursor).
  // Transition lists PhotoTile's own properties too, since this declaration replaces its transition on the same element.
  & &__tile {
    flex: none;
    width: calc(var(--row) * 2 / 3);
    filter: grayscale(1);
    transition: filter 500ms var(--ease-out), transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out);
    &:hover, &:focus-visible { filter: none; }
  }

  &__lines {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -60%;
    display: grid;
    justify-items: center;
    opacity: 0;
    pointer-events: none;
    user-select: none;
  }
  &__line {
    margin: 0;
    font-size: var(--text-mega);
    line-height: 0.95;
    white-space: nowrap;
    text-transform: uppercase;
    color: var(--color-text-primary);
    &--a { font-family: var(--font-serif); font-weight: 500; letter-spacing: 0; opacity: 0.08; }
    &--b { font-family: var(--font-sans); font-weight: 800; letter-spacing: -0.02em; opacity: 0.05; }
  }

  // The frame starts as the hero viewport (inset --space-md) and is tweened down to card + bracket gap.
  &__frame {
    --corner: 176px;
    --corner-w: 4px;
    --corner-color: var(--color-text-on-dark);
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(100% - var(--space-md) * 2);
    height: calc(100% - var(--space-md) * 2);
    translate: -50% -50%;
  }

  &__media { position: absolute; inset: calc(var(--space-md) * -1); overflow: hidden; background: var(--color-surface-inverse); }
  &__img { width: 100%; height: 100%; object-fit: cover; }
  &__scrim { position: absolute; inset: 0 0 auto; height: 180px; background: linear-gradient(to bottom, rgb(0 0 0 / 35%), transparent); }

  &__corner {
    position: absolute;
    width: var(--corner);
    height: var(--corner);
    border: 0 solid var(--corner-color);
    pointer-events: none;
    &--tl { top: 0; left: 0; border-top-width: var(--corner-w); border-left-width: var(--corner-w); }
    &--tr { top: 0; right: 0; border-top-width: var(--corner-w); border-right-width: var(--corner-w); }
    &--bl { bottom: 0; left: 0; border-bottom-width: var(--corner-w); border-left-width: var(--corner-w); }
    &--br { bottom: 0; right: 0; border-bottom-width: var(--corner-w); border-right-width: var(--corner-w); }
  }

  // Final card box; the signature overhangs it like Figma "Vector" (698x272 at -89,18 on a 480 card).
  &__card { position: absolute; inset: var(--space-sm); pointer-events: none; }
  // Signature overhangs the card (145% wide), centred on it.
  &__sig { position: absolute; left: 50%; top: 50%; width: 145.4%; translate: -50% -50%; color: var(--color-accent-brand); opacity: 0; visibility: hidden; }

}

@keyframes slide-x { to { transform: translateX(calc(-100% / 3)); } }

@media (width <= 720px) {
  .intro__stage { --card-w: 62vw; --row: clamp(120px, calc((100svh - var(--card-h)) / 2 - var(--nav-height) - var(--space-2xl)), 180px); }
  .intro__frame { --corner: 64px; }
}
// Hovering or focusing any tile freezes both rows, so the target holds still under the pointer.
// :has() covers the whole marquee; the per-row rule is the fallback where :has() is unsupported.
.intro__row:hover .intro__track, .intro__row:focus-within .intro__track,
.intro__stage:has(.intro__row:hover, .intro__row:focus-within) .intro__track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .intro__track { animation: none; } }

// On the homepage the fixed backdrop is the sheet (it never slides either), so the stage goes clear: no seam below.
:global(html.has-backdrop .intro__stage) { background: none; }
</style>
