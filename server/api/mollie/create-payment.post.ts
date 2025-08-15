import { createMollieClient } from '@mollie/api-client';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { orderData } = body;

    if (!orderData) {
      throw createError({ statusCode: 400, statusMessage: 'Order data is required' });
    }

    // Initialize Mollie client with your API key
    const mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY || 'test_rqn9NtT4qEDrfj4cfNg5KGvG7NyVAr',
    });

    // Create payment with Mollie
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: orderData.totalPrice.toFixed(2), // Mollie expects amount in cents
      },
      description: `Bestelling ${orderData.orderNumber}`,
      redirectUrl: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?orderNumber=${orderData.orderNumber}&deliveryMethod=${orderData.deliveryMethod}`,
      // Only add webhook URL if we're in production or have a public URL
      ...(process.env.NODE_ENV === 'production' && {
        webhookUrl: `${process.env.NUXT_PUBLIC_SITE_URL}/api/mollie/webhook`,
      }),
      metadata: {
        orderNumber: orderData.orderNumber,
        orderId: orderData.orderId, // Strapi order ID
        deliveryMethod: orderData.deliveryMethod,
      },
    });

    // Return the payment URL for redirect
    return {
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl(),
      orderNumber: orderData.orderNumber,
    };
  } catch (error) {
    console.error('Mollie payment creation error:', error);

    // Return more detailed error information
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
