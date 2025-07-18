// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/strapi', '@nuxt/image', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt'],
  css: ['~/assets/css/main.css'],
  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    token: process.env.STRAPI_TOKEN || undefined,
  },
  image: {
    providers: {
      strapi: {
        provider: 'strapi',
        options: {
          baseURL: process.env.STRAPI_URL || 'http://localhost:1337',
        },
      },
    },
  },
});
