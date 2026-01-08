<template>
  <header class="admin-header">
    <div class="header-left">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="header-right">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.admin-header {
  padding: 1.5rem 2rem;
  background: var(--admin-surface-alt);
  border-bottom: 1px solid var(--admin-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--admin-text);
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
