<script setup lang="ts">
const route = useRoute()
const title = computed(() => ({ terms: 'Terms of Use', privacy: 'Privacy Policy', cookies: 'Cookies' } as Record<string, string>)[String(route.params.legal)] ?? 'Page')
</script>

<template>
  <PageStub overline="Legal" :title="title" subtext="Content to be supplied by the client." :spec="['Plain text page']" />
</template>
