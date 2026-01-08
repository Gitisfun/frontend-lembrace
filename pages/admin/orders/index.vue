<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.orders.title')" :subtitle="$t('admin.orders.subtitle')">
      <template #actions>
        <AdminActionButton @click="refreshOrders" :disabled="isLoading" :loading="isLoading">
          <template #icon>
            <IconRefresh :size="16" />
          </template>
          {{ $t('admin.orders.refresh') }}
        </AdminActionButton>
      </template>
    </AdminHeader>

    <div class="orders-content">
      <!-- Loading State -->
      <OrdersLoadingState v-if="isLoading" />

      <!-- Error State -->
      <OrdersErrorState v-else-if="hasError" @retry="refreshOrders" />

      <!-- Empty State (no orders at all) -->
      <OrdersEmptyState v-else-if="orders.length === 0" />

      <!-- Orders List -->
      <div v-else class="orders-list">
        <!-- Filters Bar -->
        <OrdersFiltersBar v-model:searchQuery="searchQuery" v-model:statusFilter="statusFilter" :sortOrder="sortOrder" :orderStatuses="orderStatuses" @toggleSort="toggleSortOrder" />

        <!-- No Results State -->
        <OrdersNoResults v-if="filteredOrders.length === 0" @clearFilters="clearFilters" />

        <!-- Orders Table -->
        <OrdersTable v-if="filteredOrders.length > 0" :orders="paginatedOrders" :strapiUrl="config.public.strapiUrl" />

        <!-- Pagination -->
        <OrdersPagination v-if="filteredOrders.length > 0" v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="filteredOrders.length" :totalPages="totalPages" />
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
import OrdersLoadingState from '~/components/admin/OrdersLoadingState.vue';
import OrdersErrorState from '~/components/admin/OrdersErrorState.vue';
import OrdersEmptyState from '~/components/admin/OrdersEmptyState.vue';
import OrdersFiltersBar from '~/components/admin/OrdersFiltersBar.vue';
import OrdersNoResults from '~/components/admin/OrdersNoResults.vue';
import OrdersTable from '~/components/admin/OrdersTable.vue';
import OrdersPagination from '~/components/admin/OrdersPagination.vue';
import IconRefresh from '~/components/icon/IconRefresh.vue';

definePageMeta({
  layout: false,
  middleware: ['admin'],
});

const { t } = useI18n();
const { find } = useStrapi();
const config = useRuntimeConfig();
const { success: toastSuccess } = useToast();

// State
const orders = ref([]);
const isLoading = ref(true);
const hasError = ref(false);

// Filters & Pagination State
const searchQuery = ref('');
const statusFilter = ref('all');
const sortOrder = ref('desc');
const currentPage = ref(1);
const pageSize = ref(10);

// Available statuses for filter
const orderStatuses = ['all', 'pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];

// Computed: Filtered, sorted, and paginated orders
const filteredOrders = computed(() => {
  let result = [...orders.value];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter((order) => {
      const orderNumber = order.orderNumber?.toLowerCase() || '';
      const firstName = order.customerInfo?.firstname?.toLowerCase() || '';
      const lastName = order.customerInfo?.lastname?.toLowerCase() || '';
      const email = order.customerInfo?.email?.toLowerCase() || '';
      return orderNumber.includes(query) || firstName.includes(query) || lastName.includes(query) || email.includes(query);
    });
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    result = result.filter((order) => order.orderStatus === statusFilter.value);
  }

  // Apply date sorting
  result.sort((a, b) => {
    const dateA = new Date(a.orderDate);
    const dateB = new Date(b.orderDate);
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / pageSize.value) || 1;
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

// Reset to first page when filters change
watch([searchQuery, statusFilter, pageSize], () => {
  currentPage.value = 1;
});

// Toggle sort order
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
};

// Clear filters
const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
};

// SEO Meta
useSeoMeta({
  title: () => t('seo.admin.orders.title'),
  description: () => t('seo.admin.orders.description'),
  robots: 'noindex, nofollow',
});

// Methods
const fetchOrders = async () => {
  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await find('orders', {
      populate: {
        customerInfo: true,
        shippingAddress: true,
        billingAddress: true,
        statusLogs: {
          sort: ['createdAt:desc'],
        },
        items: {
          populate: {
            productId: {
              populate: ['image', 'subcategory', 'materials'],
            },
          },
        },
      },
      sort: ['createdAt:desc'],
    });

    // Add initial "pending" status log based on order creation date
    const ordersWithInitialLog = (response.data || []).map((order) => {
      const initialLog = {
        id: `initial-${order.id}`,
        currentStatus: 'pending',
        previousStatus: null,
        createdAt: order.createdAt,
        note: null,
      };

      return {
        ...order,
        statusLogs: [...(order.statusLogs || []), initialLog],
      };
    });

    orders.value = ordersWithInitialLog;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const refreshOrders = async () => {
  await fetchOrders();
  if (!hasError.value) {
    toastSuccess(t('admin.orders.refreshed'));
  }
};

// Fetch orders on mount
await fetchOrders();
</script>

<style scoped>
/* Orders Content */
.orders-content {
  padding: 2rem;
  flex: 1;
}
</style>
