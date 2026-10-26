<script setup lang="ts">
// Our Journey (Figma "variation" › about, 733:351). Behaviour after landonorris.com's horizontal section:
// the section pins and vertical scroll drives a wide track sideways.
// Track: intro + quote/signature │ bracketed founder portrait on a faint "+" crosshair, stats floating round it │
// award cards in a loose zig-zag over oversized faint year numerals (parallax: numerals move slower).
// Layout is chosen by CSS media queries (no hydration layout shift); JS only adds motion in the same condition:
//   > 720px + motion OK → pinned horizontal track · reduced motion → vertical stack · ≤ 720px → stack + snap strip.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ImgRatio } from '~/composables/useLightbox'

type Space = 'md' | 'lg' | 'xl' | '2xl' | '3xl'
type Milestone = {
  year?: string
  title: string
  ratio: Extract<ImgRatio, '4/5' | '1/1'>
  image?: string // set a /public path to switch the card from ImgPlaceholder to <NuxtImg>
  low?: boolean // zig-zag: sits at the bottom of the stage instead of the top
  shift: Space // extra vertical offset from its edge, so the row never reads as a strict line
}
type Stat = { value: string; label: string }

const intro = {
  overline: 'SINCE 1997',
  title: 'Twenty-Five Years Behind the Lens',
  body: 'In 1997, Manish Patel picked up a camera and began photographing weddings across India. The Taj Studio has been telling love stories ever since.',
  quote: ['“We don’t see things', 'as they are”']
}

const milestones: Milestone[] = [
  { year: '1997', title: 'Started in 1997', ratio: '4/5', shift: 'lg' },
  { year: '2018', title: 'Wedding photographer of the year, Mywed', ratio: '1/1', low: true, shift: '2xl' },
  { year: '2018-2022', title: 'Winner of the Fearless Award', ratio: '1/1', shift: '3xl' },
  { year: '2018-2020', title: 'Winner of the Mywed Award', ratio: '4/5', low: true, shift: 'md' },
  { year: '2020', title: 'India’s top 3 wedding photographers', ratio: '4/5', shift: 'xl' },
  { year: '2020-2021', title: 'Weddingsutra Photography Awards winner', ratio: '1/1', low: true, shift: '3xl' },
  { title: 'Canon EOS influencer, India', ratio: '1/1', shift: '2xl' }
]

// Client-confirmed figures only (not 2000+ weddings / 382 awards).
const stats: Stat[] = [
  { value: '22+', label: 'years' },
  { value: '18', label: 'countries' },
  { value: '1,200+', label: 'weddings' }
]

// Depth layer behind the cards; positions are % of the awards area.
const numerals = [
  { text: '2018', left: '6%', top: '2%' },
  { text: '2020', left: '50%', top: '56%' },
  { text: '1997', left: '-14%', top: '60%' }
]

const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined
let mm: gsap.MatchMedia | undefined

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const el = root.value
  if (!el) return

  ctx = gsap.context(() => {
    mm = gsap.matchMedia()
    // Scope passed explicitly: this callback re-runs on breakpoint changes, outside the context's synchronous call.
    mm.add('(width > 720px) and (prefers-reduced-motion: no-preference)', () => {
      const stage = el.querySelector<HTMLElement>('.journey__stage')
      const track = el.querySelector<HTMLElement>('.journey__track')
      if (!stage || !track) return
      // offsetWidth, not scrollWidth: the parallaxed numerals overhang the track and would inflate the distance mid-scroll.
      const distance = () => Math.max(0, track.offsetWidth - stage.clientWidth)
      const range = { trigger: el, start: 'top top', end: () => `+=${distance()}`, scrub: 0.6, invalidateOnRefresh: true }

      const move = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { ...range, pin: true, anticipatePin: 1 }
      })

      // Numerals drift back against the track: they cover ~65% of the distance, so they read as further away.
      gsap.to('.journey__numeral', { x: () => distance() * 0.35, ease: 'none', scrollTrigger: range })
      gsap.fromTo('.journey__progress-fill', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: range })

      // Cards settle in as they cross into view (positions measured along the moving track).
      gsap.utils.toArray<HTMLElement>('.journey__card').forEach((card) => {
        gsap.from(card, {
          y: 48,
          autoAlpha: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, containerAnimation: move, start: 'left 92%', toggleActions: 'play none none reverse' }
        })
      })
    }, el)
  }, el)
})

