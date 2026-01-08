<template>
  <div class="error-state">
    <div class="error-icon">
      <IconAlertCircle :size="64" />
    </div>
    <h3>{{ $t('admin.orders.errorTitle') }}</h3>
    <p>{{ $t('admin.orders.errorMessage') }}</p>
    <button class="retry-btn" @click="$emit('retry')">{{ $t('admin.orders.retry') }}</button>
  </div>
</template>

<script setup>
import IconAlertCircle from '~/components/icon/IconAlertCircle.vue';

defineEmits(['retry']);
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
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
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.error-state p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
  margin-bottom: 1.5rem;
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
