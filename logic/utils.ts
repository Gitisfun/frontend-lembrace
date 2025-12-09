export const formatPrice = (price: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);

// Generate order number with UUID
export const generateOrderNumber = () => 'ORD-' + crypto.randomUUID();

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

export const buildOrderPayload = (form: PaymentFormData, cartItems: CartItem[], totalPrice: number, shippingCost: number) => ({
  orderNumber: generateOrderNumber(),
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
  address: {
    street: form.street,
    number: form.houseNumber,
    box: form.boxNumber || null,
    postalcode: form.postalCode,
    city: form.city,
    country: form.country,
  },
  items: cartItems.map((item) => ({
    productId: item.documentId || item.id,
    name: item.name,
    amount: item.amount,
    price: item.price,
    discount: item.discount || 0,
    calculatedPrice: item.calculatedPrice,
  })),
});

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
