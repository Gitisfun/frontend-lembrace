<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.products.title')" :subtitle="$t('admin.products.subtitle')">
      <template #actions>
        <AdminActionButton :href="strapiProductCreateUrl" target="_blank">
          <template #icon>
            <IconPlus :size="16" />
          </template>
          {{ $t('admin.products.addProduct') }}
        </AdminActionButton>
        <AdminActionButton @click="refreshProducts" :disabled="isLoading" :loading="isLoading">
          <template #icon>
            <IconRefresh :size="16" />
          </template>
          {{ $t('admin.products.refresh') }}
        </AdminActionButton>
      </template>
    </AdminHeader>

    <div class="products-content">
      <!-- Loading State -->
      <ProductsLoadingState v-if="isLoading" />

      <!-- Error State -->
      <ProductsErrorState v-else-if="hasError" @retry="refreshProducts" />

      <!-- Empty State (no products at all) -->
      <ProductsEmptyState v-else-if="products.length === 0" />

      <!-- Products List -->
      <div v-else class="products-list">
        <!-- Filters Bar -->
        <ProductsFiltersBar
          v-model:searchQuery="searchQuery"
          v-model:sortField="sortField"
          v-model:sortOrder="sortOrder"
          v-model:categoryFilter="categoryFilter"
          v-model:subcategoryFilter="subcategoryFilter"
          v-model:stockFilter="stockFilter"
          v-model:hasDiscountFilter="hasDiscountFilter"
          :categories="categories"
          @toggleSort="toggleSortOrder"
        />

        <!-- No Results State -->
        <ProductsNoResults v-if="filteredProducts.length === 0" @clearFilters="clearFilters" />

        <!-- Products Table -->
        <ProductsTable v-if="filteredProducts.length > 0" :products="paginatedProducts" :strapiUrl="config.public.strapiUrl" />

        <!-- Pagination -->
        <AdminPagination v-if="filteredProducts.length > 0" v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="filteredProducts.length" :totalPages="totalPages" :itemsLabel="$t('admin.products.productsCount')" />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from '~/composables/useToast';
import AdminLayout from '~/components/admin/AdminLayout.vue';
import AdminHeader from '~/components/admin/AdminHeader.vue';
import AdminActionButton from '~/components/admin/AdminActionButton.vue';
import AdminPagination from '~/components/admin/AdminPagination.vue';
import ProductsLoadingState from '~/components/admin/ProductsLoadingState.vue';
import ProductsErrorState from '~/components/admin/ProductsErrorState.vue';
import ProductsEmptyState from '~/components/admin/ProductsEmptyState.vue';
import ProductsFiltersBar from '~/components/admin/ProductsFiltersBar.vue';
import ProductsNoResults from '~/components/admin/ProductsNoResults.vue';
import ProductsTable from '~/components/admin/ProductsTable.vue';
import IconRefresh from '~/components/icon/IconRefresh.vue';
import IconPlus from '~/components/icon/IconPlus.vue';

definePageMeta({
  layout: false,
  middleware: ['admin'],
});

const { t } = useI18n();
const { find } = useStrapi();
const config = useRuntimeConfig();
const { success: toastSuccess } = useToast();

// Strapi product create URL
const strapiProductCreateUrl = computed(() => {
  return `${config.public.strapiUrl}/admin/content-manager/collection-types/api::product.product/create`;
});

// State
const products = ref([]);
const categories = ref([]);
const isLoading = ref(true);
const hasError = ref(false);

// Filters & Pagination State
const searchQuery = ref('');
const sortField = ref('name');
const sortOrder = ref('asc');
const categoryFilter = ref('all');
const subcategoryFilter = ref('all');
const stockFilter = ref('all');
const hasDiscountFilter = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);