onBeforeUnmount(() => { mm?.revert(); ctx?.revert() })
</script>

<template>
  <section ref="root" class="journey" id="journey" aria-labelledby="journey-title">
    <div class="journey__stage">
      <div class="journey__track">
        <span class="journey__hline" aria-hidden="true" />

        <div class="journey__intro">
          <div class="journey__lede">
            <p class="overline journey__overline">{{ intro.overline }}</p>
            <h2 id="journey-title">{{ intro.title }}</h2>
            <p class="journey__body">{{ intro.body }}</p>
          </div>
          <figure class="journey__quote">
            <blockquote><p><span v-for="line in intro.quote" :key="line">{{ line }}</span></p></blockquote>
            <figcaption class="journey__sig"><TajSignature :weight="1.6" /></figcaption>
          </figure>
        </div>

        <div class="journey__founder">
          <span class="journey__vline" aria-hidden="true" />
          <div class="journey__portrait-wrap">
            <BracketFrame always rec class="journey__portrait">
              <!-- Transparent cut-out: the crosshair runs behind him. -->
              <NuxtImg src="/images/journey/manish-patel.png" alt="Manish Patel, founder of The Taj Studio, seated on a stool"
                class="journey__portrait-img" width="711" height="715" sizes="xs:90vw md:560px" loading="lazy" />
            </BracketFrame>
            <dl class="journey__stats">
              <div v-for="(s, i) in stats" :key="s.label" class="journey__stat" :class="`journey__stat--${i}`">
                <dt class="overline">{{ s.label }}</dt>
                <dd>{{ s.value }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="journey__awards">
          <span v-for="n in numerals" :key="n.text" class="journey__numeral" :style="{ left: n.left, top: n.top }" aria-hidden="true">{{ n.text }}</span>
          <ol class="journey__cards">
            <li v-for="m in milestones" :key="m.title" class="journey__card" :class="{ 'journey__card--low': m.low }" :style="{ '--shift': `var(--space-${m.shift})` }">
              <BracketFrame>
                <NuxtImg v-if="m.image" :src="m.image" :alt="m.title" class="journey__img" :style="{ aspectRatio: m.ratio }" loading="lazy" sizes="xs:70vw md:240px" />
                <ImgPlaceholder v-else :ratio="m.ratio" :label="m.title" />
              </BracketFrame>
              <p v-if="m.year" class="overline journey__card-year">{{ m.year }}</p>
              <h3 class="journey__card-title">{{ m.title }}</h3>
            </li>
          </ol>
        </div>
      </div>

      <div class="journey__progress" aria-hidden="true">
        <span class="overline">1997</span>
        <span class="journey__progress-bar"><span class="journey__progress-fill" /></span>
        <span class="overline">Today</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
// ---------- Base = vertical stack (reduced motion, no JS-motion fallback) ----------
.journey {
  --card-w: clamp(160px, 22svh, 220px); // two zig-zag rows must fit the stage height without touching
  --portrait: min(560px, 58svh);
  overflow-x: clip; // the wide track must never widen the page
  padding-block: var(--space-5xl);

  &__stage { position: relative; }
  // minmax(0, 1fr): grid items may shrink below their content, so the mobile snap strip scrolls instead of widening.
  &__track { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-4xl); padding-inline: var(--page-margin); max-width: calc(var(--content-width) + var(--page-margin) * 2); margin-inline: auto; }
  &__hline, &__vline, &__numeral, &__progress { display: none; }

  &__intro { display: grid; gap: var(--space-2xl); align-content: space-between; }
  &__lede { display: grid; gap: var(--space-md); max-width: calc(var(--content-max-width) * 0.75); }
  &__overline { color: var(--color-accent-on-light); }
  &__body { font-size: var(--text-body-lg); color: var(--color-text-secondary); }

  &__quote { margin: 0; display: grid; gap: var(--space-sm); justify-items: start;
    blockquote { margin: 0; }
    p { display: grid; font-family: var(--font-serif); font-size: var(--text-h3); line-height: 1.25; } }
  &__sig { width: 172px; color: var(--color-accent-on-light); } // Figma signature vector: 172x67
  &__portrait-img { display: block; width: 100%; height: auto; aspect-ratio: 711 / 715; }

  &__founder { position: relative; display: grid; justify-items: start; }
  &__portrait-wrap { position: relative; width: min(100%, var(--portrait)); }
  &__stats { display: flex; flex-wrap: wrap; gap: var(--space-xl); margin: var(--space-xl) 0 0; }
  &__stat { display: flex; flex-direction: column-reverse; gap: var(--space-3xs);
    dt { color: var(--color-text-secondary); }
    dd { margin: 0; font-family: var(--font-serif); font-size: var(--text-h1); font-weight: 600; line-height: 1; } }

  &__awards { position: relative; }
  &__cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-2xl) var(--gutter); margin: 0; padding: 0; list-style: none; }
  &__card { display: grid; gap: var(--space-xs); align-content: start; }
  &__card-year { margin-top: var(--space-xs); color: var(--color-accent-on-light); }
  &__card-title { font-size: var(--text-h4); line-height: 1.3; }
  &__img { display: block; width: 100%; height: auto; object-fit: cover; }
}

