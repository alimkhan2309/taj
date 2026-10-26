<script setup lang="ts">
// Clickable gallery tile: pops on hover/focus, opens the shared lightbox on click.
// Pass the whole gallery (`items`) plus this tile's `index` so the lightbox can page through it.
// `decorative` is for loop duplicates (marquees): still clickable, but skipped by keyboard and screen readers.
import type { LightboxItem } from '~/composables/useLightbox'

const props = defineProps<{ items: LightboxItem[]; index: number; decorative?: boolean }>()
const { open } = useLightbox()
const item = computed(() => props.items[props.index])
</script>

<template>
  <button
    v-if="item"
    type="button"
    class="tile"
    :aria-label="`View larger: ${item.alt}`"
    :tabindex="decorative ? -1 : undefined"
    :aria-hidden="decorative ? 'true' : undefined"
    @click="open(items, index, $event.currentTarget)"
  >
    <NuxtImg v-if="item.src" :src="item.src" :alt="item.alt" class="tile__img" :style="{ aspectRatio: item.ratio }" loading="lazy" sizes="xs:50vw md:25vw lg:240px" />
    <ImgPlaceholder v-else :ratio="item.ratio" :label="item.alt" />
  </button>
</template>

<style scoped lang="scss">
.tile {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
  transition: transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out);

  &:hover, &:focus-visible { z-index: 2; transform: translateY(calc(var(--space-2xs) * -1)) scale(1.06); box-shadow: var(--shadow-md); }
  &:active { transform: scale(1.02); }

  &__img { display: block; width: 100%; height: auto; object-fit: cover; }
}

@media (prefers-reduced-motion: reduce) { .tile:hover, .tile:focus-visible { transform: none; } }
</style>
