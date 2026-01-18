import { createMollieClient } from '@mollie/api-client';

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event);
    const query = getQuery(event);
    const { paymentId } = query;

    if (!paymentId) {
      throw createError({ statusCode: 400, statusMessage: 'Payment ID is required' });
    }

    const apiKey = config.mollieApiKey as string;
    if (!apiKey) {
      throw createError({ statusCode: 500, statusMessage: 'Mollie API key not configured' });
    }

    // Initialize Mollie client
    const mollieClient = createMollieClient({ apiKey });

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
      const strapiUrl = config.public.strapiUrl;
      const strapiToken = config.strapiToken as string;

      if (strapiToken) {
        await $fetch<any>(`${strapiUrl}/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
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
