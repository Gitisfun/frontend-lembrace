import { createMollieClient } from '@mollie/api-client';
import { sendOrderConfirmationEmail, sendSellerOrderNotification, type OrderData, type EmailLocale } from '~/logic/email';

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
          populate: 'customerInfo,shippingAddress,items',
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
            const customerLocale = (orderData.localeCustomer === 'nl' ? 'nl' : 'en') as EmailLocale;

            if (orderData.customerInfo?.email) {
              // Send order confirmation email
              const config = useRuntimeConfig(event);
              const emailOrderData: OrderData = {
                deliveryMethod: orderData.deliveryMethod,
                totalPrice: orderData.totalPrice,
                shippingCost: orderData.shippingCost,
                customerInfo: orderData.customerInfo,
                address: orderData.shippingAddress,
                items: orderData.items,
              };
              await sendOrderConfirmationEmail(emailOrderData, orderNumber, config.public.strapiUrl, customerLocale);
              console.log(`Order confirmation email sent to ${orderData.customerInfo.email}`);

              // Send seller notification email (always in Dutch)
              await sendSellerOrderNotification(emailOrderData, orderNumber, config.public.strapiUrl, 'info@lembrace.be', 'nl');
              console.log('Seller notification email sent');
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
