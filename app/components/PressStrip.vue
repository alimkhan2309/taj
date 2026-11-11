<script setup lang="ts">
// Recognised-by strip (homepage + About). Logo marks only; the named awards live in Our Journey / About.
// Layout: a ruled grid of equal cells, label first. Desktop 1 + 5 in one row; ≤ 720px 2 × 3 (label + 5 logos = 6 cells),
// so nothing wraps into an uneven 3 + 2 pyramid. Equal cells give five very different marks a shared frame.
// Logos: three PNGs ship on an opaque white box. mix-blend-mode: multiply drops the white into the paper.
// Do not put opacity/transform/filter on any ancestor of the <img>: that isolates the blend and brings the boxes back.
import { pressMarks } from '~/data/studio'

withDefaults(defineProps<{ label?: string }>(), { label: 'Recognised by' })
</script>

<template>
  <section class="press container" :aria-label="label">
    <div class="press__grid">
      <p class="press__cell press__label overline" aria-hidden="true">{{ label }}</p>
      <ul class="press__list">
        <li v-for="m in pressMarks" :key="m.name" class="press__cell">
          <!-- Explicit box (width from the mark's ratio) reserves space before the lazy image loads: no layout shift
               under the pinned sections that follow. -->
          <NuxtImg :src="m.src" :alt="m.name" :width="m.width" :height="m.height" loading="lazy" class="press__logo"
            :style="{ '--h': `${m.display}px`, aspectRatio: `${m.width} / ${m.height}` }" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.press {
  padding-block: var(--space-4xl);

  &__grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    border-block: 1px solid var(--color-border-subtle);
  }
  &__list { display: contents; margin: 0; padding: 0; list-style: none; }

  &__cell {
    display: grid;
    place-items: center;
    min-height: 160px;
    padding: var(--space-lg) var(--space-md);
    border-left: 1px solid var(--color-border-subtle);
  }
  &__label { margin: 0; place-items: center start; border-left: 0; padding-left: 0; color: var(--color-text-secondary); }

  &__logo {
    height: calc(var(--h) * var(--logo-scale, 1));
    width: auto;
    max-width: 100%;
    object-fit: contain;
    mix-blend-mode: multiply;
    filter: grayscale(1) contrast(1.35); // pulls the washed-grey WeddingSutra mark toward the black ones
    opacity: 0.85;
    transition: opacity var(--duration-base);
  }
  &__cell:hover &__logo { opacity: 1; }
}

@media (width <= 1100px) {
  .press__cell { min-height: 140px; }
  .press__logo { --logo-scale: 0.82; }
}

@media (width <= 720px) {
  .press {
    padding-block: var(--space-2xl);
    &__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    &__cell { min-height: 120px; border-left: 0; border-top: 1px solid var(--color-border-subtle); }
    &__label, &__list > &__cell:first-child { border-top: 0; } // first row: label + logo 1
    // Right-hand column gets the vertical rule: label is cell 1 (left), so logos 1, 3, 5 sit on the right.
    &__list > &__cell:nth-child(odd) { border-left: 1px solid var(--color-border-subtle); }
    &__label { place-items: center; padding-left: var(--space-md); text-align: center; }
    &__logo { --logo-scale: 0.7; }
  }
}
</style>
