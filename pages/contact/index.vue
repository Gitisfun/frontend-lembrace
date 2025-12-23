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

        <UiButtonSubmit :loading="isSubmitting" :text="$t('contact.form.submit')" :loading-text="$t('contact.form.submitting')" />
      </form>

      <UiAlertMessage v-if="submitStatus" :type="submitStatus.type" :message="submitStatus.message" class="submit-status" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useFormValidation } from '~/composables/useFormValidation';
import { useToast } from '~/composables/useToast';
import { useSubmitStatus } from '~/composables/useSubmitStatus';
import { buildContactEmailPayload, sendEmail } from '~/logic/utils';
import { contactFormSchema, createContactFormData } from '~/schemas';
import { useAuthStore } from '~/stores/auth';

const { t } = useI18n();
const { success: toastSuccess, error: toastError } = useToast();
const authStore = useAuthStore();

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

const formData = reactive(createContactFormData());

// Autofill form if user is logged in
onMounted(() => {
  if (authStore.isAuthenticated && authStore.currentUser) {
    const user = authStore.currentUser;
    formData.name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    formData.email = user.email || '';
    formData.phone = authStore.userPhone || '';
  }
});

// Use the form validation composable
const { errors, validateField, clearError, validateAll, resetErrors } = useFormValidation(formData, contactFormSchema);

const { isSubmitting, status: submitStatus, setSuccess, setError, startSubmitting, stopSubmitting } = useSubmitStatus();
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

  startSubmitting();

  try {
    await sendEmail(buildContactEmailPayload(formData));

    setSuccess(t('contact.success'));
    toastSuccess(t('toast.contact.success'));

    // Reset form
    Object.keys(formData).forEach((key) => {
      formData[key] = '';
    });
    resetErrors();
    forceValidation.value = false;
  } catch (error) {
    console.error('Error sending email:', error);
    setError(t('contact.error'));
    toastError(t('toast.contact.apiError'));
  } finally {
    stopSubmitting();
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

.contact-form :deep(.submit-btn) {
  margin-top: 1rem;
  width: 100%;
}

.submit-status {
  margin-top: 1.5rem;
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
