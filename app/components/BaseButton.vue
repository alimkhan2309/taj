<script setup lang="ts">
// Primary: charcoal fill -> cyan on hover. Secondary: outline. Square corners.
// `bracket` wraps the button in viewfinder corners (used for "Read the full story").
withDefaults(defineProps<{ to?: string; variant?: 'primary' | 'secondary'; bracket?: boolean }>(), { variant: 'primary' })
</script>

<template>
  <component :is="to ? 'NuxtLink' : 'button'" :to="to" class="btn overline" :class="[`btn--${variant}`, { 'btn--bracket': bracket }]">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  min-height: 48px;
  padding: var(--space-sm) var(--space-xl);
  border: 1px solid var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-bg-base);
  cursor: pointer;
  transition: background-color 280ms ease, color 280ms ease, border-color 280ms ease;

  &:hover { background: var(--color-accent-brand); border-color: var(--color-accent-brand); color: var(--color-text-primary); }

  &--secondary {
    background: transparent;
    color: var(--color-text-primary);
    border-color: var(--color-border-strong);
    &:hover { background: transparent; border-color: var(--color-accent-on-light); color: var(--color-accent-on-light); }
  }

  &--bracket::before,
  &--bracket::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    border: 0 solid var(--color-border-strong);
    transition: inset 280ms var(--ease-out), border-color 280ms;
  }
  &--bracket::before { top: -6px; left: -6px; border-top-width: 1px; border-left-width: 1px; }
  &--bracket::after { bottom: -6px; right: -6px; border-bottom-width: 1px; border-right-width: 1px; }
  &--bracket:hover::before { top: -3px; left: -3px; border-color: var(--color-accent-brand); }
  &--bracket:hover::after { bottom: -3px; right: -3px; border-color: var(--color-accent-brand); }
}
</style>
