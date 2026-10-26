<script setup lang="ts">
// Closing call-to-action band for inner pages (portfolio, case studies, stubs).
withDefaults(defineProps<{ title?: string; label?: string; to?: string }>(), {
  title: 'Ready to talk?',
  label: 'Inquire',
  to: '/contact'
})
</script>

<template>
  <section class="section section--surface cta-band">
    <div class="container cta-band__inner">
      <h3>{{ title }}</h3>
      <BaseButton :to="to">{{ label }}</BaseButton>
    </div>
  </section>
</template>

<style scoped>
.cta-band__inner { display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg); flex-wrap: wrap; }
</style>
