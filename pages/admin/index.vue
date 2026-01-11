<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.dashboard.title')" :subtitle="$t('admin.dashboard.subtitle')">
      <template #actions>
        <AdminActionButton @click="refreshData" :disabled="isLoading" :loading="isLoading">
          <template #icon>
            <IconRefresh :size="16" />
          </template>
          {{ $t('admin.dashboard.refresh') }}
        </AdminActionButton>
      </template>
    </AdminHeader>

    <div class="dashboard-content">
      <!-- Loading State -->
      <AdminLoadingState v-if="isLoading" :message="$t('admin.dashboard.loading')" />

      <!-- Stats Content -->
      <div v-else class="stats-sections">
        <!-- Revenue Stats -->
        <DashboardStatsSection :title="$t('admin.dashboard.sections.revenue')">
          <template #icon>
            <IconDollarSign :size="18" />
          </template>

          <DashboardStatCard :label="$t('admin.dashboard.stats.totalRevenue')" :value="formatPrice(stats.totalRevenue)" variant="revenue" highlight>
            <template #icon>
              <IconTrendingUp :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.revenueToday')" :value="formatPrice(stats.revenueToday)" variant="today">
            <template #icon>
              <IconCalendar :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.revenueThisWeek')" :value="formatPrice(stats.revenueThisWeek)" variant="week">
            <template #icon>
              <IconCalendar :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.revenueThisMonth')" :value="formatPrice(stats.revenueThisMonth)" variant="month">
            <template #icon>
              <IconCalendar :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.averageOrderValue')" :value="formatPrice(stats.averageOrderValue)" variant="average">
            <template #icon>
              <IconBarChart :size="24" />
            </template>
          </DashboardStatCard>
        </DashboardStatsSection>

        <DashboardRevenueChart :title="$t('admin.dashboard.charts.revenuePerDay')" :orders="orders" />

        <!-- Order Stats -->
        <DashboardStatsSection :title="$t('admin.dashboard.sections.orders')">
          <template #icon>
            <IconDocument :size="18" />
          </template>

          <DashboardStatCard :label="$t('admin.dashboard.stats.totalOrders')" :value="stats.totalOrders" variant="orders">
            <template #icon>
              <IconDocument :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.ordersToday')" :value="stats.ordersToday" variant="today">
            <template #icon>
              <IconClock :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.ordersThisWeek')" :value="stats.ordersThisWeek" variant="week">
            <template #icon>
              <IconClock :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.ordersThisMonth')" :value="stats.ordersThisMonth" variant="month">
            <template #icon>
              <IconClock :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.pendingOrders')" :value="stats.pendingOrders" variant="pending" :has-action="stats.pendingOrders > 0">
            <template #icon>
              <IconClock :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.ordersToShip')" :value="stats.ordersToShip" variant="shipping" :has-action="stats.ordersToShip > 0">
            <template #icon>
              <IconTruck :size="24" />
            </template>
          </DashboardStatCard>

          <template #footer>
            <DashboardStatusBreakdown :title="$t('admin.dashboard.stats.ordersByStatus')" :statuses="stats.ordersByStatus" />
          </template>
        </DashboardStatsSection>

        <DashboardOrdersChart :title="$t('admin.dashboard.charts.ordersPerDay')" :orders="orders" />

        <!-- Customer Stats -->
        <DashboardStatsSection :title="$t('admin.dashboard.sections.customers')">
          <template #icon>
            <IconUsers :size="18" />
          </template>

          <DashboardStatCard :label="$t('admin.dashboard.stats.totalCustomers')" :value="stats.totalCustomers" variant="customers">
            <template #icon>
              <IconUsers :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.newCustomersThisMonth')" :value="stats.newCustomersThisMonth" variant="new">
            <template #icon>
              <IconUserPlus :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.repeatCustomers')" :value="stats.repeatCustomers" variant="repeat">
            <template #icon>
              <IconRepeat :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.guestOrders')" :value="stats.guestOrders" variant="guest">
            <template #icon>
              <IconUser :size="24" />
            </template>
          </DashboardStatCard>
        </DashboardStatsSection>

        <!-- Product Stats -->
        <DashboardStatsSection :title="$t('admin.dashboard.sections.products')">
          <template #icon>
            <IconShoppingBag :size="18" />
          </template>

          <DashboardStatCard :label="$t('admin.dashboard.stats.totalProducts')" :value="stats.totalProducts" variant="products">
            <template #icon>
              <IconShoppingBag :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.lowStockProducts')" :value="stats.lowStockProducts" variant="low-stock" :has-warning="stats.lowStockProducts > 0">
            <template #icon>
              <IconAlertTriangle :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.outOfStockProducts')" :value="stats.outOfStockProducts" variant="out-of-stock" :has-danger="stats.outOfStockProducts > 0">
            <template #icon>
              <IconXCircle :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.categories')" :value="stats.totalCategories" variant="categories">
            <template #icon>
              <IconGrid :size="24" />
            </template>
          </DashboardStatCard>

          <template #footer>
            <DashboardBestSellers :title="$t('admin.dashboard.stats.bestSellers')" :products="stats.bestSellers" />
          </template>
        </DashboardStatsSection>

        <!-- Activity Stats -->
        <DashboardStatsSection :title="$t('admin.dashboard.sections.activity')">
          <template #icon>
            <IconActivity :size="18" />
          </template>

          <DashboardStatCard :label="$t('admin.dashboard.stats.unreadMessages')" :value="adminUnreadStore.totalUnread" variant="messages" :has-action="adminUnreadStore.totalUnread > 0">
            <template #icon>
              <IconMessageCircle :size="24" />
            </template>
          </DashboardStatCard>

          <DashboardStatCard :label="$t('admin.dashboard.stats.ordersNeedingAction')" :value="stats.ordersNeedingAction" variant="action" :has-action="stats.ordersNeedingAction > 0">
            <template #icon>
              <IconAlertCircle :size="24" />
            </template>
          </DashboardStatCard>
        </DashboardStatsSection>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatPrice } from '~/logic/utils';
