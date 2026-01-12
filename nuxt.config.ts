// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  // Keep files in root directory (Nuxt 3 style structure)
  srcDir: '.',

  devtools: { enabled: true },
  modules: ['@nuxtjs/strapi', '@nuxt/image', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      authApiKey: process.env.AUTH_API_KEY || '',
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
      chatApiBase: process.env.CHAT_API_BASE || 'http://localhost:3003',
      orderNumberApiUrl: process.env.ORDER_NUMBER_API_URL || 'https://localhost:3002/api/counter',
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://lembrace.be' },
      ],
      meta: [
        { name: 'theme-color', content: '#d4af37' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:site_name', content: "L'embrace" },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:locale:alternate', content: 'nl_BE' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },
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
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json', language: 'en-US' },
      { code: 'nl', name: 'Nederlands', file: 'nl.json', language: 'nl-BE' },
    ],
    defaultLocale: 'en',
    langDir: 'locales',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    baseUrl: 'https://lembrace.be',
  },
});
