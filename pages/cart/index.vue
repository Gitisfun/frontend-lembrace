<template>
  <div class="cart-page">
    <div v-if="!cartItems.length" class="empty-cart">
      <p>{{ $t('cart.empty') }}</p>
      <UiButton variant="primary" :to="localePath('/products')" :text="$t('cart.viewProducts')" />
    </div>

    <div v-else class="cart-content">
      <!-- Cart Items -->
      <div class="cart-items">
        <h2>{{ $t('cart.title') }}</h2>
        <template v-if="!isMobile">
          <CartItem v-for="item in cartItems" :key="item.id" :item="item" @update:quantity="(quantity) => updateItemQuantity(item, quantity)" @remove="removeFromCart(item)" />
        </template>
        <template v-else>
          <CartItemMobile v-for="item in cartItems" :key="item.id" :item="item" @update:quantity="(quantity) => updateItemQuantity(item, quantity)" @remove="removeFromCart(item)" />
        </template>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h2>{{ $t('cart.summary') }}</h2>
        <div class="summary-row">
          <span>{{ $t('cart.subtotal') }}</span>
          <span>€{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>{{ $t('cart.shipping') }}</span>
          <span v-if="isLoadingShipping" class="price-skeleton"></span>
          <span v-else>€{{ shippingCost.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>{{ $t('cart.total') }}</span>
          <span v-if="isLoadingShipping" class="price-skeleton"></span>
          <span v-else>€{{ total.toFixed(2) }}</span>
        </div>
        <UiButton variant="primary" full-width :text="$t('cart.checkout')" class="checkout-btn" @click="handleCheckout" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { useGlobalStore } from '~/stores/global';
import { useToast } from '~/composables/useToast';
import CartItem from '~/components/cart/CartItem.vue';
import CartItemMobile from '~/components/cart/CartItemMobile.vue';

const { t } = useI18n();
const localePath = useLocalePath();
const { success: toastSuccess } = useToast();
const { find } = useStrapi();

// SEO Meta
useSeoMeta({
  title: () => t('seo.cart.title'),
  description: () => t('seo.cart.description'),
  ogTitle: () => t('seo.cart.title'),
  ogDescription: () => t('seo.cart.description'),
  robots: 'noindex, nofollow',
});

const globalStore = useGlobalStore();
const cartItems = computed(() => globalStore.cartItems);

// Fetch default shipping cost from delivery options
const shippingCost = ref(0);
const isLoadingShipping = ref(true);

const fetchDefaultShippingCost = async () => {
  try {
    isLoadingShipping.value = true;
    const { data } = await find('delivery-options');

    if (data && data.length > 0) {
      const defaultOption = data.find((option) => option.isDefault);
      shippingCost.value = defaultOption?.price ?? data[0].price;
    }
  } catch (e) {
    console.error('Failed to fetch delivery options:', e);
  } finally {
    isLoadingShipping.value = false;
  }
};

onMounted(() => {
  fetchDefaultShippingCost();
});

const subtotal = computed(() => globalStore.cartTotal);
const total = computed(() => subtotal.value + shippingCost.value);

const isMobile = useMediaQuery('(max-width: 768px)');

const updateItemQuantity = (item, newQuantity) => {
  if (newQuantity < 1) return;
  globalStore.updateQuantity(item.id, newQuantity);
  toastSuccess(t('toast.cartUpdated'));
};

const removeFromCart = (item) => {
  globalStore.removeFromCart(item.id);
  toastSuccess(t('toast.removedFromCart'));
};

const handleCheckout = () => {
  navigateTo('/payment');
};
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  min-height: calc(100vh - 70px);
}

.cart-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: var(--color-text);
  margin-bottom: 2rem;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.cart-items {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
}

.cart-items h2 {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.order-summary {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  box-shadow: var(--shadow-soft);
}

.order-summary h2 {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.summary-row.total {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 600;
  font-size: 1.2rem;
}

.price-skeleton {
  display: inline-block;
  width: 50px;
  height: 1em;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.checkout-btn {
  margin-top: 1.5rem;
}

.empty-cart {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
}

.empty-cart p {
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding: 2rem 1rem;
  }

  .cart-items {
    padding: 1rem;
  }

  .cart-items h2 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .order-summary {
    padding: 1.5rem;
  }

  .order-summary h2 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .summary-row {
    font-size: 0.95rem;
  }

  .summary-row.total {
    font-size: 1.1rem;
  }
}
</style>
