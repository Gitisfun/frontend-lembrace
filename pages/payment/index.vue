<template>
  <div class="payment-page">
    <div class="payment-container">
      <!-- Order Summary -->
      <PaymentOrderSummary :items="cartItems" :subtotal="subtotal" :shipping-cost="shippingCost" />

      <!-- Payment Form -->
      <form class="payment-form" @submit.prevent="handleSubmit" novalidate>
        <h2>{{ $t('payment.personalInfo') }}</h2>

        <!-- Contact Details -->
        <div class="form-section">
          <h3>{{ $t('payment.contactDetails') }}</h3>

          <!-- Loading State for Logged-in Users -->
          <UiFormSkeleton v-if="isAuthenticated && isLoadingProfile && !isProfileLoaded" type="fields" :rows="2" :columns="2" />

          <!-- Contact Form -->
          <PaymentContactForm
            v-else
            :first-name="form.firstName"
            :last-name="form.lastName"
            :email="form.email"
            :phone="form.phone"
            :errors="errors"
            :force-validation="forceValidation"
            :disabled="isAuthenticated"
            @update:first-name="updateField('firstName', $event)"
            @update:last-name="updateField('lastName', $event)"
            @update:email="updateField('email', $event)"
            @update:phone="updateField('phone', $event)"
            @validate="validateField($event)"
          />
        </div>

        <UiDivider />

        <!-- Shipping Address Section -->
        <div class="form-section">
          <h3>{{ $t('payment.shippingAddress') }}</h3>

          <!-- Loading State for Logged-in Users -->
          <UiFormSkeleton v-if="isAuthenticated && isLoadingProfile && !isProfileLoaded" type="options" :count="2" />

          <!-- Address Selection for Logged-in Users -->
          <InputRadioGroup v-else-if="isAuthenticated && hasAddresses" v-model="selectedShippingAddressId" :options="shippingAddressOptions" />

          <!-- New Address Form -->
          <PaymentAddressForm
            v-if="(!isAuthenticated || !hasAddresses || selectedShippingAddressId === 'new') && (!isLoadingProfile || isProfileLoaded)"
            :street="form.street"
            :house-number="form.houseNumber"
            :box-number="form.boxNumber"
            :postal-code="form.postalCode"
            :city="form.city"
            :country="form.country"
            :errors="shippingAddressErrors"
            :force-validation="forceValidation"
            :show-save-option="isAuthenticated"
            :save-address="saveNewShippingAddress"
            @update:street="updateField('street', $event)"
            @update:house-number="updateField('houseNumber', $event)"
            @update:box-number="updateField('boxNumber', $event)"
            @update:postal-code="updateField('postalCode', $event)"
            @update:city="updateField('city', $event)"
            @update:country="updateField('country', $event)"
            @update:save-address="saveNewShippingAddress = $event"
            @validate="validateField($event)"
          />
        </div>

        <UiDivider />

        <!-- Billing Address Section -->
        <div class="form-section">
          <h3>{{ $t('payment.billingAddress') }}</h3>

          <!-- Loading State for Logged-in Users -->
          <UiFormSkeleton v-if="isAuthenticated && isLoadingProfile && !isProfileLoaded" type="options" :count="2" />

          <!-- Same as Shipping / Different toggle -->
          <InputRadioGroup v-else v-model="billingAddressChoice" :options="billingChoiceOptions" />

          <!-- Billing Address Selection (when different from shipping) -->
          <div v-if="!useSameAddressForBilling" class="billing-address-section">
            <!-- Loading State for Logged-in Users -->
            <UiFormSkeleton v-if="isAuthenticated && isLoadingProfile && !isProfileLoaded" type="options" :count="2" />

            <!-- Address Picker for Logged-in Users -->
            <InputRadioGroup v-else-if="isAuthenticated && hasBillingAddresses" v-model="selectedBillingAddressId" :options="billingAddressOptions" />

            <!-- New Billing Address Form -->
            <PaymentAddressForm
              v-if="(!isAuthenticated || !hasBillingAddresses || selectedBillingAddressId === 'new') && (!isLoadingProfile || isProfileLoaded)"
              :street="form.billingStreet"
              :house-number="form.billingHouseNumber"
              :box-number="form.billingBoxNumber"
              :postal-code="form.billingPostalCode"
              :city="form.billingCity"
              :country="form.billingCountry"
              :errors="billingAddressErrors"
              :force-validation="forceValidation"
              :show-save-option="isAuthenticated"
              :save-address="saveNewBillingAddress"
              id-prefix="billing"
              @update:street="updateField('billingStreet', $event)"
              @update:house-number="updateField('billingHouseNumber', $event)"
              @update:box-number="updateField('billingBoxNumber', $event)"
              @update:postal-code="updateField('billingPostalCode', $event)"
              @update:city="updateField('billingCity', $event)"
              @update:country="updateField('billingCountry', $event)"
              @update:save-address="saveNewBillingAddress = $event"
              @validate="validateBillingField($event)"
            />
          </div>
        </div>

        <UiDivider />

        <!-- Delivery Method -->
        <div class="form-section">
          <h3>{{ $t('payment.delivery.title') }}</h3>

          <!-- Loading State -->
          <UiFormSkeleton v-if="isLoadingDeliveryOptions" type="options" :count="2" />

          <InputRadioGroup v-else v-model="form.deliveryMethod" :options="deliveryOptions" required show-value />
        </div>

        <div class="form-actions">
          <UiButtonSubmit :text="$t('payment.placeOrder')" :loading="isSubmitting" :loading-text="$t('payment.processing')" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted, watch } from 'vue';
