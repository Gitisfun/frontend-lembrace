import { ref } from 'vue';
import { useGlobalStore } from '~/stores/global';

interface RemovedPromotion {
  code: string;
  productName: string;
  message: string;
}

interface CartItem {
  id: number | string;
  name: string;
  promotionCode?: string;
  [key: string]: unknown;
}

export function usePromotionVerification() {
  const globalStore = useGlobalStore();
  const { t, locale } = useI18n();

  const promotionRemovedMessage = ref('');

  /**
   * Verify promotion codes before placing order.
   * Returns true if promotions were removed and order should be stopped.
   */
  const verifyPromotionCodes = async (cartItems: CartItem[], email?: string): Promise<boolean> => {
    const itemsWithPromotions = cartItems.filter((item) => item.promotionCode);

    if (itemsWithPromotions.length === 0) {
      return false; // No promotions to verify, continue with order
    }

    const removedPromotions: RemovedPromotion[] = [];

    for (const item of itemsWithPromotions) {
      // Save the promotion code before we potentially remove it
      const promotionCode = item.promotionCode!;
      const productName = item.name;
      const productId = item.id;

      try {
        const body: { code: string; productId: number | string; email?: string } = {
          code: promotionCode,
          productId: productId,
        };

        // Only include email if available
        if (email) {
          body.email = email;
        }

        const response = await $fetch<{ success: boolean; message?: Record<string, string> }>('/api/promotion-codes/validate', {
          method: 'POST',
          body,
        });

        // If promotion is no longer valid, remove it from the cart item
        if (!response.success) {
          // Remove promotion from cart item (reverts to original product discount)
          globalStore.updateCartItemPromotion(productId, null, 0);
          removedPromotions.push({
            code: promotionCode,
            productName: productName,
            message: response.message?.[locale.value] || response.message?.en || t('payment.promotion.invalidCode'),
          });
        }
      } catch (error) {
        console.error('Error verifying promotion code:', error);
        // On error, remove the promotion to be safe
        globalStore.updateCartItemPromotion(productId, null, 0);
        removedPromotions.push({
          code: promotionCode,
          productName: productName,
          message: t('payment.promotion.verificationFailed'),
        });
      }
    }

    // If promotions were removed, set the message and return true to stop order
    if (removedPromotions.length > 0) {
      const message = removedPromotions
        .map((p) => `${p.code} (${p.productName}): ${p.message}`)
        .join(', ');
      promotionRemovedMessage.value = message;
      return true; // Stop order process
    }

    return false; // Continue with order
  };

  /**
   * Clear the promotion removed message (call when user clicks submit again)
   */
  const clearPromotionMessage = () => {
    promotionRemovedMessage.value = '';
  };

  return {
    promotionRemovedMessage,
    verifyPromotionCodes,
    clearPromotionMessage,
  };
}
