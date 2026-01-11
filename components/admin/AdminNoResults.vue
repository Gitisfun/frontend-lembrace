<template>
  <div class="no-results">
    <div class="no-results-icon">
      <slot name="icon">
        <IconSearchX :size="48" :stroke-width="1.5" />
      </slot>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <button v-if="showClear" class="clear-btn" @click="$emit('clear')">{{ clearText }}</button>
  </div>
</template>

<script setup>
import IconSearchX from '~/components/icon/IconSearchX.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  clearText: {
    type: String,
    default: 'Clear Filters',
  },
  showClear: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['clear']);
</script>

<style scoped>
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.no-results-icon {
  color: var(--admin-text-muted);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0 0 0.5rem 0;
}

.no-results p {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text-muted);
  margin: 0 0 1.25rem 0;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}
</style>