import { useGlobalStore } from '~/stores/global';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import { useFormValidation } from '~/composables/useFormValidation';
import { useSubmitStatus } from '~/composables/useSubmitStatus';
import { useUserProfile } from '~/composables/useUserProfile';
import { paymentFormSchema, billingAddressSchema, createPaymentFormData } from '~/schemas';
import { buildOrderPayload, fetchOrderNumber } from '~/logic/utils';

const { t } = useI18n();
const { error: toastError } = useToast();
const config = useRuntimeConfig();

// SEO Meta
useSeoMeta({
  title: () => t('seo.payment.title'),
  description: () => t('seo.payment.description'),
  robots: 'noindex, nofollow',
});

const { create, find } = useStrapi();
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const { fetchUserProfile, createAddress, isLoading: isLoadingProfile } = useUserProfile();
const { isSubmitting, withSubmit, stopSubmitting } = useSubmitStatus();
const forceValidation = ref(false);
const isProfileLoaded = ref(false);

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userAddresses = computed(() => authStore.userAddresses || []);
const hasAddresses = computed(() => userAddresses.value.length > 0);
const billingAddresses = computed(() => authStore.userAddresses || []);
const hasBillingAddresses = computed(() => billingAddresses.value.length > 0);

// Address selection
const selectedShippingAddressId = ref(null);
const selectedBillingAddressId = ref(null);
const billingAddressChoice = ref('same');
const useSameAddressForBilling = computed(() => billingAddressChoice.value === 'same');
const saveNewShippingAddress = ref(false);
const saveNewBillingAddress = ref(false);

// Address options for InputRadioGroup
const formatAddressTitle = (address) => `${address.street} ${address.house}${address.box ? `, ${address.box}` : ''}`;
const formatAddressDetails = (address) => `${address.postalcode} ${address.city}, ${address.country}`;

const shippingAddressOptions = computed(() => [
  ...userAddresses.value.map((address) => ({
    value: address.id,
    title: formatAddressTitle(address),
    details: formatAddressDetails(address),
  })),
  { value: 'new', title: t('payment.useNewAddress') },
]);

const billingChoiceOptions = computed(() => [
  { value: 'same', title: t('payment.sameAsShipping') },
  { value: 'different', title: t('payment.useDifferentBilling') },
]);

const billingAddressOptions = computed(() => [
  ...billingAddresses.value.map((address) => ({
    value: address.id,
    title: formatAddressTitle(address),
    details: formatAddressDetails(address),
  })),
  { value: 'new', title: t('payment.useNewAddress') },
]);

// Cart data
const cartItems = computed(() => globalStore.cartItems);
const subtotal = computed(() => globalStore.cartTotal);

// Delivery options from Strapi
const deliveryOptionsData = ref([]);
const isLoadingDeliveryOptions = ref(true);

const fetchDeliveryOptions = async () => {
  try {
    isLoadingDeliveryOptions.value = true;
    const { data } = await find('delivery-options', {
      sort: ['price:asc'],
    });
    deliveryOptionsData.value = data || [];

    // Auto-select default delivery option, or first one if no default
    if (deliveryOptionsData.value.length > 0) {
      const defaultOption = deliveryOptionsData.value.find((option) => option.isDefault);
      form.deliveryMethod = defaultOption?.price ?? deliveryOptionsData.value[0].price;
    }
  } catch (e) {
    console.error('Failed to fetch delivery options:', e);
  } finally {
    isLoadingDeliveryOptions.value = false;
  }
};

// Transform delivery options for InputRadioGroup
const deliveryOptions = computed(() =>
  deliveryOptionsData.value.map((option) => ({
    value: option.price,
    title: option.name,
    details: option.description,
  }))
);

// Calculate shipping cost based on selected delivery method
const shippingCost = computed(() => {
  const cost = form.deliveryMethod;
  return typeof cost === 'number' ? cost : 0;
});

const total = computed(() => subtotal.value + shippingCost.value);

// Form
const form = reactive(createPaymentFormData());

// Validation
const { errors, validateField: validateFormField, validateAll, clearError } = useFormValidation(form, paymentFormSchema);
const { errors: billingErrors, validateField: validateBillingFormField, validateAll: validateAllBilling, clearError: clearBillingError } = useFormValidation(form, billingAddressSchema);

// Map shipping address errors for component
const shippingAddressErrors = computed(() => ({
  street: errors.street,
  houseNumber: errors.houseNumber,
  postalCode: errors.postalCode,
  city: errors.city,
  country: errors.country,
}));

