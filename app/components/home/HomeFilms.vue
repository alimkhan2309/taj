<script setup lang="ts">
// Our Films — its own dark, cinematic section (the one inverse surface between two light ones).
// 1. Showreel: one large 16:9 poster; a square "Play" tag trails the cursor (centred on touch).
// 2. Film index: big serif rows (no. · couple · place · year · runtime). On fine pointers a floating 16:9 preview
//    follows the cursor and wipes between posters; on touch each row carries its own thumbnail instead.
// Everything opens in the shared lightbox, which plays `video` (file or embed) once real films are added.
import { gsap } from 'gsap'
import type { LightboxItem } from '~/composables/useLightbox'

type Film = { couple: string; place: string; year: string; runtime: string }

// PLACEHOLDER copy except Mohil & Harvi (Udaipur). Swap in real films; add `video` (+ poster `src`) per item.
const films: Film[] = [
  { couple: 'Mohil & Harvi', place: 'Udaipur', year: '2025', runtime: '04:12' },
  { couple: 'Aarav & Diya', place: 'Jaipur', year: '2025', runtime: '05:40' },
  { couple: 'Kabir & Meera', place: 'Goa', year: '2024', runtime: '03:58' },
  { couple: 'Rohan & Isha', place: 'Surat', year: '2024', runtime: '06:05' },
  { couple: 'Vivaan & Anaya', place: 'Lake Como', year: '2023', runtime: '04:47' }
]

const showreel: LightboxItem[] = [{ alt: 'The Taj Studio showreel', ratio: '16/9', caption: 'Showreel 2026' }]
const filmItems: LightboxItem[] = films.map((f) => ({ alt: `${f.couple} wedding film`, ratio: '16/9', caption: `${f.couple} · ${f.place}, ${f.year}` }))

const { open } = useLightbox()
const active = ref(-1)

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined

