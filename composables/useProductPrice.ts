import { computed, type MaybeRef, toValue } from 'vue';
import { formatPrice } from '~/logic/utils';

interface ProductWithPrice {
  price?: number;
  discount?: number;
}

export const useProductPrice = (product: MaybeRef<ProductWithPrice | null | undefined>) => {
  const discountedPrice = computed(() => {
    const p = toValue(product);
    if (p?.discount && p?.price) {
      return p.price * (1 - p.discount / 100);
    }
    return p?.price ?? 0;
  });

  const formattedPrice = computed(() => (discountedPrice.value ? formatPrice(discountedPrice.value) : ''));

  const formattedOriginalPrice = computed(() => {
    const p = toValue(product);
    return p?.price ? formatPrice(p.price) : '';
  });

  const hasDiscount = computed(() => {
    const p = toValue(product);
    return (p?.discount ?? 0) > 0;
  });

  const discountPercentage = computed(() => {
    const p = toValue(product);
    return hasDiscount.value ? Math.round(p?.discount ?? 0) : 0;
  });

  return {
    discountedPrice,
    formattedPrice,
    formattedOriginalPrice,
    hasDiscount,
    discountPercentage,
  };
};
