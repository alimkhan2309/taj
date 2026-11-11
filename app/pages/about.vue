<script setup lang="ts">
// About. Reads as an editorial spread on paper, top to bottom:
//   1. Hero: title + lede + hand-drawn signature | founder cut-out on a paper plate · ruled facts row
//   2. Founder story: sticky chapter label | long-form text with an image pair
//   3. Motto band (dark): the studio line + signature
//   4. How we work: three principles over staggered, mixed-ratio images
//   5. Recognition: ruled timeline whose spine fills as you scroll · press strip
//   6. CTA band
// Motion (GSAP, skipped under reduced motion): signature writes itself on load, timeline rows settle in, spine scrubs,
// principle images drift up slightly slower than the page.
//
// !! DRAFT COPY !! Story paragraphs and the three principles are written from facts already on the site
// (1997, Surat, 18 countries, 1,200+ weddings, "quietly, so you can be in it"). They need the client's sign-off.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FOUNDED, stats, awards, type Stat, type Award } from '~/data/studio'
import type { ImgRatio } from '~/composables/useLightbox'

useSeoMeta({
  title: 'About | The Taj Studio',
  ogTitle: 'About | The Taj Studio',
  description: `Manish Patel founded The Taj Studio in ${FOUNDED}. Wedding photography and films from Surat, across 18 countries.`
})

// Founding year instead of a years-count: "22+ years" and "since 1997" disagree until the client confirms.
const facts: Stat[] = [{ value: String(FOUNDED), label: 'founded' }, ...stats.filter((s) => s.label !== 'years')]

const story = {
  lede: 'Indian weddings are big, loud and long. They are also full of small things: a grandmother’s hand on a shoulder, a look across the mandap, a father who finally sits down.',
  body: [
    `Manish Patel picked up a camera in ${FOUNDED} to photograph both. Nearly three decades on, The Taj Studio still works the way he did at the start: arrive early, stay late, and stay out of the way until a moment needs us.`,
    'From Surat, the studio now travels to weddings in 18 countries. The distance changed; the approach did not. Every couple gets one point of view, carried from the first call to the final film.'
  ]
}

type Shot = { ratio: ImgRatio; caption: string }
const storyShots: Shot[] = [
  { ratio: '4/5', caption: 'Manish Patel at work' },
  { ratio: '3/2', caption: 'The studio, Surat' }
]

type Principle = { n: string; title: string; body: string; ratio: ImgRatio }
const principles: Principle[] = [
  { n: '01', title: 'Raw over posed', body: 'Big weddings, raw emotions. We follow the day as it happens and step in only when a moment needs a nudge.', ratio: '4/5' },
  { n: '02', title: 'Quiet on the day', body: 'We photograph and film quietly, so you can be in your wedding instead of managing it.', ratio: '1/1' },
  { n: '03', title: 'Photo and film, one team', body: 'Photographers and filmmakers plan together, so the gallery and the film tell the same story.', ratio: '3/2' }
]

