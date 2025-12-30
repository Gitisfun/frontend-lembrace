<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">{{ $t('auth.login.title') }}</h1>
        <p class="login-subtitle">{{ $t('auth.login.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form" novalidate>
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

        <InputPassword
          id="password"
          v-model="formData.password"
          :label="$t('auth.form.password')"
          :placeholder="$t('auth.form.passwordPlaceholder')"
          required
          show-success
          :error="errors.password"
          :force-validation="forceValidation"
          @blur="validateField('password')"
          @update:model-value="handleFieldInput('password')"
        />

        <div class="forgot-password-wrapper">
          <NuxtLink :to="localePath('/forgot-password')" class="forgot-password-link">
            {{ $t('auth.login.forgotPassword') }}
          </NuxtLink>
        </div>

        <UiButtonSubmit :loading="isSubmitting" :text="$t('auth.login.submit')" :loading-text="$t('auth.login.submitting')" />
      </form>

      <UiAlertMessage v-if="submitStatus" :type="submitStatus.type" :message="submitStatus.message" class="submit-status" />

      <!-- Resend verification email section -->
      <div v-if="showResendVerification" class="resend-section">
        <button class="resend-btn" :disabled="isResending || resendCooldown > 0" @click="resendVerificationEmail">
          <span v-if="isResending">{{ $t('auth.login.resending') }}</span>
          <span v-else-if="resendCooldown > 0">{{ $t('auth.login.resendCooldown', { seconds: resendCooldown }) }}</span>
          <span v-else>{{ $t('auth.login.resendVerification') }}</span>
        </button>
      </div>

      <div class="login-footer">
        <p class="register-prompt">
          {{ $t('auth.login.noAccount') }}
          <NuxtLink :to="localePath('/register')" class="register-link">{{ $t('auth.login.registerLink') }}</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onUnmounted } from 'vue';
import { useFormValidation, validators } from '~/composables/useFormValidation';
import { useSubmitStatus } from '~/composables/useSubmitStatus';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import { useAuthentication } from '~/composables/useAuthentication';

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const { error: toastError } = useToast();
const { login, resendVerificationEmail: resendVerification } = useAuthentication();

// SEO Meta
useSeoMeta({
  title: () => t('seo.login.title'),
  description: () => t('seo.login.description'),
  robots: 'noindex, nofollow',
});

// Redirect if already logged in
if (authStore.isAuthenticated) {
  navigateTo(localePath('/profile'));
}

const formData = reactive({
  email: '',
  password: '',
});

const loginSchema = {
  email: { rules: [validators.email()] },
  password: { rules: [validators.required('password')] },
};

const { errors, validateField, clearError, validateAll } = useFormValidation(formData, loginSchema);
const { isSubmitting, status: submitStatus, setError, setSuccess, startSubmitting, stopSubmitting, clearStatus } = useSubmitStatus();
const forceValidation = ref(false);

// Resend verification email state
const showResendVerification = ref(false);
const isResending = ref(false);
const resendCooldown = ref(0);
let cooldownInterval = null;

const handleFieldInput = (fieldName) => {
  clearError(fieldName);
  forceValidation.value = false;
  showResendVerification.value = false;
};

const startCooldown = () => {
  resendCooldown.value = 60;
  cooldownInterval = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
    }
  }, 1000);
};

const resendVerificationEmail = async () => {
  if (isResending.value || resendCooldown.value > 0) return;

  isResending.value = true;
  clearStatus();

  try {
    const result = await resendVerification(formData.email, setError, setSuccess);

    if (result.success) {
      if (result.alreadyVerified) {
        showResendVerification.value = false;
      } else {
        startCooldown();
      }
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

const handleSubmit = async () => {
  forceValidation.value = true;

  if (!validateAll()) {
    toastError(t('auth.form.validationError'));
    return;
  }

  startSubmitting();

  try {
    const result = await login({ email: formData.email, password: formData.password }, setError);

    if (result.success && result.data && result.token) {
      authStore.login(result.data, result.token);
      navigateTo(localePath('/profile'));
    } else if (result.showResendVerification) {
      showResendVerification.value = true;
    }
  } finally {
    stopSubmitting();
  }
};
</script>

<style scoped>
.login-page {
  background: var(--gradient-gold-vertical);
  min-height: calc(100vh - 70px);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  max-width: 450px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-soft);
  animation: fadeInUp 0.8s ease forwards;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-title {
  font-family: var(--font-primary);
  font-size: 2.2rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.login-subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.6;
  font-weight: 300;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-form :deep(.submit-btn) {
  margin-top: 0.5rem;
  width: 100%;
}

.forgot-password-wrapper {
  text-align: right;
  margin-top: -0.5rem;
}

.forgot-password-link {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-gold);
  text-decoration: none;
  transition: all 0.3s ease;
}

.forgot-password-link:hover {
  text-decoration: underline;
}

.submit-status {
  margin-top: 1.5rem;
}

.resend-section {
  margin-top: 1rem;
}

.resend-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-gold);
  background: transparent;
  border: 2px solid var(--color-gold);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resend-btn:hover:not(:disabled) {
  background: var(--color-gold);
  color: white;
}

.resend-btn:disabled {
  border-color: #ccc;
  color: #999;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.register-prompt {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-light);
}

.register-link {
  color: var(--color-gold);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .login-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem 0.5rem;
  }

  .login-container {
    padding: 1.5rem 1rem;
  }

  .login-title {
    font-size: 1.6rem;
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
