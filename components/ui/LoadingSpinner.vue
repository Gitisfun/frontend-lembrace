<template>
  <div class="loading-spinner" :class="[`size-${size}`, { centered }]">
    <div class="spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  text: {
    type: String,
    default: '',
  },
  centered: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner.centered {
  justify-content: center;
  min-height: 200px;
}

.spinner {
  position: relative;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--color-gold, #d4af37);
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  opacity: 0.8;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  opacity: 0.6;
}

/* Size variants */
.size-small .spinner {
  width: 24px;
  height: 24px;
}

.size-small .spinner-ring {
  width: 24px;
  height: 24px;
}

.size-medium .spinner {
  width: 40px;
  height: 40px;
}

.size-medium .spinner-ring {
  width: 40px;
  height: 40px;
}

.size-large .spinner {
  width: 64px;
  height: 64px;
}

.size-large .spinner-ring {
  width: 64px;
  height: 64px;
  border-width: 3px;
}

.loading-text {
  font-family: var(--font-body);
  color: var(--color-text-light, #666);
  font-size: 0.95rem;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
