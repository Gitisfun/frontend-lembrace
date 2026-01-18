<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.promotions.title')" :subtitle="$t('admin.promotions.subtitle')">
      <template #actions>
        <AdminActionButton :href="strapiPromotionCreateUrl" target="_blank">
          <template #icon>
            <IconPlus :size="16" />
          </template>
          {{ $t('admin.promotions.addPromotion') }}
        </AdminActionButton>
        <AdminActionButton @click="refreshPromotions" :disabled="isLoading" :loading="isLoading">
          <template #icon>
            <IconRefresh :size="16" />
          </template>
          {{ $t('admin.promotions.refresh') }}
        </AdminActionButton>
      </template>
    </AdminHeader>

    <div class="promotions-content">
      <!-- Loading State -->
      <AdminLoadingState v-if="isLoading" />

      <!-- Error State -->
      <AdminErrorState v-else-if="hasError" @retry="refreshPromotions" />

      <!-- Empty State -->
      <AdminEmptyState
        v-else-if="promotions.length === 0"
        :title="$t('admin.promotions.emptyTitle')"
        :message="$t('admin.promotions.emptyMessage')"
      />

      <!-- Promotions List -->
      <div v-else class="promotions-list">
        <!-- Search Bar -->
        <AdminSearchBar
          v-model="searchQuery"
          :placeholder="$t('admin.promotions.searchPlaceholder')"
        />

        <!-- No Results -->
        <AdminNoResults
          v-if="filteredPromotions.length === 0"
          @clearFilters="searchQuery = ''"
        />

        <!-- Promotions Table -->
        <div v-if="filteredPromotions.length > 0" class="table-container">
          <table class="promotions-table">
            <thead>
              <tr>
                <th>{{ $t('admin.promotions.table.code') }}</th>
                <th>{{ $t('admin.promotions.table.discount') }}</th>
                <th>{{ $t('admin.promotions.table.status') }}</th>
                <th>{{ $t('admin.promotions.table.appliesTo') }}</th>
                <th>{{ $t('admin.promotions.table.validity') }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="promotion in paginatedPromotions" :key="promotion.id">
                <!-- Main Row -->
                <tr 
                  class="promotion-row" 
                  :class="{ expanded: expandedPromotionId === promotion.id }" 
                  @click="togglePromotionDetails(promotion.id)"
                >
                  <td class="code-cell">
                    <div class="code-wrapper">
                      <IconChevronRight 
                        class="expand-icon" 
                        :class="{ rotated: expandedPromotionId === promotion.id }" 
                        :size="16" 
                      />
                      <span class="promotion-code">{{ promotion.code }}</span>
                    </div>
                  </td>
                  <td class="discount-cell">
                    <span class="discount-badge">-{{ promotion.discount }}%</span>
                  </td>
                  <td class="status-cell">
                    <span class="status-badge" :class="promotion.isActive ? 'active' : 'inactive'">
                      {{ promotion.isActive ? $t('admin.promotions.status.active') : $t('admin.promotions.status.inactive') }}
                    </span>
                  </td>
                  <td class="applies-to-cell">
                    <div class="applies-to-summary">
                      <span v-if="promotion.categories?.length" class="summary-tag category-tag">
                        {{ promotion.categories.length }} {{ $t('admin.promotions.appliesTo.categories').toLowerCase() }}
                      </span>
                      <span v-if="promotion.subcategories?.length" class="summary-tag subcategory-tag">
                        {{ promotion.subcategories.length }} {{ $t('admin.promotions.appliesTo.subcategories').toLowerCase() }}
                      </span>
                      <span v-if="promotion.products?.length" class="summary-tag product-tag">
                        {{ promotion.products.length }} {{ $t('admin.promotions.appliesTo.products').toLowerCase() }}
                      </span>
                      <span 
                        v-if="!promotion.categories?.length && !promotion.subcategories?.length && !promotion.products?.length" 
                        class="applies-to-all"
                      >
                        {{ $t('admin.promotions.appliesTo.all') }}
                      </span>
                    </div>
                  </td>
                  <td class="validity-cell">
                    <div class="validity-info">
                      <template v-if="promotion.startDate || promotion.endDate">
                        <div v-if="promotion.startDate" class="validity-row">
                          <span class="validity-label">{{ $t('admin.promotions.validity.from') }}:</span>
                          <span class="validity-date">{{ formatDate(promotion.startDate) }}</span>
                        </div>
                        <div v-if="promotion.endDate" class="validity-row">
                          <span class="validity-label">{{ $t('admin.promotions.validity.until') }}:</span>
                          <span class="validity-date">{{ formatDate(promotion.endDate) }}</span>
                        </div>
                      </template>
                      <span v-else class="validity-unlimited">
                        {{ $t('admin.promotions.validity.unlimited') }}
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- Expanded Details Row -->
                <tr v-show="expandedPromotionId === promotion.id" class="details-row">
                  <td colspan="5">
                    <div class="inline-details-content">
                      <!-- Actions Bar -->
                      <div class="details-actions">
                        <button 
                          class="toggle-status-btn" 
                          :class="promotion.isActive ? 'deactivate' : 'activate'"
                          :disabled="isTogglingStatus"
                          @click.stop="togglePromotionStatus(promotion)"
                        >
                          <IconX v-if="promotion.isActive" :size="16" />
                          <IconCheck v-else :size="16" />
                          {{ promotion.isActive ? $t('admin.promotions.actions.deactivate') : $t('admin.promotions.actions.activate') }}
                        </button>
                        <a 
                          :href="getPromotionEditUrl(promotion)" 
                          target="_blank" 
                          class="edit-btn"
                          @click.stop
                        >
                          <IconExternalLink :size="16" />
                          {{ $t('admin.promotions.actions.editInStrapi') }}
                        </a>
                      </div>

                      <!-- Details Grid -->
                      <div class="details-grid">
                        <!-- Categories Section -->
                        <div v-if="promotion.categories?.length > 0" class="detail-section">
                          <h4 class="section-title">
                            <IconGrid :size="16" />
                            {{ $t('admin.promotions.appliesTo.categories') }}
                          </h4>
                          <div class="items-grid">
                            <div 
                              v-for="category in promotion.categories" 
                              :key="category.id" 
                              class="item-card category-card"
                            >
                              <span class="item-name">{{ getLocalizedName(category) }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Subcategories Section -->
                        <div v-if="promotion.subcategories?.length > 0" class="detail-section">
                          <h4 class="section-title">
                            <IconLayers :size="16" />
                            {{ $t('admin.promotions.appliesTo.subcategories') }}
                          </h4>
                          <div class="items-grid">
                            <div 
                              v-for="subcategory in promotion.subcategories" 
                              :key="subcategory.id" 
                              class="item-card subcategory-card"
                            >
                              <span class="item-name">{{ getLocalizedName(subcategory) }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Products Section -->
                        <div v-if="promotion.products?.length > 0" class="detail-section">
                          <h4 class="section-title">
                            <IconShoppingBag :size="16" />
                            {{ $t('admin.promotions.appliesTo.products') }}
                          </h4>
                          <div class="items-grid products-grid">
                            <div 
                              v-for="product in promotion.products" 
                              :key="product.id" 
                              class="item-card product-card"
                            >
                              <div class="product-image" v-if="product.image?.[0]">
                                <NuxtImg 
                                  :src="product.image[0].formats?.thumbnail?.url || product.image[0].url" 
                                  :alt="getLocalizedName(product)" 
                                  width="40" 
                                  height="40" 
                                  format="webp" 
                                  provider="strapi" 
                                />
                              </div>
                              <div class="product-placeholder" v-else>
                                <IconShoppingBag :size="16" />
                              </div>
                              <span class="item-name">{{ getLocalizedName(product) }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- No Specific Targets -->
                        <div 
                          v-if="!promotion.categories?.length && !promotion.subcategories?.length && !promotion.products?.length" 
                          class="no-targets-message"
                        >
                          <IconInfo :size="18" />
                          <span>{{ $t('admin.promotions.noSpecificTargets') }}</span>
                        </div>
                      </div>

                      <!-- Validity Details -->
                      <div v-if="promotion.startDate || promotion.endDate" class="validity-details">
                        <div v-if="promotion.startDate" class="validity-item">
                          <span class="validity-label">{{ $t('admin.promotions.validity.from') }}:</span>
                          <span class="validity-value">{{ formatDate(promotion.startDate) }}</span>
                        </div>
                        <div v-if="promotion.endDate" class="validity-item">
                          <span class="validity-label">{{ $t('admin.promotions.validity.until') }}:</span>
                          <span class="validity-value">{{ formatDate(promotion.endDate) }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <AdminPagination
          v-if="filteredPromotions.length > 0"
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          :totalItems="filteredPromotions.length"
          :totalPages="totalPages"
          :itemsLabel="$t('admin.promotions.promotionsCount')"
        />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from '~/composables/useToast';
import { useLocalization } from '~/composables/useLocalization';
import AdminLayout from '~/components/admin/AdminLayout.vue';
import AdminHeader from '~/components/admin/AdminHeader.vue';
import AdminActionButton from '~/components/admin/AdminActionButton.vue';
import AdminLoadingState from '~/components/admin/AdminLoadingState.vue';
import AdminErrorState from '~/components/admin/AdminErrorState.vue';
import AdminEmptyState from '~/components/admin/AdminEmptyState.vue';
import AdminSearchBar from '~/components/admin/AdminSearchBar.vue';
import AdminNoResults from '~/components/admin/AdminNoResults.vue';
import AdminPagination from '~/components/admin/AdminPagination.vue';
import IconRefresh from '~/components/icon/IconRefresh.vue';
import IconPlus from '~/components/icon/IconPlus.vue';
import IconChevronRight from '~/components/icon/IconChevronRight.vue';
import IconCheck from '~/components/icon/IconCheck.vue';
import IconX from '~/components/icon/IconX.vue';
import IconExternalLink from '~/components/icon/IconExternalLink.vue';
import IconGrid from '~/components/icon/IconGrid.vue';
import IconLayers from '~/components/icon/IconLayers.vue';
import IconShoppingBag from '~/components/icon/IconShoppingBag.vue';
import IconInfo from '~/components/icon/IconInfo.vue';

definePageMeta({
  layout: false,
  middleware: ['admin'],
});

const { t, locale } = useI18n();
const { find, update } = useStrapi();
const config = useRuntimeConfig();
const { success: toastSuccess, error: toastError } = useToast();
const { getLocalizedItem } = useLocalization();

// Strapi URLs
const strapiPromotionCreateUrl = computed(() => {
  return `${config.public.strapiUrl}/admin/content-manager/collection-types/api::promotion-code.promotion-code/create`;
});

const getPromotionEditUrl = (promotion) => {
  return `${config.public.strapiUrl}/admin/content-manager/collection-types/api::promotion-code.promotion-code/${promotion.documentId}`;
};

// State
const promotions = ref([]);
const isLoading = ref(true);
const hasError = ref(false);
const expandedPromotionId = ref(null);
const isTogglingStatus = ref(false);

// Filters & Pagination State
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// Toggle expanded details
const togglePromotionDetails = (promotionId) => {
  expandedPromotionId.value = expandedPromotionId.value === promotionId ? null : promotionId;
};

// Toggle promotion active status
const togglePromotionStatus = async (promotion) => {
  isTogglingStatus.value = true;
  
  try {
    const newStatus = !promotion.isActive;
    
    await update('promotion-codes', promotion.documentId, {
      isActive: newStatus,
    });
    
    // Update local state
    promotion.isActive = newStatus;
    
    toastSuccess(
      newStatus 
        ? t('admin.promotions.statusUpdated.activated') 
        : t('admin.promotions.statusUpdated.deactivated')
    );
  } catch (error) {
    console.error('Failed to update promotion status:', error);
    toastError(t('admin.promotions.statusUpdated.error'));
  } finally {
    isTogglingStatus.value = false;
  }
};

// Helper to get localized name from item
const getLocalizedName = (item) => {
  if (!item) return '';
  const localized = getLocalizedItem(item);
  return localized?.name || localized?.label || item.name || item.label || '';
};

// Format date with time (24-hour format)
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'nl' ? 'nl-NL' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Computed: Filtered and paginated promotions
const filteredPromotions = computed(() => {
  let result = [...promotions.value];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter((promotion) => {
      const code = promotion.code?.toLowerCase() || '';
      return code.includes(query);
    });
  }

  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredPromotions.value.length / pageSize.value) || 1;
});

const paginatedPromotions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredPromotions.value.slice(start, end);
});

// Reset to first page when filters change
watch([searchQuery, pageSize], () => {
  currentPage.value = 1;
});

// SEO Meta
useSeoMeta({
  title: () => t('seo.admin.promotions.title'),
  description: () => t('seo.admin.promotions.description'),
  robots: 'noindex, nofollow',
});

// Methods
const fetchPromotions = async () => {
  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await find('promotion-codes', {
      populate: {
        categories: {
          populate: ['localizations'],
        },
        subcategories: {
          populate: ['localizations'],
        },
        products: {
          populate: ['image', 'localizations'],
        },
      },
    });

    promotions.value = response.data || [];
  } catch (error) {
    console.error('Failed to fetch promotions:', error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const refreshPromotions = async () => {
  await fetchPromotions();
  if (!hasError.value) {
    toastSuccess(t('admin.promotions.refreshed'));
  }
};

// Fetch promotions on mount
await fetchPromotions();
</script>

<style scoped>
.promotions-content {
  padding: 2rem;
  flex: 1;
}

.promotions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.table-container {
  background: var(--admin-surface, white);
  border-radius: 12px;
  border: 1px solid var(--admin-border, rgba(0, 0, 0, 0.08));
  overflow: hidden;
}

.promotions-table {
  width: 100%;
  border-collapse: collapse;
}

.promotions-table th,
.promotions-table td {
  padding: 1rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid var(--admin-border, rgba(0, 0, 0, 0.08));
}

.promotions-table th {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--admin-text-muted, #666);
  background: var(--admin-surface-alt, #f8f9fa);
}

/* Promotion Row */
.promotion-row {
  cursor: pointer;
  transition: background 0.2s ease;
}

.promotion-row:hover {
  background: var(--admin-surface-alt, rgba(0, 0, 0, 0.02));
}

.promotion-row.expanded {
  background: var(--admin-surface-alt, rgba(0, 0, 0, 0.02));
}

.promotion-row.expanded td {
  border-bottom-color: transparent;
}

/* Code Cell */
.code-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-icon {
  color: var(--color-gold);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.expand-icon.rotated {
  transform: rotate(90deg);
}

.promotion-code {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: var(--admin-code-bg, #f1f3f4);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: var(--admin-text, #333);
  font-family: var(--font-mono, monospace);
}

/* Discount Cell */
.discount-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.15) 0%, rgba(39, 174, 96, 0.25) 100%);
  border: 1px solid rgba(39, 174, 96, 0.3);
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e8449;
}

/* Status Cell */
.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.active {
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.15) 0%, rgba(39, 174, 96, 0.25) 100%);
  color: #1e8449;
}

.status-badge.inactive {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(231, 76, 60, 0.25) 100%);
  color: #c0392b;
}

