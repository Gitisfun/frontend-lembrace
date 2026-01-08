<template>
  <div class="no-results-state">
    <IconSearchX :size="48" :stroke-width="1.5" />
    <h3>{{ $t('admin.orders.noResults') }}</h3>
    <p>{{ $t('admin.orders.noResultsMessage') }}</p>
    <button class="clear-filters-btn" @click="$emit('clearFilters')">
      {{ $t('admin.orders.clearFilters') }}
    </button>
  </div>
</template>

<script setup>
import IconSearchX from '~/components/icon/IconSearchX.vue';

defineEmits(['clearFilters']);
</script>

<style scoped>
.no-results-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.no-results-state svg {
  color: var(--admin-text-muted);
  margin-bottom: 1rem;
}

.no-results-state h3 {
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--admin-text);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.no-results-state p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
}

.clear-filters-btn {
  padding: 0.625rem 1.25rem;
  background: var(--color-gold);
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: var(--color-gold-dark);
}
</style>
