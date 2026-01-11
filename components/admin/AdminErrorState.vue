<template>
  <div class="error-state">
    <div class="error-icon">
      <slot name="icon">
        <IconAlertCircle :size="64" />
      </slot>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <button v-if="showRetry" class="retry-btn" @click="$emit('retry')">{{ retryText }}</button>
  </div>
</template>

<script setup>
import IconAlertCircle from '~/components/icon/IconAlertCircle.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  retryText: {
    type: String,
    default: 'Try Again',
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['retry']);
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-state h3 {
  font-family: var(--font-body);
  font-size: 1.25rem;
  color: var(--admin-text);
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
}

.error-state p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
  margin: 0 0 1.5rem 0;
  transition: color 0.3s ease;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--color-gold);
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--color-gold-dark);
}
</style>
