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
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ $t('admin.customers.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="error-state">
        <IconAlertCircle :size="48" />
        <h3>{{ $t('admin.customers.errorTitle') }}</h3>
        <p>{{ $t('admin.customers.errorMessage') }}</p>
        <button class="retry-btn" @click="refreshCustomers">{{ $t('admin.customers.retry') }}</button>
      </div>

      <!-- Empty State (no customers at all) -->
      <div v-else-if="customers.length === 0" class="empty-state">
        <IconUsers :size="48" />
        <h3>{{ $t('admin.customers.emptyTitle') }}</h3>
        <p>{{ $t('admin.customers.emptyMessage') }}</p>
      </div>

      <!-- Customers List -->
      <div v-else class="customers-list">
        <!-- Search Bar -->
        <div class="filters-bar">
          <div class="search-wrapper">
            <IconSearch class="search-icon" :size="16" />
            <input v-model="searchQuery" type="text" class="search-input" :placeholder="$t('admin.customers.searchPlaceholder')" />
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
              <IconX :size="14" />
            </button>
          </div>
        </div>

        <!-- Sort Hint Banner -->
        <div class="sort-hint">
          <IconInfo :size="14" />
          <span>{{ $t('admin.customers.sortHint') }}</span>
        </div>

        <!-- No Results State -->
        <div v-if="filteredCustomers.length === 0" class="no-results">
          <IconSearchX :size="40" />
          <h3>{{ $t('admin.customers.noResults') }}</h3>
          <p>{{ $t('admin.customers.noResultsMessage') }}</p>
          <button class="clear-btn" @click="searchQuery = ''">{{ $t('admin.customers.clearFilters') }}</button>
        </div>

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
import CustomersTable from '~/components/admin/CustomersTable.vue';
import IconRefresh from '~/components/icon/IconRefresh.vue';
import IconSearch from '~/components/icon/IconSearch.vue';
import IconX from '~/components/icon/IconX.vue';
import IconSearchX from '~/components/icon/IconSearchX.vue';
import IconUsers from '~/components/icon/IconUsers.vue';
import IconAlertCircle from '~/components/icon/IconAlertCircle.vue';
import IconInfo from '~/components/icon/IconInfo.vue';

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
/* Customers Content */
.customers-content {
  padding: 2rem;
  flex: 1;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--admin-border);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--admin-text-muted);
}

.error-state svg {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-state h3 {
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0 0 0.5rem 0;
}

.error-state p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
  margin: 0 0 1.5rem 0;
}

.retry-btn {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 167, 98, 0.3);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--admin-text-muted);
}

.empty-state svg {
  color: var(--color-gold);
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-state h3 {
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
  margin: 0;
}

/* Filters Bar */
.filters-bar {
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
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

/* Sort Hint Banner */
.sort-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(212, 167, 98, 0.08);
  border: 1px solid rgba(212, 167, 98, 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-secondary);
}

.sort-hint svg {
  color: var(--color-gold);
  flex-shrink: 0;
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.no-results svg {
  color: var(--admin-text-muted);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0 0 0.5rem 0;
}

.no-results p {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text-muted);
  margin: 0 0 1.25rem 0;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

@media (max-width: 768px) {
  .customers-content {
    padding: 1rem;
  }
}
</style>
