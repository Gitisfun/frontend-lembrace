<template>
  <div class="products-page">
    <div class="products-container">
      <!-- Mobile Search -->
      <div class="mobile-search">
        <InputSearch v-model="searchQuery" @search="handleSearch" />
      </div>

      <!-- Mobile Filter Button -->
      <button class="mobile-filter-button" @click="isFilterOpen = true">
        <IconFilter :size="20" class="filter-icon" />
        {{ $t('products.filters.button') }}
        <span v-if="activeFilterCount > 0" class="active-filter-count">
          {{ activeFilterCount }}
        </span>
      </button>

      <!-- Active Filters -->
      <ProductActiveFilters
        :categories="processedCategories"
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
      <ModalFilter :is-open="isFilterOpen" :categories="processedCategories" :initial-search-query="searchQuery" :initial-selected-subcategories="selectedSubcategories" :initial-show-discounted="showDiscounted" @close="isFilterOpen = false" @apply="handleFilterApply" @clear="clearFilters" />

      <!-- Desktop Filters -->
      <ProductFilter class="desktop-only" :categories="processedCategories" :initial-search-query="searchQuery" :initial-selected-subcategories="selectedSubcategories" :initial-show-discounted="showDiscounted" @filter-change="handleFilterChange" />

      <!-- Loading State -->
      <div v-if="status === 'pending'" class="loading-grid">
        <UiSkeletonProductCard v-for="i in 8" :key="i" />
      </div>

      <!-- Error State -->
      <UiErrorState v-else-if="error" variant="inline" :title="$t('errors.products.title')" :message="$t('errors.products.message')" :retry-text="$t('common.retry')" @retry="refresh" />

      <!-- Empty State -->
      <div v-else-if="productList && productList.length === 0" class="no-products">
        <div class="no-products-content">
          <div class="no-products-icon">
            <IconSearch :size="64" />
          </div>
          <h2 class="no-products-title">{{ $t('products.noProducts.title') }}</h2>
          <p class="no-products-description">{{ $t('products.noProducts.description') }}</p>
        </div>
      </div>
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
import { useCategories } from '~/composables/useCategories';
import { useLocalization } from '~/composables/useLocalization';

const { t, locale } = useI18n();
const { find } = useStrapi();
const { getLocalizedItem, strapiLocale } = useLocalization();

// SEO Meta
useSeoMeta({
  title: () => t('seo.products.title'),
  description: () => t('seo.products.description'),
  ogTitle: () => t('seo.products.title'),
  ogDescription: () => t('seo.products.description'),
  ogImage: '/logo-lembrace.png',
  twitterTitle: () => t('seo.products.title'),
  twitterDescription: () => t('seo.products.description'),
});

// Get query params for initial filter state
const route = useRoute();

// Helper to parse subcategory from query (handles both numeric IDs and 'all_X' format)
const parseSubcategoryQuery = (value) => {
  if (!value) return [];
  const strValue = String(value);
  if (strValue.startsWith('all_')) {
    return [strValue]; // Keep as string for "all_X" format
  }
  return [Number(value)];
};

// Filter states - initialize from query params if present
const searchQuery = ref('');
const initialSubcategory = parseSubcategoryQuery(route.query.subcategory);
const selectedSubcategories = ref(initialSubcategory);
const showDiscounted = ref(false);
const currentPage = ref(1);
const itemsPerPage = 12;

// Fetch localized categories with subcategories
const { categories, fetchCategories, isLoading: isCategoriesLoading } = useCategories();

// Use useAsyncData for proper SSR handling
await useAsyncData('categories', () => fetchCategories());

// Mobile filter state
const isFilterOpen = ref(false);

// Active filter count
const activeFilterCount = computed(() => {
  return selectedSubcategories.value.length + (showDiscounted.value ? 1 : 0);
});

// Function to inject virtual "all" options into categories
const injectAllOptions = (categories) => {
  return (
    categories?.map((category) => ({
      ...category,
      subcategories: [{ id: `all_${category.id}`, name: 'all', label: t('products.filters.all'), category: category.id }, ...(category.subcategories || [])],
    })) || []
  );
};