/* Applies To Summary */
.applies-to-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.summary-tag {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.summary-tag.category-tag {
  background: rgba(155, 89, 182, 0.15);
  color: #8e44ad;
}

.summary-tag.subcategory-tag {
  background: rgba(52, 152, 219, 0.15);
  color: #2980b9;
}

.summary-tag.product-tag {
  background: rgba(230, 126, 34, 0.15);
  color: #d35400;
}

.applies-to-all {
  font-size: 0.85rem;
  color: var(--admin-text-muted, #666);
  font-style: italic;
}

/* Validity Cell */
.validity-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.validity-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
}

.validity-label {
  color: var(--admin-text-muted, #666);
  font-weight: 500;
}

.validity-date {
  color: var(--admin-text, #333);
  font-weight: 600;
}

.validity-unlimited {
  font-size: 0.85rem;
  color: var(--admin-text-muted, #666);
  font-style: italic;
}

/* Details Row */
.details-row {
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.05) 0%, rgba(212, 167, 98, 0.1) 100%);
}

.details-row td {
  padding: 0 !important;
  border-bottom: 1px solid var(--admin-border, rgba(0, 0, 0, 0.08)) !important;
}

.inline-details-content {
  padding: 1.5rem;
  background: transparent;
  border-top: 1px solid rgba(212, 167, 98, 0.2);
}

/* Details Actions */
.details-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.toggle-status-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-status-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-status-btn.activate {
  background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
  color: white;
}

.toggle-status-btn.activate:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.toggle-status-btn.deactivate {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.toggle-status-btn.deactivate:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--color-gold);
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f1419;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Details Grid */
.details-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  background: var(--admin-surface, white);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid var(--admin-border, rgba(0, 0, 0, 0.08));
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--admin-text, #333);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title svg {
  color: var(--color-gold);
}

.items-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.items-grid.products-grid {
  gap: 0.75rem;
}

.item-card {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.item-card.category-card {
  background: rgba(155, 89, 182, 0.1);
  border: 1px solid rgba(155, 89, 182, 0.25);
  color: #8e44ad;
}

.item-card.subcategory-card {
  background: rgba(52, 152, 219, 0.1);
  border: 1px solid rgba(52, 152, 219, 0.25);
  color: #2980b9;
}

.item-card.product-card {
  background: rgba(230, 126, 34, 0.1);
  border: 1px solid rgba(230, 126, 34, 0.25);
  color: #d35400;
}

.product-image {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: rgba(230, 126, 34, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-placeholder svg {
  color: #d35400;
  opacity: 0.6;
}

.no-targets-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--admin-surface-alt, #f8f9fa);
  border-radius: 8px;
  color: var(--admin-text-muted, #666);
  font-size: 0.9rem;
}

.no-targets-message svg {
  color: var(--color-gold);
  flex-shrink: 0;
}

/* Validity Details */
.validity-details {
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--admin-border, rgba(0, 0, 0, 0.08));
}

.validity-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.validity-label {
  font-size: 0.85rem;
  color: var(--admin-text-muted, #666);
}

.validity-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--admin-text, #333);
}

/* Dark theme support */
:root.dark .table-container,
.theme-dark .table-container {
  --admin-surface: #1e2330;
  --admin-surface-alt: rgba(255, 255, 255, 0.03);
  --admin-border: rgba(255, 255, 255, 0.08);
  --admin-text: #e5e7eb;
  --admin-text-muted: #9ca3af;
  --admin-code-bg: rgba(255, 255, 255, 0.08);
}

/* Responsive */
@media (max-width: 1024px) {
  .promotions-content {
    padding: 1.5rem;
  }

  .details-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .promotions-content {
    padding: 1rem;
  }

  .promotions-table th,
  .promotions-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }

  .table-container {
    overflow-x: auto;
  }

  .promotions-table {
    min-width: 700px;
  }

  .validity-details {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
