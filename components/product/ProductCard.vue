<template>
  <div class="product-card">
    <div class="product-image">
      <NuxtLink :to="`/products/${product.documentId}`" class="product-link">
        <NuxtImg :src="product?.image[0]?.formats?.medium?.url" :alt="product?.name" width="400" height="400" format="webp" provider="strapi" class="image main-image" />
        <NuxtImg :src="product?.image_background?.formats?.medium?.url ?? product?.image[0]?.formats?.medium?.url" :alt="product?.name" width="400" height="400" format="webp" provider="strapi" class="image hover-image" />
      </NuxtLink>
      <button @click="toggleFavorite" class="favorite-btn" :class="{ active: isFavorite }">
        <svg v-if="isFavorite" class="heart-icon filled" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <svg v-else class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
      <div v-if="product?.amount === 0" class="soldout-badge">Sold out</div>
      <div v-if="hasDiscount" class="discount-badge">- {{ discountPercentage }}%</div>
    </div>
    <NuxtLink :to="`/products/${product.documentId}`" class="product-info">
      <h3 class="product-name">{{ product?.name }}</h3>
      <div class="price-container">
        <span v-if="hasDiscount" class="original-price">{{ formattedOriginalPrice }}</span>
        <span class="product-price">{{ formattedPrice }}</span>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
import { formatPrice } from '~/logic/utils';
import { useGlobalStore } from '~/stores/global';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const globalStore = useGlobalStore();

const discountedPrice = computed(() => {
  if (props?.product?.discount && props?.product?.price) {
    return props.product.price * (1 - props.product.discount / 100);
  }
  return props?.product?.price;
});

const formattedPrice = computed(() => {
  return discountedPrice.value ? formatPrice(discountedPrice.value) : '';
});

const formattedOriginalPrice = computed(() => {
  return props?.product?.price ? formatPrice(props?.product?.price) : '';
});

const hasDiscount = computed(() => {
  return props?.product?.discount && props?.product?.discount > 0;
});

const discountPercentage = computed(() => {
  if (!hasDiscount.value) return 0;
  return Math.round(props.product.discount);
});

const isFavorite = computed(() => {
  return globalStore.isFavorite(props.product.documentId);
});

const toggleFavorite = () => {
  globalStore.toggleFavorite(props.product.documentId);
};
</script>

<style scoped>
.product-card {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  text-decoration: none;
  display: block;
  cursor: pointer;
  position: relative;
  transition: none;
}

.product-image {
  background: #fff;
  aspect-ratio: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0;
  box-shadow: none;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
  display: block;
  transition: opacity 0.3s ease;
}

.main-image {
  opacity: 1;
}

.hover-image {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.product-card:hover .main-image {
  opacity: 0;
}

.product-card:hover .hover-image {
  opacity: 1;
}

.soldout-badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  padding: 0.3rem 1.2rem;
  background: #23262a;
  color: #fff;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  font-family: inherit;
  font-weight: 500;
  letter-spacing: 0.04em;
  z-index: 1;
}

.discount-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.3rem 0.8rem;
  background: #e74c3c;
  color: #fff;
  font-size: 0.8rem;
  border-radius: 0.5rem;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 0.04em;
  z-index: 1;
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

.product-info {
  padding: 1.2rem 0 0.2rem 0.2rem;
  text-align: left;
  text-decoration: none;
  color: inherit;
}

.product-name {
  font-family: inherit;
  font-size: 1rem;
  color: #23262a;
  font-weight: 400;
  letter-spacing: 0.01em;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.original-price {
  font-size: 1rem;
  color: #e74c3c;
  text-decoration: line-through;
  font-weight: 400;
}

.product-price {
  font-size: 1.25rem;
  color: #23262a;
  font-weight: 400;
  letter-spacing: 0.01em;
  margin: 0;
}
</style>
