// ============================================================================
// General Utility Functions
// ============================================================================

/**
 * Formats a price in EUR currency with Dutch locale
 */
export const formatPrice = (price: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);

// ============================================================================
// Order Number API
// ============================================================================

/**
 * Fetches a new unique order number from the order API
 * @param apiKey - The API key for authentication
 * @param apiUrl - The order number API URL (from runtime config)
 */
export const fetchOrderNumber = async (apiKey: string, apiUrl: string): Promise<string> => {
  const response = await $fetch<{ order_number: string }>(apiUrl, {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
    },
  });
  return response.order_number;
};

// ============================================================================
// Order Payload Builder
// ============================================================================

interface PaymentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  boxNumber: string;
  postalCode: string;
  city: string;
  country: string;
  billingStreet: string;
  billingHouseNumber: string;
  billingBoxNumber: string;
  billingPostalCode: string;
  billingCity: string;
  billingCountry: string;
  deliveryMethod: string;
}

interface Material {
  id: number;
  documentId: string;
  name: string;
  color: string;
}

interface CartItem {
  id: string | number;
  documentId?: string;
  name: string;
  amount: number;
  price: number;
  discount?: number;
  calculatedPrice: number;
  material?: Material | null;
}

interface BuildOrderOptions {
  useSameAddressForBilling?: boolean;
  orderNumber?: string;
  customerId?: number | null;
  localeCustomer?: string;
}

/**
 * Builds an order payload for submission to the API
 */
export const buildOrderPayload = (form: PaymentFormData, cartItems: CartItem[], totalPrice: number, shippingCost: number, options: BuildOrderOptions = {}) => {
  const { useSameAddressForBilling = true, orderNumber, customerId = null, localeCustomer = 'en' } = options;

  if (!orderNumber) {
    throw new Error('Order number is required');
  }

  const shippingAddress = {
    street: form.street,
    number: form.houseNumber,
    box: form.boxNumber || null,
    postalcode: form.postalCode,
    city: form.city,
    country: form.country,
  };

  const billingAddress = useSameAddressForBilling
    ? shippingAddress
    : {
        street: form.billingStreet,
        number: form.billingHouseNumber,
        box: form.billingBoxNumber || null,
        postalcode: form.billingPostalCode,
        city: form.billingCity,
        country: form.billingCountry,
      };

  return {
    orderNumber,
    unique_order_number: crypto.randomUUID(),
    orderStatus: 'pending',
    totalPrice,
    shippingCost,
    customerId,
    localeCustomer,
    customerInfo: {
      firstname: form.firstName,
      lastname: form.lastName,
      email: form.email,
      phone: form.phone,
    },
    shippingAddress,
    billingAddress,
    items: cartItems.map((item) => ({
      productId: item.documentId || item.id,
      name: item.name,
      amount: item.amount,
      price: item.price,
      discount: item.discount || 0,
      calculatedPrice: item.calculatedPrice,
      materialName: item.material?.name,
    })),
  };
};
