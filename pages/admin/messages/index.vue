<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.notifications.title')" :subtitle="$t('admin.notifications.subtitle')">
      <template #actions>
        <AdminActionButton @click="refreshAll" :disabled="isLoading" :loading="isLoading">
          <template #icon>
            <IconRefresh :size="16" />
          </template>
          {{ $t('admin.orders.refresh') }}
        </AdminActionButton>
      </template>
    </AdminHeader>

    <div class="notifications-content">
      <!-- Loading State -->
      <OrdersLoadingState v-if="isLoading" />

      <!-- Error State -->
      <OrdersErrorState v-else-if="hasError" @retry="refreshAll" />

      <!-- Content Sections -->
      <div v-else class="sections-container">
        <!-- Unread Messages Section -->
        <NotificationSection :title="$t('admin.notifications.messages.title')" :count="orders.length" :empty-text="$t('admin.notifications.messages.empty')" badge-variant="active">
          <template #icon>
            <IconMail :size="18" />
          </template>
          <OrdersTable :orders="orders" :strapiUrl="config.public.strapiUrl" :unreadCounts="adminUnreadStore.counts" />
        </NotificationSection>

        <!-- Out of Stock Products Section -->
        <NotificationSection :title="$t('admin.notifications.outOfStock.title')" :count="outOfStockProducts.length" :empty-text="$t('admin.notifications.outOfStock.empty')" badge-variant="warning" success-when-empty>
          <template #icon>
            <IconPackage :size="18" />
          </template>
          <ProductsTable :products="outOfStockProducts" :strapiUrl="config.public.strapiUrl" @stock-updated="onStockUpdated" />
        </NotificationSection>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from '~/composables/useToast';
import { useAuthStore } from '~/stores/auth';
import { useAdminUnreadMessagesStore } from '~/stores/adminUnreadMessages';
import AdminLayout from '~/components/admin/AdminLayout.vue';
import AdminHeader from '~/components/admin/AdminHeader.vue';
import AdminActionButton from '~/components/admin/AdminActionButton.vue';
import NotificationSection from '~/components/admin/NotificationSection.vue';
import OrdersLoadingState from '~/components/admin/OrdersLoadingState.vue';
import OrdersErrorState from '~/components/admin/OrdersErrorState.vue';
import OrdersTable from '~/components/admin/OrdersTable.vue';
import ProductsTable from '~/components/admin/ProductsTable.vue';
import IconRefresh from '~/components/icon/IconRefresh.vue';
import IconMail from '~/components/icon/IconMail.vue';
import IconPackage from '~/components/icon/IconPackage.vue';

definePageMeta({
  layout: false,
  middleware: ['admin'],
});

const { t } = useI18n();
const { find } = useStrapi();
const config = useRuntimeConfig();
const { success: toastSuccess } = useToast();
const authStore = useAuthStore();
const adminUnreadStore = useAdminUnreadMessagesStore();

// State
const orders = ref([]);
const products = ref([]);
const isLoading = ref(true);
const hasError = ref(false);

// Computed out of stock products
const outOfStockProducts = computed(() => {
  return products.value.filter((p) => (p.amount ?? 0) === 0);
});

// SEO Meta
useSeoMeta({
  title: () => t('seo.admin.notifications.title'),
  description: () => t('seo.admin.notifications.description'),
  robots: 'noindex, nofollow',
});

// Fetch orders with unread messages
const fetchOrdersWithUnreadMessages = async () => {
  try {
    // First, ensure we have unread counts
    if (authStore.adminUser?.id) {
      await adminUnreadStore.fetchUnreadCounts(String(authStore.adminUser.id));
    }

    // Get order numbers that have unread messages
    const orderNumbersWithUnread = adminUnreadStore.counts.filter((c) => c.unreadCount > 0).map((c) => c.roomName);

    if (orderNumbersWithUnread.length === 0) {
      orders.value = [];
      return;
    }

    // Fetch orders by order numbers
    const response = await find('orders', {
      filters: {
        orderNumber: {
          $in: orderNumbersWithUnread,
        },
      },
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

    // Sort by unread count (most unread first)
    ordersWithInitialLog.sort((a, b) => {
      const unreadA = adminUnreadStore.getUnreadByRoom(a.orderNumber);
      const unreadB = adminUnreadStore.getUnreadByRoom(b.orderNumber);
      return unreadB - unreadA;
    });

    orders.value = ordersWithInitialLog;
  } catch (error) {
    console.error('Failed to fetch orders with unread messages:', error);
    throw error;
  }
};

// Fetch products
const fetchProducts = async () => {
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
    throw error;
  }
};

// Fetch all data
const fetchAllData = async () => {
  isLoading.value = true;
  hasError.value = false;

  try {
    await Promise.all([fetchOrdersWithUnreadMessages(), fetchProducts()]);
  } catch (error) {
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const refreshAll = async () => {
  await fetchAllData();
  if (!hasError.value) {
    toastSuccess(t('admin.notifications.refreshed'));
  }
};

// Handle stock update from ProductsTable
const onStockUpdated = (product) => {
  // Product is already updated in the array by ProductsTable
  // The computed will automatically filter it out if stock > 0
};

// Fetch on mount
await fetchAllData();
</script>

<style scoped>
.notifications-content {
  padding: 2rem;
  flex: 1;
}

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .notifications-content {
    padding: 1rem;
  }
}
</style>
