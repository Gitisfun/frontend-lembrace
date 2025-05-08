<template>
  <NuxtLink :to="`/products/${product.documentId}`" class="product-card">
    <!-- Optional Badge -->
    <div v-if="product?.isNew" class="product-badge">NEW</div>
    <!-- NEW -->

    <div class="product-image">
      <NuxtImg :src="product?.image?.formats?.medium?.url" :alt="product?.name" width="400" height="400" format="webp" provider="strapi" class="image" />
      <div class="image-overlay">
        <span class="view-details">View Details</span>
      </div>
    </div>

    <div class="product-info">
      <h3 class="product-name">{{ product?.name }}</h3>
      <p class="product-price">{{ formattedPrice }}</p>
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

const formattedPrice = props?.product?.price ? formatPrice(props?.product?.price) : '';
</script>

<style scoped>
.product-card {
  background: white;
  border: 1px solid #e8d8b4; /* NEW gold-toned border */
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  display: block;
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* NEW Badge */
.product-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: #d4af37;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  letter-spacing: 0.5px;
  z-index: 2;
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-bottom: 1px solid #f0ead6;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.view-details {
  color: white;
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 500;
  padding: 0.6rem 1.2rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 24px;
  backdrop-filter: blur(3px);
  transform: translateY(20px);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.product-card:hover .image {
  transform: scale(1.05);
}

.product-card:hover .image-overlay {
  opacity: 1;
}

.product-card:hover .view-details {
  transform: translateY(0);
}

.product-info {
  padding: 1.5rem;
  text-align: center;
}

.product-name {
  font-family: 'Playfair Display', serif; /* NEW */
  font-size: 1.25rem;
  color: var(--color-text);
  margin-bottom: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.product-price {
  font-size: 1.2rem;
  background: linear-gradient(90deg, #d4af37, #b88b2a); /* NEW */
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
