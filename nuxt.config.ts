// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  // Keep files in root directory (Nuxt 3 style structure)
  srcDir: '.',

  devtools: { enabled: true },
  modules: ['@nuxtjs/strapi', '@nuxt/image', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Private keys (server-side only)
    // These are automatically populated from NUXT_* environment variables at runtime
    // e.g., NUXT_MOLLIE_API_KEY -> mollieApiKey
    mollieApiKey: '',
    strapiToken: '',
    authApiKey: '',
    authApiBase: '',
    chatApiBase: '',
    orderNumberApiUrl: '',
    notificationApiUrl: '',
    public: {
      // Public keys are automatically populated from NUXT_PUBLIC_* environment variables
      siteUrl: '',
      strapiUrl: '',
      chatApiBase: '',
      notificationApiUrl: '',
      notificationAppId: '',
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
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
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
    url: 'http://localhost:1337',
  },
  image: {
    providers: {
      strapi: {
        provider: 'strapi',
        options: {
          baseURL: 'http://localhost:1337',
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
