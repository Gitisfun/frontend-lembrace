import { createMollieClient } from '@mollie/api-client';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { paymentId } = query;

    if (!paymentId) {
      throw createError({ statusCode: 400, statusMessage: 'Payment ID is required' });
    }

    // Initialize Mollie client
    const mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY || 'test_rqn9NtT4qEDrfj4cfNg5KGvG7NyVAr',
    });

    // Get payment details from Mollie
    const payment = await mollieClient.payments.get(paymentId as string);

    // Extract order information from metadata
    const metadata = payment.metadata as any;
    const { orderId, orderNumber } = metadata || {};

    // Determine order status based on payment status
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

    if (orderId) {
      // Update order in Strapi using direct fetch
      const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
      const strapiToken = process.env.STRAPI_TOKEN;

      if (strapiToken) {
        await $fetch(`${strapiUrl}/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
          body: {
            data: {
              orderStatus: orderStatus,
              molliePaymentId: paymentId,
              paymentStatus: payment.status,
              paidAt: payment.status === 'paid' ? new Date().toISOString() : null,
            },
          },
        });
      }

      console.log(`Order ${orderNumber} updated to status: ${orderStatus}`);
    }

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      orderId,
      orderNumber,
      orderStatus: orderStatus,
    };
  } catch (error) {
    console.error('Payment status check error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check payment status',
    });
  }
});
