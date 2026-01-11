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
        <template v-for="product in products" :key="product.id">
          <!-- Product Row -->
          <tr class="product-row" :class="{ expanded: expandedProductId === product.id }" @click="toggleExpand(product.id)">
            <td class="image-cell">
              <div class="product-image-wrapper">
                <IconChevronRight class="expand-icon" :class="{ rotated: expandedProductId === product.id }" :size="16" />
                <div class="product-image">
                  <img :src="getProductImage(product)" :alt="product.name" />
                </div>
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
              <a :href="getStrapiEditUrl(product)" target="_blank" rel="noopener noreferrer" class="strapi-link" :title="$t('admin.products.editInStrapi')" @click.stop>
                <IconExternalLink :size="16" />
              </a>
            </td>
          </tr>

          <!-- Expanded Stock Management Row -->
          <tr v-if="expandedProductId === product.id" class="stock-detail-row">
            <td colspan="7">
              <div class="stock-detail-content">
                <h4 class="stock-detail-title">
                  <IconPackage :size="16" />
                  {{ $t('admin.products.stock.title') }}
                </h4>
                <div class="stock-form">
                  <div class="stock-current">
                    <span class="stock-label">{{ $t('admin.products.stock.currentStock') }}</span>
                    <span class="stock-value" :class="getStockClass(product.amount)">{{ product.amount ?? 0 }}</span>
                  </div>
                  <div class="stock-input-group">
                    <label class="stock-input-label">{{ $t('admin.products.stock.addStock') }}</label>
                    <div class="stock-input-wrapper">
                      <button class="stock-adjust-btn" @click.stop="decrementStock(product.id)" :disabled="(stockInputs[product.id] || 0) <= 0">
                        <IconMinus :size="14" />
                      </button>
                      <input type="number" class="stock-input" :value="stockInputs[product.id] || 0" @input="updateStockInput(product.id, $event)" @click.stop min="0" :placeholder="$t('admin.products.stock.quantity')" />
                      <button class="stock-adjust-btn" @click.stop="incrementStock(product.id)">
                        <IconPlus :size="14" />
                      </button>
                    </div>
                  </div>
                  <div class="stock-preview">
                    <span class="stock-label">{{ $t('admin.products.stock.newStock') }}</span>
                    <span class="stock-value preview" :class="getStockClass((product.amount ?? 0) + (stockInputs[product.id] || 0))">
                      {{ (product.amount ?? 0) + (stockInputs[product.id] || 0) }}
                    </span>
                  </div>
                  <button class="stock-update-btn" :disabled="!stockInputs[product.id] || stockInputs[product.id] === 0 || isUpdating[product.id]" @click.stop="updateStock(product)">
                    <span v-if="isUpdating[product.id]" class="stock-loading"></span>
                    <template v-else>
                      <IconCheck :size="16" />
                      {{ $t('admin.products.stock.updateButton') }}
                    </template>
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { formatPrice } from '~/logic/utils';
import { useConfirmDialog } from '~/composables/useConfirmDialog';
import { useToast } from '~/composables/useToast';
import IconExternalLink from '~/components/icon/IconExternalLink.vue';
import IconChevronRight from '~/components/icon/IconChevronRight.vue';
import IconPackage from '~/components/icon/IconPackage.vue';
import IconPlus from '~/components/icon/IconPlus.vue';
import IconMinus from '~/components/icon/IconMinus.vue';
import IconCheck from '~/components/icon/IconCheck.vue';

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

const emit = defineEmits(['stock-updated']);

const { t } = useI18n();
const { update } = useStrapi();
const { confirm } = useConfirmDialog();
const { success: toastSuccess, error: toastError } = useToast();

// Expanded row state
const expandedProductId = ref(null);

// Stock input values per product
const stockInputs = reactive({});

// Loading state per product
const isUpdating = reactive({});

const toggleExpand = (productId) => {
  if (expandedProductId.value === productId) {
    expandedProductId.value = null;
  } else {
    expandedProductId.value = productId;
    // Initialize stock input if not exists
    if (!stockInputs[productId]) {
      stockInputs[productId] = 0;
    }
  }
};

