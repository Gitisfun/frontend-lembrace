<template>
  <div class="filters-bar">
    <div class="filters-row">
      <!-- Search Input -->
      <div class="search-wrapper">
        <IconSearch class="search-icon" :size="16" />
        <input :value="searchQuery" @input="emit('update:searchQuery', $event.target.value)" type="text" class="search-input" :placeholder="$t('admin.products.searchPlaceholder')" />
        <button v-if="searchQuery" class="clear-search" @click="emit('update:searchQuery', '')">
          <IconX :size="14" />
        </button>
      </div>

      <!-- Sort Controls -->
      <div class="sort-controls">
        <div class="filter-select-wrapper">
          <select :value="sortField" @change="emit('update:sortField', $event.target.value)" class="filter-select">
            <option value="name">{{ $t('admin.products.sortBy.name') }}</option>
            <option value="price">{{ $t('admin.products.sortBy.price') }}</option>
            <option value="category">{{ $t('admin.products.sortBy.category') }}</option>
            <option value="subcategory">{{ $t('admin.products.sortBy.subcategory') }}</option>
          </select>
          <IconChevronDown class="select-arrow" :size="14" />
        </div>

        <button class="sort-btn" @click="emit('toggleSort')" :title="$t('admin.products.sortDirection')">
          <IconSortDesc v-if="sortOrder === 'desc'" :size="16" />
          <IconSortAsc v-else :size="16" />
          {{ sortOrder === 'desc' ? $t('admin.products.descending') : $t('admin.products.ascending') }}
        </button>
      </div>
    </div>

    <div class="filters-row filters-secondary">
      <!-- Category Filter -->
      <div class="filter-select-wrapper">
        <select :value="categoryFilter" @change="emit('update:categoryFilter', $event.target.value)" class="filter-select">
          <option value="all">{{ $t('admin.products.allCategories') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.label }}
          </option>
        </select>
        <IconChevronDown class="select-arrow" :size="14" />
      </div>

      <!-- Subcategory Filter -->
      <div class="filter-select-wrapper">
        <select :value="subcategoryFilter" @change="emit('update:subcategoryFilter', $event.target.value)" class="filter-select" :disabled="!filteredSubcategories.length">
          <option value="all">{{ $t('admin.products.allSubcategories') }}</option>
          <option v-for="subcategory in filteredSubcategories" :key="subcategory.id" :value="subcategory.id">
            {{ subcategory.label }}
          </option>
        </select>
        <IconChevronDown class="select-arrow" :size="14" />
      </div>

      <!-- Stock Filter -->
      <div class="filter-select-wrapper">
        <select :value="stockFilter" @change="emit('update:stockFilter', $event.target.value)" class="filter-select">
          <option value="all">{{ $t('admin.products.allStock') }}</option>
          <option value="in_stock">{{ $t('admin.products.inStock') }}</option>
          <option value="low_stock">{{ $t('admin.products.lowStock') }}</option>
          <option value="out_of_stock">{{ $t('admin.products.outOfStock') }}</option>
        </select>
        <IconChevronDown class="select-arrow" :size="14" />
      </div>

      <!-- Has Discount Filter -->
      <button class="filter-toggle-btn" :class="{ active: hasDiscountFilter }" @click="emit('update:hasDiscountFilter', !hasDiscountFilter)">
        <IconDollarSign :size="14" />
        {{ $t('admin.products.hasDiscount') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import IconSearch from '~/components/icon/IconSearch.vue';
import IconX from '~/components/icon/IconX.vue';
import IconChevronDown from '~/components/icon/IconChevronDown.vue';
import IconSortDesc from '~/components/icon/IconSortDesc.vue';
import IconSortAsc from '~/components/icon/IconSortAsc.vue';
import IconDollarSign from '~/components/icon/IconDollarSign.vue';

const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  sortField: {
    type: String,
    default: 'name',
  },
  sortOrder: {
    type: String,
    default: 'asc',
  },
  categoryFilter: {
    type: [String, Number],
    default: 'all',
  },
  subcategoryFilter: {
    type: [String, Number],
    default: 'all',
  },
  stockFilter: {
    type: String,
    default: 'all',
  },
  hasDiscountFilter: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:searchQuery', 'update:sortField', 'update:sortOrder', 'update:categoryFilter', 'update:subcategoryFilter', 'update:stockFilter', 'update:hasDiscountFilter', 'toggleSort']);

const filteredSubcategories = computed(() => {
  if (props.categoryFilter === 'all') {
    // Return all subcategories from all categories
    return props.categories.flatMap((cat) => cat.subcategories || []);
  }
  const selectedCategory = props.categories.find((cat) => String(cat.id) === String(props.categoryFilter));
  return selectedCategory?.subcategories || [];
});
</script>

<style scoped>
.filters-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filters-secondary {
  padding-top: 0.5rem;
  border-top: 1px solid var(--admin-border-light);
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
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

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select-wrapper {
  position: relative;
  min-width: 140px;
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

.filter-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.filter-toggle-btn {
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

.filter-toggle-btn:hover {
  background: var(--admin-surface-hover);
  color: var(--admin-text);
  border-color: var(--admin-border-hover);
}

.filter-toggle-btn.active {
  background: rgba(212, 167, 98, 0.15);
  border-color: var(--color-gold);
  color: var(--color-gold);
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    width: 100%;
    min-width: unset;
  }

  .sort-controls {
    width: 100%;
    justify-content: space-between;
  }

  .filter-select-wrapper {
    flex: 1;
    min-width: unset;
  }

  .filters-secondary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .filter-toggle-btn {
    grid-column: span 2;
    justify-content: center;
  }
}
</style>
