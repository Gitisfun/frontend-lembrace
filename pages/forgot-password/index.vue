<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <div class="forgot-password-header">
        <h1 class="forgot-password-title">{{ $t('auth.forgotPassword.title') }}</h1>
        <p class="forgot-password-subtitle">{{ $t('auth.forgotPassword.subtitle') }}</p>
      </div>

      <form v-if="!emailSent" @submit.prevent="handleSubmit" class="forgot-password-form" novalidate>
        <InputField
          id="email"
          v-model="formData.email"
          :label="$t('auth.form.email')"
          type="email"
          :placeholder="$t('auth.form.emailPlaceholder')"
          required
          show-success
          :error="errors.email"
          :force-validation="forceValidation"
          @blur="validateField('email')"
          @update:model-value="handleFieldInput('email')"
        />

        <UiButtonSubmit :loading="isSubmitting" :text="$t('auth.forgotPassword.submit')" :loading-text="$t('auth.forgotPassword.submitting')" />
      </form>

      <!-- Success State -->
      <div v-else class="success-state">
        <div class="success-icon">
          <IconCheckCircle class="icon" />
        </div>
        <h2 class="success-title">{{ $t('auth.forgotPassword.successTitle') }}</h2>
        <p class="success-message">{{ $t('auth.forgotPassword.successMessage') }}</p>
        <div class="email-info">
          <p class="email-label">{{ $t('auth.forgotPassword.sentTo') }}</p>
          <p class="email-value">{{ formData.email }}</p>
        </div>
      </div>

      <UiAlertMessage v-if="submitStatus" :type="submitStatus.type" :message="submitStatus.message" class="submit-status" />

      <div class="forgot-password-footer">
        <NuxtLink :to="localePath('/login')" class="back-link">
          {{ $t('auth.forgotPassword.backToLogin') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useFormValidation, validators } from '~/composables/useFormValidation';
import { useSubmitStatus } from '~/composables/useSubmitStatus';
import { useToast } from '~/composables/useToast';
import { sendEmail } from '~/logic/utils';

const { t } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const { success: toastSuccess, error: toastError } = useToast();

console.log('config.public.strapiUrl');
console.log(config.public.strapiUrl);

// SEO Meta
useSeoMeta({
  title: () => t('seo.forgotPassword.title'),
  description: () => t('seo.forgotPassword.description'),
  robots: 'noindex, nofollow',
});

const formData = reactive({
  email: '',
});

const forgotPasswordSchema = {
  email: { rules: [validators.email()] },
};

const { errors, validateField, clearError, validateAll } = useFormValidation(formData, forgotPasswordSchema);
const { isSubmitting, status: submitStatus, setError, startSubmitting, stopSubmitting } = useSubmitStatus();
const forceValidation = ref(false);
const emailSent = ref(false);

const handleFieldInput = (fieldName) => {
  clearError(fieldName);
  forceValidation.value = false;
};

const handleSubmit = async () => {
  forceValidation.value = true;

  if (!validateAll()) {
    toastError(t('auth.form.validationError'));
    return;
  }

  startSubmitting();

  try {
    // Request password reset token from API
    const tokenResponse = await $fetch(`https://sundrops-api-345f2765b0ea.herokuapp.com/api/auth/password-reset-token`, {
      method: 'POST',
      body: {
        email: formData.email,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.public.authApiKey,
      },
    });

    if (tokenResponse?.data?.password_reset_token) {
      const siteUrl = window.location.origin;
      const resetLink = `${siteUrl}/reset-password/${tokenResponse.data.password_reset_token}`;

      await sendEmail(
        {
          to: formData.email,
          email: formData.email,
          name: formData.email,
          subject: "Reset your L'embrace password",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Reset Your Password</h2>
            <p style="color: #666; line-height: 1.6;">You requested to reset your password for your L'embrace account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #888; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="color: #d4af37; word-break: break-all; font-size: 14px;">${resetLink}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #888; font-size: 12px;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
            <p style="color: #666; font-style: italic;">L'embrace - Elegance in every detail</p>
          </div>
        `.trim(),
        },
        config.public.strapiUrl
      );
    }

    emailSent.value = true;
    toastSuccess(t('auth.forgotPassword.success'));
  } catch (error) {
    console.error('Forgot password failed:', error);
    // Always show success to prevent email enumeration
    emailSent.value = true;
    toastSuccess(t('auth.forgotPassword.success'));
  } finally {
    stopSubmitting();
  }
};
</script>

<style scoped>
.forgot-password-page {
  background: var(--gradient-gold-vertical);
  min-height: calc(100vh - 70px);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot-password-container {
  max-width: 450px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-soft);
  animation: fadeInUp 0.8s ease forwards;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.forgot-password-title {
  font-family: var(--font-primary);
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.forgot-password-subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.6;
  font-weight: 300;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.forgot-password-form :deep(.submit-btn) {
  margin-top: 0.5rem;
  width: 100%;
}

.success-state {
  text-align: center;
}

.success-icon {
  margin-bottom: 1.5rem;
}

.success-icon .icon {
  width: 70px;
  height: 70px;
  color: var(--color-gold);
}

.success-title {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.success-message {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.email-info {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  padding: 1rem;
}

.email-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin-bottom: 0.25rem;
}

.email-value {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 600;
}

.submit-status {
  margin-top: 1.5rem;
}

.forgot-password-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.back-link {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-gold);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .forgot-password-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .forgot-password-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .forgot-password-page {
    padding: 1rem 0.5rem;
  }

  .forgot-password-container {
    padding: 1.5rem 1rem;
  }

  .forgot-password-title {
    font-size: 1.4rem;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
