<script setup lang="ts">
// Placeholder for sections whose Figma frames are not finished yet (Our Journey, Testimonials).
defineProps<{ title: string; note: string }>()
</script>

<template>
  <section class="section awaiting">
    <div class="container">
      <p class="overline">Awaiting design</p>
      <h3>{{ title }}</h3>
      <p>{{ note }}</p>
    </div>
  </section>
</template>

<style scoped>
.awaiting { border-block: 1px dashed var(--color-border-strong); text-align: center; color: var(--color-text-secondary); }
.awaiting h3 { margin-block: var(--space-xs); }
</style>
