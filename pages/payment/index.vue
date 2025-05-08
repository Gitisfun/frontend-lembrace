<template>
  <div class="payment-page">
    <div class="payment-container">
      <!-- Order Summary -->
      <div class="order-summary">
        <h2>Bestelling overzicht</h2>
        <div class="summary-items">
          <div v-for="item in cartItems" :key="item.id" class="summary-item">
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </div>
            <span class="item-price">€{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        <div class="summary-totals">
          <div class="summary-row">
            <span>Subtotaal</span>
            <span>€{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Verzendkosten</span>
            <span>€{{ shippingCost.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>Totaal</span>
            <span>€{{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Form -->
      <form class="payment-form" @submit.prevent="handleSubmit">
        <h2>Persoonlijke gegevens</h2>

        <div class="form-section">
          <h3>Contactgegevens</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">Voornaam *</label>
              <input id="firstName" v-model="form.firstName" type="text" required placeholder="Voornaam" />
            </div>
            <div class="form-group">
              <label for="lastName">Achternaam *</label>
              <input id="lastName" v-model="form.lastName" type="text" required placeholder="Achternaam" />
            </div>
            <div class="form-group">
              <label for="email">E-mailadres *</label>
              <input id="email" v-model="form.email" type="email" required placeholder="E-mailadres" />
            </div>
            <div class="form-group">
              <label for="phone">Telefoonnummer *</label>
              <input id="phone" v-model="form.phone" type="tel" required placeholder="Telefoonnummer" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Verzendadres</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="street">Straatnaam *</label>
              <input id="street" v-model="form.street" type="text" required placeholder="Straatnaam" />
            </div>
            <div class="form-group">
              <label for="houseNumber">Huisnummer *</label>
              <input id="houseNumber" v-model="form.houseNumber" type="text" required placeholder="Huisnummer" />
            </div>
            <div class="form-group">
              <label for="postalCode">Postcode *</label>
              <input id="postalCode" v-model="form.postalCode" type="text" required placeholder="Postcode" />
            </div>
            <div class="form-group">
              <label for="city">Plaats *</label>
              <input id="city" v-model="form.city" type="text" required placeholder="Plaats" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Levering</h3>
          <div class="delivery-options">
            <label class="delivery-option">
              <input type="radio" v-model="form.deliveryMethod" value="standard" required />
              <div class="option-content">
                <span class="option-title">Standaard levering</span>
                <span class="option-details">2-3 werkdagen</span>
              </div>
            </label>
            <label class="delivery-option">
              <input type="radio" v-model="form.deliveryMethod" value="express" required />
              <div class="option-content">
                <span class="option-title">Express levering</span>
                <span class="option-details">1 werkdag</span>
              </div>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button @click="handleSubmit" type="submit" class="submit-btn">Bestelling plaatsen</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useGlobalStore } from '~/stores/global';
import { useRouter } from 'vue-router';

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
  postalCode: '',
  city: '',

  // Delivery Method
  deliveryMethod: 'standard',
});

const generateOrderNumber = () => {
  return (
    'ORD-' +
    Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
  );
};

const handleSubmit = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    const orderData = {
      orderNumber: generateOrderNumber(),
      ...form.value,
      items: cartItems.value.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        selectedMaterials: item.selectedMaterials,
      })),
    };

    console.log('orderData');
    console.log(orderData);

    // Redirect to Mollie checkout
    //window.location.href = response.url;
  } catch (error) {
    console.error('Payment failed:', error);
    // Show error message to user
    alert('Er is een fout opgetreden bij het verwerken van je betaling. Probeer het later opnieuw.');
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--color-text);
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-gold);
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
