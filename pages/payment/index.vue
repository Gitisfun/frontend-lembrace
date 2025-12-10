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
            <InputField
              id="firstName"
              v-model="form.firstName"
              :label="$t('payment.form.firstName')"
              type="text"
              required
              :placeholder="$t('payment.form.firstName')"
              :error="errors.firstName"
              :force-validation="forceValidation"
              show-success
              :disabled="isAuthenticated"
              @blur="validateField('firstName')"
              @update:model-value="handleFieldInput('firstName')"
            />
            <InputField
              id="lastName"
              v-model="form.lastName"
              :label="$t('payment.form.lastName')"
              type="text"
              required
              :placeholder="$t('payment.form.lastName')"
              :error="errors.lastName"
              :force-validation="forceValidation"
              show-success
              :disabled="isAuthenticated"
              @blur="validateField('lastName')"
              @update:model-value="handleFieldInput('lastName')"
            />
            <InputField
              id="email"
              v-model="form.email"
              :label="$t('payment.form.email')"
              type="email"
              required
              :placeholder="$t('payment.form.email')"
              :error="errors.email"
              :force-validation="forceValidation"
              show-success
              :disabled="isAuthenticated"
              @blur="validateField('email')"
              @update:model-value="handleFieldInput('email')"
            />
            <InputField id="phone" v-model="form.phone" :label="$t('payment.form.phone')" type="tel" :placeholder="$t('payment.form.phone')" :error="errors.phone" :force-validation="forceValidation" show-success @blur="validateField('phone')" @update:model-value="handleFieldInput('phone')" />
          </div>
        </div>
        <UiDivider />

        <!-- Shipping Address Section -->
        <div class="form-section">
          <h3>{{ $t('payment.shippingAddress') }}</h3>

          <!-- Address Selection for Logged-in Users -->
          <div v-if="isAuthenticated && hasAddresses" class="address-selection">
            <div class="address-options">
              <!-- Existing Addresses -->
              <label v-for="address in userAddresses" :key="address.id" class="address-option" :class="{ selected: selectedShippingAddressId === address.id }" @click="selectShippingAddress(address)">
                <input type="radio" :value="address.id" :checked="selectedShippingAddressId === address.id" name="shippingAddress" />
                <div class="option-content">
                  <span class="option-title">{{ formatAddressTitle(address) }}</span>
                  <span class="option-details">{{ formatAddressDetails(address) }}</span>
                </div>
              </label>

              <!-- New Address Option -->
              <label class="address-option" :class="{ selected: selectedShippingAddressId === 'new' }" @click="selectNewShippingAddress">
                <input type="radio" value="new" :checked="selectedShippingAddressId === 'new'" name="shippingAddress" />
                <div class="option-content">
                  <span class="option-title">{{ $t('payment.useNewAddress') }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- New Address Form (shown for guests or when "new address" is selected) -->
          <div v-if="!isAuthenticated || !hasAddresses || selectedShippingAddressId === 'new'" class="new-address-form">
            <div class="form-grid">
              <InputField
                id="street"
                v-model="form.street"
                :label="$t('payment.form.street')"
                type="text"
                required
                :placeholder="$t('payment.form.street')"
                :error="errors.street"
                :force-validation="forceValidation"
                show-success
                @blur="validateField('street')"
                @update:model-value="handleFieldInput('street')"
              />
              <InputField
                id="houseNumber"
                v-model="form.houseNumber"
                :label="$t('payment.form.houseNumber')"
                type="text"
                required
                :placeholder="$t('payment.form.houseNumber')"
                :error="errors.houseNumber"
                :force-validation="forceValidation"
                show-success
                @blur="validateField('houseNumber')"
                @update:model-value="handleFieldInput('houseNumber')"
              />
              <InputField id="boxNumber" v-model="form.boxNumber" :label="$t('payment.form.boxNumber')" type="text" show-optional :placeholder="$t('payment.form.boxNumberOptional')" />
              <InputField
                id="postalCode"
                v-model="form.postalCode"
                :label="$t('payment.form.postalCode')"
                type="text"
                required
                :placeholder="$t('payment.form.postalCode')"
                :error="errors.postalCode"
                :force-validation="forceValidation"
                show-success
                @blur="validateField('postalCode')"
                @update:model-value="handleFieldInput('postalCode')"
              />
              <InputField id="city" v-model="form.city" :label="$t('payment.form.city')" type="text" required :placeholder="$t('payment.form.city')" :error="errors.city" :force-validation="forceValidation" show-success @blur="validateField('city')" @update:model-value="handleFieldInput('city')" />
              <InputSelect
                id="country"
                v-model="form.country"
                :label="$t('payment.form.country')"
                required
                :placeholder="$t('payment.form.selectCountry')"
                :options="countryOptions"
                :error="errors.country"
                show-success
                @blur="validateField('country')"
                @update:model-value="handleFieldInput('country')"
              />
            </div>

            <!-- Save address checkbox for logged-in users -->
            <div v-if="isAuthenticated" class="save-address-option">
              <label class="checkbox-label">
                <input type="checkbox" v-model="saveNewShippingAddress" />
                <span>{{ $t('payment.saveAddress') }}</span>
              </label>
            </div>
          </div>
        </div>
        <UiDivider />

        <!-- Billing Address Section -->
        <div class="form-section">
          <h3>{{ $t('payment.billingAddress') }}</h3>

          <div class="address-options">
            <!-- Same as Shipping -->
            <label class="address-option" :class="{ selected: useSameAddressForBilling }" @click="setUseSameAddressForBilling(true)">
              <input type="radio" value="same" :checked="useSameAddressForBilling" name="billingAddressChoice" />
              <div class="option-content">
                <span class="option-title">{{ $t('payment.sameAsShipping') }}</span>
              </div>
            </label>

            <!-- Different Billing Address -->
            <label class="address-option" :class="{ selected: !useSameAddressForBilling }" @click="setUseSameAddressForBilling(false)">
              <input type="radio" value="different" :checked="!useSameAddressForBilling" name="billingAddressChoice" />
              <div class="option-content">
                <span class="option-title">{{ $t('payment.useDifferentBilling') }}</span>
              </div>
            </label>
          </div>

          <!-- Billing Address Selection (when different from shipping) -->
          <div v-if="!useSameAddressForBilling" class="billing-address-section">
            <!-- Address Selection for Logged-in Users -->
            <div v-if="isAuthenticated && hasBillingAddresses" class="address-selection">
              <div class="address-options">
                <!-- Existing Billing Addresses -->
                <label v-for="address in billingAddresses" :key="address.id" class="address-option" :class="{ selected: selectedBillingAddressId === address.id }" @click="selectBillingAddress(address)">
                  <input type="radio" :value="address.id" :checked="selectedBillingAddressId === address.id" name="billingAddress" />
                  <div class="option-content">
                    <span class="option-title">{{ formatAddressTitle(address) }}</span>
                    <span class="option-details">{{ formatAddressDetails(address) }}</span>
                  </div>
                </label>

                <!-- New Billing Address Option -->
                <label class="address-option" :class="{ selected: selectedBillingAddressId === 'new' }" @click="selectNewBillingAddress">
                  <input type="radio" value="new" :checked="selectedBillingAddressId === 'new'" name="billingAddress" />
                  <div class="option-content">
                    <span class="option-title">{{ $t('payment.useNewAddress') }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- New Billing Address Form -->
            <div v-if="!isAuthenticated || !hasBillingAddresses || selectedBillingAddressId === 'new'" class="new-address-form">
              <div class="form-grid">
                <InputField
                  id="billingStreet"
                  v-model="form.billingStreet"
                  :label="$t('payment.form.street')"
                  type="text"
                  required
                  :placeholder="$t('payment.form.street')"
                  :error="billingErrors.billingStreet"
                  :force-validation="forceValidation"
                  show-success
                  @blur="validateBillingField('billingStreet')"
                  @update:model-value="handleBillingFieldInput('billingStreet')"
                />
                <InputField
                  id="billingHouseNumber"
                  v-model="form.billingHouseNumber"
                  :label="$t('payment.form.houseNumber')"
                  type="text"
                  required
                  :placeholder="$t('payment.form.houseNumber')"
                  :error="billingErrors.billingHouseNumber"
                  :force-validation="forceValidation"
                  show-success
                  @blur="validateBillingField('billingHouseNumber')"
                  @update:model-value="handleBillingFieldInput('billingHouseNumber')"
                />
                <InputField id="billingBoxNumber" v-model="form.billingBoxNumber" :label="$t('payment.form.boxNumber')" type="text" show-optional :placeholder="$t('payment.form.boxNumberOptional')" />
                <InputField
                  id="billingPostalCode"
                  v-model="form.billingPostalCode"
                  :label="$t('payment.form.postalCode')"
                  type="text"
                  required
                  :placeholder="$t('payment.form.postalCode')"
                  :error="billingErrors.billingPostalCode"
                  :force-validation="forceValidation"
                  show-success
                  @blur="validateBillingField('billingPostalCode')"
                  @update:model-value="handleBillingFieldInput('billingPostalCode')"
                />
                <InputField
                  id="billingCity"
                  v-model="form.billingCity"
                  :label="$t('payment.form.city')"
                  type="text"
                  required
                  :placeholder="$t('payment.form.city')"
                  :error="billingErrors.billingCity"
                  :force-validation="forceValidation"
                  show-success
                  @blur="validateBillingField('billingCity')"
                  @update:model-value="handleBillingFieldInput('billingCity')"
                />
                <InputSelect
                  id="billingCountry"
                  v-model="form.billingCountry"
                  :label="$t('payment.form.country')"
                  required
                  :placeholder="$t('payment.form.selectCountry')"
                  :options="countryOptions"
                  :error="billingErrors.billingCountry"
                  show-success
                  @blur="validateBillingField('billingCountry')"
                  @update:model-value="handleBillingFieldInput('billingCountry')"
                />
              </div>

              <!-- Save billing address checkbox for logged-in users -->
              <div v-if="isAuthenticated" class="save-address-option">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="saveNewBillingAddress" />
                  <span>{{ $t('payment.saveAddress') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <UiDivider />

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
import { computed, ref, reactive, onMounted, watch } from 'vue';
import { useGlobalStore } from '~/stores/global';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from '~/composables/useToast';
import { useFormValidation } from '~/composables/useFormValidation';
import { useSubmitStatus } from '~/composables/useSubmitStatus';
import { useUserProfile } from '~/composables/useUserProfile';
import { paymentFormSchema, billingAddressSchema, createPaymentFormData } from '~/schemas';
import { buildOrderPayload } from '~/logic/utils';

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
const authStore = useAuthStore();
const { fetchUserProfile, createAddress } = useUserProfile();
const { isSubmitting, withSubmit, stopSubmitting } = useSubmitStatus();
const forceValidation = ref(false);

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userAddresses = computed(() => authStore.userAddresses || []);
const hasAddresses = computed(() => userAddresses.value.length > 0);
const billingAddresses = computed(() => authStore.userAddresses || []);
const hasBillingAddresses = computed(() => billingAddresses.value.length > 0);

// Address selection
const selectedShippingAddressId = ref(null);
const selectedBillingAddressId = ref(null);
const useSameAddressForBilling = ref(true);
const saveNewShippingAddress = ref(false);
const saveNewBillingAddress = ref(false);

const cartItems = computed(() => globalStore.cartItems);
const subtotal = computed(() => globalStore.cartTotal);
const shippingCost = 2.5;
const total = computed(() => subtotal.value + shippingCost);

const form = reactive(createPaymentFormData());

const { errors, validateField, validateAll, clearError } = useFormValidation(form, paymentFormSchema);

// Separate validation for billing address
const { errors: billingErrors, validateField: validateBillingField, validateAll: validateAllBilling, clearError: clearBillingError } = useFormValidation(form, billingAddressSchema);

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

// Format address for display
const formatAddressTitle = (address) => {
  return `${address.street} ${address.house}${address.box ? `, ${address.box}` : ''}`;
};

const formatAddressDetails = (address) => {
  return `${address.postalcode} ${address.city}, ${address.country}`;
};

// Pre-fill form with user data
const prefillUserData = () => {
  if (authStore.isAuthenticated && authStore.currentUser) {
    form.firstName = authStore.currentUser.first_name || '';
    form.lastName = authStore.currentUser.last_name || '';
    form.email = authStore.currentUser.email || '';
    form.phone = authStore.userPhone || '';

    // Auto-select first address if available
    if (userAddresses.value.length > 0) {
      selectShippingAddress(userAddresses.value[0]);
    }
  }
};

// Select an existing shipping address
const selectShippingAddress = (address) => {
  selectedShippingAddressId.value = address.id;
  form.street = address.street || '';
  form.houseNumber = address.house || '';
  form.boxNumber = address.box || '';
  form.postalCode = address.postalcode || '';
  form.city = address.city || '';
  form.country = address.country || '';
};

// Select new shipping address option
const selectNewShippingAddress = () => {
  selectedShippingAddressId.value = 'new';
  form.street = '';
  form.houseNumber = '';
  form.boxNumber = '';
  form.postalCode = '';
  form.city = '';
  form.country = '';
};

// Select an existing billing address
const selectBillingAddress = (address) => {
  selectedBillingAddressId.value = address.id;
  form.billingStreet = address.street || '';
  form.billingHouseNumber = address.house || '';
  form.billingBoxNumber = address.box || '';
  form.billingPostalCode = address.postalcode || '';
  form.billingCity = address.city || '';
  form.billingCountry = address.country || '';
};

// Select new billing address option
const selectNewBillingAddress = () => {
  selectedBillingAddressId.value = 'new';
  form.billingStreet = '';
  form.billingHouseNumber = '';
  form.billingBoxNumber = '';
  form.billingPostalCode = '';
  form.billingCity = '';
  form.billingCountry = '';
};

// Set billing address preference
const setUseSameAddressForBilling = (same) => {
  useSameAddressForBilling.value = same;
  if (!same && billingAddresses.value.length > 0) {
    selectBillingAddress(billingAddresses.value[0]);
  } else if (!same) {
    selectedBillingAddressId.value = 'new';
  }
};

// Handle field input - clear error when user starts typing
const handleFieldInput = (fieldName) => {
  clearError(fieldName);
  forceValidation.value = false;
};

const handleBillingFieldInput = (fieldName) => {
  clearBillingError(fieldName);
  forceValidation.value = false;
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  // Force validation display on all fields
  forceValidation.value = true;

  // Validate all shipping/contact fields
  const isShippingValid = validateAll();

  // Validate billing fields if different address is used
  const isBillingValid = useSameAddressForBilling.value || validateAllBilling();

  if (!isShippingValid || !isBillingValid) {
    toastError(t('payment.form.validationError'));
    return;
  }

  await withSubmit(async () => {
    // Save new shipping address if requested
    if (isAuthenticated.value && saveNewShippingAddress.value && selectedShippingAddressId.value === 'new') {
      await createAddress({
        street: form.street,
        house: form.houseNumber,
        box: form.boxNumber,
        postalcode: form.postalCode,
        city: form.city,
        country: form.country,
        type: 'shipping',
      });
    }

    // Save new billing address if requested
    if (isAuthenticated.value && !useSameAddressForBilling.value && saveNewBillingAddress.value && selectedBillingAddressId.value === 'new') {
      await createAddress({
        street: form.billingStreet,
        house: form.billingHouseNumber,
        box: form.billingBoxNumber,
        postalcode: form.billingPostalCode,
        city: form.billingCity,
        country: form.billingCountry,
        type: 'billing',
      });
    }

    const orderData = buildOrderPayload(form, cartItems.value, total.value, shippingCost, {
      useSameAddressForBilling: useSameAddressForBilling.value,
    });

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

// Load user data on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await fetchUserProfile();
    prefillUserData();
  }
});

// Watch for auth changes
watch(
  () => authStore.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      await fetchUserProfile();
      prefillUserData();
    }
  }
);
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

/* Address Selection Styles - Matching InputRadioGroup */
.address-selection {
  margin-bottom: 1rem;
}

.address-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-option:hover {
  border-color: var(--color-gold);
}

.address-option.selected {
  border-color: var(--color-gold);
  background: rgba(212, 175, 55, 0.05);
}

.address-option input[type='radio'] {
  width: 20px;
  height: 20px;
  accent-color: var(--color-gold);
  cursor: pointer;
  flex-shrink: 0;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.option-title {
  font-weight: 500;
}

.option-details {
  font-size: 0.9rem;
  color: #666;
}

.billing-address-section {
  margin-top: 1rem;
}

.new-address-form {
  margin-top: 1rem;
}

.save-address-option {
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-gold);
  cursor: pointer;
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

  .address-option {
    padding: 0.875rem;
  }

  .option-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
