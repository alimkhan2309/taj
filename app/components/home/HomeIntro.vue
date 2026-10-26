<script setup lang="ts">
// Hero -> Transition as one pinned, scrubbed scene (Figma 733:130 hero, 733:154 sign). Reference: landonorris.com.
// 1. Full-bleed hero photo shrinks into the centred 480x253 card; the viewfinder corners travel and shrink with it.
// 2. Marquee rows, oversized text lines and the card brackets fade in around it; text lines drift sideways.
// 3. Past ~72% of the pin, the signature draws on (played, not scrubbed) and un-draws on the way back up.
// Reduced motion: no pin, the scene renders in its final state.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

// 12 tiles rendered twice so the CSS loop (translateX -50%) is seamless.
const loop = Array.from({ length: 24 }, (_, i) => i)

// Viewfinder timecode next to REC, ticking from page load (decorative, aria-hidden).
const seconds = ref(0)
const timecode = computed(() => [Math.floor(seconds.value / 3600), Math.floor(seconds.value / 60) % 60, seconds.value % 60].map((n) => String(n).padStart(2, '0')).join(':'))
let tick: ReturnType<typeof setInterval> | undefined

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined

onMounted(() => {
  tick = setInterval(() => { seconds.value++ }, 1000)
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin)
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

      const sig = gsap.timeline({ paused: true })
        .set(q('.intro__sig'), { autoAlpha: 1 })
        .from(q('.intro__sig path'), { drawSVG: 0, duration: 1.1, ease: 'power2.out' }) // one continuous stroke

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
          ? { trigger: el, start: 'top top', end: '+=200%', pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, onUpdate }
          : undefined
      })

      tl.to(q('.intro__ui'), { autoAlpha: 0, duration: 0.12, ease: 'none' }, 0)
        .fromTo(q('.intro__frame'),
          { width: () => stage.clientWidth - pad * 2, height: () => stage.clientHeight - pad * 2,
            '--corner': small ? '64px' : '176px', '--corner-w': '4px', '--corner-color': color('--color-text-on-dark') },
          { width: () => cardW() + gap * 2, height: () => cardH() + gap * 2,
            '--corner': small ? '32px' : '64px', '--corner-w': '2px', '--corner-color': color('--color-text-primary'), duration: 0.6 }, 0)
        .fromTo(q('.intro__media'),
          { top: -pad, right: -pad, bottom: -pad, left: -pad },
          { top: gap, right: gap, bottom: gap, left: gap, duration: 0.6 }, 0)
        .fromTo(q('.intro__img'), { scale: 1.15 }, { scale: 1, duration: 0.6 }, 0)
        .fromTo(q('.intro__row'), { autoAlpha: 0, y: (i: number) => (i ? 60 : -60) }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }, 0.3)
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

onBeforeUnmount(() => { mm?.revert(); clearInterval(tick) })
</script>