// Map billing address errors for component
const billingAddressErrors = computed(() => ({
  street: billingErrors.billingStreet,
  houseNumber: billingErrors.billingHouseNumber,
  postalCode: billingErrors.billingPostalCode,
  city: billingErrors.billingCity,
  country: billingErrors.billingCountry,
}));

// Update form field and clear validation
const updateField = (fieldName, value) => {
  form[fieldName] = value;
  clearError(fieldName);
  forceValidation.value = false;
};

// Validate field
const validateField = (fieldName) => {
  validateFormField(fieldName);
};

// Validate billing field (map component field names to form field names)
const validateBillingField = (fieldName) => {
  const fieldMap = {
    street: 'billingStreet',
    houseNumber: 'billingHouseNumber',
    postalCode: 'billingPostalCode',
    city: 'billingCity',
    country: 'billingCountry',
  };
  const formFieldName = fieldMap[fieldName] || fieldName;
  validateBillingFormField(formFieldName);
  clearBillingError(formFieldName);
  forceValidation.value = false;
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
      selectedShippingAddressId.value = userAddresses.value[0].id;
    }
  }
};

// Select new shipping address option
const selectNewShippingAddress = () => {
  form.street = '';
  form.houseNumber = '';
  form.boxNumber = '';
  form.postalCode = '';
  form.city = '';
  form.country = '';
};

// Select new billing address option
const selectNewBillingAddress = () => {
  form.billingStreet = '';
  form.billingHouseNumber = '';
  form.billingBoxNumber = '';
  form.billingPostalCode = '';
  form.billingCity = '';
  form.billingCountry = '';
};

// Submit handler
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  forceValidation.value = true;

  const isShippingValid = validateAll();
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

    // Get new order number from order number API
    const orderNumber = await fetchOrderNumber(config.public.authApiKey);

    // Build order payload with order number and user ID
    const orderData = buildOrderPayload(form, cartItems.value, total.value, shippingCost.value, {
      useSameAddressForBilling: useSameAddressForBilling.value,
      orderNumber,
      customerId: authStore.currentUser?.id ?? null,
    });

    console.log('Order data:', orderData);

    console.log('Sending order data to Strapi:', orderData);
    // Create order in Strapi
    const result = await create('orders', orderData);
    console.log('Order created successfully:', result);

    /*
    const mollieResponse = await $fetch('/api/mollie/create-payment', {
      method: 'POST',
      body: orderData,
    });

    if (mollieResponse.success && mollieResponse.checkoutUrl) {
      globalStore.clearCart();
      window.location.href = mollieResponse.checkoutUrl;
    } else {
      throw new Error('Failed to create Mollie payment');
    }
      */
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
  // Fetch delivery options
  fetchDeliveryOptions();

  if (authStore.isAuthenticated) {
    await fetchUserProfile();
    prefillUserData();
    isProfileLoaded.value = true;
  }
});

// Watch for auth changes
watch(
  () => authStore.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      isProfileLoaded.value = false;
      await fetchUserProfile();
      prefillUserData();
      isProfileLoaded.value = true;
    }
  }
);

// Watch shipping address selection
watch(selectedShippingAddressId, (newId) => {
  if (newId === 'new') {
    selectNewShippingAddress();
  } else if (newId) {
    const address = userAddresses.value.find((a) => a.id === newId);
    if (address) {
      form.street = address.street || '';
      form.houseNumber = address.house || '';
      form.boxNumber = address.box || '';
      form.postalCode = address.postalcode || '';
      form.city = address.city || '';
      form.country = address.country || '';
    }
  }
});

// Watch billing address selection
watch(selectedBillingAddressId, (newId) => {
  if (newId === 'new') {
    selectNewBillingAddress();
  } else if (newId) {
    const address = billingAddresses.value.find((a) => a.id === newId);
    if (address) {
      form.billingStreet = address.street || '';
      form.billingHouseNumber = address.house || '';
      form.billingBoxNumber = address.box || '';
      form.billingPostalCode = address.postalcode || '';
      form.billingCity = address.city || '';
      form.billingCountry = address.country || '';
    }
  }
});

// Watch billing choice to auto-select first address or new
watch(billingAddressChoice, (newChoice) => {
  if (newChoice === 'different') {
    if (billingAddresses.value.length > 0) {
      selectedBillingAddressId.value = billingAddresses.value[0].id;
    } else {
      selectedBillingAddressId.value = 'new';
    }
  }
});
</script>

<style scoped>
.payment-page {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 70px);
  overflow-x: hidden;
  box-sizing: border-box;
}

.payment-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.payment-form {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
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

.billing-address-section {
  margin-top: 1rem;
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
}

@media (max-width: 768px) {
  .payment-page {
    padding: 1rem;
  }

  .payment-form {
    padding: 1.5rem;
  }

  .payment-form h2 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }

  .form-section h3 {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .payment-page {
    padding: 0.75rem;
  }

  .payment-form {
    padding: 1rem;
    border-radius: 12px;
  }

  .payment-form h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .form-section h3 {
    font-size: 1rem;
  }

  .form-section {
    margin-bottom: 1.5rem;
  }
}
</style>
