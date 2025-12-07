export const formatPrice = (price: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);

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
