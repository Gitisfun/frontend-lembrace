<template>
  <div class="promocode-section">
    <!-- Applied promocode display -->
    <div v-if="promocodeValidated && appliedPromocode" class="promocode-applied">
      <div class="promocode-applied-header">
        <div class="promocode-applied-content">
          <IconCheck :size="18" class="promocode-check-icon" />
          <span class="promocode-code">{{ appliedPromocode }}</span>
          <span class="promocode-discount">-{{ appliedPromocodeDiscount }}%</span>
        </div>
        <button type="button" class="promocode-remove" @click="removePromocode">
          <IconX :size="16" />
        </button>
      </div>
      <p v-if="promocodeSuccessMessage" class="promocode-success-message">{{ promocodeSuccessMessage }}</p>
    </div>
    
    <!-- Promocode input (hidden when code is applied) -->
    <template v-else>
      <div class="promocode-input-wrapper">
        <input
          v-model="promocode"
          type="text"
          :placeholder="$t('product.promocode.placeholder')"
          class="promocode-input"
          :class="{ 'has-error': promocodeError }"
          :disabled="isValidatingPromocode"
          @keyup.enter="applyPromocode"
        />
        <UiButton
          variant="primary"
          size="sm"
          :text="isValidatingPromocode ? $t('product.promocode.applying') : $t('product.promocode.apply')"
          :disabled="isValidatingPromocode"
          @click="applyPromocode"
        />
      </div>
      <p v-if="promocodeError" class="promocode-error">{{ promocodeError }}</p>
    </template>
  </div>
</template>

<script setup>
import IconCheck from '~/components/icon/IconCheck.vue';
import IconX from '~/components/icon/IconX.vue';
import { useAuthStore } from '~/stores/auth';

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
  isInCart: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['applied', 'removed']);

const { t, locale } = useI18n();
const { success: toastSuccess } = useToast();
const authStore = useAuthStore();

// Promocode state
const promocode = ref('');
const isValidatingPromocode = ref(false);
const promocodeValidated = ref(false);
const promocodeError = ref('');
const promocodeSuccessMessage = ref('');
const appliedPromocode = ref(null);
const appliedPromocodeDiscount = ref(0);

const applyPromocode = async () => {
  const code = promocode.value.trim();
  
  // Reset error state
  promocodeError.value = '';
  
  if (!code) {
    promocodeError.value = t('product.promocode.error.empty');
    return;
  }
  
  isValidatingPromocode.value = true;
  
  try {
    // Build request body - include email if user is logged in
    const requestBody = {
      code,
      productId: props.productId,
    };
    
    // Only add email if user is authenticated
    if (authStore.isAuthenticated && authStore.currentUser?.email) {
      requestBody.email = authStore.currentUser.email;
    }
    
    const response = await $fetch('/api/promotion-codes/validate', {
      method: 'POST',
      body: requestBody,
    });
    
    if (response.success) {
      // Store the applied promotion code, discount and message
      appliedPromocode.value = response.code;
      appliedPromocodeDiscount.value = response.discount;
      promocodeValidated.value = true;
      promocodeError.value = '';
      
      // Store and show localized success message from API
      const message = response.message[locale.value] || response.message.en;
      promocodeSuccessMessage.value = message;
      toastSuccess(message);
      
      // Emit applied event with code and discount
      emit('applied', {
        code: response.code,
        discount: response.discount,
      });
    } else {
      // Show localized error message from API
      const message = response.message[locale.value] || response.message.en;
      promocodeError.value = message;
      promocodeValidated.value = false;
      appliedPromocode.value = null;
      appliedPromocodeDiscount.value = 0;
    }
  } catch (e) {
    console.error('Promotion code validation failed:', e);
    promocodeError.value = t('product.promocode.error.generic');
    promocodeValidated.value = false;
    appliedPromocode.value = null;
    appliedPromocodeDiscount.value = 0;
  } finally {
    isValidatingPromocode.value = false;
  }
};

const removePromocode = () => {
  // Emit removed event before clearing state
  emit('removed');
  
  promocode.value = '';
  appliedPromocode.value = null;
  appliedPromocodeDiscount.value = 0;
  promocodeValidated.value = false;
  promocodeError.value = '';
  promocodeSuccessMessage.value = '';
  toastSuccess(t('product.promocode.removed'));
};

// Expose state for parent component if needed
defineExpose({
  appliedPromocode,
  appliedPromocodeDiscount,
  promocodeValidated,
});
</script>

<style scoped>
.promocode-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.promocode-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}

.promocode-input {
  flex: 1;
  min-width: 0;
  padding: 0.8rem 1rem;
  border: 1px solid #e8d8b4;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.promocode-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

.promocode-input::placeholder {
  color: #999;
}

.promocode-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.promocode-input.has-error {
  border-color: #e74c3c;
}

.promocode-error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin: 0;
  padding-left: 0.25rem;
}

.promocode-applied {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.15) 100%);
  border: 1px solid rgba(39, 174, 96, 0.3);
  border-radius: 8px;
  animation: fadeIn 0.3s ease-in-out;
}

.promocode-applied-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.promocode-applied-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.promocode-success-message {
  margin: 0;
  font-size: 0.85rem;
  color: #1e8449;
  font-family: var(--font-body);
  line-height: 1.4;
}

.promocode-check-icon {
  color: #27ae60;
  flex-shrink: 0;
}

.promocode-code {
  font-family: var(--font-body);
  font-weight: 600;
  color: #1e8449;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.promocode-discount {
  font-family: var(--font-body);
  font-weight: 700;
  color: #27ae60;
  background: rgba(39, 174, 96, 0.15);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.promocode-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.promocode-remove:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #e74c3c;
}

@media (max-width: 768px) {
  .promocode-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .promocode-input {
    width: 100%;
  }

  .promocode-applied {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .promocode-applied-content {
    flex: 1;
    min-width: 0;
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
