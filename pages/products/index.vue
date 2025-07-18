<template>
  <div class="products-page">
    <div class="products-container">
      <!-- Mobile Search -->
      <div class="mobile-search">
        <InputSearch v-model="searchQuery" @search="handleSearch" />
      </div>

      <!-- Mobile Filter Button -->
      <button class="mobile-filter-button" @click="isFilterOpen = true">
        <svg class="filter-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        Filters
        <span v-if="activeFilterCount > 0" class="active-filter-count">
          {{ activeFilterCount }}
        </span>
      </button>

      <!-- Active Filters -->
      <ProductActiveFilters
        :categories="categories"
        :selected-subcategories="selectedSubcategories"
        :show-discounted="showDiscounted"
        @remove-subcategory="removeSubcategory"
        @remove-discounted="
          () => {
            showDiscounted = false;
            currentPage = 1;
            refresh();
          }
        "
      />

      <!-- Filter Modal -->
      <ModalFilter :is-open="isFilterOpen" :categories="categories" :initial-search-query="searchQuery" :initial-selected-subcategories="selectedSubcategories" :initial-show-discounted="showDiscounted" @close="isFilterOpen = false" @apply="handleFilterApply" @clear="clearFilters" />

      <!-- Desktop Filters -->
      <ProductFilter class="desktop-only" :categories="categories" :initial-search-query="searchQuery" :initial-selected-subcategories="selectedSubcategories" :initial-show-discounted="showDiscounted" @filter-change="handleFilterChange" />

      <div v-if="status === 'pending'" class="loading">Loading products...</div>
      <div v-else-if="error" class="error">Error loading products: {{ error.message }}</div>
      <div v-else class="products-grid">
        <ProductCard v-for="product in productList" :key="product.id" :product="product" />
      </div>

      <!-- Pagination Controls -->
    </div>
    <ProductsPagination :current-page="currentPage" :total-pages="totalPages" @page-change="handlePageChange" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ModalFilter from '~/components/modal/ModalFilter.vue';
import ProductFilter from '~/components/product/ProductFilter.vue';
import ProductActiveFilters from '~/components/product/ProductActiveFilters.vue';
import ProductsPagination from '~/components/product/ProductsPagination.vue';
import InputSearch from '~/components/input/InputSearch.vue';
const { find } = useStrapi();

// Filter states
const searchQuery = ref('');
const selectedSubcategories = ref([]);
const showDiscounted = ref(false);
const currentPage = ref(1);
const itemsPerPage = 12;

// Fetch filter options
const { data: categories } = await find('categories', {
  populate: ['subcategories'],
});

console.log('categories');
console.log(categories);

// Mobile filter state
const isFilterOpen = ref(false);

// Active filter count
const activeFilterCount = computed(() => {
  return selectedSubcategories.value.length + (showDiscounted.value ? 1 : 0);
});

// Build filters object
const buildFilters = () => {
  const filters = {
    $or: [{ name: { $containsi: searchQuery.value } }, { description_detailed: { $containsi: searchQuery.value } }],
  };

  if (selectedSubcategories.value.length) {
    filters.subcategory = { id: { $in: selectedSubcategories.value } };
  }

  if (showDiscounted.value) {
    filters.discount = { $gt: 0 };
  }

  return filters;
};

// Fetch products with useAsyncData
const {
  data: products,
  status,
  error,
  refresh,
} = await useAsyncData('products', () =>
  find('products', {
    populate: ['image', 'image_background', 'subcategory'],
    filters: buildFilters(),
    pagination: {
      page: currentPage.value,
      pageSize: itemsPerPage,
    },
  })
);

// Ensure products is always an array
const productList = computed(() => products.value?.data || []);
const totalPages = computed(() => Math.ceil((products.value?.meta?.pagination?.total || 0) / itemsPerPage));

// Handle search input with debounce
let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleFilterChange({
      searchQuery: searchQuery.value,
      selectedSubcategories: selectedSubcategories.value,
      showDiscounted: showDiscounted.value,
    });
  }, 300);
};

// Handle page change
const handlePageChange = async (page) => {
  currentPage.value = page;
  await refresh();
};

// Handle filter changes
const handleFilterChange = async (filters) => {
  searchQuery.value = filters.searchQuery;
  selectedSubcategories.value = filters.selectedSubcategories;
  showDiscounted.value = filters.showDiscounted;
  currentPage.value = 1;
  await refresh();
};

// Handle filter apply from modal
const handleFilterApply = (filters) => {
  searchQuery.value = filters.searchQuery;
  selectedSubcategories.value = filters.selectedSubcategories;
  showDiscounted.value = filters.showDiscounted;
  isFilterOpen.value = false;
  handleFilterChange(filters);
};

const removeSubcategory = (id) => {
  selectedSubcategories.value = selectedSubcategories.value.filter((c) => c !== id);
  currentPage.value = 1;
  refresh();
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedSubcategories.value = [];
  showDiscounted.value = false;
  handleFilterChange();
};
</script>

<style scoped>
.products-page {
  padding: 4rem 2rem;
  min-height: calc(100vh - 70px);
}

.products-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.loading,
.error {
  text-align: center;
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: var(--color-text);
  padding: 2rem;
}

.error {
  color: var(--color-error);
}

.mobile-search {
  display: none;
}

.mobile-filter-button {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-body);
  color: var(--color-text);
  cursor: pointer;
}

.filter-icon {
  width: 20px;
  height: 20px;
}

.active-filter-count {
  background: var(--color-gold);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

@media (max-width: 1024px) {
  .products-container {
    grid-template-columns: 1fr;
  }

  .mobile-search {
    display: block;
    margin-bottom: 1rem;
  }

  .desktop-only {
    display: none;
  }

  .mobile-filter-button {
    display: flex;
  }
}

@media (max-width: 768px) {
  .products-page {
    padding: 2rem 1rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