const timeline: Award[] = awards
const pad = (n: number) => String(n).padStart(2, '0')

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const el = root.value
  if (!el) return

  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const q = gsap.utils.selector(el)

    // Hero: the signature writes itself (shared with Home). Title, lede and portrait are not animated in: they are
    // the LCP and would flash on hydration.
    const sig = signatureTimeline(q('.about-hero__sig')[0])
    gsap.delayedCall(0.4, () => sig.play())

    // Timeline: the cyan spine fills with scroll; rows settle in as they enter.
    gsap.fromTo(q('.tl__fill'), { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: q('.tl')[0], start: 'top 70%', end: 'bottom 70%', scrub: 0.6 }
    })
    // Rows are below the fold on load, so hiding them here never flashes.
    gsap.set(q('.tl__row'), { y: 24, autoAlpha: 0 })
    ScrollTrigger.batch(q('.tl__row'), {
      start: 'top 88%',
      once: true,
      onEnter: (rows) => gsap.to(rows, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' })
    })

    // Principles: images rise a little slower than the page (light parallax, desktop only by distance).
    q('.principle__media').forEach((m, i) => {
      gsap.fromTo(m, { y: 40 + i * 16 }, { y: 0, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom 40%', scrub: 0.6 } })
    })
  }, el)
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <div ref="root" class="about">
    <!-- 1. Hero -->
    <section class="about-hero" aria-labelledby="about-title">
      <div class="container about-hero__grid">
        <div class="about-hero__text">
          <p class="overline about-hero__overline">About · Est. {{ FOUNDED }}</p>
          <h1 id="about-title" class="about-hero__title">The story <em>behind</em> the lens</h1>
          <p class="about-hero__lede">
            Manish Patel picked up a camera in {{ FOUNDED }} and began photographing weddings across India.
            The Taj Studio has been telling love stories ever since.
          </p>
          <TajSignature class="about-hero__sig" :weight="2" />
        </div>

        <figure class="about-hero__figure">
          <BracketFrame always rec class="about-hero__frame">
            <span class="about-hero__plate paper" aria-hidden="true" />
            <NuxtImg src="/images/journey/manish-patel.png" alt="Manish Patel, founder of The Taj Studio, seated on a stool"
              class="about-hero__portrait" width="711" height="715" sizes="xs:90vw md:520px" loading="eager" fetchpriority="high" />
          </BracketFrame>
          <figcaption class="overline about-hero__caption">Manish Patel · Founder</figcaption>
        </figure>
      </div>

      <div class="container">
        <dl class="facts">
          <div v-for="f in facts" :key="f.label" class="facts__item">
            <dt class="overline">{{ f.label }}</dt>
            <dd>{{ f.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- 2. Founder story -->
    <section class="section story" aria-labelledby="story-title">
      <div class="container story__grid">
        <header class="story__aside">
          <p class="overline story__chapter">01 · The founder</p>
          <h2 id="story-title">One point of view, since {{ FOUNDED }}</h2>
        </header>

        <div class="story__body">
          <p class="story__lede">{{ story.lede }}</p>
          <p v-for="(p, i) in story.body" :key="i" class="story__p">{{ p }}</p>

          <div class="story__shots">
            <figure v-for="s in storyShots" :key="s.caption" class="story__shot">
              <BracketFrame><ImgPlaceholder :ratio="s.ratio" :label="s.caption" /></BracketFrame>
              <figcaption class="overline">{{ s.caption }}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Motto band -->
    <section class="motto paper--dark" aria-label="Studio motto">
      <div class="container motto__inner">
        <blockquote class="motto__quote"><p>“We don’t see things<br>as they are”</p></blockquote>
        <TajSignature class="motto__sig" :weight="2" />
      </div>
    </section>

    <!-- 4. How we work -->
    <section class="section" aria-label="How we work">
      <div class="container">
        <SectionHeader overline="02 · How we work" title="How We Work" subtext="Three habits that have not changed since the first wedding." />
        <ol class="principles">
          <li v-for="p in principles" :key="p.n" class="principle">
            <div class="principle__media">
              <BracketFrame><ImgPlaceholder :ratio="p.ratio" :label="p.title" /></BracketFrame>
            </div>
            <span class="overline principle__n">{{ p.n }}</span>
            <h3 class="principle__title">{{ p.title }}</h3>
            <p class="principle__body">{{ p.body }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- 5. Recognition -->
    <!-- Base, not surface: the CTA band below is surface, and two textured surfaces back to back show a tile restart. -->
    <section class="section recognition-section" aria-labelledby="recognition-title">
      <div class="container recognition">
        <header class="recognition__head">
          <p class="overline recognition__overline">03 · Recognition</p>
          <h2 id="recognition-title">Since {{ FOUNDED }}</h2>
          <p class="recognition__sub">Milestones and awards, oldest first.</p>
        </header>

        <div class="tl">
          <span class="tl__spine" aria-hidden="true"><span class="tl__fill" /></span>
          <ol class="tl__list">
          <li v-for="(a, i) in timeline" :key="a.title" class="tl__row">
            <span class="tl__year">{{ a.year ?? '—' }}</span>
            <span class="tl__what">
              <span class="tl__title">{{ a.title }}</span>
              <span v-if="a.by" class="overline tl__by">{{ a.by }}</span>
            </span>
            <span class="overline tl__no" aria-hidden="true">{{ pad(i + 1) }}</span>
          </li>
          </ol>
        </div>
      </div>
      <PressStrip />
    </section>

    <CtaBand title="Tell us about your day" label="Check your date" />
  </div>
</template>

<style scoped lang="scss">
// ---------- 1. Hero ----------
.about-hero {
  padding-top: calc(var(--nav-height) + var(--space-4xl));
  padding-bottom: var(--space-4xl);

  &__grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--gutter); align-items: end; }
  &__text { grid-column: 1 / 8; display: grid; gap: var(--space-lg); justify-items: start; padding-bottom: var(--space-2xl); }
  &__overline { color: var(--color-accent-on-light); }
  &__title {
    font-size: var(--text-hero);
    line-height: 1.02;
    letter-spacing: -0.03em;
    font-weight: 500;
    em { font-style: italic; color: var(--color-accent-on-light); }
  }
  &__lede { max-width: 34rem; font-size: var(--text-body-lg); color: var(--color-text-secondary); }
  &__sig { width: 240px; color: var(--color-accent-on-light); margin-top: var(--space-xs); }

  &__figure { grid-column: 8 / 13; margin: 0; display: grid; gap: var(--space-md); }
  &__frame { isolation: isolate; }
  // Paper plate behind the cut-out: covers the lower three quarters so the head and shoulders break out over its top.
  &__plate { position: absolute; inset: 24% 0 0; z-index: -1; background-color: var(--color-bg-surface); }
  &__portrait { display: block; width: 100%; height: auto; aspect-ratio: 711 / 715; }
  &__caption { color: var(--color-text-secondary); }
}

// Signature is written by GSAP on load; hidden until then so it never flashes fully drawn first.
@media (prefers-reduced-motion: no-preference) {
  .about-hero__sig { visibility: hidden; }
}

.facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: var(--space-3xl) 0 0;
  border-block: 1px solid var(--color-border-subtle);

  &__item {
    display: flex;
    flex-direction: column-reverse;
    gap: var(--space-2xs);
    padding: var(--space-xl) var(--space-lg);
    border-left: 1px solid var(--color-border-subtle);
    &:first-child { border-left: 0; padding-left: 0; }
    dt { color: var(--color-text-secondary); }
    dd { margin: 0; font-family: var(--font-serif); font-size: var(--text-display); font-weight: 500; line-height: 1; }
  }
}

// ---------- 2. Story ----------
.story {
  &__grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--gutter); align-items: start; }
  &__aside { grid-column: 1 / 5; position: sticky; top: calc(var(--nav-height) + var(--space-xl)); display: grid; gap: var(--space-sm); }
  &__chapter { color: var(--color-accent-on-light); }
  &__body { grid-column: 6 / 13; display: grid; gap: var(--space-lg); }
  &__lede { font-family: var(--font-serif); font-size: var(--text-h3); line-height: 1.4; color: var(--color-text-primary); }
  &__p { max-width: 62ch; font-size: var(--text-body-lg); color: var(--color-text-secondary); }

  // Pair of mixed ratios, bottom-aligned, so the two tops step.
  &__shots { display: grid; grid-template-columns: 4fr 5fr; gap: var(--space-xl); align-items: end; margin-top: var(--space-2xl); }
  &__shot { margin: 0; display: grid; gap: var(--space-sm); figcaption { color: var(--color-text-secondary); } }
}

