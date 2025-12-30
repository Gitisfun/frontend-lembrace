// ============================================================================
// Email Utility Module
// Centralized email templates and sending functionality for L'embrace
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export interface SendEmailOptions {
  to: string;
  email: string;
  name: string;
  subject: string;
  html: string;
}

export interface EmailTemplateOptions {
  title: string;
  body: string;
  buttonText: string;
  buttonLink: string;
  footerNote?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface OrderData {
  orderNumber?: string;
  deliveryMethod?: string;
  totalPrice: number;
  shippingCost: number;
  customerInfo?: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
  };
  address?: {
    street?: string;
    number?: string;
    box?: string;
    postalcode?: string;
    city?: string;
    country?: string;
  };
  items?: Array<{
    name: string;
    amount: number;
    calculatedPrice: number;
  }>;
}

// ============================================================================
// Base Email Template
// ============================================================================

const EMAIL_STYLES = {
  container: 'font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;',
  heading: 'color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;',
  body: 'color: #666; line-height: 1.6;',
  buttonContainer: 'text-align: center; margin: 30px 0;',
  button: 'display: inline-block; background-color: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;',
  linkNote: 'color: #888; font-size: 14px;',
  link: 'color: #d4af37; word-break: break-all; font-size: 14px;',
  divider: 'border: none; border-top: 1px solid #eee; margin: 30px 0;',
  footer: 'color: #888; font-size: 12px;',
  signature: 'color: #666; font-style: italic;',
} as const;

/**
 * Creates a branded email template with consistent styling
 */
export const createEmailTemplate = (options: EmailTemplateOptions): string => {
  const { title, body, buttonText, buttonLink, footerNote } = options;

  return `
<div style="${EMAIL_STYLES.container}">
  <h2 style="${EMAIL_STYLES.heading}">${title}</h2>
  <p style="${EMAIL_STYLES.body}">${body}</p>
  <div style="${EMAIL_STYLES.buttonContainer}">
    <a href="${buttonLink}" style="${EMAIL_STYLES.button}">${buttonText}</a>
  </div>
  <p style="${EMAIL_STYLES.linkNote}">Or copy and paste this link in your browser:</p>
  <p style="${EMAIL_STYLES.link}">${buttonLink}</p>
  <hr style="${EMAIL_STYLES.divider}">
  ${footerNote ? `<p style="${EMAIL_STYLES.footer}">${footerNote}</p>` : ''}
  <p style="${EMAIL_STYLES.signature}">L'embrace - Elegance in every detail</p>
</div>
`.trim();
};

// ============================================================================
// Auth Email Templates
// ============================================================================

/**
 * Creates a password reset email
 */
export const createPasswordResetEmail = (resetLink: string): string => {
  return createEmailTemplate({
    title: 'Reset Your Password',
    body: "You requested to reset your password for your L'embrace account.",
    buttonText: 'Reset Password',
    buttonLink: resetLink,
    footerNote: 'If you did not request this, you can safely ignore this email. Your password will remain unchanged.',
  });
};

/**
 * Creates a welcome/verification email for new registrations
 */
export const createWelcomeVerificationEmail = (verificationLink: string): string => {
  return createEmailTemplate({
    title: "Welcome to L'embrace!",
    body: 'Thank you for creating an account. Please verify your email address to complete your registration.',
    buttonText: 'Verify Email Address',
    buttonLink: verificationLink,
    footerNote: 'If you did not create this account, you can safely ignore this email.',
  });
};

/**
 * Creates a resend verification email
 */
export const createResendVerificationEmail = (verificationLink: string): string => {
  return createEmailTemplate({
    title: 'Verify Your Email',
    body: "You requested a new verification email for your L'embrace account.",
    buttonText: 'Verify Email Address',
    buttonLink: verificationLink,
    footerNote: 'If you did not request this, you can safely ignore this email.',
  });
};

// ============================================================================
// Contact Email Template
// ============================================================================

/**
 * Creates a contact form submission email
 */
