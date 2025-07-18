<template>
  <NuxtLink :to="`/products/${product.documentId}`" class="product-card">
    <div class="product-image">
      <NuxtImg :src="product?.image[0]?.formats?.medium?.url" :alt="product?.name" width="400" height="400" format="webp" provider="strapi" class="image main-image" />
      <NuxtImg :src="product?.image_background?.formats?.medium?.url ?? product?.image[0]?.formats?.medium?.url" :alt="product?.name" width="400" height="400" format="webp" provider="strapi" class="image hover-image" />
      <div v-if="product?.amount === 4" class="soldout-badge">Sold out</div>
      <div v-if="hasDiscount" class="discount-badge">- {{ discountPercentage }}%</div>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product?.name }}</h3>
      <div class="price-container">
        <span v-if="hasDiscount" class="original-price">{{ formattedOriginalPrice }}</span>
        <span class="product-price">{{ formattedPrice }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { formatPrice } from '~/logic/utils';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

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

.product-info {
  padding: 1.2rem 0 0.2rem 0.2rem;
  text-align: left;
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