// ---------- 3. Motto ----------
.motto {
  background-color: var(--color-surface-inverse);
  color: var(--color-text-on-dark);
  padding-block: var(--space-5xl);

  &__inner { display: grid; justify-items: center; gap: var(--space-xl); text-align: center; }
  &__quote { margin: 0; p { font-family: var(--font-serif); font-size: var(--text-hero); line-height: 1.05; letter-spacing: -0.02em; font-style: italic; } }
  &__sig { width: 260px; color: var(--color-accent-brand); } // brand cyan is allowed on dark
}

// ---------- 4. How we work ----------
.principles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2xl) var(--gutter);
  align-items: start;
  margin: 0;
  padding: 0;
  list-style: none;
}
.principle {
  display: grid;
  gap: var(--space-sm);
  &:nth-child(2) { margin-top: var(--space-4xl); } // editorial stagger: middle column drops
  &__media { margin-bottom: var(--space-md); }
  &__n { color: var(--color-accent-on-light); }
  &__title { font-size: var(--text-h3); }
  &__body { color: var(--color-text-secondary); max-width: 36ch; }
}

// ---------- 5. Recognition ----------
.recognition {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--gutter);
  align-items: start;

  &__head { grid-column: 1 / 5; position: sticky; top: calc(var(--nav-height) + var(--space-xl)); display: grid; gap: var(--space-sm); }
  &__overline { color: var(--color-accent-on-light); }
  &__sub { color: var(--color-text-secondary); font-size: var(--text-body-lg); }
}

