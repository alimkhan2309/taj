<script setup lang="ts">
// White by default. Pages that open on a dark full-bleed image opt in to the transparent overlay with
// definePageMeta({ navOverlay: true }); there it turns white once scrolled.
// 5 items, Hick's Law: Home · Portfolio · About · Services · Contact. "Inquire" stays far right at all times.
const scrolled = ref(false)
const open = ref(false)

onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 40 }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
})

const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
const solid = computed(() => scrolled.value || route.meta.navOverlay !== true)

const links = [
  { label: 'Home', to: '/' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' }
]
// Home matches only itself; sections also match their children (/portfolio/photos → Portfolio).
const isCurrent = (to: string) => (to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`))
</script>

<template>
  <header class="nav" :class="{ 'nav--scrolled': solid, 'nav--open': open }">
    <div class="nav__inner container">
      <NuxtLink to="/" class="nav__logo" aria-label="The Taj Studio — home">
        <!-- White mark on the transparent overlay; inverted to near-black on the white bar. -->
        <img src="/images/brand/logo-mark.png" alt="" class="nav__logo-mark" width="45" height="56">
      </NuxtLink>

      <nav class="nav__links" aria-label="Primary">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nav__link overline" :class="{ 'is-current': isCurrent(l.to) }"
          :aria-current="isCurrent(l.to) ? 'page' : undefined">{{ l.label }}</NuxtLink>
      </nav>

      <BaseButton to="/contact" class="nav__cta">Inquire</BaseButton>

      <button class="nav__burger" :aria-expanded="open" aria-label="Menu" @click="open = !open"><span /><span /></button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.nav {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  height: var(--nav-height);
  color: var(--color-text-on-dark);
  background: linear-gradient(to bottom, rgb(0 0 0 / 35%), transparent);
  transition: background-color 280ms ease, color 280ms ease, box-shadow 280ms ease;

  &--scrolled, &--open { background: var(--color-bg-elevated); color: var(--color-text-primary); box-shadow: var(--shadow-sm); }

  &__inner { height: 100%; display: flex; align-items: center; gap: var(--space-xl); }
  &__logo { margin-right: auto; display: flex; align-items: center; }
  &__logo-mark { width: auto; height: 56px; transition: filter 280ms ease; }
  &--scrolled &__logo-mark, &--open &__logo-mark { filter: invert(1) brightness(0.12); }
  &__links { display: flex; gap: var(--space-xl); }
  &__link {
    position: relative;
    padding-block: var(--space-xs);
    &::after { content: ''; position: absolute; inset: auto 0 0; height: 2px; background: var(--color-accent-brand); transform: scaleX(0); transform-origin: left; transition: transform 280ms var(--ease-out); }
    &:hover::after, &.is-current::after { transform: scaleX(1); }
  }
  &__burger { display: none; }
}

@media (width <= 900px) {
  .nav {
    &__links { position: absolute; inset: var(--nav-height) 0 auto; flex-direction: column; gap: 0; padding: var(--space-lg) var(--page-margin); background: var(--color-bg-elevated); color: var(--color-text-primary); display: none; }
    &--open &__links { display: flex; }
    &__cta { display: none; }
    &__logo-mark { height: 44px; }
    &__burger { display: grid; gap: 6px; width: 28px; background: none; border: 0; cursor: pointer;
      span { height: 2px; background: currentcolor; } }
  }
}
</style>
