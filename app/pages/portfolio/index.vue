<script setup lang="ts">
// Portfolio fork: full-viewport split, Photography | Films. Each half is one large link.
// Hover: the hovered half grows (flex-grow) and its viewfinder brackets tighten inward. Stacked on mobile.
definePageMeta({ navOverlay: true })

useSeoMeta({
  title: 'Portfolio — The Taj Studio',
  description: 'Wedding photography and wedding films by The Taj Studio, Surat. Choose photographs or films.',
  ogTitle: 'Portfolio — The Taj Studio',
  ogDescription: 'Wedding photography and wedding films by The Taj Studio.',
  ogImage: '/og/portfolio.jpg' // PLACEHOLDER: add a 1200x630 image at public/og/portfolio.jpg
})

const halves = [
  { label: 'Photography', to: '/portfolio/photos', note: 'Weddings · Pre-weddings · Family', alt: 'Bride and groom portrait' },
  { label: 'Films', to: '/portfolio/films', note: 'Wedding films and highlights', alt: 'Still from a wedding film' }
]
</script>

<template>
  <section class="fork" aria-label="Portfolio">
    <NuxtLink v-for="h in halves" :key="h.to" :to="h.to" class="fork__half">
      <!-- Swap for <NuxtImg :src fit="cover" loading="eager"> once real photography lands. -->
      <ImgPlaceholder ratio="16/9" dark :label="h.alt" class="fork__img" />
      <span class="fork__scrim" aria-hidden="true" />
      <BracketFrame always class="fork__frame"><span /></BracketFrame>
      <span class="fork__content">
        <span class="overline fork__note">{{ h.note }}</span>
        <span class="fork__label">{{ h.label }}</span>
        <span class="overline fork__cta">View all →</span>
      </span>
    </NuxtLink>
  </section>
</template>

<style scoped lang="scss">
.fork {
  display: flex;
  height: 100svh;
  min-height: 560px;
  background: var(--color-surface-inverse);

  &__half {
    position: relative;
    flex: 1 1 0;
    overflow: hidden;
    color: var(--color-text-on-dark);
    transition: flex-grow 700ms var(--ease-out);
    &:hover, &:focus-visible { flex-grow: 1.35; }
    &:focus-visible { outline-offset: -4px; }
  }

  &__img {
    position: absolute;
    inset: 0;
    height: 100%;
    aspect-ratio: auto !important; // fill the half regardless of the placeholder ratio
    transition: transform 1200ms var(--ease-out);
  }
  &__half:hover &__img { transform: scale(1.04); }
  &__scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgb(0 0 0 / 45%), transparent 55%); }

  // Brackets sit at the frame's edges and tighten inward on hover.
  & &__frame.bracket {
    --size: 56px;
    --inset: 0px;
    position: absolute;
    inset: calc(var(--nav-height) + var(--space-md)) var(--space-xl) var(--space-xl);
    pointer-events: none;
    :deep(.bracket__corner) { border-color: var(--color-text-on-dark-muted); }
  }
  &__half:hover &__frame.bracket { --inset: calc(var(--space-md) * -1); }
  &__half:hover &__frame.bracket :deep(.bracket__corner) { border-color: var(--color-accent-brand); }

  &__content {
    position: absolute;
    left: var(--space-3xl);
    bottom: var(--space-3xl);
    display: grid;
    gap: var(--space-sm);
  }
  &__note { color: var(--color-text-on-dark-muted); }
  &__label {
    font-family: var(--font-serif);
    font-size: calc(var(--text-display) * 1.6);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  &__cta {
    justify-self: start;
    padding-bottom: var(--space-2xs);
    border-bottom: 1px solid currentcolor;
    transition: color var(--duration-base);
  }
  &__half:hover &__cta { color: var(--color-accent-brand); }
}

@media (width <= 720px) {
  .fork { flex-direction: column; height: auto; min-height: 0; }
  .fork__half { flex: none; height: 50svh; min-height: 320px; &:hover, &:focus-visible { flex-grow: 0; } }
  .fork .fork__frame.bracket { --size: 32px; inset: var(--space-md); }
  .fork .fork__half:first-child .fork__frame.bracket { top: calc(var(--nav-height) + var(--space-md)); }
  .fork__content { left: var(--space-xl); bottom: var(--space-xl); }
  .fork__label { font-size: var(--text-display); }
}

@media (prefers-reduced-motion: reduce) {
  .fork__half { transition: none; &:hover { flex-grow: 1; } }
  .fork__img { transition: none; }
  .fork__half:hover .fork__img { transform: none; }
}
</style>