const updateStockInput = (productId, event) => {
  const value = parseInt(event.target.value) || 0;
  stockInputs[productId] = value;
};

const incrementStock = (productId) => {
  if (!stockInputs[productId]) {
    stockInputs[productId] = 0;
  }
  stockInputs[productId]++;
};

const decrementStock = (productId) => {
  if (!stockInputs[productId]) {
    stockInputs[productId] = 0;
  }
  if (stockInputs[productId] > 0) {
    stockInputs[productId]--;
  }
};

const updateStock = async (product) => {
  const addAmount = stockInputs[product.id] || 0;
  if (addAmount === 0) return;

  const currentStock = product.amount ?? 0;
  const newStock = currentStock + addAmount;

  // Ask for confirmation
  const confirmed = await confirm({
    title: t('admin.products.stock.confirmTitle'),
    message: t('admin.products.stock.confirmMessage', {
      name: product.name,
      current: currentStock,
      add: addAmount,
      new: newStock,
    }),
    confirmText: t('admin.products.stock.confirmButton'),
    cancelText: t('common.cancel'),
    variant: 'success',
    icon: 'check',
  });

  if (!confirmed) return;

  isUpdating[product.id] = true;
  try {
    await update('products', product.documentId, {
      amount: newStock,
    });

    // Update local product data
    product.amount = newStock;

    // Reset input
    stockInputs[product.id] = 0;

    toastSuccess(t('admin.products.stock.success', { name: product.name }));
    emit('stock-updated', product);
  } catch (error) {
    console.error('Failed to update stock:', error);
    toastError(t('admin.products.stock.error'));
  } finally {
    isUpdating[product.id] = false;
  }
};

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
  cursor: pointer;
}

.product-row:hover {
  background: var(--admin-surface-alt);
}

.product-row.expanded {
  background: var(--admin-surface-alt);
}

.product-row.expanded td {
  border-bottom-color: transparent;
}

.expand-icon {
  color: var(--color-gold);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.expand-icon.rotated {
  transform: rotate(90deg);
}

.image-cell {
  width: 100px;
}

.product-image-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

/* Stock Detail Row */
.stock-detail-row td {
  padding: 0 !important;
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.05) 0%, rgba(212, 167, 98, 0.1) 100%);
}

.stock-detail-content {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  margin-left: 50px;
  border-left: 2px solid var(--color-gold);
}

.stock-detail-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stock-detail-title svg {
  color: var(--color-gold);
}

.stock-form {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 1.25rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  flex-wrap: wrap;
}

.stock-current,
.stock-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 80px;
}

.stock-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--admin-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stock-value {
  font-family: var(--font-body);
  font-size: 1.5rem;
  font-weight: 700;
}

.stock-value.in-stock {
  color: #10b981;
}

.stock-value.low-stock {
  color: #f59e0b;
}

.stock-value.out-of-stock {
  color: #ef4444;
}

.stock-value.preview {
  color: var(--color-gold);
}

.stock-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stock-input-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--admin-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stock-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--admin-surface-alt);
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  overflow: hidden;
}

.stock-adjust-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: var(--admin-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.stock-adjust-btn:hover:not(:disabled) {
  background: var(--admin-hover-bg);
  color: var(--color-gold);
}

.stock-adjust-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stock-input {
  width: 50px;
  padding: 0.25rem;
  border: none;
  background: transparent;
  text-align: center;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--admin-text);
  appearance: textfield;
  -moz-appearance: textfield;
}

.stock-input::-webkit-outer-spin-button,
.stock-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.stock-input:focus {
  outline: none;
}

.stock-update-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 140px;
  margin-left: auto;
}

.stock-update-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.stock-update-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.stock-loading {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .stock-form {
    gap: 1rem;
  }

  .stock-current,
  .stock-preview {
    min-width: 60px;
  }
}

@media (max-width: 768px) {
  .products-table-wrapper {
    overflow-x: auto;
  }

  .products-table {
    min-width: 750px;
  }

  .stock-detail-content {
    margin-left: 0;
    padding: 1rem;
  }

  .stock-form {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .stock-current,
  .stock-preview {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: auto;
  }

  .stock-update-btn {
    width: 100%;
    margin-left: 0;
  }
}
</style>
