<script setup lang="ts">
// Objection handling (Act 4): static, scannable steps. Deliberately NOT horizontal scroll.
const steps = [
  { n: '01', title: 'Inquire', body: 'Tell us about your day. We reply within 24 hours.' },
  { n: '02', title: 'Discuss', body: 'A relaxed call to understand your story, venues and style.' },
  { n: '03', title: 'Shoot', body: 'We photograph and film the day, quietly, so you can be in it.' },
  { n: '04', title: 'Edit & deliver', body: 'Your gallery and film arrive on a timeline we agree up front.' }
]
</script>

<template>
  <section class="section" id="what-to-expect">
    <div class="container">
      <SectionHeader overline="Process" title="What to Expect" subtext="Pricing is tailored to your day — ask us for our full guide." />
      <ol class="steps">
        <li v-for="s in steps" :key="s.n" class="steps__item">
          <span class="overline steps__n">{{ s.n }}</span>
          <h4>{{ s.title }}</h4>
          <p>{{ s.body }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped lang="scss">
.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gutter);
  margin: 0;
  padding: 0;
  list-style: none;

  &__item { padding-top: var(--space-lg); border-top: 1px solid var(--color-border-strong); display: grid; gap: var(--space-sm); align-content: start;
    p { color: var(--color-text-secondary); } }
  &__n { color: var(--color-accent-on-light); }
}
@media (width <= 900px) { .steps { grid-template-columns: 1fr 1fr; } }
@media (width <= 560px) { .steps { grid-template-columns: 1fr; } }
</style>
