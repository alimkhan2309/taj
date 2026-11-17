<script setup lang="ts">
// Services. One page, four chapters, read top to bottom (design canvas "Taj Studio Services Page"):
//   1. Intro: large title + lede | numbered index of the four services (anchor links, Lenis glides to them)
//   2. Wedding (flagship): 3:2 lead + staggered 4:5 / 1:1 pair | copy, ruled list, CTAs
//   3. Film: dark band, 16:9 showreel (opens the lightbox), three film types in a row
//   4. Pre-wedding: copy | 4:5 lead with an overlapping 3:2
//   5. Family: on the surface colour, staggered 1:1 / 4:5 pair | copy
//   6. What to Expect (shared with the homepage), then the closing CTA band
// Copy lives in app/data/services.ts (DRAFT, for client sign-off).
import type { LightboxItem } from '~/composables/useLightbox'
import { services, type Service, type ServiceShot } from '~/data/services'

useSeoMeta({
  title: 'Services | The Taj Studio',
  ogTitle: 'Services | The Taj Studio',
  description: 'Wedding photography, wedding films, pre-wedding shoots and family portraits by The Taj Studio, Surat.'
})

const pad = (n: number) => String(n).padStart(2, '0')
const index: Service[] = services

function get(id: Service['id']): Service {
  const s = services.find((x) => x.id === id)
  if (!s) throw new Error(`Missing service: ${id}`)
  return s
}
const wedding = get('wedding')
const film = get('film')
const preWedding = get('pre-wedding')
const family = get('family')
const no = (s: Service) => pad(services.indexOf(s) + 1)

// Shots by slot, so the template never indexes arrays. A missing slot falls back to a labelled placeholder.
const shot = (s: Service, i: number): ServiceShot => s.shots[i] ?? { ratio: '3/2', alt: `${s.name} photograph` }
const weddingLead = shot(wedding, 0)
const weddingDetail = shot(wedding, 1)
const weddingPortrait = shot(wedding, 2)
const preWeddingLead = shot(preWedding, 0)
const preWeddingOver = shot(preWedding, 1)
const familyA = shot(family, 0)
const familyB = shot(family, 1)
const reelShot: ServiceShot = shot(film, 0)

// Film points are written "Title: description".
type FilmType = { title: string; body: string }
const filmTypes: FilmType[] = film.points.map((p) => {
  const [title = '', ...rest] = p.split(':')
  const body = rest.join(':').trim()
  return { title: title.trim(), body: body.charAt(0).toUpperCase() + body.slice(1) }
})

const { open } = useLightbox()
const reel: LightboxItem[] = [{ src: reelShot.src, alt: reelShot.alt, ratio: '16/9', caption: 'Showreel' }]
</script>

