<template>
  <div class="summary-item">
    <span class="summary-label">{{ label }}</span>
    <span class="summary-value" :class="{ highlight: highlighted }">{{ value }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  highlighted: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex: 1;
  padding: 1rem;
  background: var(--admin-surface);
  border-radius: 8px;
  text-align: center;
  transition: background 0.3s ease;
}

.summary-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--admin-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--admin-text);
}

.summary-value.highlight {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gold);
}
</style>
