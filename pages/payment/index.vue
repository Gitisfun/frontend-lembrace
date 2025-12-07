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
            <InputField id="firstName" v-model="form.firstName" :label="$t('payment.form.firstName')" type="text" required :placeholder="$t('payment.form.firstName')" />
            <InputField id="lastName" v-model="form.lastName" :label="$t('payment.form.lastName')" type="text" required :placeholder="$t('payment.form.lastName')" />
            <InputField id="email" v-model="form.email" :label="$t('payment.form.email')" type="email" required :placeholder="$t('payment.form.email')" />
            <InputField id="phone" v-model="form.phone" :label="$t('payment.form.phone')" type="tel" required :placeholder="$t('payment.form.phone')" />
          </div>
        </div>

        <div class="form-section">
          <h3>{{ $t('payment.shippingAddress') }}</h3>
          <div class="form-grid">
            <InputField id="street" v-model="form.street" :label="$t('payment.form.street')" type="text" required :placeholder="$t('payment.form.street')" />
            <InputField id="houseNumber" v-model="form.houseNumber" :label="$t('payment.form.houseNumber')" type="text" required :placeholder="$t('payment.form.houseNumber')" />
            <InputField id="boxNumber" v-model="form.boxNumber" :label="$t('payment.form.boxNumber')" type="text" show-optional :placeholder="$t('payment.form.boxNumberOptional')" />
            <InputField id="postalCode" v-model="form.postalCode" :label="$t('payment.form.postalCode')" type="text" required :placeholder="$t('payment.form.postalCode')" />
            <InputField id="city" v-model="form.city" :label="$t('payment.form.city')" type="text" required :placeholder="$t('payment.form.city')" />
            <InputSelect id="country" v-model="form.country" :label="$t('payment.form.country')" required :placeholder="$t('payment.form.selectCountry')" :options="countryOptions" />
          </div>
        </div>

        <div class="form-section">
          <h3>{{ $t('payment.delivery.title') }}</h3>
          <div class="delivery-options">
            <label class="delivery-option">
              <input type="radio" v-model="form.deliveryMethod" value="standard" required />
              <div class="option-content">
                <span class="option-title">{{ $t('payment.delivery.standard') }}</span>
                <span class="option-details">{{ $t('payment.delivery.standardTime') }}</span>
              </div>
            </label>
            <label class="delivery-option">
              <input type="radio" v-model="form.deliveryMethod" value="express" required />
              <div class="option-content">
                <span class="option-title">{{ $t('payment.delivery.express') }}</span>
                <span class="option-details">{{ $t('payment.delivery.expressTime') }}</span>
              </div>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button @click="handleSubmit" type="submit" class="submit-btn">{{ $t('payment.placeOrder') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useGlobalStore } from '~/stores/global';
import { useRouter } from 'vue-router';
import { useToast } from '~/composables/useToast';

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
const isLoading = ref(false);

const cartItems = computed(() => globalStore.cartItems);
const subtotal = computed(() => globalStore.cartTotal);
const shippingCost = 2.5;
const total = computed(() => subtotal.value + shippingCost);

const form = ref({
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

const countryOptions = computed(() => [
  { value: 'Nederland', label: t('payment.form.countries.netherlands') },
  { value: 'België', label: t('payment.form.countries.belgium') },
  { value: 'Duitsland', label: t('payment.form.countries.germany') },
  { value: 'Frankrijk', label: t('payment.form.countries.france') },
  { value: 'Verenigd Koninkrijk', label: t('payment.form.countries.uk') },
  { value: 'andere', label: t('payment.form.countries.other') },
]);

const generateOrderNumber = () => {
  // Generate a UUID v4
  return 'ORD-' + crypto.randomUUID();
};

const handleSubmit = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    const orderData = {
      orderNumber: generateOrderNumber(),
      unique_order_number: crypto.randomUUID(),
      orderStatus: 'pending',
      totalPrice: total.value,
      shippingCost: shippingCost,
      customerInfo: {
        firstname: form.value.firstName,
        lastname: form.value.lastName,
        email: form.value.email,
        phone: form.value.phone,
      },
      address: {
        street: form.value.street,
        number: form.value.houseNumber,
        box: form.value.boxNumber || null,
        postalcode: form.value.postalCode,
        city: form.value.city,
        country: form.value.country,
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
  } catch (error) {
    console.error('Payment failed:', error);
    toastError(t('payment.orderError'));
  } finally {
    isLoading.value = false;
  }
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

.delivery-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delivery-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delivery-option:hover {
  border-color: var(--color-gold);
}

.delivery-option input[type='radio'] {
  width: 20px;
  height: 20px;
  accent-color: var(--color-gold);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-title {
  font-weight: 500;
}

.option-details {
  font-size: 0.9rem;
  color: #666;
}

.form-actions {
  margin-top: 2rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: var(--color-gold);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background: #b88b2a;
  transform: translateY(-2px);
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

  .submit-btn {
    font-size: 1rem;
    padding: 0.9rem;
  }
}
</style>