<template>
  <div class="services">
    <!-- 1. Intro + index -->
    <section class="section sv-intro">
      <div class="container sv-intro__grid">
        <div class="sv-intro__copy">
          <p class="overline sv-overline">Services</p>
          <h1 class="sv-intro__title">Four ways we<br>tell your story.</h1>
          <p class="sv-intro__lede">Weddings and films first, then the moments around them. Every service is shot by the same studio, with the same eye.</p>
        </div>
        <nav class="sv-index" aria-label="Services on this page">
          <ol>
            <li v-for="(s, i) in index" :key="s.id">
              <a :href="`#${s.id}`" class="sv-index__row">
                <span class="overline sv-index__no">{{ pad(i + 1) }}</span>
                <span class="sv-index__name">{{ s.name }}</span>
                <span class="sv-index__kind">{{ s.kind }} <span aria-hidden="true">→</span></span>
              </a>
            </li>
          </ol>
        </nav>
      </div>
    </section>

    <!-- 2. Wedding (flagship) -->
    <section :id="wedding.id" class="section sv-chapter" :aria-labelledby="`${wedding.id}-title`">
      <div class="container">
        <div class="sv-rule"><span class="overline sv-rule__no">{{ no(wedding) }}</span><span class="sv-rule__line" /><span v-if="wedding.flagship" class="overline sv-tag">Flagship</span></div>
        <div class="sv-split">
          <div class="sv-split__media sv-wedding__media">
            <BracketFrame always>
              <ShotImage v-bind="weddingLead" sizes="xs:100vw md:760px" eager />
            </BracketFrame>
            <div class="sv-pair">
              <ShotImage v-bind="weddingDetail" sizes="xs:50vw md:370px" />
              <ShotImage v-bind="weddingPortrait" sizes="xs:50vw md:370px" />
            </div>
          </div>
          <div class="sv-split__text">
            <h2 :id="`${wedding.id}-title`" class="sv-title">{{ wedding.name }}</h2>
            <p class="sv-body">{{ wedding.body }}</p>
            <div>
              <p class="overline sv-list-label">What’s covered</p>
              <ul class="sv-points"><li v-for="p in wedding.points" :key="p">{{ p }}</li></ul>
            </div>
            <div class="sv-ctas">
              <BaseButton :to="wedding.primary.to">{{ wedding.primary.label }}</BaseButton>
              <NuxtLink v-if="wedding.secondary" :to="wedding.secondary.to" class="overline sv-link">{{ wedding.secondary.label }} <span aria-hidden="true">→</span></NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Film (dark band) -->
    <section :id="film.id" class="section sv-film paper--dark" :aria-labelledby="`${film.id}-title`">
      <div class="container">
        <div class="sv-rule sv-rule--dark"><span class="overline sv-rule__no">{{ no(film) }}</span><span class="sv-rule__line" /></div>
        <div class="sv-film__head">
          <h2 :id="`${film.id}-title`" class="sv-title">{{ film.name }}</h2>
          <p class="sv-body">{{ film.body }}</p>
        </div>
        <button type="button" class="sv-film__reel" aria-label="Play the Taj Studio showreel" @click="open(reel, 0, $event.currentTarget)">
          <BracketFrame always class="sv-film__frame">
            <ShotImage :src="reelShot.src" alt="Showreel poster" ratio="16/9" dark sizes="xs:100vw md:1280px" />
          </BracketFrame>
          <span class="overline sv-film__play" aria-hidden="true"><i />Play</span>
          <span class="overline sv-film__meta" aria-hidden="true">Showreel</span>
        </button>
        <div class="sv-film__foot">
          <ul class="sv-film__types">
            <li v-for="t in filmTypes" :key="t.title">
              <span class="sv-film__type">{{ t.title }}</span>
              <span class="sv-film__desc">{{ t.body }}</span>
            </li>
          </ul>
          <BaseButton :to="film.primary.to" variant="secondary" class="sv-film__btn">{{ film.primary.label }}</BaseButton>
        </div>
      </div>
    </section>

    <!-- 4. Pre-wedding -->
    <section :id="preWedding.id" class="section sv-chapter" :aria-labelledby="`${preWedding.id}-title`">
      <div class="container">
        <div class="sv-rule"><span class="overline sv-rule__no">{{ no(preWedding) }}</span><span class="sv-rule__line" /></div>
        <div class="sv-split sv-split--reverse">
          <div class="sv-split__text">
            <h2 :id="`${preWedding.id}-title`" class="sv-title">{{ preWedding.name }}</h2>
            <p v-if="preWedding.tagline" class="sv-tagline">{{ preWedding.tagline }}</p>
            <p class="sv-body">{{ preWedding.body }}</p>
            <ul class="sv-points"><li v-for="p in preWedding.points" :key="p">{{ p }}</li></ul>
            <div class="sv-ctas">
              <BaseButton :to="preWedding.primary.to">{{ preWedding.primary.label }}</BaseButton>
              <NuxtLink v-if="preWedding.secondary" :to="preWedding.secondary.to" class="overline sv-link">{{ preWedding.secondary.label }} <span aria-hidden="true">→</span></NuxtLink>
            </div>
          </div>
          <div class="sv-split__media sv-collage">
            <BracketFrame always class="sv-collage__lead">
              <ShotImage v-bind="preWeddingLead" sizes="xs:70vw md:440px" />
            </BracketFrame>
            <div class="sv-collage__over">
              <ShotImage v-bind="preWeddingOver" sizes="xs:60vw md:380px" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Family -->
    <section :id="family.id" class="section section--surface sv-chapter" :aria-labelledby="`${family.id}-title`">
      <div class="container">
        <div class="sv-rule"><span class="overline sv-rule__no">{{ no(family) }}</span><span class="sv-rule__line" /></div>
        <div class="sv-split">
          <div class="sv-split__media sv-pair sv-pair--family">
            <BracketFrame always>
              <ShotImage v-bind="familyA" sizes="xs:50vw md:340px" />
            </BracketFrame>
            <div>
              <ShotImage v-bind="familyB" sizes="xs:50vw md:340px" />
            </div>
          </div>
          <div class="sv-split__text">
            <h2 :id="`${family.id}-title`" class="sv-title">{{ family.name }}</h2>
            <p class="sv-body">{{ family.body }}</p>
            <div class="sv-ctas">
              <BaseButton :to="family.primary.to">{{ family.primary.label }}</BaseButton>
              <NuxtLink v-if="family.secondary" :to="family.secondary.to" class="overline sv-link">{{ family.secondary.label }} <span aria-hidden="true">→</span></NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <HomeWhatToExpect />
    <CtaBand />
  </div>
