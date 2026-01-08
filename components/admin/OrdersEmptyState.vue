<template>
  <div class="empty-state">
    <div class="empty-icon">
      <IconFile :size="64" :stroke-width="1.5" />
    </div>
    <h3>{{ $t('admin.orders.emptyTitle') }}</h3>
    <p>{{ $t('admin.orders.emptyMessage') }}</p>
  </div>
</template>

<script setup>
import IconFile from '~/components/icon/IconFile.vue';
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.empty-icon {
  color: var(--admin-text-subtle);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-family: var(--font-body);
  font-size: 1.25rem;
  color: var(--admin-text);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.empty-state p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}
</style>
