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
    const { orderNumber, uniqueOrderNumber } = metadata || {};

    // Map payment status to order status
    const statusMap: Record<string, string> = {
      paid: 'paid',
      failed: 'failed',
      expired: 'expired',
      canceled: 'cancelled',
    };
    const orderStatus = statusMap[payment.status] || 'pending';

    // Update order in Strapi if we have the unique order number
    if (uniqueOrderNumber) {
      const strapiUrl = config.public.strapiUrl;
      const strapiToken = config.strapiToken as string;

      if (strapiToken) {
        // Find order by unique_order_number
        const findResponse = await $fetch<any>(`${strapiUrl}/api/orders`, {
          method: 'GET',
          query: {
            'filters[unique_order_number][$eq]': uniqueOrderNumber,
          },
        });

        const order = findResponse?.data?.[0];
        if (order) {
          const orderId = order.documentId || order.id;
          await $fetch<any>(`${strapiUrl}/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              data: {
                orderStatus,
              },
            },
          });
        }
      }
    }

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      orderNumber,
      orderStatus,
    };
  } catch (error) {
    console.error('Payment status check error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check payment status',
    });
  }
});
