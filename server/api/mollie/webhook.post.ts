import { createMollieClient } from '@mollie/api-client';
import { sendEmail } from '~/logic/utils';

// Function to generate order confirmation email
const generateOrderConfirmationEmail = (orderData: any, orderNumber: string) => {
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
        (item: any) => `
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

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id } = body;

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Payment ID is required' });
    }

    // Initialize Mollie client
    const mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY || 'test_rqn9NtT4qEDrfj4cfNg5KGvG7NyVAr',
    });

    // Get payment details from Mollie
    const payment = await mollieClient.payments.get(id);

    // Extract order information from metadata
    const metadata = payment.metadata as any;
    const { orderId, orderNumber, uniqueOrderNumber } = metadata || {};

    if (uniqueOrderNumber) {
      // Update order status in Strapi based on payment status
      let orderStatus = 'pending';

      switch (payment.status) {
        case 'paid':
          orderStatus = 'paid';
          break;
        case 'failed':
          orderStatus = 'failed';
          break;
        case 'expired':
          orderStatus = 'expired';
          break;
        case 'canceled':
          orderStatus = 'cancelled';
          break;
        default:
          orderStatus = 'pending';
      }

      // First find the order by unique_order_number
      const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
      const strapiToken = process.env.STRAPI_TOKEN;

      // Find order by unique_order_number
      const findResponse = await $fetch<any>(`${strapiUrl}/api/orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
        query: {
          'filters[unique_order_number][$eq]': uniqueOrderNumber,
          populate: 'customerInfo,address,items',
        },
      });

      const order = findResponse?.data?.[0];

      if (order) {
        // Update order in Strapi
        const updateResponse = await $fetch<any>(`${strapiUrl}/api/orders/${order.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
          body: {
            data: {
              orderStatus: orderStatus,
              molliePaymentId: id,
              paymentStatus: payment.status,
              paidAt: payment.status === 'paid' ? new Date().toISOString() : null,
            },
          },
        });

        // Send confirmation email if payment was successful
        if (payment.status === 'paid' && updateResponse?.data) {
          try {
            const orderData = updateResponse.data;
            const customerEmail = orderData.customerInfo?.email;

            if (customerEmail) {
              // Send order confirmation email
              await sendEmail({
                email: customerEmail,
                name: orderData.customerInfo?.firstname || 'Klant',
                subject: `Bestelling bevestiging - ${orderNumber}`,
                to: customerEmail,
                text: generateOrderConfirmationEmail(orderData, orderNumber),
              });
              console.log(`Order confirmation email sent to ${customerEmail}`);
            }
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't throw error here as the payment was successful
          }
        }
        //}

        console.log(`Order ${orderNumber} updated to status: ${orderStatus}`);
      }
    }

    // Return success to Mollie
    return { success: true };
  } catch (error) {
    console.error('Mollie webhook error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed',
    });
  }
});
