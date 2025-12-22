<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1 class="register-title">{{ $t('auth.register.title') }}</h1>
        <p class="register-subtitle">{{ $t('auth.register.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="register-form" novalidate>
        <div class="form-row">
          <InputField
            id="firstName"
            v-model="formData.firstName"
            :label="$t('auth.form.firstName')"
            type="text"
            :placeholder="$t('auth.form.firstNamePlaceholder')"
            required
            show-success
            :error="errors.firstName"
            :force-validation="forceValidation"
            @blur="validateField('firstName')"
            @update:model-value="handleFieldInput('firstName')"
          />

          <InputField
            id="lastName"
            v-model="formData.lastName"
            :label="$t('auth.form.lastName')"
            type="text"
            :placeholder="$t('auth.form.lastNamePlaceholder')"
            required
            show-success
            :error="errors.lastName"
            :force-validation="forceValidation"
            @blur="validateField('lastName')"
            @update:model-value="handleFieldInput('lastName')"
          />
        </div>

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

        <InputField
          id="confirmPassword"
          v-model="formData.confirmPassword"
          :label="$t('auth.form.confirmPassword')"
          type="password"
          :placeholder="$t('auth.form.confirmPasswordPlaceholder')"
          required
          show-success
          :error="errors.confirmPassword"
          :force-validation="forceValidation"
          @blur="validateField('confirmPassword')"
          @update:model-value="handleFieldInput('confirmPassword')"
        />

        <UiButtonSubmit :loading="isSubmitting" :text="$t('auth.register.submit')" :loading-text="$t('auth.register.submitting')" />
      </form>

      <UiAlertMessage v-if="submitStatus" :type="submitStatus.type" :message="submitStatus.message" class="submit-status" />

      <div class="register-footer">
        <p class="login-prompt">
          {{ $t('auth.register.hasAccount') }}
          <NuxtLink :to="localePath('/login')" class="login-link">{{ $t('auth.register.loginLink') }}</NuxtLink>
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
  title: () => t('seo.register.title'),
  description: () => t('seo.register.description'),
  robots: 'noindex, nofollow',
});

// Redirect if already logged in
if (authStore.isAuthenticated) {
  navigateTo(localePath('/profile'));
}

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// Custom password match validator
const passwordMatch = () => (value) => {
  if (!value) return 'Please confirm your password';
  if (value !== formData.password) return 'Passwords do not match';
  return '';
};

const registerSchema = {
  firstName: { rules: [validators.name()] },
  lastName: { rules: [validators.name()] },
  email: { rules: [validators.email()] },
  password: { rules: [validators.required('password'), validators.minLength(8, 'Password')] },
  confirmPassword: { rules: [passwordMatch()] },
};

const { errors, validateField, clearError, validateAll } = useFormValidation(formData, registerSchema);
const { isSubmitting, status: submitStatus, setSuccess, setError, startSubmitting, stopSubmitting } = useSubmitStatus();
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
    const response = await $fetch('https://sundrops-api-345f2765b0ea.herokuapp.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.public.authApiKey,
      },
      body: {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        status: 'active',
      },
    });

    if (response.user) {
      // Auto-login after registration
      if (response.token) {
        authStore.login(response.user, response.token);
      } else {
        authStore.setUser(response.user);
      }
      toastSuccess(t('auth.register.success'));
      navigateTo(localePath('/profile'));
    } else {
      setSuccess(t('auth.register.successMessage'));
      toastSuccess(t('auth.register.success'));
      // Redirect to login if no auto-login
      setTimeout(() => {
        navigateTo(localePath('/login'));
      }, 2000);
    }
  } catch (error) {
    console.error('Registration failed:', error);
    const errorMessage = error?.data?.message || t('auth.register.error');
    setError(errorMessage);
    toastError(errorMessage);
  } finally {
    stopSubmitting();
  }
};
</script>

<style scoped>
.register-page {
  background: var(--gradient-gold-vertical);
  min-height: calc(100vh - 70px);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-soft);
  animation: fadeInUp 0.8s ease forwards;
}

.register-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.register-title {
  font-family: var(--font-primary);
  font-size: 2.2rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.register-subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.6;
  font-weight: 300;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.register-form :deep(.submit-btn) {
  margin-top: 0.5rem;
  width: 100%;
}

.submit-status {
  margin-top: 1.5rem;
}

.register-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.login-prompt {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-light);
}

.login-link {
  color: var(--color-gold);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .register-title {
    font-size: 1.8rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .register-page {
    padding: 1rem 0.5rem;
  }

  .register-container {
    padding: 1.5rem 1rem;
  }

  .register-title {
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