// Function to get category ID from subcategory ID (for "all" handling)
const getCategoryFromSubcategory = (subcategoryId, categories) => {
  const subcategoryIdStr = String(subcategoryId);
  if (subcategoryIdStr.startsWith('all_')) {
    return subcategoryIdStr.replace('all_', '');
  }

  for (const category of categories) {
    const subcategory = category.subcategories?.find((sub) => sub.id === subcategoryId);
    if (subcategory) {
      return category.id;
    }
  }
  return null;
};

// Process categories with virtual "all" options
const processedCategories = computed(() => {
  return injectAllOptions(categories.value);
});

// Build filters object
const buildFilters = () => {
  const filters = {
    $or: [{ name: { $containsi: searchQuery.value } }, { description_detailed: { $containsi: searchQuery.value } }],
  };

  if (selectedSubcategories.value.length) {
    // Separate "all" selections from regular subcategory selections
    const allSelections = selectedSubcategories.value.filter((id) => String(id).startsWith('all_'));
    const regularSelections = selectedSubcategories.value.filter((id) => !String(id).startsWith('all_'));

    const categoryFilters = [];

    // Handle "all" selections - filter by category
    if (allSelections.length > 0) {
      const categoryIds = allSelections.map((id) => String(id).replace('all_', ''));
      categoryFilters.push({
        subcategory: {
          category: {
            id: { $in: categoryIds },
          },
        },
      });
    }

    // Handle regular subcategory selections
    if (regularSelections.length > 0) {
      categoryFilters.push({
        subcategory: {
          id: { $in: regularSelections },
        },
      });
    }

    // Combine category filters with OR logic
    if (categoryFilters.length > 0) {
      if (categoryFilters.length === 1) {
        filters.$and = categoryFilters;
      } else {
        filters.$or = [...filters.$or, ...categoryFilters];
      }
    }
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
} = await useAsyncData(
  'products',
  () =>
    find('products', {
      locale: strapiLocale.value,
      populate: ['image', 'image_background', 'subcategory', 'localizations'],
      filters: buildFilters(),
      pagination: {
        page: currentPage.value,
        pageSize: itemsPerPage,
      },
    }),
  {
    watch: [() => strapiLocale.value],
  }
);

// Localized products list (reacts to both data and locale changes)
const productList = computed(() => {
  const rawProducts = products.value?.data || [];
  // Access locale.value to make this computed reactive to locale changes
  const _ = locale.value;
  return rawProducts.map((product) => getLocalizedItem(product)).filter(Boolean);
});
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

// Watch for route query changes (e.g., from mobile menu navigation)
watch(
  () => route.query.subcategory,
  (newSubcategory) => {
    selectedSubcategories.value = parseSubcategoryQuery(newSubcategory);
    currentPage.value = 1;
    refresh();
  }
);
</script>

<style scoped>
.products-page {
  padding: 4rem 2rem;
  min-height: calc(100vh - 70px);
  overflow-x: hidden;
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
}

.products-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  box-sizing: border-box;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
  gap: 1.5rem;
  align-content: start;
  width: 100%;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
  gap: 1.5rem;
  align-content: start;
  width: 100%;
}

@media (max-width: 768px) {
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.no-products {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 3rem 2rem;
  background: #fafafa;
  border-radius: 12px;
  margin: 2rem 0;
  border: 1px solid #e0e0e0;
}

.no-products-content {
  text-align: center;
  max-width: 450px;
}

.no-products-icon {
  margin-bottom: 1.5rem;
  color: #ccc;
}

.no-products-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: #333;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.no-products-description {
  font-family: var(--font-body);
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .no-products {
    min-height: 300px;
    padding: 2rem 1rem;
  }

  .no-products-title {
    font-size: 1.6rem;
  }
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
    padding: 1.5rem 1rem;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .products-page {
    padding: 1rem 0.75rem;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>
