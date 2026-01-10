<template>
  <div class="customers-table-wrapper">
    <table class="customers-table">
      <thead>
        <tr>
          <th class="sortable" @click="emit('sort', 'customer')">
            <span class="th-content">
              {{ $t('admin.customers.table.customer') }}
              <span v-if="sortField === 'customer'" class="sort-icon">
                <IconSortDesc v-if="sortOrder === 'desc'" :size="14" />
                <IconSortAsc v-else :size="14" />
              </span>
            </span>
          </th>
          <th class="sortable" @click="emit('sort', 'email')">
            <span class="th-content">
              {{ $t('admin.customers.table.email') }}
              <span v-if="sortField === 'email'" class="sort-icon">
                <IconSortDesc v-if="sortOrder === 'desc'" :size="14" />
                <IconSortAsc v-else :size="14" />
              </span>
            </span>
          </th>
          <th>{{ $t('admin.customers.table.phone') }}</th>
          <th>{{ $t('admin.customers.table.orders') }}</th>
          <th class="sortable" @click="emit('sort', 'totalSpent')">
            <span class="th-content">
              {{ $t('admin.customers.table.totalSpent') }}
              <span v-if="sortField === 'totalSpent'" class="sort-icon">
                <IconSortDesc v-if="sortOrder === 'desc'" :size="14" />
                <IconSortAsc v-else :size="14" />
              </span>
            </span>
          </th>
          <th class="sortable" @click="emit('sort', 'lastOrderDate')">
            <span class="th-content">
              {{ $t('admin.customers.table.lastOrder') }}
              <span v-if="sortField === 'lastOrderDate'" class="sort-icon">
                <IconSortDesc v-if="sortOrder === 'desc'" :size="14" />
                <IconSortAsc v-else :size="14" />
              </span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="customer in customers" :key="customer.id">
          <!-- Customer Row -->
          <tr class="customer-row" :class="{ expanded: expandedCustomerId === customer.id }" @click="toggleExpand(customer.id)">
            <td class="customer-cell">
              <div class="customer-info">
                <IconChevronRight class="expand-icon" :class="{ rotated: expandedCustomerId === customer.id }" :size="16" />
                <div class="customer-avatar">
                  {{ getInitials(customer) }}
                </div>
                <div class="customer-name-wrapper">
                  <span class="customer-name">{{ getFullName(customer) }}</span>
                  <span class="customer-id">ID: {{ customer.id }}</span>
                </div>
              </div>
            </td>
            <td class="email-cell">
              <a :href="`mailto:${customer.email}`" class="email-link" @click.stop>{{ customer.email || '-' }}</a>
            </td>
            <td class="phone-cell">
              <span>{{ customer.phone || '-' }}</span>
            </td>
            <td class="orders-cell">
              <span class="orders-badge">{{ customer.orderCount }}</span>
            </td>
            <td class="total-cell">
              <span class="total-spent">{{ formatPrice(customer.totalSpent) }}</span>
            </td>
            <td class="date-cell">
              <span class="date-value">{{ formatDate(customer.lastOrderDate) }}</span>
            </td>
          </tr>

          <!-- Expanded Orders Row -->
          <tr v-if="expandedCustomerId === customer.id" class="orders-detail-row">
            <td colspan="6">
              <div class="orders-detail-content">
                <h4 class="orders-detail-title">
                  <IconDocument :size="16" />
                  {{ $t('admin.customers.orderHistory') }}
                </h4>
                <div class="orders-list">
                  <div v-for="order in getCustomerOrders(customer.id)" :key="order.id" class="order-item">
                    <div class="order-info">
                      <NuxtLink :to="localePath(`/admin/orders/${order.documentId}`)" class="order-number" @click.stop>
                        {{ order.orderNumber }}
                      </NuxtLink>
                      <span class="order-date">{{ formatDate(order.orderDate) }}</span>
                    </div>
                    <div class="order-status">
                      <span class="status-badge" :class="order.orderStatus">{{ $t(`orders.status.${order.orderStatus}`) }}</span>
                    </div>
                    <div class="order-total">
                      {{ formatPrice(order.totalPrice) }}
                    </div>
                    <NuxtLink :to="localePath(`/admin/orders/${order.documentId}`)" class="view-order-btn" @click.stop>
                      {{ $t('admin.customers.viewOrder') }}
                      <IconArrowRight :size="14" />
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { formatPrice } from '~/logic/utils';
import IconChevronRight from '~/components/icon/IconChevronRight.vue';
import IconDocument from '~/components/icon/IconDocument.vue';
import IconArrowRight from '~/components/icon/IconArrowRight.vue';
import IconSortAsc from '~/components/icon/IconSortAsc.vue';
import IconSortDesc from '~/components/icon/IconSortDesc.vue';

