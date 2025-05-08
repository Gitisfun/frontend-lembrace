<template>
  <div class="product-details">
    <div v-if="loading" class="loading">Loading product details...</div>
    <div v-else-if="error" class="error">Error loading product: {{ error }}</div>
    <div v-else-if="!product" class="error">Product not found</div>
    <div v-else class="product-container">
      <!-- Product Image -->
      <div class="product-image">
        <NuxtImg :src="product?.image?.formats?.large?.url" :alt="product?.name" width="800" height="800" format="webp" provider="strapi" class="image" />
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <div class="product-header">
          <div>
            <h1 class="product-name">{{ product?.name }}</h1>
            <div class="title-decoration"></div>
          </div>
          <p class="product-price">{{ formattedPrice }}</p>
        </div>

        <div class="product-meta">
          <div class="product-description">
            <p>{{ product?.description }}</p>
          </div>
          <div v-if="product?.amount" class="meta-item">
            <span class="meta-label">Available:</span>
            <span class="meta-value">{{ product.amount }} in stock</span>
          </div>

          <!-- Materials Dropdown -->
          <div v-if="product?.materials?.length" class="meta-item">
            <InputDropdown :items="product.materials" v-model="selectedMaterials" label="Materials" placeholder="Select materials" />
          </div>
        </div>

        <div class="product-actions">
          <InputCounter v-if="product?.amount" v-model="quantity" :max="product.amount" />
          <button class="add-to-cart" @click="addToCart">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatPrice } from '~/logic/utils';
import InputDropdown from '~/components/input/InputDropdown.vue';
import InputCounter from '~/components/input/InputCounter.vue';
import { useGlobalStore } from '~/stores/global';

const route = useRoute();
const { findOne } = useStrapi();
const globalStore = useGlobalStore();

const loading = ref(true);
const error = ref(null);
const product = ref(null);
const formattedPrice = ref('');

const selectedMaterials = ref([]);
const quantity = ref(1);

// Initialize values when product is loaded
watch(
  () => product.value,
  (newProduct) => {
    if (newProduct?.materials?.length) {
      selectedMaterials.value = [newProduct.materials[0].id];
    } else {
      selectedMaterials.value = [];
    }
  },
  { immediate: true }
);

try {
  const { data: response } = await findOne('products', route.params.id, {
    populate: ['image', 'materials', 'category'],
  });
  product.value = response;
  formattedPrice.value = product.value?.price ? formatPrice(product.value.price) : '';
} catch (e) {
  error.value = e.message;
} finally {
  loading.value = false;
}

const addToCart = () => {
  if (!product.value) return;
  console.log('selectedMaterials.value');
  console.log(selectedMaterials.value);
  globalStore.addToCart(product.value, quantity.value, selectedMaterials.value);
};
</script>

<style scoped>
.product-details {
  padding: 4rem 2rem;
  min-height: calc(100vh - 70px);
}

.product-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  border: 1px solid #e8d8b4;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 2rem;
}

.product-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.product-price {
  font-size: 1.8rem;
  color: black;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: white;
  border: 2px solid var(--color-gold);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: inline-block;
  margin-left: 2rem;
}

.product-description {
  margin-bottom: 2rem;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
}

.product-meta {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fcf8f3;
  border-radius: 12px;
  border: 1px solid #e8d8b4;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e8d8b4;
}

.meta-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.meta-label {
  font-weight: 600;
  color: var(--color-text);
}

.meta-value {
  color: var(--color-text);
}

.product-actions {
  margin-top: 2rem;
}

.add-to-cart {
  width: 100%;
  padding: 1rem 2rem;
  background: var(--color-gold);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart:hover {
  background: #b88b2a;
  transform: translateY(-2px);
}
.title-decoration {
  width: 15%;
  height: 2px;
  background: var(--color-gold);
  opacity: 0.7;
  transition: width 0.3s ease;
}

@media (max-width: 1024px) {
  .product-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .product-image {
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .product-details {
    padding: 2rem 1rem;
  }

  .product-name {
    font-size: 2rem;
  }

  .product-price {
    font-size: 1.5rem;
  }
}

.loading,
.error {
  text-align: center;
  padding: 4rem;
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: var(--color-text);
}

.error {
  color: var(--color-error);
}
</style>
