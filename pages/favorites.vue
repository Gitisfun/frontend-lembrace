<template>
  <div class="favorites-page">
    <div class="favorites-container">
      <div class="favorites-header">
        <h1 class="favorites-title">My Favorites</h1>
        <p class="favorites-subtitle">Your saved items</p>
      </div>

      <div v-if="loading" class="loading">Loading favorites...</div>
      <div v-else-if="error" class="error">Error loading favorites: {{ error.message }}</div>
      <div v-else-if="favoriteProducts.length === 0" class="no-favorites">
        <div class="no-favorites-content">
          <div class="no-favorites-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h2 class="no-favorites-title">No favorites yet</h2>
          <p class="no-favorites-description">Start browsing our products and add items to your favorites by clicking the heart icon.</p>
          <NuxtLink to="/products" class="browse-products-btn"> Browse Products </NuxtLink>
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
import ProductCard from '~/components/product/ProductCard.vue';

const { find } = useStrapi();
const globalStore = useGlobalStore();

const loading = ref(true);
const error = ref(null);
const favoriteProducts = ref([]);

// Get favorite product IDs from store
const favoriteIds = computed(() => globalStore.favoriteItems);
console.log('favoriteIds', globalStore.favoriteItems);

// Fetch favorite products
const fetchFavoriteProducts = async () => {
  try {
    loading.value = true;
    error.value = null;

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
    error.value = e.message;
    console.error('Error fetching favorite products:', e);
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
}

.favorites-container {
  max-width: 1400px;
  margin: 0 auto;
}

.favorites-header {
  text-align: center;
  margin-bottom: 3rem;
}

.favorites-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.loading,
.error {
  text-align: center;
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: var(--color-text);
  padding: 2rem;
}

.error {
  color: var(--color-error);
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

.browse-products-btn {
  display: inline-block;
  padding: 0.9rem 1.8rem;
  background: var(--color-gold);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.browse-products-btn:hover {
  background: #b88b2a;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .favorites-page {
    padding: 2rem 1rem;
  }

  .favorites-title {
    font-size: 2rem;
  }

  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>
