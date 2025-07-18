<template>
  <div class="product-details">
    <div v-if="loading" class="loading">Loading product details...</div>
    <div v-else-if="error" class="error">Error loading product: {{ error }}</div>
    <div v-else-if="!product" class="error">Product not found</div>
    <div v-else class="product-container">
      <!-- Product Image Gallery -->
      <div class="product-gallery">
        <!-- Main Image -->
        <div class="product-image">
          <NuxtImg :src="selectedImage?.formats?.large?.url || product?.image?.[0]?.formats?.large?.url" :alt="product?.name" width="800" height="800" format="webp" provider="strapi" class="image" />
          <button @click="toggleFavorite" class="favorite-btn" :class="{ active: isFavorite }">
            <svg v-if="isFavorite" class="heart-icon filled" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <svg v-else class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        <!-- Thumbnail Gallery -->
        <div v-if="product?.image && product.image.length > 1" class="image-thumbnails">
          <div v-for="(image, index) in product.image" :key="index" class="thumbnail" :class="{ active: selectedImage === image }" @click="selectImage(image)">
            <NuxtImg :src="image.formats?.thumbnail?.url || image.formats?.small?.url" :alt="`${product?.name} - Image ${index + 1}`" width="100" height="100" format="webp" provider="strapi" class="thumbnail-image" />
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <!-- Product Name -->
        <h1 class="product-name">{{ product?.name }}</h1>

        <!-- Price Section -->
        <div class="price-section">
          <div class="price-container">
            <span v-if="hasDiscount" class="original-price">{{ formattedOriginalPrice }}</span>
            <span class="product-price">{{ formattedPrice }}</span>
          </div>
          <div v-if="hasDiscount" class="discount-badge">- {{ discountPercentage }}%</div>
        </div>
        <!--
          <div class="product-meta"></div>
        -->

        <!-- Product Description -->
        <div class="product-description">
          <RichcontentViewer v-if="product?.description_detailed" :content="product.description_detailed" />
        </div>

        <!-- Product Meta -->

        <!-- Action Buttons -->
        <div class="product-actions">
          <div v-if="product?.amount === 0" class="soldout-alert">Sorry, this item is currently sold out</div>
          <template v-else>
            <InputCounter v-if="product?.amount" v-model="quantity" :max="product.amount" />

            <!-- Promocode Input -->
            <div class="promocode-section">
              <input v-model="promocode" type="text" placeholder="Enter promocode" class="promocode-input" />
              <button @click="applyPromocode" class="apply-promocode-btn">Apply</button>
            </div>

            <!-- Divider -->
            <div class="action-divider"></div>

            <button class="add-to-cart" @click="addToCart">Add to Cart</button>
            <NuxtLink to="/cart" class="checkout-btn">Proceed to Checkout</NuxtLink>
          </template>
        </div>
      </div>

      <!-- You might also like section -->
    </div>
    <div v-if="relatedProducts.length > 0" class="related-products-section">
      <h2 class="section-title">You might also like</h2>
      <div class="related-products-grid">
        <ProductCard v-for="product in relatedProducts" :key="product.id" :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatPrice } from '~/logic/utils';
import InputCounter from '~/components/input/InputCounter.vue';
import RichcontentViewer from '~/components/richcontent/RichcontentViewer.vue';
import ProductCard from '~/components/product/ProductCard.vue';
import { useGlobalStore } from '~/stores/global';

const route = useRoute();
const { findOne, find } = useStrapi();
const globalStore = useGlobalStore();

const loading = ref(true);
const error = ref(null);
const product = ref(null);
const selectedImage = ref(null);
const relatedProducts = ref([]);
const promocode = ref('');

const quantity = ref(1);

// Discount calculations
const discountedPrice = computed(() => {
  if (product.value?.discount && product.value?.price) {
    return product.value.price * (1 - product.value.discount / 100);
  }
  return product.value?.price;
});

const formattedPrice = computed(() => {
  return discountedPrice.value ? formatPrice(discountedPrice.value) : '';
});

