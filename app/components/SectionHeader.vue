<script setup lang="ts">
withDefaults(defineProps<{ overline?: string; title: string; subtext?: string; align?: 'left' | 'center' }>(), { align: 'left' })
</script>

<template>
  <header class="section-header" :class="`section-header--${align}`">
    <p v-if="overline" class="overline section-header__overline">{{ overline }}</p>
    <h2>{{ title }}</h2>
    <p v-if="subtext" class="section-header__sub">{{ subtext }}</p>
  </header>
</template>

<style scoped lang="scss">
.section-header {
  margin-bottom: var(--space-2xl);
  &--center { text-align: center; .section-header__sub { margin-inline: auto; } }
  &__overline { color: var(--color-accent-on-light); margin-bottom: var(--space-xs); }
  &__sub { margin-top: var(--space-sm); max-width: var(--content-max-width); font-size: var(--text-body-lg); color: var(--color-text-secondary); }
}
</style>
