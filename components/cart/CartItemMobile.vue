<template>
  <div class="cart-item-mobile">
    <div class="item-header">
      <div class="item-image">
        <NuxtImg :src="item.image" :alt="item.name" width="80" height="80" format="webp" provider="strapi" class="product-image" />
      </div>
      <div class="item-main-info">
        <h3 class="item-name">{{ item.name }}</h3>
        <div v-if="item.material" class="item-material">
          <span class="material-swatch" :style="{ backgroundColor: item.material.color }"></span>
        </div>
        <div class="item-price">€{{ item.calculatedPrice.toFixed(2) }}</div>
      </div>
      <button @click="$emit('remove')" class="remove-btn" aria-label="Remove item">
        <IconX :size="18" />
      </button>
    </div>

    <div class="item-details">
      <div class="item-controls">
        <div class="quantity-controls">
          <span class="quantity-label">Quantity:</span>
          <div class="item-quantity">
            <button @click="updateQuantity(item.amount - 1)" class="quantity-btn" :disabled="item.amount <= 1" aria-label="Decrease quantity">−</button>
            <span class="quantity-value">{{ item.amount }}</span>
            <button @click="updateQuantity(item.amount + 1)" class="quantity-btn" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>
    </div>
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
.cart-item-mobile {
  padding: 1rem;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.item-header {
  display: flex;
  gap: 1rem;
  position: relative;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f8f8;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-main-info {
  flex: 1;
  min-width: 0;
  padding-right: 2rem;
}

.item-name {
  font-family: var(--font-primary);
  font-size: 1.1rem;
  color: var(--color-text);
  margin: 0 0 0.25rem;
  line-height: 1.3;
}

.item-material {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.35rem;
}

.material-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
}

.material-name {
  font-size: 0.85rem;
  color: #666;
}

.item-price {
  font-weight: 600;
  color: var(--color-text);
  font-size: 1.1rem;
}

.item-details {
  margin-top: 1rem;
  padding-left: calc(80px + 1rem);
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quantity-label {
  font-size: 0.9rem;
  color: #666;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f8f8;
  padding: 0.25rem;
  border-radius: 6px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-gold);
  background: white;
  border-radius: 4px;
  color: var(--color-gold);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  padding: 0;
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
  min-width: 24px;
  text-align: center;
  font-weight: 500;
}

.remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #666;
}
</style>