<template>
  <section ref="root" class="intro" aria-label="The Taj Studio">
    <div class="intro__stage">
      <div class="intro__row intro__row--top" aria-hidden="true">
        <div class="intro__track">
          <ImgPlaceholder v-for="(_, n) in loop" :key="`a${n}`" ratio="1/1" class="intro__tile" />
        </div>
      </div>

      <div class="intro__lines">
        <h2 class="intro__line intro__line--a">Surat’s premium wedding photographers</h2>
        <p class="intro__line intro__line--b" aria-hidden="true">Big weddings, raw emotions</p>
      </div>

      <div class="intro__row intro__row--bottom" aria-hidden="true">
        <div class="intro__track intro__track--reverse">
          <ImgPlaceholder v-for="(_, n) in loop" :key="`b${n}`" ratio="1/1" class="intro__tile" />
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
          <TajSignature class="intro__sig" :weight="3" />
        </div>

        <!-- Hero UI: viewfinder readout top-left; message + actions bottom-left; WhatsApp bottom-right. Fades on scroll. -->
        <div class="intro__ui">
          <span class="intro__rec overline" aria-hidden="true"><i /> REC <span class="intro__tc">{{ timecode }}</span></span>

          <div class="intro__lede">
            <p class="intro__kicker overline">The Taj Studio · Since 1997</p>
            <h1 class="intro__title">Wedding photography <br class="intro__br">&amp; films in Surat</h1>
            <p class="intro__proof">1,200+ weddings across 18 countries</p>
            <div class="intro__actions">
              <BaseButton to="/contact" class="intro__cta">Check your date</BaseButton>
              <NuxtLink to="/portfolio" class="intro__link overline">View our work →</NuxtLink>
            </div>
          </div>

          <a class="intro__whatsapp" href="https://wa.me/919558194459" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
            <span class="intro__wa-icon" aria-hidden="true" />
          </a>
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
    --tile: 160px;
    --row-gap: var(--space-3xl);
    position: relative;
    height: 100svh;
    min-height: 560px;
    overflow: hidden;
    background: var(--color-bg-base);
  }

  // Marquee rows: outer row is GSAP's (fade/rise), inner track is the CSS loop. Keeps the two transforms apart.
  &__row {
    position: absolute;
    left: 0;
    opacity: 0;
    &--top { top: calc(50% - var(--card-h) / 2 - var(--row-gap) - var(--tile)); }
    &--bottom { top: calc(50% + var(--card-h) / 2 + var(--row-gap)); }
  }
  &__track { display: flex; gap: var(--space-xs); padding-right: var(--space-xs); width: max-content; animation: slide 60s linear infinite; &--reverse { animation-direction: reverse; } }
  &__tile { width: var(--tile); flex: none; filter: grayscale(1); }

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
  &__sig { position: absolute; left: -18.54%; top: 7.11%; width: 145.4%; color: var(--color-accent-brand); opacity: 0; visibility: hidden; }

  &__ui {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    gap: var(--space-xl);
    padding: var(--space-3xl);
    color: var(--color-text-on-dark);
    background: linear-gradient(to top, rgb(0 0 0 / 45%), transparent 50%); // legibility for the headline
  }

  // Camera readout, top-left just under the nav.
  &__rec {
    position: absolute;
    top: calc(var(--nav-height) + var(--space-md));
    left: var(--space-3xl);
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    i { width: 12px; height: 12px; background: var(--color-accent-brand); animation: rec 2.4s ease-in-out infinite; }
  }
  &__tc { margin-left: var(--space-xs); color: var(--color-text-on-dark-muted); font-variant-numeric: tabular-nums; }

  &__lede { display: grid; gap: var(--space-md); justify-items: start; max-width: var(--content-max-width); }
  &__kicker { color: var(--color-text-on-dark-muted); }
  &__title {
    font-family: var(--font-serif);
    font-size: clamp(var(--text-h1), 5.2vw, calc(var(--text-display) * 1.5));
    font-weight: 500;
    line-height: 1.02;
    letter-spacing: -0.025em;
    color: var(--color-text-on-dark);
  }
  &__proof { color: var(--color-text-on-dark-muted); font-size: var(--text-body-lg); }
  &__actions { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-lg) var(--space-xl); margin-top: var(--space-xs); }
  // Primary on dark: light fill, cyan on hover (BaseButton's charcoal would vanish on the photo).
  & &__cta.btn { background: var(--color-bg-base); border-color: var(--color-bg-base); color: var(--color-text-primary);
    &:hover { background: var(--color-accent-brand); border-color: var(--color-accent-brand); } }
  &__link {
    padding-block: var(--space-2xs);
    border-bottom: 1px solid currentcolor;
    color: var(--color-text-on-dark);
    transition: color var(--duration-base), border-color var(--duration-base);
    &:hover { color: var(--color-accent-brand); }
  }

  // WhatsApp: the PNG glyph is used as a mask so its colour is ours; brand green on hover.
  &__whatsapp {
    margin-left: auto;
    flex: none;
    color: var(--color-text-on-dark);
    transition: color var(--duration-base), transform var(--duration-base) var(--ease-out);
    &:hover, &:focus-visible { color: var(--color-whatsapp); transform: scale(1.06); }
  }
  &__wa-icon {
    display: block;
    width: 64px;
    height: 64px;
    background: currentcolor;
    mask: url('/images/brand/whatsapp.png') center / contain no-repeat;
  }
}

@keyframes slide { to { transform: translateX(-50%); } }
@keyframes rec { 50% { opacity: 0.35; } }

@media (height <= 760px) { .intro__stage { --tile: 120px; --row-gap: var(--space-xl); } }
@media (width <= 720px) {
  .intro__stage { --card-w: 62vw; --tile: 110px; --row-gap: var(--space-xl); }
  .intro__ui :deep(.btn) { white-space: nowrap; padding-inline: var(--space-lg); }
  .intro__frame { --corner: 64px; }
  .intro__ui { padding: var(--space-lg); gap: var(--space-md); }
  .intro__rec { left: var(--space-lg); }
  .intro__br { display: none; }
  .intro__proof { font-size: var(--text-body); }
  .intro__wa-icon { width: 44px; height: 44px; }
}
@media (prefers-reduced-motion: reduce) { .intro__track { animation: none; } }
</style>
