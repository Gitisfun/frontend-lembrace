<template>
  <div class="stats-section">
    <h3 class="section-title">
      <slot name="icon" />
      {{ title }}
    </h3>
    <div class="stats-grid">
      <slot />
    </div>
    <slot name="footer" />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.stats-section {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 600;
  color: var(--admin-text);
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--admin-border);
}

.section-title :deep(svg) {
  color: var(--color-gold);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
