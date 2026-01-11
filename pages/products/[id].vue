<template>
  <div class="product-details">
    <!-- Loading State -->
    <UiSkeletonProductDetail v-if="loading" />

    <!-- Error State -->
    <UiErrorState v-else-if="error" variant="fullpage" :title="$t('errors.product.title')" :message="$t('errors.product.message')" :retry-text="$t('common.retry')" :home-text="$t('common.goHome')" show-home @retry="fetchProduct" />

    <!-- Not Found State -->
    <UiErrorState v-else-if="!product" variant="fullpage" :title="$t('product.notFound')" :message="$t('errors.product.message')" :home-text="$t('common.goHome')" :show-retry="false" show-home />

    <!-- Product Content -->
    <div v-else class="product-container">
      <!-- Product Image Gallery -->
      <div class="product-gallery">
        <!-- Main Image -->
        <div class="product-image">
          <NuxtImg :src="selectedImage?.formats?.large?.url || product?.image?.[0]?.formats?.large?.url" :alt="product?.name" width="800" height="800" format="webp" provider="strapi" class="image" />
          <UiFavoriteButton :is-active="isFavorite" class="favorite-btn-position" @toggle="toggleFavorite" />
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

        <!-- Material Selector -->
        <ProductMaterialSelector v-if="product?.materials && product.materials.length > 0" v-model="selectedMaterial" :materials="product.materials" />

        <!-- Product Meta -->

        <!-- Action Buttons -->
        <div class="product-actions">
          <div v-if="product?.amount === 0" class="soldout-alert">{{ $t('product.soldOut') }}</div>
          <template v-else>
            <!-- Cart Quantity Indicator -->
            <div v-if="cartQuantity > 0" class="cart-quantity-indicator">
              <IconCart :size="18" />
              <span>{{ $t('product.inCart', { count: cartQuantity }) }}</span>
            </div>

            <InputCounter v-if="product?.amount" v-model="quantity" :max="product.amount" :product-id="product.documentId || product.id" />

            <!-- Max Items Message -->
            <div v-if="showMaxItemsMessage" class="max-items-message">{{ $t('product.maxItems') }}</div>

            <!-- Quantity Adjusted Message -->
            <div v-if="showQuantityAdjustedMessage" class="quantity-adjusted-message">{{ $t('product.quantityAdjusted') }}</div>

            <!-- Promocode Input -->
            <div class="promocode-section">
              <input v-model="promocode" type="text" :placeholder="$t('product.promocode.placeholder')" class="promocode-input" />
              <UiButton variant="primary" size="sm" :text="$t('product.promocode.apply')" @click="applyPromocode" />
            </div>

            <!-- Divider -->
            <div class="action-divider"></div>
            <UiButton variant="primary" full-width :text="$t('product.addToCart')" @click="addToCart" />
            <UiButton v-if="isInCart" variant="danger" full-width :text="$t('product.removeFromCart')" @click="removeFromCart" />
            <UiButton variant="secondary" full-width :arrow="true" :to="localePath('/cart')" :text="$t('product.checkout')" />
          </template>
        </div>
      </div>

      <!-- You might also like section -->
    </div>
    <div v-if="relatedProducts.length > 0" class="related-products-section">
      <h2 class="section-title">{{ $t('product.relatedProducts') }}</h2>
      <div class="related-products-grid">
        <ProductCard v-for="product in relatedProducts" :key="product.id" :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProductPrice } from '~/composables/useProductPrice';
import { useApiError } from '~/composables/useApiError';
import InputCounter from '~/components/input/InputCounter.vue';
import RichcontentViewer from '~/components/richcontent/RichcontentViewer.vue';
import ProductCard from '~/components/product/ProductCard.vue';
import ProductMaterialSelector from '~/components/product/MaterialSelector.vue';
import IconCart from '~/components/icon/IconCart.vue';
import { useGlobalStore } from '~/stores/global';

const { t } = useI18n();
const localePath = useLocalePath();
const { success: toastSuccess, error: toastError } = useToast();

const route = useRoute();
const { findOne, find } = useStrapi();
const globalStore = useGlobalStore();

