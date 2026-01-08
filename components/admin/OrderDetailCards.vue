<template>
  <div class="details-grid">
    <!-- Customer Info -->
    <div class="details-section">
      <h4>{{ $t('admin.orders.customerInfo') }}</h4>
      <div class="info-card">
        <p>
          <strong>{{ customer?.firstname }} {{ customer?.lastname }}</strong>
        </p>
        <p>{{ customer?.email }}</p>
        <p v-if="customer?.phone">{{ customer?.phone }}</p>
      </div>
    </div>

    <!-- Shipping Address -->
    <div class="details-section">
      <h4>{{ $t('admin.orders.shippingAddress') }}</h4>
      <div class="info-card">
        <p>{{ shippingAddress?.street }} {{ shippingAddress?.number }}{{ shippingAddress?.box ? ` / ${shippingAddress.box}` : '' }}</p>
        <p>{{ shippingAddress?.postalcode }} {{ shippingAddress?.city }}</p>
        <p>{{ shippingAddress?.country }}</p>
      </div>
    </div>

    <!-- Billing Address -->
    <div class="details-section">
      <h4>{{ $t('admin.orders.billingAddress') }}</h4>
      <div class="info-card">
        <p>{{ billingAddress?.street }} {{ billingAddress?.number }}{{ billingAddress?.box ? ` / ${billingAddress.box}` : '' }}</p>
        <p>{{ billingAddress?.postalcode }} {{ billingAddress?.city }}</p>
        <p>{{ billingAddress?.country }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  customer: {
    type: Object,
    default: null,
  },
  shippingAddress: {
    type: Object,
    default: null,
  },
  billingAddress: {
    type: Object,
    default: null,
  },
});
</script>

<style scoped>
.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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

.info-card {
  background: var(--admin-surface);
  border-radius: 8px;
  padding: 1rem;
  transition: background 0.3s ease;
}

.info-card p {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text-secondary);
  line-height: 1.5;
  transition: color 0.3s ease;
}

.info-card p strong {
  color: var(--admin-text);
}

@media (max-width: 1200px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
