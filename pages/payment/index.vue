<template>
  <div class="payment-page">
    <div class="payment-container">
      <!-- Order Summary -->
      <div class="order-summary">
        <h2>{{ $t('payment.orderSummary') }}</h2>
        <div class="summary-items">
          <div v-for="item in cartItems" :key="item.id" class="summary-item">
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">x{{ item.amount }}</span>
            </div>
            <span class="item-price">€{{ item.calculatedPrice.toFixed(2) }}</span>
          </div>
        </div>
        <div class="summary-totals">
          <div class="summary-row">
            <span>{{ $t('cart.subtotal') }}</span>
            <span>€{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>{{ $t('cart.shipping') }}</span>
            <span>€{{ shippingCost.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>{{ $t('cart.total') }}</span>
            <span>€{{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Form -->
      <form class="payment-form" @submit.prevent="handleSubmit" novalidate>
        <h2>{{ $t('payment.personalInfo') }}</h2>

        <div class="form-section">
          <h3>{{ $t('payment.contactDetails') }}</h3>
          <div class="form-grid">
            <InputField id="firstName" v-model="form.firstName" :label="$t('payment.form.firstName')" type="text" required :placeholder="$t('payment.form.firstName')" :error="errors.firstName" :force-validation="forceValidation" show-success @blur="validateField('firstName')" />
            <InputField id="lastName" v-model="form.lastName" :label="$t('payment.form.lastName')" type="text" required :placeholder="$t('payment.form.lastName')" :error="errors.lastName" :force-validation="forceValidation" show-success @blur="validateField('lastName')" />
            <InputField id="email" v-model="form.email" :label="$t('payment.form.email')" type="email" required :placeholder="$t('payment.form.email')" :error="errors.email" :force-validation="forceValidation" show-success @blur="validateField('email')" />
            <InputField id="phone" v-model="form.phone" :label="$t('payment.form.phone')" type="tel" :placeholder="$t('payment.form.phone')" :error="errors.phone" :force-validation="forceValidation" show-success @blur="validateField('phone')" />
          </div>
        </div>

        <div class="form-section">
          <h3>{{ $t('payment.shippingAddress') }}</h3>
          <div class="form-grid">
            <InputField id="street" v-model="form.street" :label="$t('payment.form.street')" type="text" required :placeholder="$t('payment.form.street')" :error="errors.street" :force-validation="forceValidation" show-success @blur="validateField('street')" />
            <InputField id="houseNumber" v-model="form.houseNumber" :label="$t('payment.form.houseNumber')" type="text" required :placeholder="$t('payment.form.houseNumber')" :error="errors.houseNumber" :force-validation="forceValidation" show-success @blur="validateField('houseNumber')" />
            <InputField id="boxNumber" v-model="form.boxNumber" :label="$t('payment.form.boxNumber')" type="text" show-optional :placeholder="$t('payment.form.boxNumberOptional')" />
            <InputField id="postalCode" v-model="form.postalCode" :label="$t('payment.form.postalCode')" type="text" required :placeholder="$t('payment.form.postalCode')" :error="errors.postalCode" :force-validation="forceValidation" show-success @blur="validateField('postalCode')" />
            <InputField id="city" v-model="form.city" :label="$t('payment.form.city')" type="text" required :placeholder="$t('payment.form.city')" :error="errors.city" :force-validation="forceValidation" show-success @blur="validateField('city')" />
            <InputSelect id="country" v-model="form.country" :label="$t('payment.form.country')" required :placeholder="$t('payment.form.selectCountry')" :options="countryOptions" :error="errors.country" show-success @blur="validateField('country')" />
          </div>
        </div>

        <div class="form-section">
          <h3>{{ $t('payment.delivery.title') }}</h3>
          <InputRadioGroup v-model="form.deliveryMethod" :options="deliveryOptions" required />
        </div>

        <div class="form-actions">
          <UiButtonSubmit disabled :text="$t('payment.placeOrder')" :loading="isSubmitting" :loading-text="$t('payment.processing')" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue';
import { useGlobalStore } from '~/stores/global';
import { useRouter } from 'vue-router';
import { useToast } from '~/composables/useToast';
import { useFormValidation, validators } from '~/composables/useFormValidation';
import { useSubmitStatus } from '~/composables/useSubmitStatus';

const { t } = useI18n();
const { error: toastError } = useToast();

// SEO Meta
useSeoMeta({
  title: () => t('seo.payment.title'),
  description: () => t('seo.payment.description'),
  robots: 'noindex, nofollow',
});

const { create } = useStrapi();
const router = useRouter();
const globalStore = useGlobalStore();
const { isSubmitting, withSubmit, stopSubmitting } = useSubmitStatus();
const forceValidation = ref(false);

const cartItems = computed(() => globalStore.cartItems);
const subtotal = computed(() => globalStore.cartTotal);
const shippingCost = 2.5;
const total = computed(() => subtotal.value + shippingCost);

const form = reactive({
  // Personal Information
  firstName: '',
  lastName: '',
  email: '',
  phone: '',

  // Delivery Address
  street: '',
  houseNumber: '',
  boxNumber: '',
  postalCode: '',
  city: '',
  country: '',

  // Delivery Method
  deliveryMethod: 'standard',
});

// Validation schema
const fieldConfigs = {
  firstName: {
    rules: [validators.name()],
  },
  lastName: {
    rules: [validators.name()],
  },
  email: {
    rules: [validators.email()],
  },
  phone: {
    rules: [validators.phone()],
  },
  street: {
    rules: [validators.required('street address')],
  },
  houseNumber: {
    rules: [validators.required('house number')],
  },
  postalCode: {
    rules: [validators.required('postal code')],
  },
  city: {
    rules: [validators.required('city')],
  },
  country: {
    rules: [validators.required('country')],
  },
};

const { errors, validateField, validateAll, clearError } = useFormValidation(form, fieldConfigs);

const countryOptions = computed(() => [
  { value: 'Nederland', label: t('payment.form.countries.netherlands') },
  { value: 'België', label: t('payment.form.countries.belgium') },
  { value: 'Duitsland', label: t('payment.form.countries.germany') },
  { value: 'Frankrijk', label: t('payment.form.countries.france') },
  { value: 'Verenigd Koninkrijk', label: t('payment.form.countries.uk') },
  { value: 'andere', label: t('payment.form.countries.other') },
]);

const deliveryOptions = computed(() => [
  { value: 'standard', title: t('payment.delivery.standard'), details: t('payment.delivery.standardTime') },
  { value: 'express', title: t('payment.delivery.express'), details: t('payment.delivery.expressTime') },
]);

const generateOrderNumber = () => {
  // Generate a UUID v4
  return 'ORD-' + crypto.randomUUID();
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  // Force validation display on all fields
  forceValidation.value = true;

  // Validate all fields
  if (!validateAll()) {
    toastError(t('payment.form.validationError'));
    return;
  }

  await withSubmit(async () => {
    const orderData = {
      orderNumber: generateOrderNumber(),
      unique_order_number: crypto.randomUUID(),
      orderStatus: 'pending',
      totalPrice: total.value,
      shippingCost: shippingCost,
      customerInfo: {
        firstname: form.firstName,
        lastname: form.lastName,
        email: form.email,
        phone: form.phone,
      },
      address: {
        street: form.street,
        number: form.houseNumber,
        box: form.boxNumber || null,
        postalcode: form.postalCode,
        city: form.city,
        country: form.country,
      },
      items: cartItems.value.map((item) => ({
        productId: item.documentId || item.id,
        name: item.name,
        amount: item.amount,
        price: item.price,
        discount: item.discount || 0,
        calculatedPrice: item.calculatedPrice,
      })),
    };

    console.log('Sending order data to Strapi:', orderData);

    // First create the order in Strapi
    const result = await create('orders', orderData);
    console.log('Order created successfully:', result);

    // Add the Strapi order ID to the order data for Mollie
    const orderDataWithId = {
      ...orderData,
      orderId: result.data.id,
    };

    // Create Mollie payment
    const mollieResponse = await $fetch('/api/mollie/create-payment', {
      method: 'POST',
      body: { orderData: orderDataWithId },
    });

    if (mollieResponse.success && mollieResponse.checkoutUrl) {
      // Clear cart after successful order creation
      globalStore.clearCart();

      // Redirect to Mollie checkout
      window.location.href = mollieResponse.checkoutUrl;
    } else {
      throw new Error('Failed to create Mollie payment');
    }
  })
    .catch((error) => {
      console.error('Payment failed:', error);
      toastError(t('payment.orderError'));
    })
    .finally(() => {
      stopSubmitting();
    });
};
</script>

<style scoped>
.payment-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 70px);
}

.payment-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.order-summary {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.order-summary h2 {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.summary-items {
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 500;
}

.item-quantity {
  font-size: 0.9rem;
  color: #666;
}

.item-price {
  font-weight: 500;
}

.summary-totals {
  margin-top: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: var(--color-text);
}

.summary-row.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 600;
  font-size: 1.2rem;
}

.payment-form {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
}

.payment-form h2 {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--color-text);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-family: var(--font-primary);
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  margin-top: 2rem;
}

.form-actions :deep(.submit-btn) {
  width: 100%;
}

@media (max-width: 1024px) {
  .payment-container {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .payment-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .payment-form,
  .order-summary {
    padding: 1.5rem;
  }

  .payment-form h2,
  .order-summary h2 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }

  .form-section h3 {
    font-size: 1.1rem;
  }
}
</style>
