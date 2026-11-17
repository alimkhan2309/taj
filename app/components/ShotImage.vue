<script setup lang="ts">
// One photo slot: the real image when `src` is set, otherwise the sized placeholder. Keeps pages free of
// v-if/v-else pairs for every shot while photography is still arriving.
import type { ImgRatio } from '~/composables/useLightbox'

withDefaults(defineProps<{ src?: string; alt: string; ratio?: ImgRatio; sizes?: string; dark?: boolean; eager?: boolean }>(), {
  ratio: '3/2',
  sizes: 'xs:100vw md:50vw'
})
</script>

<template>
  <NuxtImg v-if="src" :src="src" :alt="alt" class="shot" :style="{ aspectRatio: ratio }" :sizes="sizes" :loading="eager ? 'eager' : 'lazy'" />
  <ImgPlaceholder v-else :ratio="ratio" :label="alt" :dark="dark" />
</template>

<style scoped>
.shot { display: block; width: 100%; height: auto; object-fit: cover; }
</style>
