<template>
  <div class="cart-page">
    <div v-if="!cartItems.length" class="empty-cart">
      <p>Je winkelwagen is leeg</p>
      <NuxtLink to="/products" class="continue-shopping">Bekijk onze producten</NuxtLink>
    </div>

    <div v-else class="cart-content">
      <!-- Cart Items -->
      <div class="cart-items">
        <h2>Mijn bestelling</h2>
        <template v-if="!isMobile">
          <CartItem v-for="item in cartItems" :key="item.id" :item="item" :materials="materials" @update:quantity="(quantity) => updateItemQuantity(item, quantity)" @remove="removeFromCart(item)" />
        </template>
        <template v-else>
          <CartItemMobile v-for="item in cartItems" :key="item.id" :item="item" :materials="materials" @update:quantity="(quantity) => updateItemQuantity(item, quantity)" @remove="removeFromCart(item)" />
        </template>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h2>Overzicht</h2>
        <div class="summary-row">
          <span>Subtotaal</span>
          <span>€{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Verzendkosten</span>
          <span>€{{ shippingCost.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>Totaal</span>
          <span>€{{ total.toFixed(2) }}</span>
        </div>
        <button class="checkout-btn" @click="handleCheckout">Verder naar betalen</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useGlobalStore } from '~/stores/global';
import CartItem from '~/components/cart/CartItem.vue';
import CartItemMobile from '~/components/cart/CartItemMobile.vue';

const globalStore = useGlobalStore();
const { find } = useStrapi();
const materials = ref([]);
const responseMaterials = await find('materials');
materials.value = responseMaterials.data;
const cartItems = computed(() => globalStore.cartItems);

const shippingCost = 2.5;
const subtotal = computed(() => globalStore.cartTotal);
const total = computed(() => subtotal.value + shippingCost);

const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const updateItemQuantity = (item, newQuantity) => {
  if (newQuantity < 1) return;
  globalStore.updateQuantity(item.id, newQuantity, item.selectedMaterials);
};

const removeFromCart = (item) => {
  globalStore.removeFromCart(item.id, item.selectedMaterials);
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

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: var(--color-gold);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
}

.checkout-btn:hover {
  background: #b88b2a;
  transform: translateY(-2px);
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

.continue-shopping {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--color-gold);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.continue-shopping:hover {
  background: #b88b2a;
  transform: translateY(-2px);
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

  .checkout-btn {
    font-size: 1rem;
    padding: 0.9rem;
  }
}
</style>
