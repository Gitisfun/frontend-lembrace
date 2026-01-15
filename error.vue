<template>
  <div class="error-page">
    <div class="error-container">
      <!-- Logo -->
      <NuxtLink to="/" class="error-logo"> L'embrace </NuxtLink>

      <!-- Illustration -->
      <div class="error-illustration">
        <div class="illustration-circle">
          <span class="illustration-icon">{{ errorIcon }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="error-content">
        <span class="error-code">{{ error?.statusCode || 404 }}</span>
        <h1 class="error-title">{{ errorTitle }}</h1>
        <p class="error-message">{{ errorMessage }}</p>
      </div>

      <!-- Actions -->
      <div class="error-actions">
        <NuxtLink to="/" class="error-button primary">
          <span class="button-icon">←</span>
          {{ $t('error.backHome') }}
        </NuxtLink>
        <NuxtLink to="/products" class="error-button secondary">
          {{ $t('error.browseProducts') }}
        </NuxtLink>
      </div>

      <!-- Help text -->
      <p class="error-help">
        {{ $t('error.needHelp') }}
        <NuxtLink to="/contact" class="help-link">{{ $t('error.contactUs') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();

const errorIcon = computed(() => {
  if (props.error?.statusCode === 404) return '🔍';
  if (props.error?.statusCode === 500) return '⚙️';
  return '💫';
});

const errorTitle = computed(() => {
  if (props.error?.statusCode === 404) {
    return t('error.notFound.title');
  }
  if (props.error?.statusCode === 500) {
    return t('error.serverError.title');
  }
  return t('error.generic.title');
});

const errorMessage = computed(() => {
  if (props.error?.statusCode === 404) {
    return t('error.notFound.message');
  }
  if (props.error?.statusCode === 500) {
    return t('error.serverError.message');
  }
  return props.error?.message || t('error.generic.message');
});

// SEO Meta
useSeoMeta({
  title: () => `${errorTitle.value} | L'embrace`,
  robots: 'noindex, nofollow',
});
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fdfcfa 0%, #f8f5f0 50%, #f5f0e8 100%);
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 480px;
  width: 100%;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo */
.error-logo {
  display: inline-block;
  font-family: var(--font-heading, 'Cormorant Garamond', serif);
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--color-gold, #d4a762);
  text-decoration: none;
  letter-spacing: 1px;
  margin-bottom: 2.5rem;
  transition: opacity 0.3s ease;
}

.error-logo:hover {
  opacity: 0.8;
}

/* Illustration */
.error-illustration {
  margin-bottom: 2rem;
}

.illustration-circle {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.1) 0%, rgba(212, 167, 98, 0.05) 100%);
  border: 2px solid rgba(212, 167, 98, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.illustration-icon {
  font-size: 3rem;
}

/* Content */
.error-content {
  margin-bottom: 2rem;
}

.error-code {
  display: inline-block;
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-gold, #d4a762);
  background: rgba(212, 167, 98, 0.1);
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.error-title {
  font-family: var(--font-heading, 'Cormorant Garamond', serif);
  font-size: 2.25rem;
  font-weight: 500;
  color: var(--color-text, #2c2c2c);
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
}

.error-message {
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 1rem;
  color: var(--color-text-muted, #6b6b6b);
  line-height: 1.7;
  margin: 0;
}

/* Actions */
.error-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.error-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.error-button.primary {
  background: linear-gradient(135deg, var(--color-gold, #d4a762) 0%, var(--color-gold-dark, #c49a58) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(212, 167, 98, 0.3);
}

.error-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(212, 167, 98, 0.4);
}

.error-button.secondary {
  background: white;
  color: var(--color-text, #2c2c2c);
  border: 1px solid #e8e4de;
}

.error-button.secondary:hover {
  background: #faf8f5;
  border-color: var(--color-gold, #d4a762);
}

.button-icon {
  font-size: 1.1rem;
}

/* Help */
.error-help {
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 0.85rem;
  color: var(--color-text-muted, #6b6b6b);
  margin: 0;
}

.help-link {
  color: var(--color-gold, #d4a762);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.help-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .error-page {
    padding: 1.5rem;
  }

  .error-logo {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }

  .illustration-circle {
    width: 100px;
    height: 100px;
  }

  .illustration-icon {
    font-size: 2.5rem;
  }

  .error-title {
    font-size: 1.75rem;
  }

  .error-message {
    font-size: 0.9rem;
  }
}
</style>
