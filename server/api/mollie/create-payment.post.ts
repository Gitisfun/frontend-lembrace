import { createMollieClient } from '@mollie/api-client';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { orderData } = body;

    if (!orderData) {
      throw createError({ statusCode: 400, statusMessage: 'Order data is required' });
    }

    // Validate required fields
    if (typeof orderData.totalPrice !== 'number' || !orderData.orderNumber) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid order data' });
    }

    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      throw createError({ statusCode: 500, statusMessage: 'Mollie API key not configured' });
    }

    const mollieClient = createMollieClient({ apiKey });

    const siteUrl = process.env.NUXT_PUBLIC_SITE_URL;
    const webhookUrl = siteUrl && !siteUrl.includes('localhost') && !siteUrl.includes('127.0.0.1') ? `${siteUrl}/api/mollie/webhook` : undefined;

    const paymentData: any = {
      amount: {
        currency: 'EUR',
        value: orderData.totalPrice.toFixed(2), // Mollie expects decimal format (e.g., "10.00")
      },
      description: `Bestelling ${orderData.orderNumber}`,
      redirectUrl: `${siteUrl}/payment/success?orderNumber=${encodeURIComponent(orderData.orderNumber)}&uniqueOrderNumber=${encodeURIComponent(orderData.unique_order_number)}&deliveryMethod=${encodeURIComponent(orderData.deliveryMethod)}`,
      metadata: {
        orderNumber: orderData.orderNumber,
        orderId: orderData.orderId,
        deliveryMethod: orderData.deliveryMethod,
      },
    };

    if (webhookUrl) {
      paymentData.webhookUrl = webhookUrl;
    }

    const payment = await mollieClient.payments.create(paymentData);

    const checkoutUrl = payment.getCheckoutUrl();
    if (!checkoutUrl) {
      throw createError({ statusCode: 500, statusMessage: 'No checkout URL returned from Mollie' });
    }

    return {
      success: true,
      paymentId: payment.id,
      checkoutUrl,
      orderNumber: orderData.orderNumber,
    };
  } catch (error) {
    console.error('Mollie payment creation error:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : undefined;

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create payment: ${errorMessage}`,
      data: {
        originalError: errorMessage,
        stack: errorDetails,
        timestamp: new Date().toISOString(),
      },
    });
  }
});
