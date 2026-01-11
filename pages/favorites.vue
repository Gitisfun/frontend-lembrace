<template>
  <div class="favorites-page">
    <div class="favorites-container">
      <div class="favorites-header">
        <h1 class="favorites-title">{{ $t('favorites.title') }}</h1>
        <p class="favorites-subtitle">{{ $t('favorites.subtitle') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-grid">
        <UiSkeletonProductCard v-for="i in 4" :key="i" />
      </div>

      <!-- Error State -->
      <UiErrorState v-else-if="error" variant="inline" :title="$t('errors.favorites.title')" :message="$t('errors.favorites.message')" :retry-text="$t('common.retry')" @retry="fetchFavoriteProducts" />

      <!-- Empty State -->
      <div v-else-if="favoriteProducts.length === 0" class="no-favorites">
        <div class="no-favorites-content">
          <div class="no-favorites-icon">
            <IconHeart :size="80" />
          </div>
          <h2 class="no-favorites-title">{{ $t('favorites.empty.title') }}</h2>
          <p class="no-favorites-description">{{ $t('favorites.empty.description') }}</p>
          <UiButton variant="primary" :to="localePath('/products')" :text="$t('favorites.empty.browseProducts')" />
        </div>
      </div>
      <div v-else class="favorites-grid">
        <ProductCard v-for="product in favoriteProducts" :key="product.id" :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGlobalStore } from '~/stores/global';
import { useApiError } from '~/composables/useApiError';
import ProductCard from '~/components/product/ProductCard.vue';

const { t } = useI18n();
const localePath = useLocalePath();

// SEO Meta
useSeoMeta({
  title: () => t('seo.favorites.title'),
  description: () => t('seo.favorites.description'),
  ogTitle: () => t('seo.favorites.title'),
  ogDescription: () => t('seo.favorites.description'),
  robots: 'noindex, nofollow',
});

const { find } = useStrapi();
const globalStore = useGlobalStore();

const loading = ref(true);
const { error, handleError, clearError } = useApiError();
const favoriteProducts = ref([]);

// Get favorite product IDs from store
const favoriteIds = computed(() => globalStore.favoriteItems);

// Fetch favorite products
const fetchFavoriteProducts = async () => {
  try {
    loading.value = true;
    clearError();

    if (favoriteIds.value.length === 0) {
      favoriteProducts.value = [];
      return;
    }

    const { data: products } = await find('products', {
      populate: ['image', 'image_background', 'subcategory'],
      filters: {
        documentId: { $in: favoriteIds.value },
      },
    });

    favoriteProducts.value = products || [];
  } catch (e) {
    handleError(e, 'Failed to load favorite products');
  } finally {
    loading.value = false;
  }
};

// Watch for changes in favorites and refetch
watch(
  favoriteIds,
  () => {
    fetchFavoriteProducts();
  },
  { immediate: true }
);
</script>

<style scoped>
.favorites-page {
  padding: 4rem 2rem;
  min-height: calc(100vh - 70px);
  overflow-x: hidden;
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
}

.favorites-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.favorites-header {
  text-align: center;
  margin-bottom: 3rem;
}

.favorites-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.favorites-subtitle {
  font-family: var(--font-body);
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
  gap: 1.5rem;
  width: 100%;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 768px) {
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.no-favorites {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 3rem 2rem;
  background: #fafafa;
  border-radius: 12px;
  margin: 2rem 0;
  border: 1px solid #e0e0e0;
}

.no-favorites-content {
  text-align: center;
  max-width: 450px;
}

.no-favorites-icon {
  margin-bottom: 1.5rem;
  color: #ccc;
}

.no-favorites-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: #333;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.no-favorites-description {
  font-family: var(--font-body);
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  margin: 0 0 2rem 0;
}

@media (max-width: 768px) {
  .favorites-page {
    padding: 1.5rem 1rem;
  }

  .favorites-header {
    margin-bottom: 2rem;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .no-favorites {
    min-height: 300px;
    padding: 2rem 1rem;
  }

  .no-favorites-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .favorites-page {
    padding: 1rem 0.75rem;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>
