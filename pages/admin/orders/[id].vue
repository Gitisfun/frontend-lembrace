<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.orders.orderDetails')" :subtitle="order ? `${$t('admin.orders.table.order')} #${order.orderNumber}` : ''">
      <template v-if="order" #actions>
        <OrderStatusBadge :status="order.orderStatus" size="large" />
      </template>
    </AdminHeader>

    <div class="order-content">
      <!-- Loading State -->
      <OrdersLoadingState v-if="isLoading" />

      <!-- Error State -->
      <OrdersErrorState v-else-if="hasError" @retry="fetchOrder" />

      <!-- Order Details -->
      <div v-else-if="order">
        <!-- Order Summary Header -->
        <div class="order-summary-header">
          <OrderSummaryItem :label="$t('admin.orders.time')" :value="formatTime(order.orderDate)" />
          <OrderSummaryItem :label="$t('admin.orders.table.date')" :value="formatDate(order.orderDate)" />
          <OrderSummaryItem :label="$t('admin.orders.table.items')" :value="`${order.items?.length || 0} ${order.items?.length === 1 ? $t('admin.orders.item') : $t('admin.orders.items')}`" />
          <OrderSummaryItem :label="$t('admin.orders.table.total')" :value="formatPrice(order.totalPrice)" highlighted />
        </div>

        <!-- Customer & Address Info -->
        <OrderDetailCards :customer="order.customerInfo" :shippingAddress="order.shippingAddress" :billingAddress="order.billingAddress" />

        <!-- Order Items -->
        <OrderItemsList :items="order.items" :totalPrice="order.totalPrice" :shippingCost="order.shippingCost" :strapiUrl="config.public.strapiUrl" />

        <!-- Status History -->
        <OrderStatusTimeline :statusLogs="order.statusLogs" />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import { formatPrice } from '~/logic/utils';
import AdminLayout from '~/components/admin/AdminLayout.vue';
import AdminHeader from '~/components/admin/AdminHeader.vue';
import OrderSummaryItem from '~/components/admin/OrderSummaryItem.vue';
import OrderStatusBadge from '~/components/admin/OrderStatusBadge.vue';
import OrderDetailCards from '~/components/admin/OrderDetailCards.vue';
import OrderItemsList from '~/components/admin/OrderItemsList.vue';
import OrderStatusTimeline from '~/components/admin/OrderStatusTimeline.vue';

definePageMeta({
  layout: false,
  middleware: ['admin'],
});

const { t } = useI18n();
const { locale } = useI18n();
const route = useRoute();
const { findOne } = useStrapi();
const config = useRuntimeConfig();

// State
const order = ref(null);
const isLoading = ref(true);
const hasError = ref(false);

// SEO Meta
useSeoMeta({
  title: () => (order.value ? `${t('admin.orders.orderDetails')} #${order.value.orderNumber} | L'embrace` : `${t('admin.orders.orderDetails')} | L'embrace`),
  description: () => t('seo.admin.orders.description'),
  robots: 'noindex, nofollow',
});

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'nl' ? 'nl-BE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale.value === 'nl' ? 'nl-BE' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Fetch order
const fetchOrder = async () => {
  isLoading.value = true;
  hasError.value = false;

  try {
    const orderId = route.params.id;
    const response = await findOne('orders', orderId, {
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
    });

    if (response?.data) {
      // Add initial "pending" status log based on order creation date
      const initialLog = {
        id: `initial-${response.data.id}`,
        currentStatus: 'pending',
        previousStatus: null,
        createdAt: response.data.createdAt,
        note: null,
      };

      order.value = {
        ...response.data,
        statusLogs: [...(response.data.statusLogs || []), initialLog],
      };
    } else {
      hasError.value = true;
    }
  } catch (error) {
    console.error('Failed to fetch order:', error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

// Fetch order on mount
await fetchOrder();
</script>

<style scoped>
/* Order Content */
.order-content {
  padding: 2rem;
  flex: 1;
}

/* Order Summary Header */
.order-summary-header {
  display: flex;
  gap: 2rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--admin-border);
}

/* Responsive */
@media (max-width: 768px) {
  .order-summary-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
