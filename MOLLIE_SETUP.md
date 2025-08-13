# Mollie Payment Integration Setup

## Overview
This application now includes Mollie payment integration for processing online payments. The integration includes:
- Payment creation via Mollie API
- Webhook handling for payment status updates
- Automatic order status updates in Strapi
- Redirect flow to Mollie checkout

## Required Environment Variables

Add these to your `.env` file:

```bash
# Strapi Configuration
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=your_strapi_api_token_here

# Mollie Configuration
MOLLIE_API_KEY=your_mollie_api_key_here

# Site Configuration
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Mollie API Key Setup

1. **Create a Mollie account** at [mollie.com](https://www.mollie.com)
2. **Get your API key** from the Mollie dashboard
3. **Set the API key** in your environment variables

## How It Works

### 1. Payment Flow
1. User fills out payment form
2. Order is created in Strapi
3. Mollie payment is created via API
4. User is redirected to Mollie checkout
5. After payment, user returns to success page

### 2. Webhook Handling
- Mollie sends payment status updates to `/api/mollie/webhook`
- Order status is automatically updated in Strapi
- Payment statuses: `pending`, `paid`, `failed`, `expired`, `cancelled`

### 3. API Endpoints
- `POST /api/mollie/create-payment` - Creates Mollie payment
- `POST /api/mollie/webhook` - Handles payment status updates

## Testing

### Development Mode
- Use Mollie test API key for development
- Test payments will not charge real money
- **Webhooks disabled locally** - Use manual payment status check instead
- **Manual status check**: `GET /api/mollie/check-payment?paymentId=YOUR_PAYMENT_ID`

### Production Mode
- Use Mollie live API key
- Ensure webhook URLs are publicly accessible
- Test payment flow thoroughly
- Webhooks automatically enabled when `NODE_ENV=production`

### Local Development Workflow
1. **Create payment** → Redirects to Mollie checkout
2. **Complete payment** → Returns to success page
3. **Check status manually** → Call `/api/mollie/check-payment?paymentId=PAYMENT_ID`
4. **Order updated** → Status automatically updated in Strapi

## Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for sensitive data
- **Validate webhook signatures** in production (optional but recommended)
- **HTTPS required** for production webhooks

## Troubleshooting

### Common Issues
1. **Payment creation fails** - Check Mollie API key and network connectivity
2. **Webhook not working** - Verify webhook URL is accessible and Strapi token is valid
3. **Order status not updating** - Check webhook logs and Strapi permissions

### Development Issues
1. **"Webhook URL is invalid because it is unreachable"** - This is normal in development
   - Webhooks are automatically disabled when `NODE_ENV !== 'production'`
   - Use manual payment status check: `/api/mollie/check-payment?paymentId=PAYMENT_ID`
   - This endpoint updates order status in Strapi manually

2. **Payment created but order status not updated** - Use manual status check
   - Get payment ID from Mollie dashboard or logs
   - Call the check-payment endpoint to update order status

### Debug Mode
Enable console logging in the webhook endpoint to debug payment status updates. 