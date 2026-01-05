<template>
  <div class="cart-item">
    <NuxtImg :src="item.image" :alt="item.name" width="120" height="120" format="webp" provider="strapi" class="product-image" />
    <div class="item-details">
      <h3 class="item-name">{{ item.name }}</h3>
      <div v-if="item.material" class="item-material">
        <span class="material-swatch" :style="{ backgroundColor: item.material.color }"></span>
      </div>
    </div>
    <div class="item-quantity">
      <button @click="updateQuantity(item.amount - 1)" class="quantity-btn" :disabled="item.amount <= 1">−</button>
      <span class="quantity-value">{{ item.amount }}</span>
      <button @click="updateQuantity(item.amount + 1)" class="quantity-btn">+</button>
    </div>
    <div class="item-price">€{{ item.calculatedPrice.toFixed(2) }}</div>
    <button @click="$emit('remove')" class="remove-btn">
      <IconX :size="20" />
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
  overflow: hidden;
  background: #f8f8f8;
}

.product-image {
  border-radius: 8px;
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

.item-material {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.material-swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
}

.material-name {
  font-size: 0.9rem;
  color: #666;
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
