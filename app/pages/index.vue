<script setup lang="ts">
definePageMeta({ navOverlay: true }) // hero is a dark full-bleed photo

useSeoMeta({
  title: 'The Taj Studio — Wedding Photography & Films in Surat',
  ogTitle: 'The Taj Studio — Wedding Photography & Films',
  description: 'Award-winning wedding photography and films since 1997, across 18 countries.'
})
</script>

<template>
  <div>
    <HomeIntro />
    <HomeFeaturedWork />
    <HomeFilms />
    <HomePressStrip />
    <HomeCaseStudies />
    <HomeJourney />
    <HomeAwaitingDesign title="Testimonials" note="Short endorsements with stars and a Google Reviews badge. Figma frame in progress." />
    <HomeWhatToExpect />
    <HomeContact />
  </div>
</template>
