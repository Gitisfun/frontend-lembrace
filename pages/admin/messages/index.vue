<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.messages.title')" :subtitle="$t('admin.messages.subtitle')">
      <template #actions>
        <AdminActionButton @click="refreshMessages" :disabled="isLoading" :loading="isLoading">
          <template #icon>
            <IconRefresh :size="16" />
          </template>
          {{ $t('admin.orders.refresh') }}
        </AdminActionButton>
      </template>
    </AdminHeader>

    <div class="messages-content">
      <!-- Loading State -->
      <OrdersLoadingState v-if="isLoading" />

      <!-- Error State -->
      <OrdersErrorState v-else-if="hasError" @retry="refreshMessages" />

      <!-- Empty State (no unread messages) -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <IconMail :size="64" class="empty-icon" />
        <h2 class="empty-title">{{ $t('admin.messages.emptyTitle') }}</h2>
        <p class="empty-message">{{ $t('admin.messages.emptyMessage') }}</p>
      </div>

      <!-- Orders with Unread Messages -->
      <div v-else class="orders-list">
        <!-- Orders Table -->
        <OrdersTable :orders="orders" :strapiUrl="config.public.strapiUrl" :unreadCounts="adminUnreadStore.counts" />
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
import OrdersLoadingState from '~/components/admin/OrdersLoadingState.vue';
import OrdersErrorState from '~/components/admin/OrdersErrorState.vue';
import OrdersTable from '~/components/admin/OrdersTable.vue';
import IconRefresh from '~/components/icon/IconRefresh.vue';
import IconMail from '~/components/icon/IconMail.vue';

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
const isLoading = ref(true);
const hasError = ref(false);

// SEO Meta
useSeoMeta({
  title: () => t('seo.admin.messages.title'),
  description: () => t('seo.admin.messages.description'),
  robots: 'noindex, nofollow',
});

// Fetch orders with unread messages
const fetchOrdersWithUnreadMessages = async () => {
  isLoading.value = true;
  hasError.value = false;

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
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const refreshMessages = async () => {
  await fetchOrdersWithUnreadMessages();
  if (!hasError.value) {
    toastSuccess(t('admin.orders.refreshed'));
  }
};

// Fetch on mount
await fetchOrdersWithUnreadMessages();
</script>

<style scoped>
.messages-content {
  padding: 2rem;
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  text-align: center;
}

.empty-icon {
  color: var(--admin-text-muted);
  opacity: 0.5;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0 0 0.5rem 0;
}

.empty-message {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--admin-text-muted);
  margin: 0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 10px;
  color: var(--admin-text);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
}

.info-banner svg {
  color: #f59e0b;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .messages-content {
    padding: 1rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }
}
</style>