const formattedOriginalPrice = computed(() => {
  return product.value?.price ? formatPrice(product.value?.price) : '';
});

const hasDiscount = computed(() => {
  return product.value?.discount && product.value?.discount > 0;
});

const discountPercentage = computed(() => {
  if (!hasDiscount.value) return 0;
  return Math.round(product.value.discount);
});

const isFavorite = computed(() => {
  return globalStore.isFavorite(product.value?.documentId);
});

const toggleFavorite = () => {
  globalStore.toggleFavorite(product.value?.documentId);
};

const fetchRelatedProducts = async () => {
  try {
    const { data: relatedResponse } = await find('products', {
      populate: ['image', 'image_background', 'subcategory'],
      filters: {
        id: { $ne: route.params.id }, // Exclude current product
      },
      pagination: {
        page: 1,
        pageSize: 4,
      },
    });
    relatedProducts.value = relatedResponse || [];
  } catch (e) {
    console.error('Error fetching related products:', e);
  }
};

try {
  const { data: response } = await findOne('products', route.params.id, {
    populate: ['image', 'subcategory'],
  });
  product.value = response;

  // Set the first image as selected if images exist
  if (product.value?.image && product.value.image.length > 0) {
    selectedImage.value = product.value.image[0];
  }

  // Fetch related products
  await fetchRelatedProducts();
} catch (e) {
  error.value = e.message;
} finally {
  loading.value = false;
}

const selectImage = (image) => {
  selectedImage.value = image;
};

const addToCart = () => {
  if (!product.value) return;
  globalStore.addToCart(product.value, quantity.value);
};

const applyPromocode = () => {
  if (promocode.value.trim()) {
    // Here you would typically validate the promocode with your backend
    console.log('Applying promocode:', promocode.value);
    // You can add logic here to validate and apply the promocode
  }
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

.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  border: 1px solid #e8d8b4;
}

.favorite-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.heart-icon {
  width: 20px;
  height: 20px;
  color: black;
  transition: all 0.3s ease;
}

.heart-icon.filled {
  color: #e74c3c;
}

.favorite-btn:hover .heart-icon {
  color: #e74c3c;
}

.favorite-btn.active .heart-icon {
  color: #e74c3c;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-thumbnails {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background: white;
}

.thumbnail:hover {
  border-color: var(--color-gold);
  transform: scale(1.05);
}

.thumbnail.active {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 2px rgba(184, 139, 42, 0.3);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.product-name {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.original-price {
  font-size: 1.5rem;
  color: #e74c3c;
  text-decoration: line-through;
  font-weight: 400;
}

.product-price {
  font-size: 2rem;
  color: black;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.discount-badge {
  padding: 0.3rem 0.8rem;
  background: #e74c3c;
  color: #fff;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.product-description {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
}

.product-meta {
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.promocode-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.promocode-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid #e8d8b4;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
}

.promocode-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

.promocode-input::placeholder {
  color: #999;
}

.apply-promocode-btn {
  padding: 0.8rem 1.5rem;
  background: var(--color-gold);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.apply-promocode-btn:hover {
  background: #b88b2a;
  transform: translateY(-1px);
}

.action-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e8d8b4, transparent);
  margin: 1rem 0;
  border-radius: 1px;
}

.soldout-alert {
  padding: 1rem 1.5rem;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;
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

.checkout-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: #23262a;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;
  display: block;
  box-sizing: border-box;
}

.checkout-btn:hover {
  background: #3a3f45;
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

  .product-gallery {
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

  .original-price {
    font-size: 1.2rem;
  }

  .thumbnail {
    width: 60px;
    height: 60px;
  }

  .image-thumbnails {
    gap: 0.25rem;
  }

  .add-to-cart {
    width: auto;
    min-width: 200px;
    margin: 0 auto;
    display: block;
  }

  .checkout-btn {
    width: auto;
    min-width: 200px;
    margin: 0 auto;
    display: block;
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

.related-products-section {
  margin-top: 4rem;
  padding-top: 2rem;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.related-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .related-products-section {
    margin-top: 3rem;
    padding-top: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .related-products-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
}
</style>
