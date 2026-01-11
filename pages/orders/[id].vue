<template>
  <div class="order-detail-page">
    <div class="order-detail-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ $t('orders.detail.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="error-state">
        <IconAlertCircle :size="48" class="error-icon" />
        <h2 class="error-title">{{ $t('orders.detail.notFound') }}</h2>
        <p class="error-description">{{ $t('orders.detail.notFoundDesc') }}</p>
        <UiButton variant="primary" :to="localePath('/orders')" :text="$t('orders.detail.backToOrders')" />
      </div>

      <!-- Order Detail -->
      <template v-else-if="order">
        <!-- Header -->
        <div class="order-detail-header">
          <div class="header-info">
            <h1 class="order-title">{{ $t('orders.orderNumber') }}: {{ order.orderNumber }}</h1>
            <div class="order-meta">
              <span class="order-date">{{ formatDate(order.orderDate) }}</span>
              <span class="order-time">{{ formatTime(order.orderDate) }}</span>
            </div>
          </div>
          <span class="order-status" :class="order.orderStatus">
            {{ $t(`orders.status.${order.orderStatus}`) }}
          </span>
        </div>

        <!-- Order Content -->
        <div class="order-content">
          <!-- Products Section -->
          <section class="order-section">
            <h2 class="section-title">{{ $t('orders.detail.orderedItems') }}</h2>
            <div class="items-list">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <div class="item-image">
                  <img :src="getItemImage(item)" :alt="item.name" />
                </div>
                <div class="item-details">
                  <span class="item-name">{{ item.name }}</span>
                  <span v-if="item.materialName && item.materialName !== '-'" class="item-material">{{ item.materialName }}</span>
                  <span class="item-quantity">{{ $t('orders.quantity') }}: {{ item.amount }}</span>
                </div>
                <div class="item-price">
                  <span class="price-unit">{{ formatPrice(item.price) }} {{ $t('orders.detail.each') }}</span>
                  <span class="price-total">{{ formatPrice(item.calculatedPrice) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Order Summary -->
          <section class="order-section">
            <h2 class="section-title">{{ $t('orders.detail.summary') }}</h2>
            <div class="summary-card">
              <div class="summary-row">
                <span>{{ $t('orders.detail.subtotal') }}</span>
                <span>{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span>{{ $t('orders.detail.deliveryCost') }}</span>
                <span>{{ formatPrice(order.shippingCost || 0) }}</span>
              </div>
              <div class="summary-row total">
                <span>{{ $t('orders.total') }}</span>
                <span>{{ formatPrice(order.totalPrice) }}</span>
              </div>
            </div>
          </section>

          <!-- Contact Information -->
          <section class="order-section">
            <h2 class="section-title">{{ $t('orders.detail.contactInfo') }}</h2>
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">{{ $t('orders.detail.name') }}</span>
                <span class="info-value">{{ order.customerInfo?.firstname }} {{ order.customerInfo?.lastname }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ $t('orders.detail.email') }}</span>
                <span class="info-value">{{ order.customerInfo?.email }}</span>
              </div>
              <div v-if="order.customerInfo?.phone" class="info-row">
                <span class="info-label">{{ $t('orders.detail.phone') }}</span>
                <span class="info-value">{{ order.customerInfo?.phone }}</span>
              </div>
            </div>
          </section>

          <!-- Addresses -->
          <div class="addresses-grid">
            <!-- Delivery Address -->
            <section class="order-section">
              <h2 class="section-title">{{ $t('orders.detail.deliveryAddress') }}</h2>
              <div class="info-card">
                <p>{{ order.shippingAddress?.street }} {{ order.shippingAddress?.number }}{{ order.shippingAddress?.box ? ` / ${order.shippingAddress.box}` : '' }}</p>
                <p>{{ order.shippingAddress?.postalcode }} {{ order.shippingAddress?.city }}</p>
                <p>{{ order.shippingAddress?.country }}</p>
              </div>
            </section>

            <!-- Billing Address -->
            <section class="order-section">
              <h2 class="section-title">{{ $t('orders.detail.billingAddress') }}</h2>
              <div class="info-card">
                <p>{{ order.billingAddress?.street }} {{ order.billingAddress?.number }}{{ order.billingAddress?.box ? ` / ${order.billingAddress.box}` : '' }}</p>
                <p>{{ order.billingAddress?.postalcode }} {{ order.billingAddress?.city }}</p>
                <p>{{ order.billingAddress?.country }}</p>
              </div>
            </section>
          </div>

          <!-- Chat Section -->
          <section class="order-section chat-section">
            <h2 class="section-title">{{ $t('orders.chat.sectionTitle') }}</h2>
            <CustomerOrderChat :orderId="String(route.params.id)" :orderNumber="order.orderNumber" />
          </section>
        </div>

        <!-- Back Button -->
        <div class="back-link">
          <UiButton variant="ghost" :to="localePath('/orders')" icon-left="←" :text="$t('orders.detail.backToOrders')" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { formatPrice } from '~/logic/utils';
import CustomerOrderChat from '~/components/customer/OrderChat.vue';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const route = useRoute();
const { findOne } = useStrapi();
const config = useRuntimeConfig();

// State
const order = ref(null);
const isLoading = ref(true);
const hasError = ref(false);

// SEO Meta
useSeoMeta({
  title: () => (order.value ? `${t('orders.orderNumber')} ${order.value.orderNumber} | L'embrace` : `${t('orders.detail.loading')} | L'embrace`),
  description: () => t('seo.orders.description'),
  robots: 'noindex, nofollow',
});

// Redirect if not logged in
if (!authStore.isAuthenticated) {
  navigateTo(localePath('/login'));
}

// Computed
const subtotal = computed(() => (order.value?.totalPrice || 0) - (order.value?.shippingCost || 0));

// Get item image URL from product relation
const getItemImage = (item) => {
  const image = item.productId?.image?.[0];
  if (image) {
    const imageUrl = image.formats?.thumbnail?.url || image.url;
    return `${config.public.strapiUrl}${imageUrl}`;
  }
  return '/placeholder-product.png';
};

// Format date based on locale
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'nl' ? 'nl-BE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time based on locale
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
      filters: {
        customerId: authStore.user?.id,
      },
      populate: {
        customerInfo: true,
        shippingAddress: true,
        billingAddress: true,
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
      // Verify that the order belongs to the current user
      if (response.data.customerId === authStore.user?.id) {
        order.value = response.data;
      } else {
        hasError.value = true;
      }
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
.order-detail-page {
  background: var(--gradient-gold-vertical);
  min-height: calc(100vh - 70px);
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  overflow-x: hidden;
  box-sizing: border-box;
}

.order-detail-container {
  max-width: 800px;
  width: 100%;
  box-sizing: border-box;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #f0f0f0;
  border-top-color: var(--color-primary);
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
  color: var(--color-text-light);
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
  text-align: center;
}

.error-icon {
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.error-title {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.error-description {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
}

/* Header */
.order-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
  box-shadow: var(--shadow-soft);
  margin-bottom: 2px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-title {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  color: var(--color-text);
  font-weight: 600;
  margin: 0;
}

.order-meta {
  display: flex;
  gap: 1rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.order-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  flex-shrink: 0;
}

.order-status.delivered {
  background: #e8f5e9;
  color: #2e7d32;
}

.order-status.shipped {
  background: #e3f2fd;
  color: #1565c0;
}

.order-status.processing {
  background: #fff3e0;
  color: #ef6c00;
}

.order-status.pending {
  background: #fff3e0;
  color: #ef6c00;
}

.order-status.paid {
  background: #e8f5e9;
  color: #2e7d32;
}

.order-status.cancelled {
  background: #ffebee;
  color: #c62828;
}

.order-status.refunded {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* Order Content */
.order-content {
  background: white;
  padding: 1.5rem;
  border-radius: 0 0 12px 12px;
  box-shadow: var(--shadow-soft);
}

/* Sections */
.order-section {
  margin-bottom: 2rem;
}

.order-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
}

/* Items List */
.items-list {
  background: #f8f8f8;
  border-radius: 8px;
  overflow: hidden;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
}

.item-material {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.item-quantity {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.item-price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.price-unit {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.price-total {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Summary Card */
.summary-card {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.summary-row.total {
  border-top: 1px solid #ddd;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text);
}

/* Info Card */
.info-card {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.info-value {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}

.info-card p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
}

/* Addresses Grid */
.addresses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Chat Section */
.chat-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

/* Back Link */
.back-link {
  margin-top: 2rem;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .order-detail-header {
    flex-direction: column;
    gap: 1rem;
  }

  .order-title {
    font-size: 1.25rem;
  }

  .order-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .addresses-grid {
    grid-template-columns: 1fr;
  }

  .order-item {
    flex-wrap: wrap;
  }

  .item-price {
    width: 100%;
    text-align: right;
    margin-top: 0.5rem;
    flex-direction: row;
    justify-content: flex-end;
    gap: 0.75rem;
    align-items: center;
  }

  .info-row {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .order-detail-page {
    padding: 1rem 0.5rem;
  }

  .order-detail-header,
  .order-content {
    padding: 1rem;
  }
}

/* Animation */
.order-detail-header,
.order-content {
  animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
