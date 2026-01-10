<template>
  <div class="products-table-wrapper">
    <table class="products-table">
      <thead>
        <tr>
          <th>{{ $t('admin.products.table.image') }}</th>
          <th>{{ $t('admin.products.table.name') }}</th>
          <th>{{ $t('admin.products.table.category') }}</th>
          <th>{{ $t('admin.products.table.price') }}</th>
          <th>{{ $t('admin.products.table.stock') }}</th>
          <th>{{ $t('admin.products.table.discount') }}</th>
          <th class="actions-header"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id" class="product-row">
          <td class="image-cell">
            <div class="product-image">
              <img :src="getProductImage(product)" :alt="product.name" />
            </div>
          </td>
          <td class="name-cell">
            <div class="product-name-wrapper">
              <span class="product-name">{{ product.name }}</span>
              <span v-if="product.description_short" class="product-description">{{ truncateText(product.description_short, 60) }}</span>
            </div>
          </td>
          <td class="category-cell">
            <div class="category-info">
              <span class="category-name">{{ product.subcategory?.category?.label || '-' }}</span>
              <span class="subcategory-name">{{ product.subcategory?.label || '-' }}</span>
            </div>
          </td>
          <td class="price-cell">
            <div class="price-info">
              <span class="product-price" :class="{ discounted: product.discount > 0 }">{{ formatPrice(getDiscountedPrice(product)) }}</span>
              <span v-if="product.discount > 0" class="original-price">{{ formatPrice(product.price) }}</span>
            </div>
          </td>
          <td class="stock-cell">
            <span class="stock-badge" :class="getStockClass(product.amount)">
              {{ product.amount ?? 0 }}
            </span>
          </td>
          <td class="discount-cell">
            <span v-if="product.discount > 0" class="discount-badge">-{{ product.discount }}%</span>
            <span v-else class="no-discount">-</span>
          </td>
          <td class="actions-cell">
            <a :href="getStrapiEditUrl(product)" target="_blank" rel="noopener noreferrer" class="strapi-link" :title="$t('admin.products.editInStrapi')">
              <IconExternalLink :size="16" />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { formatPrice } from '~/logic/utils';
import IconExternalLink from '~/components/icon/IconExternalLink.vue';

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  strapiUrl: {
    type: String,
    required: true,
  },
});

const getProductImage = (product) => {
  const image = product.image?.[0] || product.image;
  if (image) {
    const imageUrl = image.formats?.thumbnail?.url || image.url;
    if (imageUrl) {
      return `${props.strapiUrl}${imageUrl}`;
    }
  }
  return '/placeholder-product.png';
};

const getDiscountedPrice = (product) => {
  if (product.discount > 0) {
    return product.price * (1 - product.discount / 100);
  }
  return product.price;
};

const getStockClass = (amount) => {
  if (!amount || amount === 0) return 'out-of-stock';
  if (amount <= 5) return 'low-stock';
  return 'in-stock';
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const getStrapiEditUrl = (product) => {
  return `${props.strapiUrl}/admin/content-manager/collection-types/api::product.product/${product.documentId}`;
};
</script>

<style scoped>
.products-table-wrapper {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--admin-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--admin-surface-alt);
  border-bottom: 1px solid var(--admin-border);
  transition: all 0.3s ease;
}

.products-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--admin-border-light);
  transition: all 0.3s ease;
}

.product-row {
  transition: background 0.2s ease;
}

.product-row:hover {
  background: var(--admin-surface-alt);
}

.product-row:last-child td {
  border-bottom: none;
}

.image-cell {
  width: 80px;
}

.product-image {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--admin-border);
  background: var(--admin-bg);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name-cell {
  min-width: 200px;
}

.product-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.product-description {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.category-cell {
  min-width: 140px;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.category-name {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.subcategory-name {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.price-cell {
  min-width: 100px;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.product-price {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.product-price.discounted {
  color: #10b981;
}

.original-price {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-muted);
  text-decoration: line-through;
  transition: color 0.3s ease;
}

.stock-cell {
  width: 100px;
}

.stock-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
}

.stock-badge.in-stock {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stock-badge.low-stock {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stock-badge.out-of-stock {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.discount-cell {
  width: 80px;
}

.discount-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.15) 0%, rgba(212, 167, 98, 0.25) 100%);
  border-radius: 4px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-gold);
}

.no-discount {
  color: var(--admin-text-muted);
  font-size: 0.9rem;
}

.actions-header {
  width: 50px;
}

.actions-cell {
  width: 50px;
  text-align: center;
}

.strapi-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: var(--admin-text-muted);
  transition: all 0.2s ease;
}

.strapi-link:hover {
  background: var(--admin-hover-bg);
  color: var(--color-gold);
}

@media (max-width: 768px) {
  .products-table-wrapper {
    overflow-x: auto;
  }

  .products-table {
    min-width: 700px;
  }
}
</style>
