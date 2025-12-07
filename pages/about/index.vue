<template>
  <div>About</div>
</template>

<script setup>
const { t } = useI18n();

// SEO Meta
useSeoMeta({
  title: () => t('seo.about.title'),
  description: () => t('seo.about.description'),
  ogTitle: () => t('seo.about.title'),
  ogDescription: () => t('seo.about.description'),
  ogImage: '/logo-lembrace.png',
  twitterTitle: () => t('seo.about.title'),
  twitterDescription: () => t('seo.about.description'),
});
</script>
