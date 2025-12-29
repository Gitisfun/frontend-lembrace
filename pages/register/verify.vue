<template>
  <div class="verify-page">
    <div class="verify-container">
      <div class="verify-icon">
        <IconCheckCircle class="icon-success" />
      </div>

      <div class="verify-header">
        <h1 class="verify-title">{{ $t('auth.verify.title') }}</h1>
        <p class="verify-subtitle">{{ $t('auth.verify.subtitle') }}</p>
      </div>

      <div class="verify-content">
        <div class="email-info">
          <p class="email-label">{{ $t('auth.verify.sentTo') }}</p>
          <p class="email-value">{{ userEmail }}</p>
        </div>

        <div class="verify-instructions">
          <p>{{ $t('auth.verify.instructions') }}</p>
        </div>

        <div class="verify-tips">
          <p class="tips-title">{{ $t('auth.verify.tipsTitle') }}</p>
          <ul class="tips-list">
            <li>{{ $t('auth.verify.tip1') }}</li>
            <li>{{ $t('auth.verify.tip2') }}</li>
          </ul>
        </div>
      </div>

      <div class="verify-actions">
        <button class="resend-btn" :disabled="isResending || cooldown > 0" @click="resendEmail">
          <span v-if="isResending">{{ $t('auth.verify.resending') }}</span>
          <span v-else-if="cooldown > 0">{{ $t('auth.verify.resendCooldown', { seconds: cooldown }) }}</span>
          <span v-else>{{ $t('auth.verify.resendEmail') }}</span>
        </button>

        <NuxtLink :to="localePath('/login')" class="login-link">
          {{ $t('auth.verify.backToLogin') }}
        </NuxtLink>
      </div>

      <UiAlertMessage v-if="alertMessage" :type="alertType" :message="alertMessage" class="alert-status" />
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useToast } from '~/composables/useToast';
import { sendEmail } from '~/logic/utils';

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const { success: toastSuccess, error: toastError } = useToast();

// SEO Meta
useSeoMeta({
  title: () => t('seo.verify.title'),
  description: () => t('seo.verify.description'),
  robots: 'noindex, nofollow',
});

// Get email from query params
const userEmail = ref(route.query.email || '');

// If no email, redirect to register
if (!userEmail.value) {
  navigateTo(localePath('/register'));
}

const isResending = ref(false);
const cooldown = ref(0);
const alertMessage = ref('');
const alertType = ref('success');

let cooldownInterval = null;

const startCooldown = () => {
  cooldown.value = 60; // 60 seconds cooldown
  cooldownInterval = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
    }
  }, 1000);
};

const resendEmail = async () => {
  if (isResending.value || cooldown.value > 0) return;

  isResending.value = true;
  alertMessage.value = '';

  try {
    // Get the verification token
    const tokenResponse = await $fetch(`https://sundrops-api-345f2765b0ea.herokuapp.com/api/auth/verification-token/${encodeURIComponent(userEmail.value)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.public.authApiKey,
      },
    });

    if (!tokenResponse?.data?.email_verification_token) {
      throw new Error('Failed to get verification token');
    }

    const siteUrl = window.location.origin;
    const verificationLink = `${siteUrl}/register/confirmation/${tokenResponse.data.email_verification_token}`;

    await sendEmail(
      {
        to: userEmail.value,
        email: userEmail.value,
        name: userEmail.value,
        subject: "Verify your L'embrace account",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Verify Your Email</h2>
          <p style="color: #666; line-height: 1.6;">You requested a new verification email for your L'embrace account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; background-color: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p style="color: #888; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="color: #d4af37; word-break: break-all; font-size: 14px;">${verificationLink}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #888; font-size: 12px;">If you did not request this, you can safely ignore this email.</p>
          <p style="color: #666; font-style: italic;">L'embrace - Elegance in every detail</p>
        </div>
      `.trim(),
      },
      config.public.strapiUrl
    );

    alertType.value = 'success';
    alertMessage.value = t('auth.verify.resendSuccess');
    toastSuccess(t('auth.verify.resendSuccess'));
    startCooldown();
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    const statusCode = error?.response?.status || error?.data?.statusCode || error?.statusCode;

    alertType.value = 'error';
    if (statusCode === 409) {
      alertMessage.value = t('auth.verify.alreadyVerified');
      toastSuccess(t('auth.verify.alreadyVerified'));
      // Redirect to login after a short delay
      setTimeout(() => {
        navigateTo(localePath('/login'));
      }, 2000);
    } else {
      alertMessage.value = error?.data?.message || t('auth.verify.resendError');
      toastError(alertMessage.value);
    }
  } finally {
    isResending.value = false;
  }
};

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
  }
});
</script>

<style scoped>
.verify-page {
  background: var(--gradient-gold-vertical);
  min-height: calc(100vh - 70px);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-soft);
  animation: fadeInUp 0.8s ease forwards;
  text-align: center;
}

.verify-icon {
  margin-bottom: 1.5rem;
}

.icon-success {
  width: 80px;
  height: 80px;
  color: var(--color-gold);
}

.verify-header {
  margin-bottom: 2rem;
}

.verify-title {
  font-family: var(--font-primary);
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.verify-subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.6;
  font-weight: 300;
}

.verify-content {
  margin-bottom: 2rem;
}

.email-info {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.email-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin-bottom: 0.25rem;
}

.email-value {
  font-family: var(--font-body);
  font-size: 1.125rem;
  color: var(--color-text);
  font-weight: 600;
}

.verify-instructions {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.verify-tips {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: left;
}

.tips-title {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.tips-list {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-light);
  line-height: 1.6;
  margin: 0;
  padding-left: 1.25rem;
}

.tips-list li {
  margin-bottom: 0.5rem;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

.verify-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.resend-btn {
  width: 100%;
  padding: 1rem 2rem;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--color-gold);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resend-btn:hover:not(:disabled) {
  background: var(--color-gold-dark, #c4a030);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.resend-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-gold);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-link:hover {
  text-decoration: underline;
}

.alert-status {
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .verify-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .verify-title {
    font-size: 1.6rem;
  }

  .icon-success {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .verify-page {
    padding: 1rem 0.5rem;
  }

  .verify-container {
    padding: 1.5rem 1rem;
  }

  .verify-title {
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
