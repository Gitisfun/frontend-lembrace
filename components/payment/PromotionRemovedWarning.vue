<template>
  <div v-if="message" class="promotion-removed-warning">
    <p class="warning-title">{{ $t('payment.promotion.warningTitle') }}</p>
    <p class="warning-message">{{ message }}</p>
    <p class="warning-action">{{ $t('payment.promotion.reconfirmAction') }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.promotion-removed-warning {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  text-align: center;
}

.promotion-removed-warning .warning-title {
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
}

.promotion-removed-warning .warning-message {
  color: #b91c1c;
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

.promotion-removed-warning .warning-action {
  color: #b91c1c;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
