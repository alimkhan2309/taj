<script setup lang="ts">
// Films. Featured film on top: a poster button; the Vimeo/YouTube iframe is only created after the click.
// Below: 2-column grid of 16:9 cards; each opens the shared lightbox with the embed (same keyboard/touch/focus
// behaviour as photos). Only one video ever plays: opening a card unmounts the featured player first.
import { films, filmEmbedUrl, isPlaceholderVideo, type FilmItem } from '~/data/portfolio'
import type { LightboxItem } from '~/composables/useLightbox'

useSeoMeta({
  title: 'Wedding Films — The Taj Studio',
  description: 'Wedding films and highlights by The Taj Studio, Surat — honest, cinematic storytelling.',
  ogTitle: 'Wedding Films — The Taj Studio',
  ogDescription: 'Wedding films and highlights by The Taj Studio.',
  ogImage: '/og/films.jpg' // PLACEHOLDER: add a 1200x630 image at public/og/films.jpg
})

const [featured, ...rest] = films
const playing = ref(false)
const featuredUrl = computed(() => (playing.value && featured ? filmEmbedUrl(featured) : undefined))

const { open } = useLightbox()
const toItem = (f: FilmItem): LightboxItem => ({
  alt: `${f.couple} wedding film`,
  ratio: '16/9',
  caption: `${f.couple} · ${f.location} · ${f.runtime}`,
  video: filmEmbedUrl(f), // undefined for placeholders → poster + note instead of an iframe
  note: isPlaceholderVideo(f) ? 'Film placeholder: add a video ID in app/data/portfolio.ts' : undefined
})
const items = rest.map(toItem)

function openFilm(i: number, el: EventTarget | null) {
  playing.value = false // never two players at once
  open(items, i, el, { inquire: true })
}
</script>

<template>
  <div>
    <section class="section films-head">
      <div class="container">
        <SectionHeader overline="Portfolio" title="Films" subtext="Wedding films, told honestly. Press play: nothing loads or plays until you do." />

        <div v-if="featured" class="feature">
          <BracketFrame always class="feature__frame">
            <div class="feature__player">
              <iframe v-if="featuredUrl" :src="featuredUrl" :title="`${featured.couple} wedding film`" class="feature__embed"
                allow="autoplay; fullscreen; picture-in-picture" allowfullscreen />
              <button v-else type="button" class="feature__poster" :aria-label="`Play ${featured.couple}, ${featured.location}, ${featured.runtime}`" @click="playing = true">
                <!-- Swap for <NuxtImg> poster (eager: above the fold). -->
                <ImgPlaceholder ratio="16/9" dark :label="`${featured.couple} film poster`" />
                <span class="play" aria-hidden="true"><i /></span>
                <span v-if="playing" class="feature__note overline">Film placeholder: add a video ID</span>
              </button>
            </div>
          </BracketFrame>
          <div class="feature__meta">
            <p class="overline feature__kicker">Featured film</p>
            <h2 class="feature__title">{{ featured.couple }}</h2>
            <p class="feature__info">{{ featured.location }} · {{ featured.runtime }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section films-grid" aria-label="All films">
      <div class="container">
        <ul class="cards">
          <li v-for="(f, i) in rest" :key="f.id">
            <button type="button" class="card" :aria-label="`Play ${f.couple}, ${f.location}, ${f.runtime}`" @click="openFilm(i, $event.currentTarget)">
              <BracketFrame class="card__frame">
                <ImgPlaceholder ratio="16/9" dark :label="`${f.couple} film poster`" />
                <span class="play play--sm" aria-hidden="true"><i /></span>
              </BracketFrame>
              <span class="card__meta">
                <span class="card__couple">{{ f.couple }}</span>
                <span class="card__info">{{ f.location }}</span>
                <span class="card__info card__runtime">{{ f.runtime }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </section>

    <CtaBand title="Like what you see? Tell us about your date" label="Inquire" />
  </div>
</template>

<style scoped lang="scss">
.films-head { padding-top: calc(var(--nav-height) + var(--space-4xl)); padding-bottom: 0; }

.feature {
  display: grid;
  gap: var(--space-xl);

  &__player { position: relative; aspect-ratio: 16 / 9; background: var(--color-surface-inverse); }
  &__embed { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  &__poster {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    :deep(.ph) { transition: transform 900ms var(--ease-out); }
    &:hover :deep(.ph) { transform: scale(1.02); }
  }
  &__note { position: absolute; inset: auto 0 var(--space-xl); color: var(--color-text-on-dark-muted); text-align: center; }
  &__meta { display: flex; align-items: baseline; flex-wrap: wrap; gap: var(--space-xs) var(--space-xl); }
  &__kicker { color: var(--color-accent-on-light); }
  &__title { font-size: var(--text-h1); }
  &__info { margin-left: auto; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
}

// Square play mark (zero radius): cyan tile with a triangle.
.play {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  background: var(--color-accent-brand);
  color: var(--color-text-primary);
  transition: scale var(--duration-base) var(--ease-out);
  i { width: 0; height: 0; margin-left: 4px; border-left: 18px solid currentcolor; border-block: 11px solid transparent; }
  &--sm { width: 64px; height: 64px; i { border-left-width: 14px; border-block-width: 9px; } }
}
.feature__poster:hover .play, .card:hover .play { scale: 1.1; }

.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3xl) var(--space-xl);
  margin: 0;
  padding: 0;
  list-style: none;
}
.card {
  display: grid;
  gap: var(--space-md);
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &__frame { overflow: visible; }
  &__meta { display: flex; align-items: baseline; gap: var(--space-md); }
  &__couple { font-family: var(--font-serif); font-size: var(--text-h3); line-height: 1.2; transition: color var(--duration-base); }
  &:hover &__couple { color: var(--color-accent-on-light); }
  &__info { color: var(--color-text-secondary); font-size: var(--text-body-sm); }
  &__runtime { margin-left: auto; font-variant-numeric: tabular-nums; }
}

@media (width <= 720px) {
  .cards { grid-template-columns: 1fr; gap: var(--space-2xl); }
  .play { width: 72px; height: 72px; }
  .play--sm { width: 56px; height: 56px; }
  .feature__info { margin-left: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .feature__poster :deep(.ph) { transition: none; }
  .play { transition: none; }
}
</style>
