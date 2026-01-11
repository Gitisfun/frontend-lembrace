<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.orders.orderDetails')" :subtitle="order ? `${$t('admin.orders.table.order')} #${order.orderNumber}` : ''">
      <template v-if="order" #actions>
        <OrderStatusBadge :status="order.orderStatus" size="large" />
      </template>
    </AdminHeader>

    <div class="order-page-layout">
      <!-- Left Side: Order Details -->
      <div class="order-content">
        <!-- Loading State -->
        <OrdersLoadingState v-if="isLoading" />

        <!-- Error State -->
        <OrdersErrorState v-else-if="hasError" @retry="fetchOrder" />

        <!-- Order Details -->
        <div v-else-if="order">
          <!-- Start Processing Banner (shown when status is paid) -->
          <AdminBanner
            v-if="order.orderStatus === 'paid'"
            variant="info"
            :title="$t('admin.orders.processingBanner.title')"
            :description="$t('admin.orders.processingBanner.description')"
            :button-text="$t('admin.orders.processingBanner.button')"
            :button-loading="isUpdatingStatus"
            :icon-size="20"
            @button-click="startProcessing"
          >
            <template #icon>
              <IconPackage :size="20" />
            </template>
          </AdminBanner>

          <!-- Ship Order Banner (shown when status is processing) -->
          <AdminBanner
            v-if="order.orderStatus === 'processing'"
            variant="success"
            :title="$t('admin.orders.shippingBanner.title')"
            :description="$t('admin.orders.shippingBanner.description')"
            :button-text="$t('admin.orders.shippingBanner.button')"
            :button-loading="isUpdatingStatus"
            :icon-size="20"
            @button-click="shipOrder"
          >
            <template #icon>
              <IconTruck :size="20" />
            </template>
          </AdminBanner>

          <!-- Unread Messages Banner -->
          <AdminBanner v-if="unreadCount > 0" variant="message" :description="$t('admin.orders.chat.unreadMessages', { count: unreadCount })" />

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

          <!-- Manual Status Change -->
          <OrderStatusChanger :currentStatus="order.orderStatus" :orderId="route.params.id" @status-changed="fetchOrder" />
        </div>
      </div>

      <!-- Right Side: Chat or Guest Order Notice -->
      <div class="chat-panel">
        <!-- Chat for registered customers -->
        <OrderChat v-if="order && order.customerId" :orderId="String(route.params.id)" :orderNumber="order.orderNumber" />

        <!-- Guest Order Notice -->
        <GuestOrderNotice v-else-if="order && !order.customerId" :email="order.customerInfo?.email" />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import { formatPrice } from '~/logic/utils';
import { useAuthStore } from '~/stores/auth';
import { useAdminUnreadMessagesStore } from '~/stores/adminUnreadMessages';
import { useConfirmDialog } from '~/composables/useConfirmDialog';
import AdminLayout from '~/components/admin/AdminLayout.vue';
import AdminHeader from '~/components/admin/AdminHeader.vue';
import OrderSummaryItem from '~/components/admin/OrderSummaryItem.vue';
import OrderStatusBadge from '~/components/admin/OrderStatusBadge.vue';
import OrderDetailCards from '~/components/admin/OrderDetailCards.vue';
import OrderItemsList from '~/components/admin/OrderItemsList.vue';
import OrderStatusTimeline from '~/components/admin/OrderStatusTimeline.vue';
import OrderChat from '~/components/admin/OrderChat.vue';
import AdminBanner from '~/components/admin/AdminBanner.vue';
import OrderStatusChanger from '~/components/admin/OrderStatusChanger.vue';
import GuestOrderNotice from '~/components/admin/GuestOrderNotice.vue';
import IconPackage from '~/components/icon/IconPackage.vue';
import IconTruck from '~/components/icon/IconTruck.vue';

definePageMeta({
  layout: false,
  middleware: ['admin'],
});

const { t } = useI18n();
const { locale } = useI18n();
const route = useRoute();
const { findOne, update } = useStrapi();
const config = useRuntimeConfig();
const authStore = useAuthStore();
const adminUnreadStore = useAdminUnreadMessagesStore();
const { confirm } = useConfirmDialog();

// State
const order = ref(null);
const isLoading = ref(true);
const hasError = ref(false);
const isUpdatingStatus = ref(false);

// Get unread count from store
const unreadCount = computed(() => {
  if (!order.value?.orderNumber) return 0;
  return adminUnreadStore.getUnreadByRoom(order.value.orderNumber);
});

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

// Start processing order (change status from paid to processing)
const startProcessing = async () => {
  if (!order.value || isUpdatingStatus.value) return;

  // Ask for confirmation
  const confirmed = await confirm({
    title: t('admin.orders.processingBanner.confirmTitle'),
    message: t('admin.orders.processingBanner.confirmMessage'),
    confirmText: t('admin.orders.processingBanner.button'),
    cancelText: t('common.cancel'),
    variant: 'success',
    icon: 'check',
  });

  if (!confirmed) return;

  isUpdatingStatus.value = true;
  try {
    const orderId = route.params.id;
    await update('orders', orderId, {
      orderStatus: 'processing',
    });

    // Refresh order data to get updated status and status logs
    await fetchOrder();
  } catch (error) {
    console.error('Failed to update order status:', error);
  } finally {
    isUpdatingStatus.value = false;
  }
};

// Ship order (change status from processing to shipped)
const shipOrder = async () => {
  if (!order.value || isUpdatingStatus.value) return;

  // Ask for confirmation
  const confirmed = await confirm({
    title: t('admin.orders.shippingBanner.confirmTitle'),
    message: t('admin.orders.shippingBanner.confirmMessage'),
    confirmText: t('admin.orders.shippingBanner.button'),
    cancelText: t('common.cancel'),
    variant: 'success',
    icon: 'check',
  });

  if (!confirmed) return;

  isUpdatingStatus.value = true;
  try {
    const orderId = route.params.id;
    await update('orders', orderId, {
      orderStatus: 'shipped',
    });

    // Refresh order data to get updated status and status logs
    await fetchOrder();
  } catch (error) {
    console.error('Failed to update order status:', error);
  } finally {
    isUpdatingStatus.value = false;
  }
};

// Fetch order on mount
await fetchOrder();

// Fetch unread counts if not already loaded
if (authStore.adminUser?.id && adminUnreadStore.counts.length === 0) {
  await adminUnreadStore.fetchUnreadCounts(String(authStore.adminUser.id));
}
</script>

<style scoped>
/* Page Layout */
.order-page-layout {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  flex: 1;
  min-height: 0;
}

/* Order Content (Left Side) */
.order-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

/* Chat Panel (Right Side) */
.chat-panel {
  width: 380px;
  min-width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  position: sticky;
  top: 2rem;
}

/* Order Summary Header */
.order-summary-header {
  display: flex;
  justify-content: space-around;
  gap: 2rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--admin-border);
}

/* Responsive */
@media (max-width: 1200px) {
  .order-page-layout {
    flex-direction: column;
  }

  .chat-panel {
    width: 100%;
    min-width: 100%;
    height: 500px;
    position: static;
  }
}

@media (max-width: 768px) {
  .order-page-layout {
    padding: 1rem;
  }

  .order-summary-header {
    flex-direction: column;
    gap: 1rem;
  }

  .chat-panel {
    height: 400px;
  }
}
</style>