</template>

<style scoped lang="scss">
// Hairline on the dark band: on-dark text at low strength (same recipe as Films).
$rule-dark: color-mix(in srgb, var(--color-text-on-dark) 16%, transparent);

.sv-overline { color: var(--color-accent-on-light); margin-bottom: var(--space-lg); }

// 1. Intro
.sv-intro {
  padding-top: calc(var(--nav-height) + var(--space-4xl));
  padding-bottom: 0; // the first chapter's own top padding is the gap
  &__grid { display: grid; grid-template-columns: 7fr 5fr; gap: var(--space-3xl); align-items: end; }
  &__title { font-size: var(--text-mega); font-weight: 500; line-height: 0.95; letter-spacing: -0.035em; }
  &__lede { margin-top: var(--space-xl); max-width: 520px; font-size: var(--text-body-lg); color: var(--color-text-secondary); }
}
.sv-index {
  ol { margin: 0; padding: 0; list-style: none; border-bottom: 1px solid var(--color-border-subtle); }
  li { border-top: 1px solid var(--color-border-subtle); }
  &__row {
    display: grid;
    grid-template-columns: var(--space-2xl) 1fr auto;
    align-items: baseline;
    gap: var(--space-md);
    padding-block: var(--space-lg);
    &:hover .sv-index__name { color: var(--color-accent-on-light); transform: translateX(var(--space-xs)); }
  }
  &__no { color: var(--color-accent-on-light); }
  &__name { font-family: var(--font-serif); font-size: var(--text-h2); font-weight: 500; line-height: 1.1; transition: color var(--duration-base), transform var(--duration-base) var(--ease-out); }
  &__kind { font-size: var(--text-body-sm); color: var(--color-text-muted); }
}

// Chapter number rule: "01 ──────── FLAGSHIP"
.sv-rule {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  &__no { color: var(--color-accent-on-light); }
  &__line { flex: 1; height: 1px; background: var(--color-border-subtle); }
  &--dark &__no { color: var(--color-accent-brand); }
  &--dark &__line { background: $rule-dark; }
}
.sv-tag { padding: var(--space-2xs) var(--space-sm); border: 1px solid var(--color-accent-on-light); color: var(--color-accent-on-light); }

.sv-title { font-size: var(--text-mega); font-weight: 500; line-height: 0.95; letter-spacing: -0.03em; }
.sv-tagline { font-family: var(--font-serif); font-style: italic; font-size: var(--text-h2); line-height: 1.2; color: var(--color-text-secondary); }
.sv-body { font-size: var(--text-body-lg); color: var(--color-text-secondary); max-width: 560px; }
.sv-list-label { color: var(--color-text-secondary); margin-bottom: var(--space-sm); }
.sv-points {
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: 1px solid var(--color-border-subtle);
  li { display: flex; gap: var(--space-md); padding-block: var(--space-sm); border-top: 1px solid var(--color-border-subtle); }
  // Square cyan dot (brand cyan is fine as a mark on light; it is never text here).
  li::before { content: ''; flex: none; width: var(--space-xs); height: var(--space-xs); margin-top: 0.6em; background: var(--color-accent-brand); }
}
.sv-ctas { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-md) var(--space-xl); }
.sv-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: 48px;
  color: var(--color-accent-on-light);
  span { transition: transform var(--duration-base) var(--ease-out); }
  &:hover span { transform: translateX(var(--space-2xs)); }
}

