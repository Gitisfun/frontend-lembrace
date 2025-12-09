<template>
  <div class="divider" :class="[variant, { 'with-margin': withMargin }]">
    <span v-if="$slots.default" class="divider-text">
      <slot />
    </span>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'light', 'gold'].includes(value),
  },
  withMargin: {
    type: Boolean,
    default: true,
  },
});
</script>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  width: 100%;
}

.divider.with-margin {
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
}

.divider.light::before,
.divider.light::after {
  background: rgba(0, 0, 0, 0.05);
}

.divider.gold::before,
.divider.gold::after {
  background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
}

.divider-text {
  padding: 0 1rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-light);
  white-space: nowrap;
}

.divider:not(:has(.divider-text))::after {
  display: none;
}

.divider:not(:has(.divider-text))::before {
  flex: 1;
}
</style>
