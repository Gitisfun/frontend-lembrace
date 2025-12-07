<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiToastContainer />
  </div>
</template>

<script setup>
const { locale } = useI18n();
const head = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
});

useHead({
  htmlAttrs: {
    lang: () => locale.value,
  },
  link: [...(head.value.link || [])],
  meta: [...(head.value.meta || [])],
});
</script>