// ---------- Pinned horizontal track ----------
@media (width > 720px) and (prefers-reduced-motion: no-preference) {
  .journey {
    padding-block: 0;

    &__stage { height: 100svh; padding: var(--nav-height) 0 var(--space-3xl); overflow: hidden; }
    &__track {
      display: flex;
      align-items: stretch;
      gap: var(--space-4xl);
      width: max-content;
      max-width: none;
      height: 100%;
      margin: 0;
      padding-block: var(--space-xl);
      will-change: transform;
    }

    // Faint "+" crosshair through the portrait centre: one line across the whole track, one down the stage.
    &__hline, &__vline { display: block; position: absolute; background: var(--color-border-subtle); pointer-events: none; }
    &__hline { left: 0; right: 0; top: 50%; height: 1px; }
    &__vline { top: calc(var(--nav-height) * -1 - var(--space-xl)); bottom: calc(var(--space-3xl) * -1 - var(--space-xl)); left: 50%; width: 1px; }

    &__intro { position: relative; z-index: 1; width: calc(var(--content-max-width) * 0.75); }

    &__founder { place-items: center; height: 100%; padding-inline: var(--space-4xl); }
    &__portrait-wrap { width: var(--portrait); }
    &__portrait { position: relative; z-index: 1; }

    // Stats float round the portrait, on a base-colour chip so the crosshair passes behind them.
    &__stats { display: contents; }
    &__stat { position: absolute; z-index: 2; padding: var(--space-xs) var(--space-sm); background: var(--color-bg-base); }
    &__stat--0 { left: calc(100% + var(--space-lg)); top: 14%; }
    &__stat--1 { right: calc(100% + var(--space-lg)); top: 24%; }
    &__stat--2 { left: calc(100% + var(--space-2xl)); bottom: 12%; }

    &__awards { height: 100%; padding-right: var(--page-margin); }
    &__numeral {
      display: block;
      position: absolute;
      font-family: var(--font-serif);
      font-size: var(--text-mega);
      line-height: 1;
      color: var(--color-text-primary);
      opacity: 0.06;
      pointer-events: none;
      user-select: none;
    }

    // Loose zig-zag: top cards hang from the top edge, low cards sit on the bottom edge. A low card cancels the gap
    // before it, so neighbours meet edge-to-edge in columns (staggered, never overlapping titles).
    &__cards { position: relative; display: flex; align-items: flex-start; gap: var(--space-3xl); height: 100%; }
    &__card { width: var(--card-w); margin-top: var(--shift); }
    &__card--low { align-self: flex-end; margin-top: 0; margin-bottom: var(--shift); margin-left: calc(var(--space-3xl) * -1); }

    &__progress {
      position: absolute;
      inset: auto var(--page-margin) var(--space-lg);
      display: flex;
      align-items: center;
      gap: var(--space-md);
      color: var(--color-text-secondary);
    }
    &__progress-bar { position: relative; flex: 1; height: 1px; background: var(--color-border-subtle); }
    &__progress-fill { position: absolute; inset: 0; background: var(--color-accent-brand); transform-origin: left; transform: scaleX(0); }
  }
}

// ---------- Mobile: stack, milestones become a native snap strip ----------
@media (width <= 720px) {
  .journey {
    padding-block: var(--space-2xl);
    &__track { padding-inline: 0; }
    &__intro, &__founder { padding-inline: var(--page-margin); }
    &__cards {
      display: flex;
      gap: var(--space-md);
      overflow-x: auto;
      padding: var(--space-md) var(--page-margin);
      scroll-padding-inline: var(--page-margin);
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }
    &__card { flex: 0 0 70vw; scroll-snap-align: start; }
  }
}
</style>
