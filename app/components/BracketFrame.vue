<script setup lang="ts">
// Viewfinder corner brackets. Wraps any child (usually an image).
// Resting: hidden. Hover: brackets fade in cyan and tighten inward, like a camera locking focus.
// Pass `always` to keep them visible (e.g. the founder portrait).
defineProps<{ always?: boolean; rec?: boolean }>()
</script>

<template>
  <div class="bracket" :class="{ 'bracket--always': always }">
    <slot />
    <span class="bracket__corner bracket__corner--tl" aria-hidden="true" />
    <span class="bracket__corner bracket__corner--tr" aria-hidden="true" />
    <span class="bracket__corner bracket__corner--bl" aria-hidden="true" />
    <span class="bracket__corner bracket__corner--br" aria-hidden="true" />
    <span v-if="rec" class="bracket__rec overline"><i /> REC</span>
  </div>
</template>

<style scoped lang="scss">
.bracket {
  --inset: 14px;
  --size: 18px;
  position: relative;
  display: block;
  overflow: visible;

  &__corner {
    position: absolute;
    width: var(--size);
    height: var(--size);
    border: 0 solid var(--color-border-strong);
    opacity: 0;
    transition: opacity var(--duration-base) var(--ease-out), inset var(--duration-base) var(--ease-out), border-color var(--duration-base);
    pointer-events: none;

    &--tl { top: calc(var(--inset) * -1); left: calc(var(--inset) * -1); border-top-width: 2px; border-left-width: 2px; }
    &--tr { top: calc(var(--inset) * -1); right: calc(var(--inset) * -1); border-top-width: 2px; border-right-width: 2px; }
    &--bl { bottom: calc(var(--inset) * -1); left: calc(var(--inset) * -1); border-bottom-width: 2px; border-left-width: 2px; }
    &--br { bottom: calc(var(--inset) * -1); right: calc(var(--inset) * -1); border-bottom-width: 2px; border-right-width: 2px; }
  }

  &--always &__corner { opacity: 1; }

  &:hover { --inset: 6px; }
  &:hover &__corner { opacity: 1; border-color: var(--color-accent-brand); }

  &__rec {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    color: var(--color-text-primary);

    i {
      width: 10px;
      height: 10px;
      background: var(--color-accent-brand);
      animation: rec 2.4s ease-in-out infinite;
    }
  }
}

@keyframes rec { 50% { opacity: 0.35; } }
</style>