// Media | text split. --reverse puts the text first on desktop (pre-wedding).
.sv-split {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: var(--space-3xl);
  align-items: start;
  &--reverse { grid-template-columns: 5fr 7fr; align-items: center; }
  &__text { display: grid; gap: var(--space-xl); align-content: start; justify-items: start; padding-top: var(--space-md); }
}
.sv-wedding__media { display: grid; gap: var(--space-lg); }
.sv-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-lg);
  align-items: start;
  > :last-child { margin-top: var(--space-4xl); } // stagger
  &--family > :last-child { margin-top: var(--space-3xl); }
}

// Pre-wedding collage: 4:5 lead, a 3:2 overlapping its lower right.
.sv-collage {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: end;
  padding-bottom: var(--space-3xl);
  &__lead { grid-column: 1 / 8; grid-row: 1; }
  &__over { grid-column: 7 / 13; grid-row: 1; margin-bottom: calc(var(--space-3xl) * -1); z-index: 1; box-shadow: var(--shadow-md); }
}

// 3. Film (dark)
.sv-film {
  background-color: var(--color-surface-inverse);
  color: var(--color-text-on-dark);
  .sv-title { color: var(--color-text-on-dark); }
  .sv-body { color: var(--color-text-on-dark-muted); }

  &__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--space-xl) var(--space-3xl); margin-bottom: var(--space-2xl); }
  &__reel {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    :deep(.bracket__corner) { border-color: var(--color-accent-brand); }
  }
  &__play {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    display: grid;
    place-items: center;
    align-content: center;
    gap: var(--space-xs);
    width: 112px;
    height: 112px;
    background: var(--color-accent-brand);
    color: var(--color-text-primary);
    transition: scale var(--duration-base) var(--ease-out);
    i { width: 0; height: 0; border-left: 14px solid currentcolor; border-block: 9px solid transparent; }
  }
  &__reel:hover &__play, &__reel:focus-visible &__play { scale: 1.08; }
  &__meta { position: absolute; left: var(--space-xl); bottom: var(--space-xl); color: var(--color-text-on-dark); }

  &__foot { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: var(--space-xl) var(--space-3xl); margin-top: var(--space-3xl); }
  &__types {
    flex: 1 1 560px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--gutter);
    margin: 0;
    padding: 0;
    list-style: none;
    li { display: grid; gap: var(--space-xs); align-content: start; padding-top: var(--space-md); border-top: 1px solid $rule-dark; }
  }
  &__type { font-family: var(--font-serif); font-size: var(--text-h3); font-weight: 500; line-height: 1.2; }
  &__desc { color: var(--color-text-on-dark-muted); }
  // Secondary button recoloured for the dark band (outranks BaseButton's own variant rules).
  & &__btn.btn {
    flex: none;
    color: var(--color-text-on-dark);
    border-color: $rule-dark;
    &:hover { color: var(--color-accent-brand); border-color: var(--color-accent-brand); }
  }
}

@media (width <= 900px) {
  .sv-intro__grid, .sv-split, .sv-split--reverse { grid-template-columns: 1fr; gap: var(--space-2xl); }
  .sv-split--reverse .sv-split__media { order: -1; } // photos first on small screens, like the other chapters
  .sv-pair > :last-child { margin-top: var(--space-2xl); }
  .sv-film__types { grid-template-columns: 1fr; }
  .sv-film__play { width: 80px; height: 80px; }
  .sv-film__btn { width: 100%; }
  .sv-title { font-size: var(--text-display); }
}

@media (prefers-reduced-motion: reduce) {
  .sv-index__name { transition: color var(--duration-base); }
}
</style>
