<script setup lang="ts">
// Studio mark pinned to the bottom-right corner on every page: a quiet signature, like a photographer's stamp on a
// print. Decorative only (the nav logo is the real home link), so it never takes clicks or a tab stop.
// The mark is white artwork; mix-blend-mode: difference turns it dark over the sand canvas and light over the dark
// Films surface and the hero photo, so one asset stays legible everywhere. Low opacity keeps it out of the way.
</script>

<template>
  <!-- Same file as the nav logo (already cached), large enough to stay sharp at 2x. -->
  <img src="/images/brand/logo-mark.png" alt="" aria-hidden="true" class="corner-mark" width="599" height="748">
</template>

<style scoped lang="scss">
.corner-mark {
  position: fixed;
  right: var(--space-lg);
  bottom: var(--space-lg);
  z-index: 40; // under the nav (50) and its mobile menu; the lightbox is a <dialog> in the top layer
  width: auto;
  height: var(--space-4xl);
  mix-blend-mode: difference;
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
}

@media (width <= 720px) {
  .corner-mark { right: var(--space-md); bottom: var(--space-md); height: calc(var(--space-2xl) + var(--space-xs)); }
}

@media print { .corner-mark { display: none; } }
</style>
