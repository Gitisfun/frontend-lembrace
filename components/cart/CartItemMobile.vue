<template>
  <div class="cart-item-mobile">
    <div class="item-header">
      <div class="item-image">
        <NuxtImg :src="item.image?.formats?.thumbnail?.url" :alt="item.name" width="80" height="80" format="webp" provider="strapi" class="product-image" />
      </div>
      <div class="item-main-info">
        <h3 class="item-name">{{ item.name }}</h3>
        <div class="item-price">€{{ (item.price * item.quantity).toFixed(2) }}</div>
      </div>
      <button @click="$emit('remove')" class="remove-btn" aria-label="Remove item">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="item-details">
      <div v-if="item.selectedMaterials?.length" class="item-materials">
        <span v-for="materialId in item.selectedMaterials" :key="materialId" class="material-tag">
          {{ getMaterialLabel(materialId) }}
        </span>
      </div>

      <div class="item-controls">
        <div class="quantity-controls">
          <span class="quantity-label">Quantity:</span>
          <div class="item-quantity">
            <button @click="updateQuantity(item.quantity - 1)" class="quantity-btn" :disabled="item.quantity <= 1" aria-label="Decrease quantity">−</button>
            <span class="quantity-value">{{ item.quantity }}</span>
            <button @click="updateQuantity(item.quantity + 1)" class="quantity-btn" aria-label="Increase quantity">+</button>
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
  materials: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:quantity', 'remove']);

const updateQuantity = (newQuantity) => {
  if (newQuantity < 1) return;
  emit('update:quantity', newQuantity);
};

const getMaterialLabel = (materialId) => {
  const material = props.materials.find((material) => material.id === materialId);
  return material ? material.label : materialId;
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
  margin: 0 0 0.5rem;
  line-height: 1.3;
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

.item-materials {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.material-tag {
  background: #fcf8f3;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: var(--color-text);
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
