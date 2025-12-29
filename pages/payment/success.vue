<template>
  <div class="success-page">
    <div class="success-container">
      <div class="success-header">
        <div class="success-icon" :class="{ 'success-icon--error': !paymentSuccess }">
          <IconCheckCircle v-if="paymentSuccess" :size="48" />
          <IconXCircle v-else :size="48" />
        </div>
        <h1>{{ paymentSuccess ? $t('payment.success.title') : $t('payment.failed.title') }}</h1>
        <p class="success-message">{{ paymentSuccess ? $t('payment.success.message') : $t('payment.failed.message') }}</p>
      </div>

      <template v-if="paymentSuccess">
        <div class="order-details">
          <h2>{{ $t('payment.success.orderDetails') }}</h2>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">{{ $t('payment.success.orderNumber') }}</span>
              <span class="detail-value">#{{ orderNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('payment.success.date') }}</span>
              <span class="detail-value">{{ orderDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('payment.success.deliveryMethod') }}</span>
              <span class="detail-value">{{ deliveryMethod }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('payment.success.expectedDelivery') }}</span>
              <span class="detail-value">{{ expectedDelivery }}</span>
            </div>
          </div>
        </div>

        <div class="next-steps">
          <h2>{{ $t('payment.success.nextSteps') }}</h2>
          <div class="steps-list">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>{{ $t('payment.success.steps.confirmation.title') }}</h3>
                <p>{{ $t('payment.success.steps.confirmation.description') }}</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>{{ $t('payment.success.steps.processing.title') }}</h3>
                <p>{{ $t('payment.success.steps.processing.description') }}</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>{{ $t('payment.success.steps.shipping.title') }}</h3>
                <p>{{ $t('payment.success.steps.shipping.description') }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div class="action-buttons">
        <NuxtLink :to="localePath('/products')" class="continue-btn">{{ $t('payment.continueShopping') }}</NuxtLink>
        <button v-if="paymentSuccess" class="print-btn" @click="printOrder">
          <IconPrint :size="20" />
          {{ $t('payment.printOrder') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { sendEmail } from '~/logic/utils';

const { t } = useI18n();
const localePath = useLocalePath();

// SEO Meta
useSeoMeta({
  title: () => t('seo.paymentSuccess.title'),
  description: () => t('seo.paymentSuccess.description'),
  robots: 'noindex, nofollow',
});

const route = useRoute();
const paymentSuccess = ref(true);
const orderNumber = ref('');
const uniqueOrderNumber = ref('');
const orderDate = ref('');
const deliveryMethod = ref('');
const expectedDelivery = ref('');
const emailSent = ref(false);

onMounted(async () => {
  // Get order data from route query parameters
  const orderData = route.query;

  if (orderData) {
    // Check if payment was successful (Mollie redirects here after payment)
    paymentSuccess.value = true; // Assume success since user reached this page
    orderNumber.value = orderData.orderNumber || '';
    uniqueOrderNumber.value = orderData.uniqueOrderNumber || '';
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

    // Try to send confirmation email as backup (in case webhook didn't work)
    if (uniqueOrderNumber.value && !emailSent.value) {
      await sendConfirmationEmail();
      await sendSellerNotificationEmail();
    }
  }
});

const sendConfirmationEmail = async () => {
  try {
    // Get order details from Strapi using the unique_order_number
    const { find } = useStrapi();
    const orders = await find('orders', {
      filters: {
        unique_order_number: uniqueOrderNumber.value,
      },
      populate: ['customerInfo', 'address', 'items'],
    });

    const order = orders?.data?.[0];

    if (order && order.customerInfo?.email) {
      const customerEmail = order.customerInfo.email;

      // Generate email content
      const emailContent = generateOrderConfirmationEmail(order, orderNumber.value);

      // Send email
      const config = useRuntimeConfig();
      await sendEmail({
        email: customerEmail,
        name: order.customerInfo.firstname || 'Klant',
        subject: `Bestelling bevestiging - ${orderNumber.value}`,
        to: customerEmail,
        html: emailContent,
      }, config.public.strapiUrl);

      emailSent.value = true;
      console.log('Order confirmation email sent successfully');
    }
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Don't show error to user as this is a backup mechanism
  }
};

const sendSellerNotificationEmail = async () => {
  try {
    // Get order details from Strapi using the unique_order_number
    const { find } = useStrapi();
    const orders = await find('orders', {
      filters: {
        unique_order_number: uniqueOrderNumber.value,
      },
      populate: ['customerInfo', 'address', 'items'],
    });

    const order = orders?.data?.[0];

    if (order) {
      // Generate seller notification email content
      const emailContent = generateSellerNotificationEmail(order, orderNumber.value);

      // Send email to seller (you can configure the seller email address)
      const sellerEmail = 'info@lembrace.be'; // Replace with actual seller email

      const config = useRuntimeConfig();
      await sendEmail({
        email: sellerEmail,
        name: 'LemBrace Team',
        subject: `Nieuwe bestelling ontvangen - ${orderNumber.value}`,
        to: sellerEmail,
        html: emailContent,
      }, config.public.strapiUrl);

      console.log('Seller notification email sent successfully');
    }
  } catch (error) {
    console.error('Failed to send seller notification email:', error);
    // Don't show error to user as this is a notification mechanism
  }
};

const generateOrderConfirmationEmail = (orderData, orderNumber) => {
  const deliveryDate = new Date();
  const isExpress = orderData.deliveryMethod === 'express';
  if (isExpress) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  } else {
    deliveryDate.setDate(deliveryDate.getDate() + 3);
  }

  const expectedDelivery = deliveryDate.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<h2>Bestelling Bevestiging - ${orderNumber}</h2>

<p>Beste ${orderData.customerInfo?.firstname || 'Klant'},</p>

<p>Bedankt voor je bestelling! Je betaling is succesvol verwerkt en je bestelling wordt nu voorbereid.</p>

<h3>Bestelling Details:</h3>
<ul>
  <li><strong>Bestelnummer:</strong> ${orderNumber}</li>
  <li><strong>Datum:</strong> ${new Date().toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}</li>
  <li><strong>Verzendmethode:</strong> ${isExpress ? 'Express levering' : 'Standaard levering'}</li>
  <li><strong>Verwachte levering:</strong> ${expectedDelivery}</li>
</ul>

<h3>Verzendadres:</h3>
<p>
  ${orderData.customerInfo?.firstname} ${orderData.customerInfo?.lastname}<br>
  ${orderData.address?.street} ${orderData.address?.number}${orderData.address?.box ? ` bus ${orderData.address.box}` : ''}<br>
  ${orderData.address?.postalcode} ${orderData.address?.city}<br>
  ${orderData.address?.country}
</p>

<h3>Bestelde Items:</h3>
<ul>
  ${
    orderData.items
      ?.map(
        (item) => `
    <li>${item.name} x${item.amount} - €${item.calculatedPrice.toFixed(2)}</li>
  `
      )
      .join('') || '<li>Geen items gevonden</li>'
  }
</ul>

<h3>Prijs Overzicht:</h3>
<ul>
  <li><strong>Subtotaal:</strong> €${(orderData.totalPrice - orderData.shippingCost).toFixed(2)}</li>
  <li><strong>Verzendkosten:</strong> €${orderData.shippingCost.toFixed(2)}</li>
  <li><strong>Totaal:</strong> €${orderData.totalPrice.toFixed(2)}</li>
</ul>

<h3>Volgende Stappen:</h3>
<ol>
  <li>We verwerken je bestelling en bereiden deze voor op verzending</li>
  <li>Je ontvangt een e-mail zodra je pakket is verzonden met tracking informatie</li>
  <li>Je pakket wordt geleverd op het opgegeven adres</li>
</ol>

<p>Heb je vragen over je bestelling? Neem gerust contact met ons op!</p>

<p>Met vriendelijke groet,<br>
Het LemBrace Team</p>

<hr>
<p><em>Deze e-mail is automatisch gegenereerd. Reageer niet op dit e-mailadres.</em></p>`;
};

const generateSellerNotificationEmail = (orderData, orderNumber) => {
  const deliveryDate = new Date();
  const isExpress = orderData.deliveryMethod === 'express';
  if (isExpress) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  } else {
    deliveryDate.setDate(deliveryDate.getDate() + 3);
  }

  const expectedDelivery = deliveryDate.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<h2>🚨 Nieuwe Bestelling Ontvangen - ${orderNumber}</h2>

<p>Er is een nieuwe bestelling binnengekomen die directe aandacht vereist!</p>

<h3>📋 Bestelling Details:</h3>
<ul>
  <li><strong>Bestelnummer:</strong> ${orderNumber}</li>
  <li><strong>Datum:</strong> ${new Date().toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}</li>
  <li><strong>Tijd:</strong> ${new Date().toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  })}</li>
  <li><strong>Verzendmethode:</strong> ${isExpress ? 'Express levering' : 'Standaard levering'}</li>
  <li><strong>Verwachte levering:</strong> ${expectedDelivery}</li>
</ul>

<h3>👤 Klant Informatie:</h3>
<p>
  <strong>Naam:</strong> ${orderData.customerInfo?.firstname} ${orderData.customerInfo?.lastname}<br>
  <strong>E-mail:</strong> ${orderData.customerInfo?.email}<br>
  <strong>Telefoon:</strong> ${orderData.customerInfo?.phone || 'Niet opgegeven'}
</p>

<h3>📍 Verzendadres:</h3>
<p>
  ${orderData.customerInfo?.firstname} ${orderData.customerInfo?.lastname}<br>
  ${orderData.address?.street} ${orderData.address?.number}${orderData.address?.box ? ` bus ${orderData.address.box}` : ''}<br>
  ${orderData.address?.postalcode} ${orderData.address?.city}<br>
  ${orderData.address?.country}
</p>

<h3>🛍️ Bestelde Items:</h3>
<ul>
  ${
    orderData.items
      ?.map(
        (item) => `
    <li><strong>${item.name}</strong> x${item.amount} - €${item.calculatedPrice.toFixed(2)}</li>
  `
      )
      .join('') || '<li>Geen items gevonden</li>'
  }
</ul>

<h3>💰 Prijs Overzicht:</h3>
<ul>
  <li><strong>Subtotaal:</strong> €${(orderData.totalPrice - orderData.shippingCost).toFixed(2)}</li>
  <li><strong>Verzendkosten:</strong> €${orderData.shippingCost.toFixed(2)}</li>
  <li><strong>Totaal:</strong> €${orderData.totalPrice.toFixed(2)}</li>
</ul>

<h3>⚡ Actie Vereist:</h3>
<ol>
  <li>Controleer de bestelling in het admin panel</li>
  <li>Bereid de items voor op verzending</li>
  <li>Verstuur tracking informatie naar de klant zodra verzonden</li>
  <li>Update de bestelling status indien nodig</li>
</ol>

<p><strong>⚠️ Let op:</strong> Deze bestelling vereist directe verwerking om de verwachte leverdatum te halen.</p>

<hr>
<p><em>Deze notificatie is automatisch gegenereerd door het LemBrace systeem.</em></p>`;
};

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
