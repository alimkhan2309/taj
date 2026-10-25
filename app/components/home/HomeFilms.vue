<script setup lang="ts">
// Horizontal scroll-snap row of 16:9 film cards. Posters only until the visitor presses play;
// real video is lazy and never autoplays out of the viewport (build in the next pass).
const films = [1, 2, 3, 4, 5, 6]
</script>

<template>
  <section class="section section--surface films" id="films">
    <div class="container">
      <SectionHeader overline="Our films" title="Our Films" subtext="A selection of weddings and films we're proud to capture." />
    </div>

    <div class="films__track" tabindex="0" aria-label="Wedding films">
      <article v-for="f in films" :key="f" class="films__card">
        <BracketFrame>
          <ImgPlaceholder ratio="16/9" dark :label="`Film ${f} poster`" />
          <span class="films__play" aria-hidden="true"><i /></span>
        </BracketFrame>
      </article>
    </div>

    <div class="container films__cta"><BaseButton to="/portfolio/films" variant="secondary">See more</BaseButton></div>
  </section>
</template>

<style scoped lang="scss">
.films {
  padding-top: 0;
  &__track {
    display: flex;
    gap: var(--space-lg);
    overflow-x: auto;
    padding-inline: max(var(--page-margin), calc((100vw - var(--content-width)) / 2));
    padding-block: var(--space-md);
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  &__card { flex: 0 0 min(410px, 78vw); scroll-snap-align: start; position: relative; }
  &__play {
    position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none;
    i { width: 0; height: 0; border-left: 18px solid var(--color-accent-brand); border-block: 11px solid transparent; }
  }
  &__cta { display: flex; justify-content: center; margin-top: var(--space-xl); }
}
</style>
