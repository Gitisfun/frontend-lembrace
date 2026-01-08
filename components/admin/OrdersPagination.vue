<template>
  <div class="pagination-bar">
    <div class="pagination-info">
      {{ $t('admin.orders.showing') }}
      <strong>{{ startItem }}-{{ endItem }}</strong>
      {{ $t('admin.orders.of') }}
      <strong>{{ totalItems }}</strong>
      {{ $t('admin.orders.ordersCount') }}
    </div>

    <div class="pagination-controls">
      <div class="page-size-selector">
        <label>{{ $t('admin.orders.perPage') }}</label>
        <select :value="pageSize" @change="$emit('update:pageSize', Number($event.target.value))" class="page-size-select">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>

      <div class="page-navigation">
        <button class="page-btn" :disabled="currentPage === 1" @click="$emit('update:currentPage', 1)" :title="$t('admin.orders.firstPage')">
          <IconChevronsLeft :size="14" />
        </button>
        <button class="page-btn" :disabled="currentPage === 1" @click="$emit('update:currentPage', currentPage - 1)" :title="$t('admin.orders.previousPage')">
          <IconChevronLeft :size="14" />
        </button>

        <span class="page-indicator"> {{ currentPage }} / {{ totalPages }} </span>

        <button class="page-btn" :disabled="currentPage === totalPages" @click="$emit('update:currentPage', currentPage + 1)" :title="$t('admin.orders.nextPage')">
          <IconChevronRight :size="14" />
        </button>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="$emit('update:currentPage', totalPages)" :title="$t('admin.orders.lastPage')">
          <IconChevronsRight :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import IconChevronsLeft from '~/components/icon/IconChevronsLeft.vue';
import IconChevronLeft from '~/components/icon/IconChevronLeft.vue';
import IconChevronRight from '~/components/icon/IconChevronRight.vue';
import IconChevronsRight from '~/components/icon/IconChevronsRight.vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

defineEmits(['update:currentPage', 'update:pageSize']);

const startItem = computed(() => (props.currentPage - 1) * props.pageSize + 1);
const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems));
</script>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.pagination-info strong {
  color: var(--admin-text);
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-selector label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text-muted);
  white-space: nowrap;
}

.page-size-select {
  padding: 0.375rem 1.75rem 0.375rem 0.625rem;
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
}

.page-size-select:focus {
  outline: none;
  border-color: var(--color-gold);
}

.page-navigation {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--admin-surface-hover);
  color: var(--admin-text);
  border-color: var(--admin-border-hover);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  padding: 0 0.75rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .pagination-bar {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .pagination-controls {
    justify-content: space-between;
  }
}
</style>
