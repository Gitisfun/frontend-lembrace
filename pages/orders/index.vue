<template>
  <div class="orders-page">
    <div class="orders-container">
      <div class="orders-header">
        <h1 class="orders-title">{{ $t('orders.title') }}</h1>
        <p class="orders-subtitle">{{ $t('orders.subtitle') }}</p>
      </div>

      <div v-if="orders.length === 0" class="empty-state">
        <IconPackage :size="64" class="empty-icon" />
        <h2 class="empty-title">{{ $t('orders.empty.title') }}</h2>
        <p class="empty-description">{{ $t('orders.empty.description') }}</p>
        <UiButton variant="primary" :to="localePath('/products')" :text="$t('orders.empty.browseProducts')" />
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">{{ $t('orders.orderNumber') }}: {{ order.orderNumber }}</span>
              <span class="order-time">{{ formatTime(order.orderDate) }}</span>
              <span class="order-date">{{ formatDate(order.orderDate) }}</span>
            </div>
            <span class="order-status" :class="order.orderStatus">
              {{ $t(`orders.status.${order.orderStatus}`) }}
            </span>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-image">
                <img :src="getItemImage(item)" :alt="item.name" />
              </div>
              <div class="item-details">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-quantity">{{ $t('orders.quantity') }}: {{ item.amount }}</span>
              </div>
              <div class="item-price">{{ formatPrice(item.calculatedPrice) }}</div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span class="total-label">{{ $t('orders.total') }}:</span>
              <span class="total-value">{{ formatPrice(order.totalPrice) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="back-link">
        <UiButton variant="ghost" :to="localePath('/profile')" icon-left="←" :text="$t('orders.backToProfile')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { formatPrice } from '~/logic/utils';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const { find } = useStrapi();
const config = useRuntimeConfig();
const orders = ref([]);

// Get item image URL from product relation
const getItemImage = (item) => {
  const image = item.productId?.image?.[0];
  if (image) {
    const imageUrl = image.formats?.thumbnail?.url || image.url;
    return `${config.public.strapiUrl}${imageUrl}`;
  }
  return '/placeholder-product.png';
};

// SEO Meta
useSeoMeta({
  title: () => t('seo.orders.title'),
  description: () => t('seo.orders.description'),
  robots: 'noindex, nofollow',
});

// Redirect if not logged in
if (!authStore.isAuthenticated) {
  navigateTo(localePath('/login'));
}

const fetchContent = async () => {
  try {
    //isLoading.value = true;
    //hasError.value = false;
    const response = await find('orders', {
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
              populate: '*',
            },
          },
        },
      },
    });
    orders.value = response.data;
    console.log('response');
    console.log(response);
    //pageContent.value = response;
  } catch (error) {
    console.error('Failed to load homepage content:', error);
    //hasError.value = true;
  } finally {
    //isLoading.value = false;
  }
};

console.log('fetchContent');

await fetchContent();

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
// Dummy orders data
/*
const orders = ref([
  {
    id: '1',
    orderNumber: 'ORD-2024-001234',
    date: '2024-12-05',
    status: 'delivered',
    total: 89.99,
    items: [
      {
        id: '1',
        name: 'Gold Pearl Earrings',
        quantity: 1,
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop',
      },
      {
        id: '2',
        name: 'Silver Chain Necklace',
        quantity: 1,
        price: 40.0,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&h=100&fit=crop',
      },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-001198',
    date: '2024-11-28',
    status: 'shipped',
    total: 65.5,
    items: [
      {
        id: '3',
        name: 'Rose Gold Bracelet',
        quantity: 2,
        price: 32.75,
        image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=100&h=100&fit=crop',
      },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-001156',
    date: '2024-11-15',
    status: 'processing',
    total: 125.0,
    items: [
      {
        id: '4',
        name: 'Diamond Pendant',
        quantity: 1,
        price: 125.0,
        image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=100&h=100&fit=crop',
      },
    ],
  },
]);
*/
</script>

<style scoped>
.orders-page {
  background: var(--gradient-gold-vertical);
  min-height: calc(100vh - 70px);
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.orders-container {
  max-width: 700px;
  width: 100%;
}

.orders-header {
  text-align: center;
  margin-bottom: 2rem;
}

.orders-title {
  font-family: var(--font-primary);
  font-size: 2.2rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.orders-subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-light);
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-soft);
}

.empty-icon {
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-title {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.empty-description {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  animation: fadeInUp 0.5s ease forwards;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  background: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-number {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.order-time {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.order-date {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.order-status {
  padding: 0.35rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
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

.order-status.cancelled {
  background: #ffebee;
  color: #c62828;
}

.order-items {
  padding: 1rem 1.25rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
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

.item-quantity {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.item-price {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #fafafa;
  border-top: 1px solid #eee;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.total-label {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.total-value {
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.back-link {
  margin-top: 2rem;
  text-align: center;
}

@media (max-width: 768px) {
  .orders-title {
    font-size: 1.8rem;
  }

  .order-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .order-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .order-total {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .orders-page {
    padding: 1rem 0.5rem;
  }

  .order-item {
    flex-wrap: wrap;
  }

  .item-price {
    width: 100%;
    text-align: right;
    margin-top: 0.25rem;
  }
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