export const createContactEmailPayload = (formData: ContactFormData, recipientEmail: string = 'info@lembrace.be'): SendEmailOptions => ({
  email: formData.email,
  name: formData.name,
  subject: `New Contact Form Message from ${formData.name}`,
  to: recipientEmail,
  html: `
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

// ============================================================================
// Order Email Templates
// ============================================================================

/**
 * Formats a date in Dutch locale
 */
const formatDateNL = (date: Date): string => {
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Calculates expected delivery date based on delivery method
 */
const calculateExpectedDelivery = (deliveryMethod?: string): { date: Date; formatted: string; isExpress: boolean } => {
  const deliveryDate = new Date();
  const isExpress = deliveryMethod === 'express';
  deliveryDate.setDate(deliveryDate.getDate() + (isExpress ? 1 : 3));

  return {
    date: deliveryDate,
    formatted: formatDateNL(deliveryDate),
    isExpress,
  };
};

/**
 * Creates an order confirmation email for customers
 */
export const createOrderConfirmationEmail = (orderData: OrderData, orderNumber: string): string => {
  const delivery = calculateExpectedDelivery(orderData.deliveryMethod);
  const today = formatDateNL(new Date());

  const itemsHtml = orderData.items?.map((item) => `<li>${item.name} x${item.amount} - €${item.calculatedPrice.toFixed(2)}</li>`).join('') || '<li>Geen items gevonden</li>';

  return `<h2>Bestelling Bevestiging - ${orderNumber}</h2>

<p>Beste ${orderData.customerInfo?.firstname || 'Klant'},</p>

<p>Bedankt voor je bestelling! Je betaling is succesvol verwerkt en je bestelling wordt nu voorbereid.</p>

<h3>Bestelling Details:</h3>
<ul>
  <li><strong>Bestelnummer:</strong> ${orderNumber}</li>
  <li><strong>Datum:</strong> ${today}</li>
  <li><strong>Verzendmethode:</strong> ${delivery.isExpress ? 'Express levering' : 'Standaard levering'}</li>
  <li><strong>Verwachte levering:</strong> ${delivery.formatted}</li>
</ul>

<h3>Verzendadres:</h3>
<p>
  ${orderData.customerInfo?.firstname} ${orderData.customerInfo?.lastname}<br>
  ${orderData.address?.street} ${orderData.address?.number}${orderData.address?.box ? ` bus ${orderData.address.box}` : ''}<br>
  ${orderData.address?.postalcode} ${orderData.address?.city}<br>
  ${orderData.address?.country}
</p>

<h3>Bestelde Items:</h3>
<ul>
  ${itemsHtml}
</ul>

<h3>Prijs Overzicht:</h3>
<ul>
  <li><strong>Subtotaal:</strong> €${(orderData.totalPrice - orderData.shippingCost).toFixed(2)}</li>
  <li><strong>Verzendkosten:</strong> €${orderData.shippingCost.toFixed(2)}</li>
  <li><strong>Totaal:</strong> €${orderData.totalPrice.toFixed(2)}</li>
</ul>

<h3>Volgende Stappen:</h3>
<ol>
  <li>We verwerken je bestelling en bereiden deze voor op verzending</li>
  <li>Je ontvangt een e-mail zodra je pakket is verzonden met tracking informatie</li>
  <li>Je pakket wordt geleverd op het opgegeven adres</li>
</ol>

<p>Heb je vragen over je bestelling? Neem gerust contact met ons op!</p>

<p>Met vriendelijke groet,<br>
Het L'embrace Team</p>

<hr>
<p><em>Deze e-mail is automatisch gegenereerd. Reageer niet op dit e-mailadres.</em></p>`;
};

/**
 * Creates a seller notification email for new orders
 */
export const createSellerNotificationEmail = (orderData: OrderData, orderNumber: string): string => {
  const delivery = calculateExpectedDelivery(orderData.deliveryMethod);
  const today = formatDateNL(new Date());
  const currentTime = new Date().toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsHtml = orderData.items?.map((item) => `<li><strong>${item.name}</strong> x${item.amount} - €${item.calculatedPrice.toFixed(2)}</li>`).join('') || '<li>Geen items gevonden</li>';

  return `<h2>🚨 Nieuwe Bestelling Ontvangen - ${orderNumber}</h2>

<p>Er is een nieuwe bestelling binnengekomen die directe aandacht vereist!</p>

<h3>📋 Bestelling Details:</h3>
<ul>
  <li><strong>Bestelnummer:</strong> ${orderNumber}</li>
  <li><strong>Datum:</strong> ${today}</li>
  <li><strong>Tijd:</strong> ${currentTime}</li>
  <li><strong>Verzendmethode:</strong> ${delivery.isExpress ? 'Express levering' : 'Standaard levering'}</li>
  <li><strong>Verwachte levering:</strong> ${delivery.formatted}</li>
</ul>

<h3>👤 Klant Informatie:</h3>
<p>
  <strong>Naam:</strong> ${orderData.customerInfo?.firstname} ${orderData.customerInfo?.lastname}<br>
  <strong>E-mail:</strong> ${orderData.customerInfo?.email}<br>
  <strong>Telefoon:</strong> ${orderData.customerInfo?.phone || 'Niet opgegeven'}
</p>

<h3>📍 Verzendadres:</h3>
<p>
  ${orderData.customerInfo?.firstname} ${orderData.customerInfo?.lastname}<br>
  ${orderData.address?.street} ${orderData.address?.number}${orderData.address?.box ? ` bus ${orderData.address.box}` : ''}<br>
  ${orderData.address?.postalcode} ${orderData.address?.city}<br>
  ${orderData.address?.country}
</p>

<h3>🛍️ Bestelde Items:</h3>
<ul>
  ${itemsHtml}
</ul>

<h3>💰 Prijs Overzicht:</h3>
<ul>
  <li><strong>Subtotaal:</strong> €${(orderData.totalPrice - orderData.shippingCost).toFixed(2)}</li>
  <li><strong>Verzendkosten:</strong> €${orderData.shippingCost.toFixed(2)}</li>
  <li><strong>Totaal:</strong> €${orderData.totalPrice.toFixed(2)}</li>
</ul>

<h3>⚡ Actie Vereist:</h3>
<ol>
  <li>Controleer de bestelling in het admin panel</li>
  <li>Bereid de items voor op verzending</li>
  <li>Verstuur tracking informatie naar de klant zodra verzonden</li>
  <li>Update de bestelling status indien nodig</li>
</ol>

<p><strong>⚠️ Let op:</strong> Deze bestelling vereist directe verwerking om de verwachte leverdatum te halen.</p>

<hr>
<p><em>Deze notificatie is automatisch gegenereerd door het L'embrace systeem.</em></p>`;
};

// ============================================================================
// Email Sending Function
// ============================================================================

/**
 * Sends an email using the Strapi email API
 */
export const sendEmail = async (options: SendEmailOptions, apiUrl: string): Promise<void> => {
  await $fetch(`${apiUrl}/api/email/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options,
  });
};

// ============================================================================
// Helper Functions for Auth Emails
// ============================================================================

/**
 * Sends a password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetToken: string, apiUrl: string): Promise<void> => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const resetLink = `${siteUrl}/reset-password/${resetToken}`;

  await sendEmail(
    {
      to: email,
      email: email,
      name: email,
      subject: "Reset your L'embrace password",
      html: createPasswordResetEmail(resetLink),
    },
    apiUrl
  );
};

/**
 * Sends a welcome verification email for new registrations
 */
export const sendWelcomeVerificationEmail = async (email: string, name: string, verificationToken: string, apiUrl: string): Promise<void> => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationLink = `${siteUrl}/register/confirmation/${verificationToken}`;

  await sendEmail(
    {
      to: email,
      email: email,
      name: name,
      subject: "Verify your L'embrace account",
      html: createWelcomeVerificationEmail(verificationLink),
    },
    apiUrl
  );
};

/**
 * Sends a resend verification email
 */
export const sendResendVerificationEmail = async (email: string, verificationToken: string, apiUrl: string): Promise<void> => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationLink = `${siteUrl}/register/confirmation/${verificationToken}`;

  await sendEmail(
    {
      to: email,
      email: email,
      name: email,
      subject: "Verify your L'embrace account",
      html: createResendVerificationEmail(verificationLink),
    },
    apiUrl
  );
};

/**
 * Sends an order confirmation email to the customer
 */
export const sendOrderConfirmationEmail = async (orderData: OrderData, orderNumber: string, apiUrl: string): Promise<void> => {
  const customerEmail = orderData.customerInfo?.email;
  if (!customerEmail) {
    throw new Error('Customer email is required');
  }

  await sendEmail(
    {
      to: customerEmail,
      email: customerEmail,
      name: orderData.customerInfo?.firstname || 'Klant',
      subject: `Bestelling bevestiging - ${orderNumber}`,
      html: createOrderConfirmationEmail(orderData, orderNumber),
    },
    apiUrl
  );
};

/**
 * Sends a new order notification email to the seller
 */
export const sendSellerOrderNotification = async (orderData: OrderData, orderNumber: string, apiUrl: string, sellerEmail: string = 'info@lembrace.be'): Promise<void> => {
  await sendEmail(
    {
      to: sellerEmail,
      email: sellerEmail,
      name: "L'embrace Team",
      subject: `Nieuwe bestelling ontvangen - ${orderNumber}`,
      html: createSellerNotificationEmail(orderData, orderNumber),
    },
    apiUrl
  );
};
