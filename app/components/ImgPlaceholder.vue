<script setup lang="ts">
// Stand-in until real photography is wired through <NuxtImg>.
// Ratio system: 4:5 portrait · 3:2 landscape · 4:3 featured filmstrip · 1:1 marquee tiles only · 16:9 film only.
import type { ImgRatio } from '~/composables/useLightbox'

withDefaults(defineProps<{ ratio?: ImgRatio; label?: string; dark?: boolean }>(), { ratio: '3/2' })
</script>

<template>
  <div class="ph" :class="{ 'ph--dark': dark }" :style="{ aspectRatio: ratio }" role="img" :aria-label="label || 'Image placeholder'" />
</template>

<style scoped>
.ph { width: 100%; background: #7a8a8e; }
.ph--dark { background: #2b3a3e; }
</style>
