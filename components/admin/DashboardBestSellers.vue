<template>
  <div v-if="products.length > 0" class="best-sellers">
    <h4 class="breakdown-title">{{ title }}</h4>
    <div class="best-sellers-list">
      <div v-for="(product, index) in products" :key="product.id" class="best-seller-item">
        <span class="rank">{{ index + 1 }}</span>
        <span class="product-name">{{ product.name }}</span>
        <span class="sold-count">{{ $t('admin.dashboard.stats.soldCount', { count: product.sold }) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  products: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.best-sellers {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--admin-border);
}

.breakdown-title {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--admin-text);
  margin-bottom: 1rem;
}

.best-sellers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.best-seller-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
}

.best-seller-item .rank {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-primary);
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.best-seller-item .product-name {
  flex: 1;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.best-seller-item .sold-count {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-muted);
  flex-shrink: 0;
}
</style>
