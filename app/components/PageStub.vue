<script setup lang="ts">
// Inner pages: each gets a mini "Act 1" intro so a visitor landing here directly still knows what the studio is.
defineProps<{ overline: string; title: string; subtext: string; spec: string[] }>()
</script>

<template>
  <div>
    <section class="section stub">
      <div class="container">
        <SectionHeader :overline="overline" :title="title" :subtext="subtext" />
        <ul class="stub__spec">
          <li v-for="s in spec" :key="s">{{ s }}</li>
        </ul>
      </div>
    </section>
    <section class="section section--surface stub-cta">
      <div class="container stub-cta__inner">
        <h3>Ready to talk?</h3>
        <BaseButton to="/contact">Inquire</BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stub { padding-top: calc(var(--nav-height) + var(--space-4xl)); }
.stub__spec { color: var(--color-text-secondary); display: grid; gap: var(--space-xs); }
.stub-cta__inner { display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg); flex-wrap: wrap; }
</style>