import { useAuthStore } from '~/stores/auth';
import { useAdminUnreadMessagesStore } from '~/stores/adminUnreadMessages';
import { useToast } from '~/composables/useToast';

// Layout Components
import AdminLayout from '~/components/admin/AdminLayout.vue';
import AdminHeader from '~/components/admin/AdminHeader.vue';
import AdminActionButton from '~/components/admin/AdminActionButton.vue';
import AdminLoadingState from '~/components/admin/AdminLoadingState.vue';

// Dashboard Components
import DashboardStatCard from '~/components/admin/DashboardStatCard.vue';
import DashboardStatsSection from '~/components/admin/DashboardStatsSection.vue';
import DashboardStatusBreakdown from '~/components/admin/DashboardStatusBreakdown.vue';
import DashboardBestSellers from '~/components/admin/DashboardBestSellers.vue';
import DashboardRevenueChart from '~/components/admin/DashboardRevenueChart.vue';
import DashboardOrdersChart from '~/components/admin/DashboardOrdersChart.vue';

// Icons
import IconRefresh from '~/components/icon/IconRefresh.vue';
import IconDollarSign from '~/components/icon/IconDollarSign.vue';
import IconTrendingUp from '~/components/icon/IconTrendingUp.vue';
import IconCalendar from '~/components/icon/IconCalendar.vue';
import IconBarChart from '~/components/icon/IconBarChart.vue';
import IconDocument from '~/components/icon/IconDocument.vue';
import IconClock from '~/components/icon/IconClock.vue';
import IconTruck from '~/components/icon/IconTruck.vue';
import IconUsers from '~/components/icon/IconUsers.vue';
import IconUserPlus from '~/components/icon/IconUserPlus.vue';
import IconRepeat from '~/components/icon/IconRepeat.vue';
import IconUser from '~/components/icon/IconUser.vue';
import IconShoppingBag from '~/components/icon/IconShoppingBag.vue';
import IconAlertTriangle from '~/components/icon/IconAlertTriangle.vue';
import IconXCircle from '~/components/icon/IconXCircle.vue';
import IconGrid from '~/components/icon/IconGrid.vue';
import IconActivity from '~/components/icon/IconActivity.vue';
import IconMessageCircle from '~/components/icon/IconMessageCircle.vue';
import IconAlertCircle from '~/components/icon/IconAlertCircle.vue';

definePageMeta({
  layout: false,
  middleware: ['admin'],
});

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const adminUnreadStore = useAdminUnreadMessagesStore();
const { find } = useStrapi();
const { success: toastSuccess } = useToast();

// State
const orders = ref([]);
const products = ref([]);
const categories = ref([]);
const isLoading = ref(true);

