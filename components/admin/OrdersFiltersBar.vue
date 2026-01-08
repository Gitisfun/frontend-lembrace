<template>
  <div class="filters-bar">
    <div class="filters-left">
      <!-- Search Input -->
      <div class="search-wrapper">
        <IconSearch class="search-icon" :size="16" />
        <input :value="searchQuery" @input="$emit('update:searchQuery', $event.target.value)" type="text" class="search-input" :placeholder="$t('admin.orders.searchPlaceholder')" />
        <button v-if="searchQuery" class="clear-search" @click="$emit('update:searchQuery', '')">
          <IconX :size="14" />
        </button>
      </div>
    </div>

    <div class="filters-right">
      <!-- Status Filter -->
      <div class="filter-select-wrapper">
        <select :value="statusFilter" @change="$emit('update:statusFilter', $event.target.value)" class="filter-select">
          <option v-for="status in orderStatuses" :key="status" :value="status">
            {{ status === 'all' ? $t('admin.orders.allStatuses') : $t(`orders.status.${status}`) }}
          </option>
        </select>
        <IconChevronDown class="select-arrow" :size="14" />
      </div>

      <!-- Sort Toggle -->
      <button class="sort-btn" @click="$emit('toggleSort')" :title="$t('admin.orders.sortByDate')">
        <IconSortDesc v-if="sortOrder === 'desc'" :size="16" />
        <IconSortAsc v-else :size="16" />
        {{ sortOrder === 'desc' ? $t('admin.orders.newestFirst') : $t('admin.orders.oldestFirst') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import IconSearch from '~/components/icon/IconSearch.vue';
import IconX from '~/components/icon/IconX.vue';
import IconChevronDown from '~/components/icon/IconChevronDown.vue';
import IconSortDesc from '~/components/icon/IconSortDesc.vue';
import IconSortAsc from '~/components/icon/IconSortAsc.vue';

defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  statusFilter: {
    type: String,
    default: 'all',
  },
  sortOrder: {
    type: String,
    default: 'desc',
  },
  orderStatuses: {
    type: Array,
    required: true,
  },
});

defineEmits(['update:searchQuery', 'update:statusFilter', 'toggleSort']);
</script>

<style scoped>
.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters-left {
  flex: 1;
  min-width: 0;
}

.filters-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--admin-text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.625rem 2.25rem 0.625rem 2.5rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text);
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--admin-text-muted);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(212, 167, 98, 0.15);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--admin-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search:hover {
  color: var(--admin-text);
  background: var(--admin-hover-bg);
}

.filter-select-wrapper {
  position: relative;
  width: 160px;
  flex-shrink: 0;
}

.filter-select {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 0.875rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text);
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(212, 167, 98, 0.15);
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--admin-text-muted);
  pointer-events: none;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.sort-btn:hover {
  background: var(--admin-surface-hover);
  color: var(--admin-text);
  border-color: var(--admin-border-hover);
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .filters-left {
    width: 100%;
  }

  .filters-right {
    width: 100%;
    justify-content: space-between;
  }

  .filter-select-wrapper {
    flex: 1;
  }
}
</style>
