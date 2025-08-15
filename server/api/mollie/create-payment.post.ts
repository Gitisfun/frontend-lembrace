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

    // Prepare webhook URL only if we have a valid public URL
    const siteUrl = process.env.NUXT_PUBLIC_SITE_URL;
    console.log('Site URL:', siteUrl);

    const webhookUrl = siteUrl && !siteUrl.includes('localhost') && !siteUrl.includes('127.0.0.1') ? `${siteUrl}/api/mollie/webhook` : undefined;

    console.log('Webhook URL:', webhookUrl);
    console.log('Will include webhook:', !!webhookUrl);

    // Build payment object conditionally
    const paymentData: any = {
      amount: {
        currency: 'EUR',
        value: orderData.totalPrice.toFixed(2), // Mollie expects amount in cents
      },
      description: `Bestelling ${orderData.orderNumber}`,
      redirectUrl: `${siteUrl || 'http://localhost:3000'}/payment/success?orderNumber=${orderData.orderNumber}&deliveryMethod=${orderData.deliveryMethod}`,
      metadata: {
        orderNumber: orderData.orderNumber,
        orderId: orderData.orderId, // Strapi order ID
        deliveryMethod: orderData.deliveryMethod,
      },
    };

    // Only add webhook URL if we have a valid public URL
    if (webhookUrl) {
      paymentData.webhookUrl = webhookUrl;
    }

    // Create payment with Mollie
    const payment = await mollieClient.payments.create(paymentData);

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
