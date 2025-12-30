<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <!-- Success State -->
      <div v-if="resetSuccess" class="success-state">
        <div class="success-icon">
          <IconCheckCircle class="icon" />
        </div>
        <h1 class="success-title">{{ $t('auth.resetPassword.successTitle') }}</h1>
        <p class="success-message">{{ $t('auth.resetPassword.successMessage') }}</p>
        <NuxtLink :to="localePath('/login')" class="action-btn">
          {{ $t('auth.resetPassword.loginButton') }}
        </NuxtLink>
      </div>

      <!-- Reset Form -->
      <template v-else>
        <div class="reset-password-header">
          <h1 class="reset-password-title">{{ $t('auth.resetPassword.title') }}</h1>
          <p class="reset-password-subtitle">{{ $t('auth.resetPassword.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="reset-password-form" novalidate>
          <InputPassword
            id="password"
            v-model="formData.password"
            :label="$t('auth.form.password')"
            :placeholder="$t('auth.resetPassword.newPasswordPlaceholder')"
            required
            show-success
            :error="errors.password"
            :force-validation="forceValidation"
            @blur="validateField('password')"
            @update:model-value="handleFieldInput('password')"
          />

          <InputPassword
            id="confirmPassword"
            v-model="formData.confirmPassword"
            :label="$t('auth.form.confirmPassword')"
            :placeholder="$t('auth.form.confirmPasswordPlaceholder')"
            required
            show-success
            :error="errors.confirmPassword"
            :force-validation="forceValidation"
            @blur="validateField('confirmPassword')"
            @update:model-value="handleFieldInput('confirmPassword')"
          />

          <UiButtonSubmit :loading="isSubmitting" :text="$t('auth.resetPassword.submit')" :loading-text="$t('auth.resetPassword.submitting')" />
        </form>

        <UiAlertMessage v-if="submitStatus" :type="submitStatus.type" :message="submitStatus.message" class="submit-status" />
      </template>

      <div v-if="!resetSuccess" class="reset-password-footer">
        <NuxtLink :to="localePath('/login')" class="back-link">
          {{ $t('auth.resetPassword.backToLogin') }}
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
import { useAuthentication } from '~/composables/useAuthentication';

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const { error: toastError } = useToast();
const { resetPassword } = useAuthentication();

// SEO Meta
useSeoMeta({
  title: () => t('seo.resetPassword.title'),
  description: () => t('seo.resetPassword.description'),
  robots: 'noindex, nofollow',
});

const token = route.params.token;

const formData = reactive({
  password: '',
  confirmPassword: '',
});

// Custom password match validator
const passwordMatch = () => (value) => {
  if (!value) return 'Please confirm your password';
  if (value !== formData.password) return 'Passwords do not match';
  return '';
};

const resetPasswordSchema = {
  password: { rules: [validators.required('password'), validators.minLength(8, 'Password')] },
  confirmPassword: { rules: [passwordMatch()] },
};

const { errors, validateField, clearError, validateAll } = useFormValidation(formData, resetPasswordSchema);
const { isSubmitting, status: submitStatus, setError, startSubmitting, stopSubmitting } = useSubmitStatus();
const forceValidation = ref(false);
const resetSuccess = ref(false);

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
    const result = await resetPassword(token, formData.password, setError);

    if (result.success) {
      resetSuccess.value = true;
    }
  } finally {
    stopSubmitting();
  }
};
</script>

<style scoped>
.reset-password-page {
  background: var(--gradient-gold-vertical);
  min-height: calc(100vh - 70px);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-password-container {
  max-width: 450px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-soft);
  animation: fadeInUp 0.8s ease forwards;
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
  color: #22c55e;
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

.action-btn {
  display: inline-block;
  padding: 1rem 2rem;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--color-gold);
  border: none;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--color-gold-dark, #c4a030);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.reset-password-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.reset-password-title {
  font-family: var(--font-primary);
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.reset-password-subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.6;
  font-weight: 300;
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reset-password-form :deep(.submit-btn) {
  margin-top: 0.5rem;
  width: 100%;
}

.submit-status {
  margin-top: 1.5rem;
}

.reset-password-footer {
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
  .reset-password-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .reset-password-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .reset-password-page {
    padding: 1rem 0.5rem;
  }

  .reset-password-container {
    padding: 1.5rem 1rem;
  }

  .reset-password-title {
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
