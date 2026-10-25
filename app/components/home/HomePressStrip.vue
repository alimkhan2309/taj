<script setup lang="ts">
// Logo marks only — external validation. Named facts (award + year) live in Our Journey / About.
// Figma 733:187: single centred row, 138px tall, 64px gap. Admired in Africa is a wide mark, sized by its own box.
type Mark = { name: string; src: string; width: number; height: number }

const marks: Mark[] = [
  { name: 'MyWed', src: '/images/press/mywed.png', width: 113, height: 138 },
  { name: 'Admired in Africa', src: '/images/press/admired-in-africa.png', width: 230, height: 118 },
  { name: 'Fearless Photographers', src: '/images/press/fearless.png', width: 125, height: 138 },
  { name: 'WeddingSutra Photography Awards', src: '/images/press/weddingsutra.png', width: 142, height: 138 },
  { name: 'Wedisson Awards winner', src: '/images/press/wedisson.png', width: 150, height: 138 }
]
</script>

<template>
  <section class="press container" aria-label="Recognised by">
    <ul class="press__row">
      <li v-for="m in marks" :key="m.name" class="press__mark">
        <NuxtImg :src="m.src" :alt="m.name" :width="m.width" :height="m.height" loading="lazy" />
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.press {
  padding-block: var(--space-4xl);
  &__row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--space-3xl); margin: 0; padding: 0; list-style: none; }
  &__mark {
    filter: grayscale(1);
    opacity: 0.85;
    transition: opacity var(--duration-base);
    &:hover { opacity: 1; }
    img { width: auto; height: auto; max-height: 138px; object-fit: contain; }
  }
}

@media (width <= 720px) {
  .press__row { gap: var(--space-xl); }
  .press__mark img { max-height: 72px; max-width: 120px; }
}
</style>