onMounted(() => {
  const el = root.value
  if (!el) return

  mm = gsap.matchMedia()
  mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const reel = el.querySelector<HTMLElement>('.films__reel')
    const tag = el.querySelector<HTMLElement>('.films__tag')
    const list = el.querySelector<HTMLElement>('.films__list')
    const preview = el.querySelector<HTMLElement>('.films__preview')
    if (!reel || !tag || !list || !preview) return

    // Play tag: offset from the reel centre, springs back on leave.
    const tagX = gsap.quickTo(tag, 'x', { duration: 0.6, ease: 'power3' })
    const tagY = gsap.quickTo(tag, 'y', { duration: 0.6, ease: 'power3' })
    const onReelMove = (e: PointerEvent) => {
      const r = reel.getBoundingClientRect()
      tagX(e.clientX - r.left - r.width / 2)
      tagY(e.clientY - r.top - r.height / 2)
    }
    const onReelLeave = () => { tagX(0); tagY(0) }

    // Floating preview, positioned in list coordinates and centred on the pointer.
    gsap.set(preview, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.8 })
    const pvX = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3' })
    const pvY = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3' })
    const onListMove = (e: PointerEvent) => {
      const r = list.getBoundingClientRect()
      pvX(e.clientX - r.left)
      pvY(e.clientY - r.top)
    }
    const onListEnter = (e: PointerEvent) => {
      onListMove(e)
      gsap.set(preview, { x: e.clientX - list.getBoundingClientRect().left, y: e.clientY - list.getBoundingClientRect().top })
      gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3.out' })
    }
    const onListLeave = () => {
      active.value = -1
      gsap.to(preview, { autoAlpha: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' })
    }

    reel.addEventListener('pointermove', onReelMove)
    reel.addEventListener('pointerleave', onReelLeave)
    list.addEventListener('pointerenter', onListEnter)
    list.addEventListener('pointermove', onListMove)
    list.addEventListener('pointerleave', onListLeave)
    return () => {
      reel.removeEventListener('pointermove', onReelMove)
      reel.removeEventListener('pointerleave', onReelLeave)
      list.removeEventListener('pointerenter', onListEnter)
      list.removeEventListener('pointermove', onListMove)
      list.removeEventListener('pointerleave', onListLeave)
    }
  })
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="root" class="section films" id="films">
    <div class="container">
      <header class="films__head">
        <SectionHeader overline="Our films" title="Our Films" subtext="A selection of weddings and films we're proud to capture." />
        <BaseButton to="/portfolio/films" variant="secondary" class="films__all">All films</BaseButton>
      </header>

      <button type="button" class="films__reel" aria-label="Play the Taj Studio showreel" @click="open(showreel, 0, $event.currentTarget)">
        <ImgPlaceholder ratio="16/9" dark label="Showreel poster" />
        <span class="films__reel-meta overline" aria-hidden="true"><span>Showreel</span><span>2026 · 02:30</span></span>
        <span class="films__tag overline" aria-hidden="true"><i /> Play</span>
      </button>

      <div class="films__list">
        <ol class="films__rows" :class="{ 'films__rows--hovering': active >= 0 }">
          <li v-for="(f, i) in films" :key="f.couple" class="films__row" :class="{ 'is-active': active === i }">
            <button type="button" class="films__btn" :aria-label="`Play ${f.couple}, ${f.place} ${f.year}, ${f.runtime}`"
              @pointerenter="active = i" @focus="active = i" @blur="active = -1" @click="open(filmItems, i, $event.currentTarget)">
              <span class="films__thumb" aria-hidden="true"><ImgPlaceholder ratio="16/9" dark /></span>
              <span class="films__no overline">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="films__title">{{ f.couple }}</span>
              <span class="films__meta">{{ f.place }}</span>
              <span class="films__meta films__year">{{ f.year }}</span>
              <span class="films__meta films__runtime">{{ f.runtime }}</span>
            </button>
          </li>
        </ol>

        <div class="films__preview" aria-hidden="true">
          <div v-for="(f, i) in films" :key="f.couple" class="films__poster" :class="{ 'is-active': active === i }">
            <ImgPlaceholder ratio="16/9" dark :label="`${f.couple} poster`" />
            <span class="overline films__poster-label">{{ f.couple }} · {{ f.runtime }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
// Hairlines on the dark surface: on-dark text at low strength (no dedicated token on the inverse surface).
$rule: color-mix(in srgb, var(--color-text-on-dark) 16%, transparent);

.films {
  background: var(--color-surface-inverse);
  color: var(--color-text-on-dark);

  // Header on dark: brand cyan is allowed on dark surfaces.
  &__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-xl);
    margin-bottom: var(--space-2xl);
    :deep(.section-header) { margin-bottom: 0; }
    :deep(h2) { color: var(--color-text-on-dark); }
    :deep(.section-header__overline) { color: var(--color-accent-brand); }
    :deep(.section-header__sub) { color: var(--color-text-on-dark-muted); }
  }
  // Secondary button recoloured for the dark surface (selector outranks BaseButton's own variant rules).
  & &__all.btn {
    flex: none;
    color: var(--color-text-on-dark);
    border-color: $rule;
    &:hover { color: var(--color-accent-brand); border-color: var(--color-accent-brand); }
  }

  // Showreel
  &__reel {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    overflow: hidden;
    :deep(.ph) { transition: transform 900ms var(--ease-out); }
    &:hover :deep(.ph) { transform: scale(1.03); }
  }
  &__reel-meta {
    position: absolute;
    inset: auto var(--space-xl) var(--space-xl);
    display: flex;
    justify-content: space-between;
    color: var(--color-text-on-dark);
  }
  &__tag {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    display: grid;
    place-items: center;
    gap: var(--space-xs);
    width: 112px;
    height: 112px;
    background: var(--color-accent-brand);
    color: var(--color-text-primary);
    pointer-events: none;
    transition: scale var(--duration-base) var(--ease-out);
    i { width: 0; height: 0; border-left: 14px solid currentcolor; border-block: 9px solid transparent; }
  }
  &__reel:hover &__tag { scale: 1.08; }

  // Index
  &__list { position: relative; margin-top: var(--space-4xl); }
  &__rows { margin: 0; padding: 0; list-style: none; border-bottom: 1px solid $rule; }
  &__row { border-top: 1px solid $rule; transition: opacity var(--duration-base); }
  &__rows--hovering &__row:not(.is-active) { opacity: 0.35; }

  &__btn {
    display: grid;
    grid-template-columns: 4rem 1fr 10rem 5rem 5rem;
    align-items: baseline;
    gap: var(--gutter);
    width: 100%;
    padding: var(--space-xl) 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  &__thumb { display: none; }
  &__no { color: var(--color-text-on-dark-muted); }
  &__title {
    font-family: var(--font-serif);
    font-size: var(--text-display);
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: -0.02em;
    transition: transform 500ms var(--ease-out), color var(--duration-base);
  }
  &__row.is-active &__title { transform: translateX(var(--space-lg)); color: var(--color-accent-brand); }
  &__meta { color: var(--color-text-on-dark-muted); }
  &__runtime { text-align: right; font-variant-numeric: tabular-nums; }

  // Floating preview: posters stacked, the active one wipes up from the bottom.
  &__preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 360px;
    aspect-ratio: 16 / 9;
    pointer-events: none;
    visibility: hidden;
    z-index: 2;
    box-shadow: var(--shadow-md);
  }
  &__poster {
    position: absolute;
    inset: 0;
    clip-path: inset(100% 0 0 0);
    transition: clip-path 600ms var(--ease-out);
    &.is-active { clip-path: inset(0 0 0 0); z-index: 1; }
  }
  &__poster-label { position: absolute; left: var(--space-sm); bottom: var(--space-sm); color: var(--color-text-on-dark); }
}

// Touch / coarse pointers: no floating preview, no dimming; each row shows its own thumbnail.
@media (hover: none), (pointer: coarse) {
  .films__preview { display: none; }
  .films__rows--hovering .films__row:not(.is-active) { opacity: 1; }
  .films__row.is-active .films__title { transform: none; }
  .films__thumb { display: block; grid-column: 1 / -1; margin-bottom: var(--space-sm); }
}

@media (width <= 900px) {
  .films__head { flex-direction: column; align-items: flex-start; }
  // Row: [no.] [title spanning] / [ ] [place] [runtime]. Year stays in the button's aria-label.
  .films__btn { grid-template-columns: 3rem 1fr auto; row-gap: var(--space-2xs); padding-block: var(--space-lg); }
  .films__title { font-size: var(--text-h1); grid-column: 2 / -1; }
  .films__meta { font-size: var(--text-body-sm); }
  .films__meta:not(.films__runtime) { grid-column: 2; }
  .films__year { display: none; }
  .films__tag { width: 80px; height: 80px; }
}

@media (prefers-reduced-motion: reduce) {
  .films__poster { transition: none; }
  .films__title { transition: color var(--duration-base); }
}
</style>
