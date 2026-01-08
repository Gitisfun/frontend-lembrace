<template>
  <div class="admin-login-page">
    <div class="admin-login-wrapper">
      <div class="admin-branding">
        <div class="admin-logo">
          <div class="logo-icon">
            <IconLayers :size="40" :stroke-width="1.5" />
          </div>
          <span class="logo-text">L'embrace</span>
        </div>
        <span class="admin-badge">{{ $t('admin.login.badge') }}</span>
      </div>

      <div class="admin-login-container">
        <div class="admin-login-header">
          <h1 class="admin-login-title">{{ $t('admin.login.title') }}</h1>
          <p class="admin-login-subtitle">{{ $t('admin.login.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="admin-login-form" novalidate>
          <div class="form-field">
            <label for="email" class="form-label">
              {{ $t('auth.form.email') }}
              <span class="required">*</span>
            </label>
            <div class="input-wrapper" :class="{ error: errors.email && forceValidation }">
              <div class="input-icon">
                <IconMail :size="18" />
              </div>
              <input id="email" v-model="formData.email" type="email" class="form-input" :placeholder="$t('auth.form.emailPlaceholder')" @blur="validateField('email')" @input="handleFieldInput('email')" />
            </div>
            <span v-if="errors.email && forceValidation" class="error-text">{{ errors.email }}</span>
          </div>

          <div class="form-field">
            <label for="password" class="form-label">
              {{ $t('auth.form.password') }}
              <span class="required">*</span>
            </label>
            <div class="input-wrapper" :class="{ error: errors.password && forceValidation }">
              <div class="input-icon">
                <IconLock :size="18" />
              </div>
              <input id="password" v-model="formData.password" :type="showPassword ? 'text' : 'password'" class="form-input" :placeholder="$t('auth.form.passwordPlaceholder')" @blur="validateField('password')" @input="handleFieldInput('password')" />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <IconEyeOff v-if="showPassword" :size="18" />
                <IconEye v-else :size="18" />
              </button>
            </div>
            <span v-if="errors.password && forceValidation" class="error-text">{{ errors.password }}</span>
          </div>

          <button type="submit" class="admin-submit-btn" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="btn-loading">
              <svg class="spinner" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" />
              </svg>
              {{ $t('admin.login.submitting') }}
            </span>
            <span v-else class="btn-content">
              <IconLogin :size="18" />
              {{ $t('admin.login.submit') }}
            </span>
          </button>
        </form>

        <UiAlertMessage v-if="submitStatus" :type="submitStatus.type" :message="submitStatus.message" class="submit-status" />

        <div class="admin-login-footer">
          <NuxtLink :to="localePath('/')" class="back-to-site">
            <IconArrowLeft :size="16" />
            {{ $t('admin.login.backToSite') }}
          </NuxtLink>
        </div>
      </div>

      <div class="admin-footer-text">
        <p>&copy; {{ new Date().getFullYear() }} L'embrace. {{ $t('admin.login.allRightsReserved') }}</p>
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
import { useAdminAuthentication } from '~/composables/useAdminAuthentication';
import IconLayers from '~/components/icon/IconLayers.vue';
import IconMail from '~/components/icon/IconMail.vue';
import IconLock from '~/components/icon/IconLock.vue';
import IconEye from '~/components/icon/IconEye.vue';
import IconEyeOff from '~/components/icon/IconEyeOff.vue';
import IconLogin from '~/components/icon/IconLogin.vue';
import IconArrowLeft from '~/components/icon/IconArrowLeft.vue';

definePageMeta({
  layout: false,
});

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const { error: toastError } = useToast();
const { adminLogin } = useAdminAuthentication();

// SEO Meta
useSeoMeta({
  title: () => t('seo.admin.login.title'),
  description: () => t('seo.admin.login.description'),
  robots: 'noindex, nofollow',
});

// Redirect if already logged in as admin
if (authStore.isAdminAuthenticated) {
  navigateTo(localePath('/admin'));
}

const formData = reactive({
  email: '',
  password: '',
});

const showPassword = ref(false);

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
    const result = await adminLogin({ email: formData.email, password: formData.password }, setError);

    if (result.success && result.data && result.token) {
      authStore.adminLogin(result.data, result.token);
      navigateTo(localePath('/admin'));
    }
  } finally {
    stopSubmitting();
  }
};
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.admin-login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(212, 167, 98, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212, 167, 98, 0.08) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.03) 0%, transparent 30%);
  pointer-events: none;
}

.admin-login-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin-branding {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.admin-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  color: var(--color-gold);
}

.logo-text {
  font-family: var(--font-accent);
  font-size: 2.5rem;
  color: white;
  letter-spacing: 1px;
}

.admin-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  background: rgba(212, 167, 98, 0.15);
  border: 1px solid rgba(212, 167, 98, 0.3);
  border-radius: 20px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-gold);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.admin-login-container {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.admin-login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.admin-login-title {
  font-family: var(--font-primary);
  font-size: 1.75rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.admin-login-subtitle {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
}

.admin-login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-wrapper:focus-within .input-icon {
  color: var(--color-gold);
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: white;
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(212, 167, 98, 0.15);
}

.input-wrapper.error .form-input {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: rgba(255, 255, 255, 0.8);
}

.error-text {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: #ef4444;
}

.admin-submit-btn {
  margin-top: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border: none;
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.admin-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.admin-submit-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.admin-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px -10px rgba(212, 167, 98, 0.5);
}

.admin-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content,
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-loading svg {
  width: 18px;
  height: 18px;
}

.spinner {
  animation: spin 1s linear infinite;
}

.spinner circle {
  stroke-dasharray: 50;
  stroke-dashoffset: 40;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.submit-status {
  margin-top: 1rem;
}

.admin-login-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.back-to-site {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: all 0.2s ease;
}

.back-to-site:hover {
  color: var(--color-gold);
}

.admin-footer-text {
  text-align: center;
}

.admin-footer-text p {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 480px) {
  .admin-login-page {
    padding: 1rem;
  }

  .admin-login-container {
    padding: 1.5rem;
  }

  .logo-text {
    font-size: 2rem;
  }

  .admin-login-title {
    font-size: 1.5rem;
  }
}
</style>
