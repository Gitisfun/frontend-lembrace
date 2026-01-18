import { createMollieClient } from '@mollie/api-client';
import { sendOrderConfirmationEmail, sendSellerOrderNotification, type OrderData, type EmailLocale } from '~/logic/email';

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event);
    const body = await readBody(event);
    const { id } = body;

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Payment ID is required' });
    }

    const apiKey = config.mollieApiKey as string;
    if (!apiKey) {
      throw createError({ statusCode: 500, statusMessage: 'Mollie API key not configured' });
    }

    // Initialize Mollie client
    const mollieClient = createMollieClient({ apiKey });

    // Get payment details from Mollie
    const payment = await mollieClient.payments.get(id);

    // Extract order information from metadata
    const metadata = payment.metadata as any;
    const { orderNumber, uniqueOrderNumber } = metadata || {};

    if (!uniqueOrderNumber) {
      console.warn('Webhook received without uniqueOrderNumber in metadata');
      return { success: true };
    }

    // Map Mollie payment status to order status
    const statusMap: Record<string, string> = {
      paid: 'paid',
      failed: 'failed',
      expired: 'expired',
      canceled: 'cancelled',
    };
    const orderStatus = statusMap[payment.status] || 'pending';

    // Strapi configuration
    const strapiUrl = config.public.strapiUrl;
    const strapiToken = config.strapiToken as string;

    if (!strapiToken) {
      throw createError({ statusCode: 500, statusMessage: 'Strapi token not configured' });
    }

    // Find order by unique_order_number
    const findResponse = await $fetch<any>(`${strapiUrl}/api/orders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
      query: {
        'filters[unique_order_number][$eq]': uniqueOrderNumber,
        populate: 'customerInfo,shippingAddress,items',
      },
    });

    const order = findResponse?.data?.[0];

    if (!order) {
      console.warn(`Order not found for unique_order_number: ${uniqueOrderNumber}`);
      return { success: true };
    }

    // Update order in Strapi (use documentId for Strapi v4/v5)
    const orderId = order.documentId || order.id;
    const updateResponse = await $fetch<any>(`${strapiUrl}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        data: {
          orderStatus,
          molliePaymentId: id,
          paidAt: payment.status === 'paid' ? new Date().toISOString() : null,
        },
      },
    });

    // Send confirmation email if payment was successful
    if (payment.status === 'paid' && updateResponse?.data) {
      try {
        const orderData = updateResponse.data;
        const customerLocale = (orderData.localeCustomer === 'nl' ? 'nl' : 'en') as EmailLocale;

        if (orderData.customerInfo?.email) {
          const config = useRuntimeConfig(event);
          const emailOrderData: OrderData = {
            totalPrice: orderData.totalPrice,
            shippingCost: orderData.shippingCost,
            customerInfo: orderData.customerInfo,
            address: orderData.shippingAddress,
            items: orderData.items,
          };

          // Send order confirmation email to customer
          await sendOrderConfirmationEmail(emailOrderData, orderNumber, config.public.strapiUrl, customerLocale);

          // Send seller notification email (always in Dutch)
          await sendSellerOrderNotification(emailOrderData, orderNumber, config.public.strapiUrl, 'info@lembrace.be', 'nl');
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't throw - payment was successful, email is secondary
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
