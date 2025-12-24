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
        <NuxtLink :to="localePath('/login')" class="action-btn">
          {{ $t('auth.confirmation.loginButton') }}
        </NuxtLink>
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
          <button class="action-btn secondary" @click="goToRegister">
            {{ $t('auth.confirmation.registerAgain') }}
          </button>
        </template>

        <!-- Server Error (500) -->
        <template v-else>
          <h1 class="result-title">{{ $t('auth.confirmation.errorTitle') }}</h1>
          <p class="result-message">{{ resultMessage || $t('auth.confirmation.errorMessage') }}</p>
          <button class="action-btn secondary" @click="retryVerification">
            {{ $t('common.retry') }}
          </button>
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

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

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
    const response = await $fetch('https://sundrops-api-345f2765b0ea.herokuapp.com/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.public.authApiKey,
      },
      body: {
        token,
      },
    });

    status.value = 'success';
    resultMessage.value = response?.message || '';
  } catch (error) {
    console.error('Email verification failed:', error);

    const statusCode = error?.response?.status || error?.data?.statusCode || 500;
    resultMessage.value = error?.data?.message || '';

    if (statusCode === 400) {
      status.value = 'invalid';
    } else if (statusCode === 410) {
      status.value = 'expired';
    } else {
      status.value = 'error';
    }
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
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.action-btn:hover {
  background: var(--color-gold-dark, #c4a030);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.action-btn.secondary {
  background: #f3f4f6;
  color: var(--color-text);
}

.action-btn.secondary:hover {
  background: #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
