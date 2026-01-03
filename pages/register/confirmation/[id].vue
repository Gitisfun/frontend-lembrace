<template>
  <div class="confirmation-page">
    <div class="confirmation-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="confirmation-loading">
        <UiLoadingSpinner />
        <p class="loading-text">{{ $t('auth.confirmation.verifying') }}</p>
      </div>

      <!-- Success State -->
      <div v-else-if="status === 'success'" class="confirmation-result">
        <div class="result-icon success">
          <IconCheckCircle class="icon" />
        </div>
        <h1 class="result-title">{{ $t('auth.confirmation.successTitle') }}</h1>
        <p class="result-message">{{ resultMessage || $t('auth.confirmation.successMessage') }}</p>
        <UiButton variant="primary" :to="localePath('/login')" :text="$t('auth.confirmation.loginButton')" />
      </div>

      <!-- Error States -->
      <div v-else class="confirmation-result">
        <div class="result-icon error">
          <IconXCircle class="icon" />
        </div>

        <!-- Invalid Token (400) -->
        <template v-if="status === 'invalid'">
          <h1 class="result-title">{{ $t('auth.confirmation.invalidTitle') }}</h1>
          <p class="result-message">{{ resultMessage || $t('auth.confirmation.invalidMessage') }}</p>
        </template>

        <!-- Expired Token (410) -->
        <template v-else-if="status === 'expired'">
          <h1 class="result-title">{{ $t('auth.confirmation.expiredTitle') }}</h1>
          <p class="result-message">{{ resultMessage || $t('auth.confirmation.expiredMessage') }}</p>
          <UiButton variant="outline" :text="$t('auth.confirmation.registerAgain')" @click="goToRegister" />
        </template>

        <!-- Server Error (500) -->
        <template v-else>
          <h1 class="result-title">{{ $t('auth.confirmation.errorTitle') }}</h1>
          <p class="result-message">{{ resultMessage || $t('auth.confirmation.errorMessage') }}</p>
          <UiButton variant="outline" :text="$t('common.retry')" @click="retryVerification" />
        </template>

        <NuxtLink :to="localePath('/login')" class="login-link">
          {{ $t('auth.confirmation.backToLogin') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthentication } from '~/composables/useAuthentication';

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const { verifyEmail: verifyEmailApi } = useAuthentication();

// SEO Meta
useSeoMeta({
  title: () => t('seo.confirmation.title'),
  description: () => t('seo.confirmation.description'),
  robots: 'noindex, nofollow',
});

const isLoading = ref(true);
const status = ref(''); // 'success', 'invalid', 'expired', 'error'
const resultMessage = ref('');

const token = route.params.id;

const verifyEmail = async () => {
  if (!token) {
    status.value = 'invalid';
    isLoading.value = false;
    return;
  }

  try {
    const result = await verifyEmailApi(token);
    status.value = result.status;
    resultMessage.value = result.message || '';
  } finally {
    isLoading.value = false;
  }
};

const retryVerification = () => {
  isLoading.value = true;
  status.value = '';
  resultMessage.value = '';
  verifyEmail();
};

const goToRegister = () => {
  navigateTo(localePath('/register'));
};

onMounted(() => {
  verifyEmail();
});
</script>

<style scoped>
.confirmation-page {
  background: var(--gradient-gold-vertical);
  min-height: calc(100vh - 70px);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-soft);
  animation: fadeInUp 0.8s ease forwards;
  text-align: center;
}

.confirmation-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 0;
}

.loading-text {
  font-family: var(--font-body);
  font-size: 1.1rem;
  color: var(--color-text-light);
}

.confirmation-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.result-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.result-icon.success {
  background: rgba(34, 197, 94, 0.1);
}

.result-icon.success .icon {
  width: 50px;
  height: 50px;
  color: #22c55e;
}

.result-icon.error {
  background: rgba(239, 68, 68, 0.1);
}

.result-icon.error .icon {
  width: 50px;
  height: 50px;
  color: #ef4444;
}

.result-title {
  font-family: var(--font-primary);
  font-size: 1.75rem;
  color: var(--color-text);
  font-weight: 600;
  letter-spacing: 0.5px;
  margin: 0;
}

.result-message {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.6;
  margin: 0 0 1rem 0;
  max-width: 400px;
}

.login-link {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-gold);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .confirmation-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .result-title {
    font-size: 1.5rem;
  }

  .result-icon {
    width: 70px;
    height: 70px;
  }

  .result-icon .icon {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .confirmation-page {
    padding: 1rem 0.5rem;
  }

  .confirmation-container {
    padding: 1.5rem 1rem;
  }

  .result-title {
    font-size: 1.3rem;
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
