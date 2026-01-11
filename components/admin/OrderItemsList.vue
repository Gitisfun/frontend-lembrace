<template>
  <div class="details-section items-section">
    <h4>{{ $t('admin.orders.orderedItems') }}</h4>
    <div class="items-list">
      <div v-for="item in items" :key="item.id" class="item-row">
        <div class="item-image">
          <NuxtImg :src="getItemImageUrl(item)" :alt="item.name" width="50" height="50" format="webp" provider="strapi" />
        </div>
        <div class="item-info">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-material" v-if="item.materialName && item.materialName !== '-'">{{ item.materialName }}</span>
        </div>
        <div class="item-quantity">
          <span class="qty-label">{{ $t('admin.orders.qty') }}:</span>
          <span class="qty-value">{{ item.amount }}</span>
        </div>
        <div class="item-price">
          <span class="unit-price">{{ formatPrice(item.price) }} {{ $t('admin.orders.each') }}</span>
          <span class="total-price">{{ formatPrice(item.calculatedPrice) }}</span>
        </div>
      </div>
    </div>

    <!-- Order Summary -->
    <div class="order-summary">
      <div class="summary-row">
        <span>{{ $t('admin.orders.subtotal') }}</span>
        <span>{{ formatPrice(subtotal) }}</span>
      </div>
      <div class="summary-row">
        <span>{{ $t('admin.orders.shippingCost') }}</span>
        <span>{{ formatPrice(shippingCost) }}</span>
      </div>
      <div class="summary-row total">
        <span>{{ $t('admin.orders.total') }}</span>
        <span>{{ formatPrice(totalPrice) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatPrice } from '~/logic/utils';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  shippingCost: {
    type: Number,
    required: true,
  },
});

const subtotal = computed(() => props.totalPrice - props.shippingCost);

// Get item image URL path for NuxtImg strapi provider
const getItemImageUrl = (item) => {
  const image = item.productId?.image?.[0];
  if (image) {
    return image.formats?.thumbnail?.url || image.url;
  }
  return '/placeholder-product.png';
};
</script>

<style scoped>
.items-section {
  border-top: 1px solid var(--admin-border);
  padding-top: 1.5rem;
}

.details-section h4 {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--admin-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
}

.items-list {
  background: var(--admin-surface-alt);
  border-radius: 8px;
  overflow: hidden;
  transition: background 0.3s ease;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--admin-border-light);
}

.item-row:last-child {
  border-bottom: none;
}

.item-row .item-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-row .item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-row .item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.item-row .item-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.item-row .item-material {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.item-row .item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-label {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.qty-value {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.item-row .item-price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.unit-price {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-subtle);
  transition: color 0.3s ease;
}

.total-price {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.order-summary {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--admin-surface);
  border-radius: 8px;
  transition: background 0.3s ease;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-secondary);
  transition: color 0.3s ease;
}

.summary-row.total {
  border-top: 1px solid var(--admin-border);
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--admin-text);
}
</style>
