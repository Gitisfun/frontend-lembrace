<template>
  <div class="error-state" :class="[variant]">
    <div class="error-icon">
      <IconXCircle :size="iconSize" />
    </div>
    <h2 v-if="title" class="error-title">{{ title }}</h2>
    <p v-if="message" class="error-message">{{ message }}</p>
    <div class="error-actions">
      <button v-if="showRetry" class="retry-btn" @click="$emit('retry')">
        <IconRefresh :size="18" />
        {{ retryText }}
      </button>
      <NuxtLink v-if="showHome" :to="localePath('/')" class="home-btn">
        {{ homeText }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'inline', 'fullpage'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
  showHome: {
    type: Boolean,
    default: false,
  },
  retryText: {
    type: String,
    default: null,
  },
  homeText: {
    type: String,
    default: null,
  },
});

const iconSize = computed(() => {
  switch (props.variant) {
    case 'inline':
      return 32;
    case 'fullpage':
      return 64;
    default:
      return 48;
  }
});

defineEmits(['retry']);
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  gap: 1rem;
}

.error-state.fullpage {
  min-height: 60vh;
  padding: 4rem 2rem;
}

.error-state.inline {
  padding: 1.5rem;
  background: #fff5f5;
  border-radius: 12px;
  border: 1px solid #ffebeb;
}

.error-icon {
  color: #e53e3e;
  margin-bottom: 0.5rem;
}

.error-title {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  color: var(--color-text);
  margin: 0;
}

.error-state.inline .error-title {
  font-size: 1.1rem;
}

.error-state.fullpage .error-title {
  font-size: 2rem;
}

.error-message {
  font-family: var(--font-body);
  color: #666;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-gold);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #b88b2a;
  transform: translateY(-1px);
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.home-btn:hover {
  background: #f8f8f8;
}
</style>
