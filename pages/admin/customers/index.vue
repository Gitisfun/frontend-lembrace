<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.customers.title')" :subtitle="$t('admin.customers.subtitle')">
      <template #actions>
        <AdminActionButton @click="refreshCustomers" :disabled="isLoading" :loading="isLoading">
          <template #icon>
            <IconRefresh :size="16" />
          </template>
          {{ $t('admin.customers.refresh') }}
        </AdminActionButton>
      </template>
    </AdminHeader>

    <div class="customers-content">
      <!-- Loading State -->
      <AdminLoadingState v-if="isLoading" :message="$t('admin.customers.loading')" />

      <!-- Error State -->
      <AdminErrorState v-else-if="hasError" :title="$t('admin.customers.errorTitle')" :message="$t('admin.customers.errorMessage')" :retry-text="$t('admin.customers.retry')" @retry="refreshCustomers" />

      <!-- Empty State (no customers at all) -->
      <AdminEmptyState v-else-if="customers.length === 0" :title="$t('admin.customers.emptyTitle')" :message="$t('admin.customers.emptyMessage')">
        <template #icon>
          <IconUsers :size="64" />
        </template>
      </AdminEmptyState>

      <!-- Customers List -->
      <div v-else class="customers-list">
        <!-- Search Bar -->
        <div class="filters-bar">
          <AdminSearchBar v-model="searchQuery" :placeholder="$t('admin.customers.searchPlaceholder')" />
        </div>

        <!-- Sort Hint Banner -->
        <AdminInfoBanner :message="$t('admin.customers.sortHint')" />

        <!-- No Results State -->
        <AdminNoResults v-if="filteredCustomers.length === 0" :title="$t('admin.customers.noResults')" :message="$t('admin.customers.noResultsMessage')" :clear-text="$t('admin.customers.clearFilters')" @clear="searchQuery = ''" />

        <!-- Customers Table -->
        <CustomersTable v-if="filteredCustomers.length > 0" :customers="paginatedCustomers" :orders="orders" :sortField="sortField" :sortOrder="sortOrder" @sort="handleSort" />

        <!-- Pagination -->
        <AdminPagination v-if="filteredCustomers.length > 0" v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="filteredCustomers.length" :totalPages="totalPages" :itemsLabel="$t('admin.customers.customersCount')" />
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
import AdminLoadingState from '~/components/admin/AdminLoadingState.vue';
import AdminErrorState from '~/components/admin/AdminErrorState.vue';
import AdminEmptyState from '~/components/admin/AdminEmptyState.vue';
import AdminSearchBar from '~/components/admin/AdminSearchBar.vue';
import AdminInfoBanner from '~/components/admin/AdminInfoBanner.vue';
import AdminNoResults from '~/components/admin/AdminNoResults.vue';
import CustomersTable from '~/components/admin/CustomersTable.vue';
import IconRefresh from '~/components/icon/IconRefresh.vue';
import IconUsers from '~/components/icon/IconUsers.vue';

definePageMeta({
  layout: false,
  middleware: ['admin'],
});

const { t } = useI18n();
const { find } = useStrapi();
const { success: toastSuccess } = useToast();

// State
const orders = ref([]);
const isLoading = ref(true);
const hasError = ref(false);

// Filters & Pagination State
const searchQuery = ref('');
const sortField = ref('lastOrderDate');
const sortOrder = ref('desc');
const currentPage = ref(1);
const pageSize = ref(10);

// Extract unique customers from orders
const customers = computed(() => {
  const customerMap = new Map();

  orders.value.forEach((order) => {
    // Only include orders with a customerId (not guest orders)
    if (order.customerId) {
      const customerId = order.customerId;

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          email: order.customerInfo?.email || '',
          firstname: order.customerInfo?.firstname || '',
          lastname: order.customerInfo?.lastname || '',
          phone: order.customerInfo?.phone || '',
          orderCount: 1,
          totalSpent: order.totalPrice || 0,
          lastOrderDate: order.orderDate,
          firstOrderDate: order.orderDate,
        });
      } else {
        const existing = customerMap.get(customerId);
        existing.orderCount += 1;
        existing.totalSpent += order.totalPrice || 0;

        // Update last and first order dates
        if (new Date(order.orderDate) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.orderDate;
        }
        if (new Date(order.orderDate) < new Date(existing.firstOrderDate)) {
          existing.firstOrderDate = order.orderDate;
        }
      }
    }
  });

  // Convert map to array (sorting will be applied in filteredCustomers)
  return Array.from(customerMap.values());
});

// Computed: Filtered and sorted customers
const filteredCustomers = computed(() => {
  let result = [...customers.value];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter((customer) => {
      const email = customer.email?.toLowerCase() || '';
      const firstname = customer.firstname?.toLowerCase() || '';
      const lastname = customer.lastname?.toLowerCase() || '';
      const phone = customer.phone?.toLowerCase() || '';
      const fullName = `${firstname} ${lastname}`.toLowerCase();
      return email.includes(query) || firstname.includes(query) || lastname.includes(query) || fullName.includes(query) || phone.includes(query);
    });
  }

  // Apply sorting
  result.sort((a, b) => {
    let valueA, valueB;

    switch (sortField.value) {
      case 'customer':
        valueA = `${a.firstname} ${a.lastname}`.toLowerCase().trim();
        valueB = `${b.firstname} ${b.lastname}`.toLowerCase().trim();
        break;
      case 'email':
        valueA = a.email?.toLowerCase() || '';
        valueB = b.email?.toLowerCase() || '';
        break;
      case 'totalSpent':
        valueA = a.totalSpent || 0;
        valueB = b.totalSpent || 0;
        break;
      case 'lastOrderDate':
        valueA = new Date(a.lastOrderDate).getTime();
        valueB = new Date(b.lastOrderDate).getTime();
        break;
      default:
        valueA = new Date(a.lastOrderDate).getTime();
        valueB = new Date(b.lastOrderDate).getTime();
    }

    if (typeof valueA === 'string') {
      return sortOrder.value === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    return sortOrder.value === 'asc' ? valueA - valueB : valueB - valueA;
  });

  return result;
});

// Handle sort change from table
const handleSort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = field === 'lastOrderDate' || field === 'totalSpent' ? 'desc' : 'asc';
  }
};

const totalPages = computed(() => {
  return Math.ceil(filteredCustomers.value.length / pageSize.value) || 1;
});

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCustomers.value.slice(start, end);
});

// Reset to first page when filters change
watch([searchQuery, sortField, sortOrder, pageSize], () => {
  currentPage.value = 1;
});

// SEO Meta
useSeoMeta({
  title: () => t('seo.admin.customers.title'),
  description: () => t('seo.admin.customers.description'),
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
      },
      sort: ['createdAt:desc'],
    });

    orders.value = response.data || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const refreshCustomers = async () => {
  await fetchOrders();
  if (!hasError.value) {
    toastSuccess(t('admin.customers.refreshed'));
  }
};

// Fetch orders on mount
await fetchOrders();
</script>

<style scoped>
.customers-content {
  padding: 2rem;
  flex: 1;
}

.filters-bar {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .customers-content {
    padding: 1rem;
  }
}
</style>
