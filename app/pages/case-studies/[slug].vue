<script setup lang="ts">
const { params } = useRoute()
</script>

<template>
  <PageStub overline="Case study" :title="String(params.slug)" subtext="One wedding, told in depth."
    :spec="['Full-bleed opening image', 'Couple names, location, wedding type', 'Long-form story, full gallery, embedded film if any', 'Pull quotes, “More stories”, closing CTA band']" />
</template>
