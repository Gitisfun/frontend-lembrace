// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/strapi', '@nuxt/image'],
  strapi: {
    url: process.env.STRAPI_URL || 'https://backend-lembrace-production.up.railway.app',
    token: process.env.STRAPI_TOKEN || undefined,
  },
  image: {
    providers: {
      strapi: {
        provider: 'strapi',
        options: {
          baseURL: 'https://backend-lembrace-production.up.railway.app',
        },
      },
    },
  },
});
