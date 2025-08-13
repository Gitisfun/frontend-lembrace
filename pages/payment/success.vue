<template>
  <div class="success-page">
    <div class="success-container">
      <div class="success-header">
        <div class="success-icon" :class="{ 'success-icon--error': !paymentSuccess }">
          <svg v-if="paymentSuccess" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h1>{{ paymentSuccess ? 'Bedankt voor je bestelling!' : 'Betaling mislukt' }}</h1>
        <p class="success-message">{{ paymentSuccess ? 'Je bestelling is succesvol ontvangen en wordt verwerkt.' : 'Er is een probleem opgetreden bij het verwerken van je betaling.' }}</p>
      </div>

      <template v-if="paymentSuccess">
        <div class="order-details">
          <h2>Bestelling details</h2>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Bestelnummer</span>
              <span class="detail-value">#{{ orderNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Datum</span>
              <span class="detail-value">{{ orderDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Verzendmethode</span>
              <span class="detail-value">{{ deliveryMethod }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Verwachte levering</span>
              <span class="detail-value">{{ expectedDelivery }}</span>
            </div>
          </div>
        </div>

        <div class="next-steps">
          <h2>Volgende stappen</h2>
          <div class="steps-list">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Bevestigingsmail</h3>
                <p>Je ontvangt binnen enkele minuten een bevestigingsmail met alle details van je bestelling.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Verwerking</h3>
                <p>We verwerken je bestelling en bereiden deze voor op verzending.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Verzending</h3>
                <p>Je ontvangt een e-mail zodra je pakket is verzonden met tracking informatie.</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div class="action-buttons">
        <NuxtLink to="/products" class="continue-btn">Verder winkelen</NuxtLink>
        <button v-if="paymentSuccess" class="print-btn" @click="printOrder">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Bestelling afdrukken
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const paymentSuccess = ref(true);
const orderNumber = ref('');
const orderDate = ref('');
const deliveryMethod = ref('');
const expectedDelivery = ref('');

onMounted(() => {
  // Get order data from route query parameters
  const orderData = route.query;

  if (orderData) {
    // Check if payment was successful (Mollie redirects here after payment)
    paymentSuccess.value = true; // Assume success since user reached this page
    orderNumber.value = orderData.orderNumber || '';
    orderDate.value = new Date().toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    deliveryMethod.value = orderData.deliveryMethod === 'express' ? 'Express levering' : 'Standaard levering';

    // Calculate expected delivery date based on delivery method
    const deliveryDate = new Date();
    if (orderData.deliveryMethod === 'express') {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    } else {
      deliveryDate.setDate(deliveryDate.getDate() + 3);
    }

    expectedDelivery.value = deliveryDate.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
});

const printOrder = () => {
  window.print();
};
</script>

<style scoped>
.success-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
  min-height: calc(100vh - 70px);
}

.success-container {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: var(--shadow-soft);
}

.success-header {
  text-align: center;
  margin-bottom: 3rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: #e8f5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
}

.success-header h1 {
  font-family: var(--font-primary);
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1.1rem;
  color: #666;
  max-width: 500px;
  margin: 0 auto;
}

.order-details {
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f8f8f8;
  border-radius: 12px;
}

.order-details h2 {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.9rem;
  color: #666;
}

.detail-value {
  font-weight: 500;
  color: var(--color-text);
}

.next-steps {
  margin-bottom: 3rem;
}

.next-steps h2 {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--color-gold);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1.1rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #666;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.continue-btn {
  padding: 1rem 2rem;
  background: var(--color-gold);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  background: #b88b2a;
  transform: translateY(-2px);
}

.print-btn {
  padding: 1rem 2rem;
  background: white;
  color: var(--color-text);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.print-btn:hover {
  background: #f8f8f8;
  transform: translateY(-2px);
}

.success-icon--error {
  background: #ffebee;
  color: #f44336;
}

@media (max-width: 768px) {
  .success-page {
    padding: 2rem 1rem;
  }

  .success-container {
    padding: 2rem;
  }

  .success-header h1 {
    font-size: 1.5rem;
  }

  .success-message {
    font-size: 1rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .continue-btn,
  .print-btn {
    width: 100%;
    justify-content: center;
  }
}

@media print {
  .success-page {
    padding: 0;
  }

  .success-container {
    box-shadow: none;
    padding: 0;
  }

  .action-buttons {
    display: none;
  }

  .success-icon {
    display: none;
  }
}
</style>
