<template>
  <div :class="['admin-banner', `admin-banner--${variant}`]">
    <div class="admin-banner-content">
      <slot name="icon">
        <component :is="defaultIcon" v-if="defaultIcon" :size="iconSize" class="admin-banner-icon" />
      </slot>
      <div class="admin-banner-text">
        <span v-if="title" class="admin-banner-title">{{ title }}</span>
        <span v-if="description" class="admin-banner-description">{{ description }}</span>
        <slot name="content" />
      </div>
    </div>
    <div v-if="$slots.actions || buttonText" class="admin-banner-actions">
      <slot name="actions">
        <button v-if="buttonText" class="admin-banner-button" :disabled="buttonDisabled || buttonLoading" @click="$emit('button-click')">
          <span v-if="buttonLoading" class="admin-banner-button-loading"></span>
          <span v-else>{{ buttonText }}</span>
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import IconCheckCircle from '~/components/icon/IconCheckCircle.vue';
import IconAlertTriangle from '~/components/icon/IconAlertTriangle.vue';
import IconXCircle from '~/components/icon/IconXCircle.vue';
import IconMail from '~/components/icon/IconMail.vue';
import IconInfo from '~/components/icon/IconInfo.vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'warning', 'danger', 'message', 'info'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    default: '',
  },
  buttonDisabled: {
    type: Boolean,
    default: false,
  },
  buttonLoading: {
    type: Boolean,
    default: false,
  },
  iconSize: {
    type: Number,
    default: 18,
  },
  showDefaultIcon: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['button-click']);

// Default icons per variant
const defaultIcon = computed(() => {
  if (!props.showDefaultIcon) return null;

  const icons = {
    success: IconCheckCircle,
    warning: IconAlertTriangle,
    danger: IconXCircle,
    message: IconMail,
    info: IconInfo,
  };
  return icons[props.variant];
});
</script>

<style scoped>
/* Base Banner Styles */
.admin-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.admin-banner-content {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.admin-banner-icon {
  flex-shrink: 0;
}

.admin-banner-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.admin-banner-title {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--admin-text);
}

.admin-banner-description {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text-muted);
}

.admin-banner-actions {
  flex-shrink: 0;
}

/* Button Styles */
.admin-banner-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 140px;
}

.admin-banner-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.admin-banner-button-loading {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: banner-spin 0.8s linear infinite;
}

@keyframes banner-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================== */
/* Variant: Success     */
/* ==================== */
.admin-banner--success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(74, 222, 128, 0.12) 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.admin-banner--success .admin-banner-icon {
  color: #22c55e;
}

.admin-banner--success .admin-banner-button {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.admin-banner--success .admin-banner-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* ==================== */
/* Variant: Warning     */
/* ==================== */
.admin-banner--warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(251, 191, 36, 0.12) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.admin-banner--warning .admin-banner-icon {
  color: #f59e0b;
}

.admin-banner--warning .admin-banner-button {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.admin-banner--warning .admin-banner-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* ==================== */
/* Variant: Danger      */
/* ==================== */
.admin-banner--danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(248, 113, 113, 0.12) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.admin-banner--danger .admin-banner-icon {
  color: #ef4444;
}

.admin-banner--danger .admin-banner-button {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.admin-banner--danger .admin-banner-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* ==================== */
/* Variant: Message     */
/* ==================== */
.admin-banner--message {
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.12) 0%, rgba(234, 197, 128, 0.12) 100%);
  border: 1px solid rgba(212, 167, 98, 0.3);
}

.admin-banner--message .admin-banner-icon {
  color: var(--color-gold, #d4a762);
}

.admin-banner--message .admin-banner-button {
  background: linear-gradient(135deg, #d4a762 0%, #c49652 100%);
}

.admin-banner--message .admin-banner-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #c49652 0%, #b08542 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 167, 98, 0.3);
}

/* ==================== */
/* Variant: Info        */
/* ==================== */
.admin-banner--info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(96, 165, 250, 0.12) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.admin-banner--info .admin-banner-icon {
  color: #3b82f6;
}

.admin-banner--info .admin-banner-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.admin-banner--info .admin-banner-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* ==================== */
/* Responsive Styles    */
/* ==================== */
@media (max-width: 768px) {
  .admin-banner {
    flex-direction: column;
    align-items: stretch;
    gap: 0.875rem;
    padding: 1rem;
  }

  .admin-banner-button {
    width: 100%;
  }
}
</style>
