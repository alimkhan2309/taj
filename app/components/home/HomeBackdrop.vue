<script setup lang="ts">
// One fixed paper backdrop behind the whole homepage; sections sit on it transparently, so the page reads as a single
// sheet from the signature down. A section can ask for a different page colour with data-bg="<token>" (a colour
// token without the --color- prefix, e.g. "surface-inverse"), plus optional data-bg-paper="<0-1>" for texture strength.
// As that section scrolls in, the backdrop colour is scrubbed to it; as it scrolls out, back to the base canvas.
// Reference: landonorris.com's colour-shifting sections.
//
// Progressive enhancement: sections keep their own backgrounds by default. Only when this mounts does <html> get
// .has-backdrop, which makes the opted-in sections transparent (see their :global(.has-backdrop) rules).
// Mounted last on the page so its ScrollTriggers are measured after the pinned sections above have added their spacers.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const el = ref<HTMLElement>()
let ctx: gsap.Context | undefined

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const backdrop = el.value
  if (!backdrop) return
  document.documentElement.classList.add('has-backdrop')

  const css = getComputedStyle(document.documentElement)
  const token = (name: string) => css.getPropertyValue(`--color-${name}`).trim()
  type Look = { color: string; paper: number }
  const base: Look = { color: token('bg-base'), paper: 1 }
  // Soft-light texture is strongest on mid-tones, so halfway through a light/dark change the paper would turn to
  // stucco. The texture dips to this strength at the midpoint while the colour moves linearly.
  const MID_PAPER = 0.2

  // One scrubbed colour change: colour linear over the whole range, texture via the midpoint dip.
  const shift = (from: Look, to: Look, trigger: HTMLElement, start: string, end: string, first: boolean) => {
    gsap.timeline({ scrollTrigger: { trigger, start, end, scrub: true } })
      .fromTo(backdrop, { backgroundColor: from.color }, { backgroundColor: to.color, duration: 1, ease: 'none', immediateRender: first }, 0)
      .fromTo(backdrop, { '--paper': from.paper }, { '--paper': MID_PAPER, duration: 0.5, ease: 'none', immediateRender: first }, 0)
      .to(backdrop, { '--paper': to.paper, duration: 0.5, ease: 'none' }, 0.5)
  }

  ctx = gsap.context(() => {
    document.querySelectorAll<HTMLElement>('[data-bg]').forEach((section) => {
      const look: Look = { color: token(section.dataset.bg ?? 'bg-base'), paper: Number(section.dataset.bgPaper ?? 1) }
      // In: while the section's top travels from 85% to 35% of the viewport. Out: while its bottom does 65% to 15%.
      shift(base, look, section, 'top 85%', 'top 35%', true)
      shift(look, base, section, 'bottom 65%', 'bottom 15%', false)
    })
  })
  ScrollTrigger.refresh()
})

onBeforeUnmount(() => {
  ctx?.revert()
  document.documentElement.classList.remove('has-backdrop')
})
</script>

<template>
  <div ref="el" class="backdrop" aria-hidden="true" />
</template>

<style scoped lang="scss">
// Fixed and composited: the texture never slides behind pinned sections, and only the colour ever repaints.
.backdrop {
  --paper: 1;
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: var(--color-bg-base);
  pointer-events: none;

  // Same paper tile as everywhere else, soft-lit over the animated colour; --paper fades it down on dark colours.
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--texture-paper);
    background-size: var(--texture-size);
    mix-blend-mode: soft-light;
    opacity: var(--paper);
  }
}
</style>
