<template>
  <component :is="to ? NuxtLink : 'button'" :to="to" :target="target" :disabled="disabled" class="admin-action-btn" :class="{ loading: loading }" @click="!to && $emit('click')">
    <slot name="icon" />
    <span v-if="$slots.default" class="btn-text">
      <slot />
    </span>
  </component>
</template>

<script setup>
import { NuxtLink } from '#components';

defineProps({
  to: {
    type: String,
    default: null,
  },
  target: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['click']);
</script>

<style scoped>
.admin-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text-muted);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-action-btn:hover:not(:disabled) {
  background: var(--admin-surface-hover);
  color: var(--admin-text);
}

.admin-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-action-btn :slotted(svg) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.admin-action-btn.loading :slotted(svg) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
