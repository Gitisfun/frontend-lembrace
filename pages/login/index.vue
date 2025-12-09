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

        <InputField
          id="password"
          v-model="formData.password"
          :label="$t('auth.form.password')"
          type="password"
          :placeholder="$t('auth.form.passwordPlaceholder')"
          required
          show-success
          :error="errors.password"
          :force-validation="forceValidation"
          @blur="validateField('password')"
          @update:model-value="handleFieldInput('password')"
        />

        <UiButtonSubmit :loading="isSubmitting" :text="$t('auth.login.submit')" :loading-text="$t('auth.login.submitting')" />
      </form>

      <UiAlertMessage v-if="submitStatus" :type="submitStatus.type" :message="submitStatus.message" class="submit-status" />

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
import { reactive, ref } from 'vue';
import { useFormValidation, validators } from '~/composables/useFormValidation';
import { useSubmitStatus } from '~/composables/useSubmitStatus';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';

const { t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();
const config = useRuntimeConfig();
const authStore = useAuthStore();
const { success: toastSuccess, error: toastError } = useToast();

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
const { isSubmitting, status: submitStatus, setError, startSubmitting, stopSubmitting } = useSubmitStatus();
const forceValidation = ref(false);

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
    const response = await $fetch('https://sundrops-api-345f2765b0ea.herokuapp.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.public.authApiKey,
      },
      body: {
        identifier: formData.email,
        password: formData.password,
      },
    });

    if (response.success && response.data) {
      authStore.login(response.data, response.token);
      toastSuccess(t('auth.login.success'));
      navigateTo(localePath('/profile'));
    } else {
      throw new Error(response.message || 'Invalid response');
    }
  } catch (error) {
    console.error('Login failed:', error);
    setError(t('auth.login.error'));
    toastError(t('auth.login.error'));
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

.submit-status {
  margin-top: 1.5rem;
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
