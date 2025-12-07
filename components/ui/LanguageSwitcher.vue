<template>
  <div class="language-switcher">
    <button v-for="locale in availableLocales" :key="locale.code" @click="switchLocale(locale.code)" class="locale-btn" :class="{ active: currentLocale === locale.code }" :aria-label="`Switch to ${locale.name}`">
      {{ locale.code.toUpperCase() }}
    </button>
  </div>
</template>

<script setup>
const { locale, locales, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const router = useRouter();

const currentLocale = computed(() => locale.value);

const availableLocales = computed(() => {
  return locales.value.map((l) => ({
    code: l.code,
    name: l.name,
  }));
});

const switchLocale = async (localeCode) => {
  await setLocale(localeCode);
  await router.push(switchLocalePath(localeCode));
};
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.locale-btn {
  background: transparent;
  border: 1px solid transparent;
  padding: 0.3rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  font-family: var(--font-body);
}

.locale-btn:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
}

.locale-btn.active {
  color: var(--color-gold, #d88c00);
  font-weight: 600;
  border-color: var(--color-gold, #d88c00);
  background: rgba(216, 140, 0, 0.1);
}
</style>