const loading = ref(true);
const { error, handleError } = useApiError();
const product = ref(null);
const selectedImage = ref(null);
const relatedProducts = ref([]);
const promocode = ref('');
const selectedMaterial = ref(null);

const quantity = ref(1);
const showMaxItemsMessage = ref(false);
const showQuantityAdjustedMessage = ref(false);

// Use composable for price calculations
const { formattedPrice, formattedOriginalPrice, hasDiscount, discountPercentage } = useProductPrice(product);

const isInCart = computed(() => {
  if (!product.value) return false;
  const productId = product.value.documentId || product.value.id;
  return globalStore.cartItems.some((item) => item.id === productId);
});

const cartQuantity = computed(() => {
  if (!product.value) return 0;
  const productId = product.value.documentId || product.value.id;
  const cartItem = globalStore.cartItems.find((item) => item.id === productId);
  return cartItem?.amount || 0;
});

const isFavorite = computed(() => {
  return globalStore.isFavorite(product.value?.documentId);
});

const toggleFavorite = () => {
  const wasFavorite = isFavorite.value;
  globalStore.toggleFavorite(product.value?.documentId);
  if (wasFavorite) {
    toastSuccess(t('toast.removedFromFavorites'));
  } else {
    toastSuccess(t('toast.addedToFavorites'));
  }
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
    // Silently fail for related products - not critical
  }
};

const fetchProduct = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data: response } = await findOne('products', route.params.id, {
      populate: ['image', 'subcategory', 'materials'],
    });
    product.value = response;

    // Set the first image as selected if images exist
    if (product.value?.image && product.value.image.length > 0) {
      selectedImage.value = product.value.image[0];
    }

    // Fetch related products
    await fetchRelatedProducts();
  } catch (e) {
    handleError(e, 'Failed to load product');
  } finally {
    loading.value = false;
  }
};

await fetchProduct();

// SEO Meta - dynamic based on product
useSeoMeta({
  title: () => (product.value?.name ? `${product.value.name}${t('seo.product.titleSuffix')}` : t('seo.products.title')),
  description: () => product.value?.description_short || product.value?.name || t('seo.products.description'),
  ogTitle: () => (product.value?.name ? `${product.value.name}${t('seo.product.titleSuffix')}` : t('seo.products.title')),
  ogDescription: () => product.value?.description_short || product.value?.name || t('seo.products.description'),
  ogImage: () => product.value?.image?.[0]?.formats?.large?.url || '/logo-lembrace.png',
  twitterTitle: () => (product.value?.name ? `${product.value.name}${t('seo.product.titleSuffix')}` : t('seo.products.title')),
  twitterDescription: () => product.value?.description_short || product.value?.name || t('seo.products.description'),
});

const selectImage = (image) => {
  selectedImage.value = image;
};

const addToCart = () => {
  if (!product.value) return;
  const success = globalStore.addToCart(product.value, quantity.value, selectedMaterial.value);
  if (!success) {
    showMaxItemsMessage.value = true;
    setTimeout(() => {
      showMaxItemsMessage.value = false;
    }, 5000);
  } else {
    toastSuccess(t('toast.addedToCart'));
    // Check if quantity was adjusted
    const cartItem = globalStore.cartItems.find((item) => item.id === (product.value.documentId || product.value.id));
    if (cartItem && cartItem.amount !== quantity.value) {
      showQuantityAdjustedMessage.value = true;
      setTimeout(() => {
        showQuantityAdjustedMessage.value = false;
      }, 5000);
    }
  }
};

const removeFromCart = () => {
  if (!product.value) return;
  globalStore.removeFromCart(product.value.documentId || product.value.id);
  toastSuccess(t('toast.removedFromCart'));
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

.favorite-btn-position {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
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

.cart-quantity-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.15) 0%, rgba(212, 167, 98, 0.25) 100%);
  border: 1px solid rgba(212, 167, 98, 0.3);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-gold-dark, #b8956f);
}

.cart-quantity-indicator svg {
  color: var(--color-gold, #d4a762);
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

.max-items-message {
  padding: 1rem 1.5rem;
  background: #fef3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;
  animation: fadeIn 0.3s ease-in-out;
}

.quantity-adjusted-message {
  padding: 1rem 1.5rem;
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;
  animation: fadeIn 0.3s ease-in-out;
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
