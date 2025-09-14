<template>
  <div class="contact-page">
    <div class="contact-container">
      <div class="contact-header">
        <h1 class="contact-title">Get in Touch</h1>
        <p class="contact-subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="contact-form">
        <div class="form-group" :class="{ 'has-error': errors.name }">
          <label for="name" class="form-label">
            Name
            <span class="required-indicator">*</span>
          </label>
          <div class="input-wrapper">
            <input id="name" v-model="formData.name" type="text" class="form-input" :class="{ error: errors.name, success: !errors.name && formData.name.trim() }" placeholder="Your full name" @blur="validateField('name')" @input="clearError('name')" required />
            <div v-if="errors.name" class="error-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <div v-else-if="!errors.name && formData.name.trim()" class="success-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <div v-if="errors.name" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="error-icon-small">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            {{ errors.name }}
          </div>
        </div>

        <div class="form-group" :class="{ 'has-error': errors.email }">
          <label for="email" class="form-label">
            Email
            <span class="required-indicator">*</span>
          </label>
          <div class="input-wrapper">
            <input id="email" v-model="formData.email" type="email" class="form-input" :class="{ error: errors.email, success: !errors.email && formData.email.trim() }" placeholder="your.email@example.com" @blur="validateField('email')" @input="clearError('email')" required />
            <div v-if="errors.email" class="error-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <div v-else-if="!errors.email && formData.email.trim()" class="success-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <div v-if="errors.email" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="error-icon-small">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            {{ errors.email }}
          </div>
        </div>

        <div class="form-group" :class="{ 'has-error': errors.phone }">
          <label for="phone" class="form-label">
            Phone
            <span class="optional-indicator">(optional)</span>
          </label>
          <div class="input-wrapper">
            <input id="phone" v-model="formData.phone" type="tel" class="form-input" :class="{ error: errors.phone, success: !errors.phone && formData.phone.trim() }" placeholder="Your phone number" @blur="validateField('phone')" @input="clearError('phone')" />
            <div v-if="errors.phone" class="error-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <div v-else-if="!errors.phone && formData.phone.trim()" class="success-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <div v-if="errors.phone" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="error-icon-small">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            {{ errors.phone }}
          </div>
        </div>

        <div class="form-group" :class="{ 'has-error': errors.message }">
          <label for="message" class="form-label">
            Message
            <span class="required-indicator">*</span>
          </label>
          <div class="input-wrapper">
            <textarea
              id="message"
              v-model="formData.message"
              class="form-textarea"
              :class="{ error: errors.message, success: !errors.message && formData.message.trim() }"
              placeholder="Tell us about your inquiry..."
              rows="6"
              @blur="validateField('message')"
              @input="clearError('message')"
              required
            ></textarea>
            <div v-if="errors.message" class="error-icon textarea-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <div v-else-if="!errors.message && formData.message.trim()" class="success-icon textarea-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <div v-if="errors.message" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="error-icon-small">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            {{ errors.message }}
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          <span v-if="!isSubmitting">Send Message</span>
          <span v-else class="loading-text">Sending...</span>
        </button>
      </form>

      <div v-if="submitStatus" class="submit-status" :class="submitStatus.type">
        {{ submitStatus.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
});

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
});

const isSubmitting = ref(false);
const submitStatus = ref(null);

const validateField = (fieldName) => {
  const value = formData[fieldName].trim();

  switch (fieldName) {
    case 'name':
      if (!value) {
        errors.name = 'Please enter your name';
      } else if (value.length < 2) {
        errors.name = 'Name must be at least 2 characters long';
      } else if (value.length > 50) {
        errors.name = 'Name must be less than 50 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
      } else {
        errors.name = '';
      }
      break;

    case 'email':
      if (!value) {
        errors.email = 'Please enter your email address';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = 'Please enter a valid email address (e.g., user@example.com)';
      } else if (value.length > 100) {
        errors.email = 'Email address is too long';
      } else {
        errors.email = '';
      }
      break;

    case 'phone':
      if (value && !/^[\+]?[1-9]\d{7,15}$/.test(value)) {
        errors.phone = 'Please enter a valid phone number';
      } else {
        errors.phone = '';
      }
      break;

    case 'message':
      if (!value) {
        errors.message = 'Please enter your message';
      } else if (value.length < 10) {
        errors.message = 'Message must be at least 10 characters long';
      } else if (value.length > 1000) {
        errors.message = 'Message must be less than 1000 characters';
      } else {
        errors.message = '';
      }
      break;
  }
};

