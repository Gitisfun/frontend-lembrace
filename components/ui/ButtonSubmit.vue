<template>
  <button type="submit" class="submit-btn" :disabled="loading || disabled">
    <span v-if="!loading">
      <slot>{{ text }}</slot>
    </span>
    <span v-else class="loading-content">
      <span class="spinner" />
      <span v-if="loadingText">{{ loadingText }}</span>
    </span>
  </button>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Submit',
  },
  loadingText: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  background: var(--gradient-gold);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  min-width: 150px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-gold);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .submit-btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>