// Computed: Filtered, sorted, and paginated products
const filteredProducts = computed(() => {
  let result = [...products.value];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter((product) => {
      const name = product.name?.toLowerCase() || '';
      const description = typeof product.description_short === 'string' ? product.description_short.toLowerCase() : '';
      const descriptionDetailed = typeof product.description_detailed === 'string' ? product.description_detailed.toLowerCase() : '';
      const categoryName = product.subcategory?.category?.label?.toLowerCase() || '';
      const subcategoryName = product.subcategory?.label?.toLowerCase() || '';
      return name.includes(query) || description.includes(query) || descriptionDetailed.includes(query) || categoryName.includes(query) || subcategoryName.includes(query);
    });
  }

  // Apply category filter
  if (categoryFilter.value !== 'all') {
    result = result.filter((product) => {
      return String(product.subcategory?.category?.id) === String(categoryFilter.value);
    });
  }

  // Apply subcategory filter
  if (subcategoryFilter.value !== 'all') {
    result = result.filter((product) => {
      return String(product.subcategory?.id) === String(subcategoryFilter.value);
    });
  }

  // Apply stock filter
  if (stockFilter.value !== 'all') {
    result = result.filter((product) => {
      const amount = product.amount ?? 0;
      switch (stockFilter.value) {
        case 'in_stock':
          return amount > 5;
        case 'low_stock':
          return amount > 0 && amount <= 5;
        case 'out_of_stock':
          return amount === 0;
        default:
          return true;
      }
    });
  }

  // Apply has discount filter
  if (hasDiscountFilter.value) {
    result = result.filter((product) => product.discount > 0);
  }

  // Apply sorting
  result.sort((a, b) => {
    let valueA, valueB;

    switch (sortField.value) {
      case 'name':
        valueA = a.name?.toLowerCase() || '';
        valueB = b.name?.toLowerCase() || '';
        break;
      case 'price':
        valueA = a.price || 0;
        valueB = b.price || 0;
        break;
      case 'category':
        valueA = a.subcategory?.category?.label?.toLowerCase() || '';
        valueB = b.subcategory?.category?.label?.toLowerCase() || '';
        break;
      case 'subcategory':
        valueA = a.subcategory?.label?.toLowerCase() || '';
        valueB = b.subcategory?.label?.toLowerCase() || '';
        break;
      default:
        valueA = a.name?.toLowerCase() || '';
        valueB = b.name?.toLowerCase() || '';
    }

    if (typeof valueA === 'string') {
      return sortOrder.value === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    return sortOrder.value === 'asc' ? valueA - valueB : valueB - valueA;
  });

  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pageSize.value) || 1;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProducts.value.slice(start, end);
});

// Reset to first page when filters change
watch([searchQuery, categoryFilter, subcategoryFilter, stockFilter, hasDiscountFilter, sortField, sortOrder, pageSize], () => {
  currentPage.value = 1;
});

// Reset subcategory when category changes
watch(categoryFilter, () => {
  subcategoryFilter.value = 'all';
});

// Toggle sort order
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
};

// Clear filters
const clearFilters = () => {
  searchQuery.value = '';
  categoryFilter.value = 'all';
  subcategoryFilter.value = 'all';
  stockFilter.value = 'all';
  hasDiscountFilter.value = false;
};

// SEO Meta
useSeoMeta({
  title: () => t('seo.admin.products.title'),
  description: () => t('seo.admin.products.description'),
  robots: 'noindex, nofollow',
});

// Methods
const fetchProducts = async () => {
  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await find('products', {
      populate: {
        image: true,
        subcategory: {
          populate: ['category'],
        },
      },
      sort: ['name:asc'],
    });

    products.value = response.data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await find('categories', {
      populate: ['subcategories'],
    });
    categories.value = response.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

const refreshProducts = async () => {
  await Promise.all([fetchProducts(), fetchCategories()]);
  if (!hasError.value) {
    toastSuccess(t('admin.products.refreshed'));
  }
};

// Fetch products and categories on mount
await Promise.all([fetchProducts(), fetchCategories()]);
</script>

<style scoped>
/* Products Content */
.products-content {
  padding: 2rem;
  flex: 1;
}
</style>