// Date helpers
const getStartOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getStartOfWeek = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getStartOfMonth = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Computed stats
const stats = computed(() => {
  const startOfDay = getStartOfDay();
  const startOfWeek = getStartOfWeek();
  const startOfMonth = getStartOfMonth();

  // Filter orders by time periods
  const ordersToday = orders.value.filter((o) => new Date(o.orderDate) >= startOfDay);
  const ordersThisWeek = orders.value.filter((o) => new Date(o.orderDate) >= startOfWeek);
  const ordersThisMonth = orders.value.filter((o) => new Date(o.orderDate) >= startOfMonth);

  // Revenue calculations (only count paid orders - not pending or cancelled)
  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered'];
  const paidOrders = orders.value.filter((o) => paidStatuses.includes(o.orderStatus));
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const revenueToday = ordersToday.filter((o) => paidStatuses.includes(o.orderStatus)).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const revenueThisWeek = ordersThisWeek.filter((o) => paidStatuses.includes(o.orderStatus)).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const revenueThisMonth = ordersThisMonth.filter((o) => paidStatuses.includes(o.orderStatus)).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Orders by status
  const ordersByStatus = {};
  const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  statusOrder.forEach((status) => {
    const count = orders.value.filter((o) => o.orderStatus === status).length;
    if (count > 0) {
      ordersByStatus[status] = count;
    }
  });

  // Pending and to ship counts
  const pendingOrders = orders.value.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'paid').length;
  const ordersToShip = orders.value.filter((o) => o.orderStatus === 'processing').length;
  const ordersNeedingAction = pendingOrders + ordersToShip;

  // Customer stats - extract unique customers from orders
  const customerMap = new Map();
  orders.value.forEach((order) => {
    if (order.customerId) {
      if (!customerMap.has(order.customerId)) {
        customerMap.set(order.customerId, {
          id: order.customerId,
          orderCount: 1,
          firstOrderDate: order.orderDate,
        });
      } else {
        const existing = customerMap.get(order.customerId);
        existing.orderCount += 1;
        if (new Date(order.orderDate) < new Date(existing.firstOrderDate)) {
          existing.firstOrderDate = order.orderDate;
        }
      }
    }
  });

  const totalCustomers = customerMap.size;
  const newCustomersThisMonth = Array.from(customerMap.values()).filter((c) => new Date(c.firstOrderDate) >= startOfMonth).length;
  const repeatCustomers = Array.from(customerMap.values()).filter((c) => c.orderCount > 1).length;
  const guestOrders = orders.value.filter((o) => !o.customerId).length;

  // Product stats
  const totalProducts = products.value.length;
  const lowStockProducts = products.value.filter((p) => (p.amount ?? 0) > 0 && (p.amount ?? 0) <= 5).length;
  const outOfStockProducts = products.value.filter((p) => (p.amount ?? 0) === 0).length;
  const totalCategories = categories.value.length;

  // Best sellers - count products from order items
  const productSales = new Map();
  orders.value.forEach((order) => {
    if (paidStatuses.includes(order.orderStatus) && order.items) {
      order.items.forEach((item) => {
        const productId = item.productId?.id || item.productId;
        const productName = item.productId?.name || item.name || 'Unknown';
        if (productId) {
          if (!productSales.has(productId)) {
            productSales.set(productId, { id: productId, name: productName, sold: 0 });
          }
          productSales.get(productId).sold += item.quantity || 1;
        }
      });
    }
  });

  const bestSellers = Array.from(productSales.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  return {
    // Revenue
    totalRevenue,
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
    averageOrderValue,
    // Orders
    totalOrders: orders.value.length,
    ordersToday: ordersToday.length,
    ordersThisWeek: ordersThisWeek.length,
    ordersThisMonth: ordersThisMonth.length,
    pendingOrders,
    ordersToShip,
    ordersNeedingAction,
    ordersByStatus,
    // Customers
    totalCustomers,
    newCustomersThisMonth,
    repeatCustomers,
    guestOrders,
    // Products
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    totalCategories,
    bestSellers,
  };
});

// Fetch data
const fetchData = async () => {
  isLoading.value = true;

  try {
    // Fetch orders
    const ordersResponse = await find('orders', {
      populate: {
        customerInfo: true,
        items: {
          populate: {
            productId: true,
          },
        },
      },
      sort: ['createdAt:desc'],
    });
    orders.value = ordersResponse.data || [];

    // Fetch products
    const productsResponse = await find('products', {
      populate: {
        subcategory: {
          populate: ['category'],
        },
      },
    });
    products.value = productsResponse.data || [];

    // Fetch categories
    const categoriesResponse = await find('categories');
    categories.value = categoriesResponse.data || [];

    // Fetch unread message counts
    if (authStore.adminUser?.id) {
      await adminUnreadStore.fetchUnreadCounts(String(authStore.adminUser.id));
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

const refreshData = async () => {
  await fetchData();
  toastSuccess(t('admin.dashboard.refreshed'));
};

// SEO Meta
useSeoMeta({
  title: () => t('seo.admin.dashboard.title'),
  description: () => t('seo.admin.dashboard.description'),
  robots: 'noindex, nofollow',
});

// Fetch data on mount
await fetchData();
</script>

<style scoped>
.dashboard-content {
  padding: 2rem;
  flex: 1;
}

/* Stats Sections */
.stats-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* Responsive */
@media (max-width: 480px) {
  .dashboard-content {
    padding: 1rem;
  }
}
</style>