const { locale } = useI18n();
const localePath = useLocalePath();

const props = defineProps({
  customers: {
    type: Array,
    required: true,
  },
  orders: {
    type: Array,
    required: true,
  },
  sortField: {
    type: String,
    default: 'lastOrderDate',
  },
  sortOrder: {
    type: String,
    default: 'desc',
  },
});

const emit = defineEmits(['sort']);

const expandedCustomerId = ref(null);

const toggleExpand = (customerId) => {
  if (expandedCustomerId.value === customerId) {
    expandedCustomerId.value = null;
  } else {
    expandedCustomerId.value = customerId;
  }
};

const getCustomerOrders = (customerId) => {
  return props.orders.filter((order) => order.customerId === customerId).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
};

const getFullName = (customer) => {
  const firstname = customer.firstname || '';
  const lastname = customer.lastname || '';
  return `${firstname} ${lastname}`.trim() || 'Unknown';
};

const getInitials = (customer) => {
  const firstname = customer.firstname || '';
  const lastname = customer.lastname || '';
  const firstInitial = firstname.charAt(0).toUpperCase();
  const lastInitial = lastname.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}` || '?';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'nl' ? 'nl-BE' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style scoped>
.customers-table-wrapper {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
}

.customers-table th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--admin-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--admin-surface-alt);
  border-bottom: 1px solid var(--admin-border);
  transition: all 0.3s ease;
}

.customers-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.customers-table th.sortable:hover {
  color: var(--admin-text);
  background: var(--admin-hover-bg);
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  display: flex;
  align-items: center;
  color: var(--color-gold);
}

.customers-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--admin-border-light);
  transition: all 0.3s ease;
}

.expand-icon {
  color: var(--color-gold);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.expand-icon.rotated {
  transform: rotate(90deg);
}

.customer-row {
  transition: background 0.2s ease;
  cursor: pointer;
}

.customer-row:hover {
  background: var(--admin-surface-alt);
}

.customer-row.expanded {
  background: var(--admin-surface-alt);
}

.customer-row.expanded td {
  border-bottom-color: transparent;
}

.customer-cell {
  min-width: 200px;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
}

.customer-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.customer-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.customer-id {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.email-cell {
  min-width: 180px;
}

.email-link {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.email-link:hover {
  color: var(--color-gold);
}

.phone-cell {
  min-width: 120px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text-secondary);
}

.orders-cell {
  width: 80px;
  text-align: center;
}

.orders-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 0.25rem 0.5rem;
  background: rgba(212, 167, 98, 0.15);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-gold);
}

.total-cell {
  min-width: 100px;
}

.total-spent {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.date-cell {
  min-width: 120px;
}

.date-value {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text-secondary);
  transition: color 0.3s ease;
}

/* Orders Detail Row */
.orders-detail-row td {
  padding: 0 !important;
  background: var(--admin-surface-alt);
}

.orders-detail-content {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  margin-left: 50px;
  border-left: 2px solid var(--color-gold);
}

.orders-detail-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.orders-detail-title svg {
  color: var(--color-gold);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.875rem 1rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.order-item:hover {
  border-color: var(--admin-border-hover);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 140px;
}

.order-number {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--admin-text);
  text-decoration: none;
  transition: color 0.2s ease;
}

.order-number:hover {
  color: var(--color-gold);
}

.order-date {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.order-status {
  flex: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge.processing {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.paid {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.shipped {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.status-badge.delivered {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.refunded {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.order-total {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--admin-text);
  min-width: 80px;
  text-align: right;
}

.view-order-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--admin-text-secondary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.view-order-btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

@media (max-width: 1024px) {
  .order-item {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .order-info {
    min-width: 120px;
  }

  .order-status {
    flex: none;
  }

  .order-total {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .customers-table-wrapper {
    overflow-x: auto;
  }

  .customers-table {
    min-width: 800px;
  }

  .orders-detail-content {
    margin-left: 0;
    padding: 1rem;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .order-total {
    text-align: left;
  }

  .view-order-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
