<template>
  <div class="product-card">
    <div class="product-image">
      <NuxtLink :to="`/products/${product.documentId}`" class="product-link">
        <NuxtImg :src="product?.image[0]?.formats?.medium?.url" :alt="product?.name" width="400" height="400" format="webp" provider="strapi" class="image main-image" />
        <NuxtImg :src="product?.image_background?.formats?.medium?.url ?? product?.image[0]?.formats?.medium?.url" :alt="product?.name" width="400" height="400" format="webp" provider="strapi" class="image hover-image" />
      </NuxtLink>
      <UiFavoriteButton :is-active="isFavorite" class="favorite-btn-position" @toggle="toggleFavorite" />
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
import { useProductPrice } from '~/composables/useProductPrice';
import { useGlobalStore } from '~/stores/global';
import { useToast } from '~/composables/useToast';

const { t } = useI18n();
const { success: toastSuccess } = useToast();

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const globalStore = useGlobalStore();

// Use composable for price calculations
const { formattedPrice, formattedOriginalPrice, hasDiscount, discountPercentage } = useProductPrice(computed(() => props.product));

const isFavorite = computed(() => {
  return globalStore.isFavorite(props.product.documentId);
});

const toggleFavorite = () => {
  const wasFavorite = isFavorite.value;
  globalStore.toggleFavorite(props.product.documentId);
  if (wasFavorite) {
    toastSuccess(t('toast.removedFromFavorites'));
  } else {
    toastSuccess(t('toast.addedToFavorites'));
  }
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

.favorite-btn-position {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
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
