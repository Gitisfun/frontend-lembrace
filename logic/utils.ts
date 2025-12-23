export const formatPrice = (price: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);

// Order number API
const ORDER_NUMBER_API = 'https://order-number-api-912e55947744.herokuapp.com/api/counter';

export const fetchOrderNumber = async (apiKey: string): Promise<string> => {
  const response = await $fetch<{ order_number: string }>(ORDER_NUMBER_API, {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
    },
  });
  return response.order_number;
};

// Order payload types
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

interface CartItem {
  id: string | number;
  documentId?: string;
  name: string;
  amount: number;
  price: number;
  discount?: number;
  calculatedPrice: number;
}

interface BuildOrderOptions {
  useSameAddressForBilling?: boolean;
  orderNumber?: string;
}

export const buildOrderPayload = (form: PaymentFormData, cartItems: CartItem[], totalPrice: number, shippingCost: number, options: BuildOrderOptions = {}) => {
  const { useSameAddressForBilling = true, orderNumber } = options;

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
    })),
  };
};

// Contact form types
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const buildContactEmailPayload = (formData: ContactFormData, recipientEmail: string = 'info@lembrace.be') => ({
  email: formData.email,
  name: formData.name,
  subject: `New Contact Form Message from ${formData.name}`,
  to: recipientEmail,
  text: `
<h2>Contact Form Submission</h2>

<h3>Contact Details:</h3>
<ul>
  <li><strong>Name:</strong> ${formData.name}</li>
  <li><strong>Email:</strong> ${formData.email}</li>
  <li><strong>Phone:</strong> ${formData.phone || 'Not provided'}</li>
</ul>

<h3>Message:</h3>
<p>${formData.message}</p>

<hr>
<p><em>Sent from L'embrace Contact Form</em></p>
  `.trim(),
});

// Email sending types and function
export interface SendEmailOptions {
  to: string;
  email: string;
  name: string;
  subject: string;
  text: string;
}

const EMAIL_API_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  await $fetch(`${EMAIL_API_URL}/api/email/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options,
  });
};
