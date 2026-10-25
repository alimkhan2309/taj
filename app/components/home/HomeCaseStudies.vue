<script setup lang="ts">
// Sticky-scroll: left panel stays pinned and swaps content; right column scrolls a gallery per couple.
// The active story is set when its gallery crosses the vertical centre of the viewport.
// Mobile: collapses to a plain stack (see media query).
const stories = [
  { slug: 'mohil-harvi', type: 'Pre wedding', names: 'Mohil & Harvi', caption: 'Two days in Udaipur, captured start to finish.',
    quote: 'Manish Patel & Team is such a talent. All the hard work they do reflects on the results they have been giving. We look forward to work with you over and over again.' },
  { slug: 'story-two', type: 'Wedding', names: 'Couple names', caption: 'One-line context for this wedding.', quote: 'Real quote from the couple goes here.' },
  { slug: 'story-three', type: 'Wedding', names: 'Couple names', caption: 'One-line context for this wedding.', quote: 'Real quote from the couple goes here.' }
]

const galleryRatios: Array<'3/2' | '4/5'> = ['3/2', '4/5', '4/5', '3/2', '4/5', '3/2']

const active = ref(0)
const galleries = ref<HTMLElement[]>([])
let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) active.value = Number((e.target as HTMLElement).dataset.index)
    },
    { rootMargin: '-50% 0px -50% 0px' } // fires when a gallery crosses the viewport centre
  )
  galleries.value.forEach((el) => observer?.observe(el))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section class="section cs" :class="`cs--${active % 2 ? 'surface' : 'base'}`" id="case-studies">
    <div class="container">
      <SectionHeader overline="Case study" title="Stories We've Covered" subtext="One-line subtext — sits once, above everything." align="center" />

      <div class="cs__grid">
        <aside class="cs__panel" aria-live="polite">
          <Transition name="fade" mode="out-in">
            <div :key="active" class="cs__story">
              <p class="overline cs__meta">0{{ active + 1 }}/0{{ stories.length }} · {{ stories[active]!.type }}</p>
              <h3>{{ stories[active]!.names }}</h3>
              <blockquote class="cs__quote"><span aria-hidden="true">“</span>{{ stories[active]!.quote }}<span aria-hidden="true">”</span></blockquote>
              <p class="cs__caption">{{ stories[active]!.caption }}</p>
              <BaseButton :to="`/case-studies/${stories[active]!.slug}`" variant="secondary" bracket>Read the full story →</BaseButton>
            </div>
          </Transition>
        </aside>

        <div class="cs__galleries">
          <div v-for="(s, i) in stories" :key="s.slug" :ref="(el) => { if (el) galleries[i] = el as HTMLElement }" class="cs__gallery" :data-index="i">
            <BracketFrame v-for="(r, j) in galleryRatios" :key="j"><ImgPlaceholder :ratio="r" /></BracketFrame>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cs {
  transition: background-color 600ms ease;
  &--base { background-color: var(--color-bg-base); }
  &--surface { background-color: var(--color-bg-surface); }

  &__grid { display: grid; grid-template-columns: 5fr 7fr; gap: var(--space-3xl); align-items: start; }
  &__panel { position: sticky; top: calc(var(--nav-height) + var(--space-xl)); min-height: 60vh; border-left: 2px solid var(--color-border-subtle); padding-left: var(--space-lg); }
  &__story { display: grid; gap: var(--space-lg); justify-items: start; }
  &__meta { color: var(--color-text-secondary); }
  &__quote { margin: 0; font-style: italic; color: var(--color-text-secondary); span { font-family: var(--font-serif); font-size: 1.6em; color: var(--color-accent-on-light); line-height: 0; } }
  &__caption { color: var(--color-text-secondary); }
  &__galleries { display: grid; gap: var(--space-5xl); }
  &__gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; > :nth-child(odd):nth-last-child(1), > :first-child { grid-column: 1 / -1; } }
}

.fade-enter-active, .fade-leave-active { transition: opacity 280ms ease, transform 280ms var(--ease-out); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(8px); }

@media (width <= 900px) {
  .cs__grid { grid-template-columns: 1fr; }
  .cs__panel { position: static; min-height: 0; }
}
</style>
