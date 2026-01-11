<template>
  <div class="orders-table-wrapper">
    <table class="orders-table">
      <thead>
        <tr>
          <th>{{ $t('admin.orders.table.order') }}</th>
          <th>{{ $t('admin.orders.table.customer') }}</th>
          <th>{{ $t('admin.orders.table.items') }}</th>
          <th>{{ $t('admin.orders.table.total') }}</th>
          <th>{{ $t('admin.orders.table.status') }}</th>
          <th>{{ $t('admin.orders.table.date') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="order in orders" :key="order.id">
          <tr class="order-row" :class="{ expanded: expandedOrderId === order.id }" @click="toggleOrderDetails(order.id)">
            <td class="order-number-cell">
              <div class="order-number-wrapper">
                <IconChevronRight class="expand-icon" :class="{ rotated: expandedOrderId === order.id }" :size="16" />
                <span class="order-number">{{ order.orderNumber }}</span>
                <span v-if="getOrderUnreadCount(order.orderNumber) > 0" class="unread-badge">
                  <IconMail :size="12" />
                  {{ getOrderUnreadCount(order.orderNumber) }}
                </span>
              </div>
            </td>
            <td class="customer-cell">
              <div class="customer-info">
                <span class="customer-name">{{ order.customerInfo?.firstname }} {{ order.customerInfo?.lastname }}</span>
                <span class="customer-email">{{ order.customerInfo?.email }}</span>
              </div>
            </td>
            <td class="items-cell">
              <div class="items-preview">
                <div class="item-images">
                  <div v-for="(item, index) in order.items.slice(0, 3)" :key="item.id" class="item-thumb" :style="{ zIndex: 3 - index }">
                    <NuxtImg :src="getItemImageUrl(item)" :alt="item.name" width="40" height="40" format="webp" provider="strapi" />
                  </div>
                  <div v-if="order.items.length > 3" class="more-items">+{{ order.items.length - 3 }}</div>
                </div>
                <span class="items-count">{{ order.items.length }} {{ order.items.length === 1 ? $t('admin.orders.item') : $t('admin.orders.items') }}</span>
              </div>
            </td>
            <td class="total-cell">
              <span class="order-total">{{ formatPrice(order.totalPrice) }}</span>
              <span class="shipping-cost">+ {{ formatPrice(order.shippingCost) }} {{ $t('admin.orders.shipping') }}</span>
            </td>
            <td class="status-cell">
              <OrderStatusBadge :status="order.orderStatus" size="medium" />
            </td>
            <td class="date-cell">
              <span class="order-date">{{ formatDate(order.orderDate) }}</span>
              <span class="order-time">{{ formatTime(order.orderDate) }}</span>
            </td>
          </tr>
          <!-- Inline Expanded Details Row -->
          <tr v-show="expandedOrderId === order.id" class="details-row">
            <td colspan="6">
              <div class="inline-details-content">
                <!-- Unread Messages Banner -->
                <div v-if="getOrderUnreadCount(order.orderNumber) > 0" class="unread-banner">
                  <IconMail :size="18" />
                  <span>{{ $t('admin.orders.chat.unreadMessages', { count: getOrderUnreadCount(order.orderNumber) }) }}</span>
                </div>

                <!-- Actions Bar -->
                <div class="details-actions">
                  <NuxtLink :to="`/admin/orders/${order.documentId}`" class="view-details-btn" @click.stop>
                    <IconEye :size="16" />
                    {{ $t('admin.orders.viewDetails') }}
                  </NuxtLink>
                </div>

                <!-- Customer & Address Info -->
                <OrderDetailCards :customer="order.customerInfo" :shippingAddress="order.shippingAddress" :billingAddress="order.billingAddress" />

                <!-- Order Items -->
                <OrderItemsList :items="order.items" :totalPrice="order.totalPrice" :shippingCost="order.shippingCost" />

                <!-- Status History -->
                <OrderStatusTimeline :statusLogs="order.statusLogs" />
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
import OrderDetailCards from '~/components/admin/OrderDetailCards.vue';
import OrderItemsList from '~/components/admin/OrderItemsList.vue';
import OrderStatusTimeline from '~/components/admin/OrderStatusTimeline.vue';
import OrderStatusBadge from '~/components/admin/OrderStatusBadge.vue';
import IconChevronRight from '~/components/icon/IconChevronRight.vue';
import IconEye from '~/components/icon/IconEye.vue';
import IconMail from '~/components/icon/IconMail.vue';

const props = defineProps({
  orders: {
    type: Array,
    required: true,
  },
  unreadCounts: {
    type: Array,
    default: () => [],
  },
});

const { locale } = useI18n();

const expandedOrderId = ref(null);

const toggleOrderDetails = (orderId) => {
  expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId;
};

const getOrderUnreadCount = (orderNumber) => {
  const item = props.unreadCounts.find((u) => u.roomName === orderNumber);
  return item?.unreadCount || 0;
};

// Get item image URL path for NuxtImg strapi provider
const getItemImageUrl = (item) => {
  const image = item.productId?.image?.[0];
  if (image) {
    return image.formats?.thumbnail?.url || image.url;
  }
  return '/placeholder-product.png';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'nl' ? 'nl-BE' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale.value === 'nl' ? 'nl-BE' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.orders-table-wrapper {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
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

.orders-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--admin-border-light);
  transition: all 0.3s ease;
}

.order-row {
  cursor: pointer;
  transition: background 0.2s ease;
}

.order-row:hover {
  background: var(--admin-surface-alt);
}

.order-row.expanded {
  background: var(--admin-surface-alt);
}

.order-row.expanded td {
  border-bottom-color: transparent;
}

.order-number-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-icon {
  color: var(--color-gold);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.expand-icon.rotated {
  transform: rotate(90deg);
}

.order-number {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: #f59e0b;
  color: white;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.unread-badge svg {
  flex-shrink: 0;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.customer-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.customer-email {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.items-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-images {
  display: flex;
  align-items: center;
}

.item-thumb {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid var(--admin-thumb-border);
  margin-left: -8px;
  transition: border-color 0.3s ease;
}

.item-thumb:first-child {
  margin-left: 0;
}

.item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-items {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--admin-surface-hover);
  border: 2px solid var(--admin-thumb-border);
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: var(--admin-text-muted);
  transition: all 0.3s ease;
}

.items-count {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.total-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.order-total {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.shipping-cost {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-subtle);
  transition: color 0.3s ease;
}

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.order-date {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.order-time {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-subtle);
  transition: color 0.3s ease;
}

/* Inline Details Row */
.details-row {
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.05) 0%, rgba(212, 167, 98, 0.1) 100%);
}

.details-row td {
  padding: 0 !important;
  border-bottom: 1px solid var(--admin-border) !important;
}

.inline-details-content {
  padding: 1.5rem;
  background: transparent;
  border-top: 1px solid rgba(212, 167, 98, 0.2);
}

.unread-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  color: var(--admin-text);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.unread-banner svg {
  color: #f59e0b;
  flex-shrink: 0;
}

/* Details Actions Bar */
.details-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.view-details-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--color-gold);
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f1419;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-details-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .orders-table-wrapper {
    overflow-x: auto;
  }

  .orders-table {
    min-width: 800px;
  }
}
</style>