.tl {
  grid-column: 6 / 13;
  position: relative;
  padding-left: var(--space-xl);

  &__list { margin: 0; padding: 0; list-style: none; }
  &__spine { position: absolute; inset: 0 auto 0 0; width: 1px; background: var(--color-border-strong); }
  &__fill { position: absolute; inset: 0; background: var(--color-accent-brand); transform-origin: top; width: 3px; left: -1px; }

  &__row {
    position: relative;
    display: grid;
    grid-template-columns: 9rem 1fr auto;
    gap: var(--space-lg);
    align-items: baseline;
    padding-block: var(--space-lg);
    border-bottom: 1px solid var(--color-border-subtle);
    &:first-of-type { padding-top: 0; }

    // Square marker on the spine, level with the year.
    &::before {
      content: '';
      position: absolute;
      left: calc(var(--space-xl) * -1 - 4px);
      top: calc(var(--space-lg) + 0.6em);
      width: 9px;
      height: 9px;
      background: var(--color-bg-base);
      border: 1px solid var(--color-border-strong);
      transition: background-color var(--duration-base), border-color var(--duration-base);
    }
    &:first-of-type::before { top: 0.6em; }
    &:hover::before { background: var(--color-accent-brand); border-color: var(--color-accent-brand); }
  }
  &__year { font-family: var(--font-serif); font-size: var(--text-h3); font-weight: 500; line-height: 1.2; white-space: nowrap; }
  &__what { display: grid; gap: var(--space-2xs); }
  &__title { font-family: var(--font-serif); font-size: var(--text-h4); line-height: 1.3; }
  &__by { color: var(--color-text-secondary); }
  &__no { color: var(--color-text-muted); }
}

// ---------- Responsive ----------
@media (width <= 900px) {
  .about-hero {
    &__text { grid-column: 1 / -1; padding-bottom: 0; }
    &__figure { grid-column: 1 / -1; width: min(100%, 440px); margin-top: var(--space-2xl); }
  }
  .story {
    &__aside, &__body { grid-column: 1 / -1; position: static; }
    &__aside { margin-bottom: var(--space-xl); }
  }
  .recognition {
    &__head { grid-column: 1 / -1; position: static; margin-bottom: var(--space-xl); }
    .tl { grid-column: 1 / -1; } // keeps position: relative, the spine is anchored to it
  }
  .principles { grid-template-columns: 1fr 1fr; }
  .principle:nth-child(2) { margin-top: var(--space-2xl); }
  .principle:nth-child(3) { grid-column: 1 / -1; max-width: 70%; }
}

@media (width <= 720px) {
  .about-hero { padding-top: calc(var(--nav-height) + var(--space-2xl)); padding-bottom: var(--space-2xl); }
  .facts {
    margin-top: var(--space-2xl);
    &__item { padding: var(--space-md) var(--space-sm); }
    &__item dd { font-size: var(--text-h2); }
  }
  .story__shots { grid-template-columns: 1fr; gap: var(--space-lg); }
  .story__shot:nth-child(2) { width: 80%; justify-self: end; }
  .motto { padding-block: var(--space-4xl); }
  .principles { grid-template-columns: 1fr; }
  .principle:nth-child(2) { margin-top: 0; }
  .principle:nth-child(3) { max-width: none; }
  .tl {
    padding-left: var(--space-lg);
    &__row { grid-template-columns: 1fr auto; gap: var(--space-2xs) var(--space-md); }
    &__row::before { left: calc(var(--space-lg) * -1 - 4px); }
    &__year { grid-column: 1; font-size: var(--text-h4); }
    &__what { grid-column: 1; }
    &__no { grid-column: 2; grid-row: 1; }
  }
}
</style>
