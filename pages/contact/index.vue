<template>
  <div class="contact-page">
    <div class="contact-container">
      <div class="contact-header">
        <h1 class="contact-title">{{ $t('contact.title') }}</h1>
        <p class="contact-subtitle">{{ $t('contact.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="contact-form" novalidate>
        <InputField id="name" v-model="formData.name" :label="$t('contact.form.name')" type="text" placeholder="Your full name" required show-success :error="errors.name" :force-validation="forceValidation" @blur="validateField('name')" @update:model-value="handleFieldInput('name')" />

        <InputField
          id="email"
          v-model="formData.email"
          :label="$t('contact.form.email')"
          type="email"
          placeholder="your.email@example.com"
          required
          show-success
          :error="errors.email"
          :force-validation="forceValidation"
          @blur="validateField('email')"
          @update:model-value="handleFieldInput('email')"
        />

        <InputField id="phone" v-model="formData.phone" :label="$t('contact.form.phone')" type="tel" placeholder="Your phone number" show-optional show-success :error="errors.phone" :force-validation="forceValidation" @blur="validateField('phone')" @update:model-value="handleFieldInput('phone')" />

        <InputField
          id="message"
          v-model="formData.message"
          :label="$t('contact.form.message')"
          type="textarea"
          placeholder="Tell us about your inquiry..."
          :rows="6"
          required
          show-success
          :error="errors.message"
          :force-validation="forceValidation"
          @blur="validateField('message')"
          @update:model-value="handleFieldInput('message')"
        />

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          <span v-if="!isSubmitting">{{ $t('contact.form.submit') }}</span>
          <span v-else class="loading-text">{{ $t('contact.form.submitting') }}</span>
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
import { useFormValidation, validators } from '~/composables/useFormValidation';
import { useToast } from '~/composables/useToast';

const { t } = useI18n();
const { success: toastSuccess, error: toastError } = useToast();

// SEO Meta
useSeoMeta({
  title: () => t('seo.contact.title'),
  description: () => t('seo.contact.description'),
  ogTitle: () => t('seo.contact.title'),
  ogDescription: () => t('seo.contact.description'),
  ogImage: '/logo-lembrace.png',
  twitterTitle: () => t('seo.contact.title'),
  twitterDescription: () => t('seo.contact.description'),
});

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
});

// Use the form validation composable
const { errors, validateField, clearError, validateAll, resetErrors } = useFormValidation(formData, {
  name: { rules: [validators.name()] },
  email: { rules: [validators.email()] },
  phone: { rules: [validators.phone()] },
  message: {
    rules: [validators.required('message'), validators.minLength(10, 'Message'), validators.maxLength(1000, 'Message')],
  },
});

const isSubmitting = ref(false);
const submitStatus = ref(null);
const forceValidation = ref(false);

// Handle field input - clear error and reset force validation for that field
const handleFieldInput = (fieldName) => {
  clearError(fieldName);
  forceValidation.value = false;
};

const handleSubmit = async () => {
  // Force show validation on all fields
  forceValidation.value = true;

  if (!validateAll()) {
    // Show validation error toast
    toastError(t('toast.contact.validationError'));
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
        to: 'info@lembrace.be',
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
      message: t('contact.success'),
    };
    toastSuccess(t('toast.contact.success'));

    // Reset form
    Object.keys(formData).forEach((key) => {
      formData[key] = '';
    });
    resetErrors();
    forceValidation.value = false;
  } catch (error) {
    console.error('Error sending email:', error);
    submitStatus.value = {
      type: 'error',
      message: t('contact.error'),
    };
    toastError(t('toast.contact.apiError'));
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
