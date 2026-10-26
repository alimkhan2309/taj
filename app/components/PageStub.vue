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
    <CtaBand />
  </div>
</template>

<style scoped>
.stub { padding-top: calc(var(--nav-height) + var(--space-4xl)); }
.stub__spec { color: var(--color-text-secondary); display: grid; gap: var(--space-xs); }</style>
