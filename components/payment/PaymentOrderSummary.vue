<template>
  <div class="order-summary">
    <h2>{{ $t('payment.orderSummary') }}</h2>
    <div class="summary-items">
      <div v-for="item in items" :key="item.id" class="summary-item">
        <div class="item-info">
          <span class="item-name">{{ item.name }}</span>
          <div v-if="item.material" class="item-material">
            <span class="material-swatch" :style="{ backgroundColor: item.material.color }"></span>
          </div>
          <div v-if="item.promotionCode" class="item-promotion">
            <PromotionBadge :code="item.promotionCode" :discount="item.promotionDiscount" size="sm" />
          </div>
          <span class="item-quantity">x{{ item.amount }}</span>
        </div>
        <span class="item-price">€{{ item.calculatedPrice.toFixed(2) }}</span>
      </div>
    </div>
    <div class="summary-totals">
      <div class="summary-row">
        <span>{{ $t('cart.subtotal') }}</span>
        <span>€{{ subtotal.toFixed(2) }}</span>
      </div>
      <div class="summary-row">
        <span>{{ $t('cart.shipping') }}</span>
        <span>€{{ shippingCost.toFixed(2) }}</span>
      </div>
      <div class="summary-row total">
        <span>{{ $t('cart.total') }}</span>
        <span>€{{ total.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  shippingCost: {
    type: Number,
    required: true,
  },
});

const total = computed(() => props.subtotal + props.shippingCost);
</script>

<style scoped>
.order-summary {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.order-summary h2 {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.summary-items {
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 500;
}

.item-material {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.material-swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
}

.material-name {
  font-size: 0.85rem;
  color: #666;
}

.item-promotion {
  margin-top: 0.15rem;
}

.item-quantity {
  font-size: 0.9rem;
  color: #666;
}

.item-price {
  font-weight: 500;
}

.summary-totals {
  margin-top: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: var(--color-text);
}

.summary-row.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 600;
  font-size: 1.2rem;
}

@media (max-width: 1024px) {
  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .order-summary {
    padding: 1.5rem;
  }

  .order-summary h2 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
}
</style>