const clearError = (fieldName) => {
  if (errors[fieldName]) {
    errors[fieldName] = '';
  }
};

const validateForm = () => {
  // Validate all fields
  ['name', 'email', 'phone', 'message'].forEach((field) => {
    validateField(field);
  });

  // Check if any errors exist
  return !Object.values(errors).some((error) => error !== '');
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  submitStatus.value = null;

  try {
    // Call the actual email endpoint
    const response = await fetch('http://localhost:1337/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name,
        subject: `New Contact Form Message from ${formData.name}`,
        to: 'christianvandenputtelaar@gmail.com',
        text: `<h2>Contact Form Submission</h2>

<h3>Contact Details:</h3>
<ul>
  <li><strong>Name:</strong> ${formData.name}</li>
  <li><strong>Email:</strong> ${formData.email}</li>
  <li><strong>Phone:</strong> ${formData.phone || 'Not provided'}</li>
</ul>

<h3>Message:</h3>
<p>${formData.message}</p>

<hr>
<p><em>Sent from LemBrace Contact Form</em></p>`,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    submitStatus.value = {
      type: 'success',
      message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
    };

    // Reset form
    Object.keys(formData).forEach((key) => {
      formData[key] = '';
    });
  } catch (error) {
    console.error('Error sending email:', error);
    submitStatus.value = {
      type: 'error',
      message: 'Sorry, there was an error sending your message. Please try again.',
    };
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.contact-page {
  background: var(--gradient-gold-vertical);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-soft);
  animation: fadeInUp 0.8s ease forwards;
}

.contact-header {
  text-align: center;
  margin-bottom: 3rem;
}

.contact-title {
  font-family: var(--font-primary);
  font-size: 2.5rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.contact-subtitle {
  font-family: var(--font-body);
  font-size: 1.1rem;
  color: var(--color-text-light);
  line-height: 1.6;
  font-weight: 300;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.form-group.has-error .form-label {
  color: #e74c3c;
}

.required-indicator {
  color: #e74c3c;
  font-weight: 600;
  margin-left: 0.25rem;
}

.optional-indicator {
  color: var(--color-text-light);
  font-size: 0.85rem;
  font-weight: 300;
  margin-left: 0.25rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input,
.form-textarea {
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 0.875rem 1rem;
  padding-right: 3rem;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  background: white;
  color: var(--color-text);
  transition: all 0.3s ease;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(212, 167, 98, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
  background-color: #fdf2f2;
}

.form-input.success,
.form-textarea.success {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  background-color: #f0fdf4;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: var(--font-body);
  line-height: 1.5;
}

.error-icon,
.success-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.error-icon {
  color: #e74c3c;
  background-color: #fdf2f2;
}

.success-icon {
  color: #10b981;
  background-color: #f0fdf4;
}

.textarea-icon {
  top: 1rem;
  transform: none;
}

.error-message {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: #e74c3c;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #fdf2f2;
  border-radius: 6px;
  border-left: 3px solid #e74c3c;
  animation: slideIn 0.3s ease;
}

.error-icon-small {
  color: #e74c3c;
  flex-shrink: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.submit-btn {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  background: var(--gradient-gold);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-gold);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-text::after {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.submit-status {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  text-align: center;
}

.submit-status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.submit-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .contact-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .contact-title {
    font-size: 2rem;
  }

  .contact-subtitle {
    font-size: 1rem;
  }

  .form-input,
  .form-textarea {
    padding: 0.75rem 0.875rem;
  }

  .submit-btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .contact-page {
    padding: 1rem 0.5rem;
  }

  .contact-container {
    padding: 1.5rem 1rem;
  }

  .contact-title {
    font-size: 1.75rem;
  }
}
</style>
