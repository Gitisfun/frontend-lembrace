<template>
  <div v-if="visible" class="alert-message" :class="type">
    <div class="alert-icon">
      <IconCheckCircle v-if="type === 'success'" :size="20" />
      <IconXCircle v-else-if="type === 'error'" :size="20" />
      <IconInfo v-else :size="20" />
    </div>
    <p class="alert-text">{{ message }}</p>
    <button v-if="dismissible" class="alert-close" @click="$emit('dismiss')">
      <IconX :size="16" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['dismiss']);
</script>

<style scoped>
.alert-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  animation: fadeIn 0.3s ease;
}

.alert-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-text {
  flex: 1;
  margin: 0;
  line-height: 1.4;
}

.alert-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
}

.alert-close:hover {
  opacity: 1;
}

/* Success variant */
.alert-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-message.success .alert-icon {
  color: #28a745;
}

.alert-message.success .alert-close:hover {
  background: rgba(40, 167, 69, 0.1);
}

/* Error variant */
.alert-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-message.error .alert-icon {
  color: #dc3545;
}

.alert-message.error .alert-close:hover {
  background: rgba(220, 53, 69, 0.1);
}

/* Info variant */
.alert-message.info {
  background: #fff8e6;
  color: #856404;
  border: 1px solid #ffeeba;
}

.alert-message.info .alert-icon {
  color: var(--color-gold);
}

.alert-message.info .alert-close:hover {
  background: rgba(212, 175, 55, 0.1);
}

/* Warning variant */
.alert-message.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}

.alert-message.warning .alert-icon {
  color: #ffc107;
}

.alert-message.warning .alert-close:hover {
  background: rgba(255, 193, 7, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
