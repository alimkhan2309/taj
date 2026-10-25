// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/image'],

  css: [
    '@fontsource-variable/plus-jakarta-sans',
    '@fontsource/cormorant-garamond/500.css',
    '@fontsource/cormorant-garamond/600.css',
    '~/assets/scss/main.scss'
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'The Taj Studio — Wedding Photography & Films',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Award-winning wedding photography and films since 1997.' }
      ]
    }
  },

  // Static generation. Switch individual routes to SSR/ISR later via routeRules if the CMS needs it.
  routeRules: {
    '/**': { prerender: true }
  },

  image: {
    format: ['avif', 'webp'],
    quality: 80,
    screens: { xs: 110, sm: 320, md: 640, lg: 1024, xl: 1440 }
  }
})
