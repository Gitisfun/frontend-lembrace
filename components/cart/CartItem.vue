<template>
  <div class="cart-item">
    <div class="item-image">
      <NuxtImg :src="item.image?.formats?.thumbnail?.url" :alt="item.name" width="120" height="120" format="webp" provider="strapi" class="product-image" />
    </div>
    <div class="item-details">
      <h3 class="item-name">{{ item.name }}</h3>
    </div>
    <div class="item-quantity">
      <button @click="updateQuantity(item.quantity - 1)" class="quantity-btn" :disabled="item.quantity <= 1">−</button>
      <span class="quantity-value">{{ item.quantity }}</span>
      <button @click="updateQuantity(item.quantity + 1)" class="quantity-btn">+</button>
    </div>
    <div class="item-price">€{{ (item.price * item.quantity).toFixed(2) }}</div>
    <button @click="$emit('remove')" class="remove-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:quantity', 'remove']);

const updateQuantity = (newQuantity) => {
  if (newQuantity < 1) return;
  emit('update:quantity', newQuantity);
};
</script>

<style scoped>
.cart-item {
  display: grid;
  grid-template-columns: 120px 1fr auto auto auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  border-radius: 8px;
  overflow: hidden;
  background: #f8f8f8;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  font-family: var(--font-primary);
  font-size: 1.2rem;
  color: var(--color-text);
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--color-gold);
  background: white;
  border-radius: 4px;
  color: var(--color-gold);
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--color-gold);
  color: white;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-value {
  min-width: 30px;
  text-align: center;
  font-weight: 500;
}

.item-price {
  font-weight: 600;
  color: var(--color-text);
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.remove-btn:hover {
  color: #666;
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }

  .item-quantity,
  .item-price {
    grid-column: 2;
  }

  .remove-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
}
</style>
