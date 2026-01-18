import { createMollieClient } from '@mollie/api-client';

export default defineEventHandler(async (event) => {
  try {
    const orderData = await readBody(event);

    // Validate required fields
    if (!orderData || typeof orderData.totalPrice !== 'number' || !orderData.orderNumber) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid order data: totalPrice and orderNumber are required' });
    }

    if (!orderData.unique_order_number) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid order data: unique_order_number is required' });
    }

    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      throw createError({ statusCode: 500, statusMessage: 'Mollie API key not configured' });
    }

    const mollieClient = createMollieClient({ apiKey });

    const config = useRuntimeConfig(event);
    const siteUrl = config.public.siteUrl as string;

    if (!siteUrl) {
      throw createError({ statusCode: 500, statusMessage: 'Site URL not configured' });
    }

    const webhookUrl = !siteUrl.includes('localhost') && !siteUrl.includes('127.0.0.1') 
      ? `${siteUrl}/api/mollie/webhook` 
      : undefined;

    // Locale for redirect (defaults to 'en' if not provided)
    const locale = orderData.localeCustomer || 'en';

    const paymentData: any = {
      amount: {
        currency: 'EUR',
        value: orderData.totalPrice.toFixed(2),
      },
      description: `Bestelling: ${orderData.orderNumber}`,
      redirectUrl: `${siteUrl}/payment/success?orderNumber=${encodeURIComponent(orderData.orderNumber)}&locale=${encodeURIComponent(locale)}`,
      metadata: {
        orderNumber: orderData.orderNumber,
        uniqueOrderNumber: orderData.unique_order_number,
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

    // Update order in Strapi with molliePaymentId
    const strapiUrl = config.public.strapiUrl;
    const strapiToken = config.strapiToken as string;


    if (strapiToken) {
      try {
        // Find order by unique_order_number
        const findResponse = await $fetch<any>(`${strapiUrl}/api/orders`, {
          method: 'GET',
          headers: {

          },
          query: {
            'filters[unique_order_number][$eq]': orderData.unique_order_number,
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
                molliePaymentId: payment.id,
              },
            },
          });
        }
      } catch (updateError) {
        // Log but don't fail - payment was created successfully
        console.error('Failed to update order with molliePaymentId:', updateError);
      }
    }

    return {
      success: true,
      checkoutUrl,
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
