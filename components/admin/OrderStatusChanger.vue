<template>
  <div class="status-changer">
    <h3 class="status-changer-title">{{ $t('admin.orders.manualStatus.title') }}</h3>
    <p class="status-changer-description">{{ $t('admin.orders.manualStatus.description') }}</p>
    <div class="status-changer-controls">
      <select v-model="selectedStatus" class="status-changer-select">
        <option value="" disabled>{{ $t('admin.orders.manualStatus.selectPlaceholder') }}</option>
        <option v-for="status in availableStatuses" :key="status" :value="status">
          {{ $t(`orders.status.${status}`) }}
        </option>
      </select>
      <button class="status-changer-button" :disabled="!selectedStatus || isLoading" @click="changeStatus">
        <span v-if="isLoading" class="status-changer-loading"></span>
        <span v-else>{{ $t('admin.orders.manualStatus.button') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useConfirmDialog } from '~/composables/useConfirmDialog';

const props = defineProps({
  currentStatus: {
    type: String,
    required: true,
  },
  orderId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(['status-changed']);

const { t } = useI18n();
const { update } = useStrapi();
const { confirm } = useConfirmDialog();

// State
const selectedStatus = ref('');
const isLoading = ref(false);

// Available statuses (excluding current)
const allStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const availableStatuses = computed(() => {
  return allStatuses.filter((status) => status !== props.currentStatus);
});

// Change status with confirmation
const changeStatus = async () => {
  if (!selectedStatus.value || isLoading.value) return;

  // Determine variant based on status
  const isDestructive = ['cancelled', 'refunded'].includes(selectedStatus.value);
  const variant = isDestructive ? 'warning' : 'info';
  const icon = isDestructive ? 'alert' : 'question';

  // Ask for confirmation
  const confirmed = await confirm({
    title: t('admin.orders.manualStatus.confirmTitle'),
    message: t('admin.orders.manualStatus.confirmMessage', { status: t(`orders.status.${selectedStatus.value}`) }),
    confirmText: t('admin.orders.manualStatus.confirmButton'),
    cancelText: t('common.cancel'),
    variant,
    icon,
  });

  if (!confirmed) return;

  isLoading.value = true;
  try {
    await update('orders', props.orderId, {
      orderStatus: selectedStatus.value,
    });

    // Reset selection and emit event
    const newStatus = selectedStatus.value;
    selectedStatus.value = '';
    emit('status-changed', newStatus);
  } catch (error) {
    console.error('Failed to update order status:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.status-changer {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.status-changer-title {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0 0 0.375rem 0;
}

.status-changer-description {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text-muted);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.status-changer-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.status-changer-select {
  flex: 1;
  max-width: 280px;
  padding: 0.625rem 1rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text);
  background: var(--admin-surface-alt);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

.status-changer-select:hover {
  border-color: var(--admin-border-hover, #9ca3af);
}

.status-changer-select:focus {
  outline: none;
  border-color: var(--color-gold, #d4a762);
  box-shadow: 0 0 0 3px rgba(212, 167, 98, 0.15);
}

.status-changer-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--admin-surface-alt);
  color: var(--admin-text);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 120px;
}

.status-changer-button:hover:not(:disabled) {
  background: var(--admin-border);
  border-color: var(--admin-border-hover, #9ca3af);
}

.status-changer-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-changer-loading {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(107, 114, 128, 0.3);
  border-top-color: var(--admin-text-muted);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .status-changer-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .status-changer-select {
    max-width: none;
  }

  .status-changer-button {
    width: 100%;
  }
}
</style>
