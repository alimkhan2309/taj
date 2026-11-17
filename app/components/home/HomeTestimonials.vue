<script setup lang="ts">
// Testimonials: deliberately quiet. Three short quotes in a row, each signed with a small square avatar (photo, or
// initials in a ruled box) and a name. No carousel, no big photography: the words carry it.
// Header: title left, Google link right (shows the rating only once a real one is in studio.ts).
// ≤ 900px: quotes stack.
import { googleReviews } from '~/data/studio'
import { testimonials, type Testimonial } from '~/data/testimonials'

const items: Testimonial[] = testimonials
const google = googleReviews

// "Mohil & Harvi" → "MH", "The Shah Family" → "SF"
const initials = (name: string) =>
  name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w) && w.toLowerCase() !== 'the').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
</script>

<template>
  <section class="section testimonials" id="testimonials" aria-labelledby="testimonials-title">
    <div class="container">
      <header class="testimonials__head">
        <div>
          <p class="overline testimonials__overline">Kind words</p>
          <h2 id="testimonials-title">In their words</h2>
        </div>
        <a :href="google.url" target="_blank" rel="noopener" class="overline testimonials__google">
          <template v-if="google.rating">
            <span class="testimonials__rating">{{ google.rating }}</span>
            <span>Google<template v-if="google.count"> · {{ google.count }} reviews</template></span>
          </template>
          <span v-else>Read our Google reviews</span>
          <span aria-hidden="true" class="testimonials__arrow">→</span>
          <span class="visually-hidden">(opens in a new tab)</span>
        </a>
      </header>

      <ul class="testimonials__list">
        <li v-for="(t, i) in items" :key="i" class="testimonials__item">
          <blockquote class="testimonials__quote"><p><span aria-hidden="true">“</span>{{ t.quote }}<span aria-hidden="true">”</span></p></blockquote>
          <div class="testimonials__by">
            <NuxtImg v-if="t.avatar" :src="t.avatar" alt="" class="testimonials__avatar" width="48" height="48" sizes="96px" loading="lazy" />
            <span v-else class="testimonials__avatar testimonials__avatar--initials" aria-hidden="true">{{ initials(t.name) }}</span>
            <span class="testimonials__who">
              <span class="testimonials__name">{{ t.name }}</span>
              <span class="overline testimonials__meta">{{ t.meta }}</span>
            </span>
            <!-- Beside the name, not below it, so every signature sits on the same line across the row. -->
            <NuxtLink v-if="t.story" :to="t.story" class="overline testimonials__story">Story <span aria-hidden="true">→</span></NuxtLink>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.testimonials {
  &__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-lg) var(--space-xl);
    flex-wrap: wrap;
    margin-bottom: var(--space-3xl);
  }
  &__overline { color: var(--color-accent-on-light); margin-bottom: var(--space-xs); }

  &__google {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    min-height: 48px;
    color: var(--color-accent-on-light);
    &:hover .testimonials__arrow { transform: translateX(var(--space-2xs)); }
  }
  &__rating { font-family: var(--font-serif); font-size: var(--text-h3); font-weight: 600; letter-spacing: 0; text-transform: none; color: var(--color-text-primary); }
  &__arrow { transition: transform var(--duration-base) var(--ease-out); }

  &__list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-2xl) var(--gutter);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &__item {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border-strong);
  }
  &__quote {
    flex: 1;
    margin: 0;
    p { font-family: var(--font-serif); font-size: var(--text-h4); line-height: 1.4; }
  }

  &__by { display: flex; align-items: center; gap: var(--space-sm); }
  &__avatar { flex: none; width: var(--space-2xl); height: var(--space-2xl); object-fit: cover; }
  // Initials sit in a ruled square (no fill, so no paper patch on the page).
  &__avatar--initials {
    display: grid;
    place-items: center;
    border: 1px solid var(--color-border-strong);
    font-family: var(--font-serif);
    font-size: var(--text-body-lg);
    font-weight: 600;
    color: var(--color-text-secondary);
  }
  &__who { display: grid; gap: var(--space-3xs); }
  &__name { font-weight: 600; line-height: 1.3; }
  &__meta { color: var(--color-text-muted); }

  &__story { margin-left: auto; display: inline-flex; align-items: center; gap: var(--space-2xs); min-height: 48px; color: var(--color-accent-on-light); }
}

@media (width <= 900px) {
  .testimonials__list { grid-template-columns: 1fr; }
}
</style>
