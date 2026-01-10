<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast" :class="[type]">
        <div class="toast-icon-wrapper">
          <IconCheckCircle v-if="type === 'success'" :size="20" />
          <IconXCircle v-else-if="type === 'error'" :size="20" />
          <IconAlertTriangle v-else-if="type === 'warning'" :size="20" />
          <IconMail v-else-if="type === 'message'" :size="20" />
          <IconInfo v-else :size="20" />
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ message }}</p>
        </div>
        <button v-if="actionLabel" class="toast-action" @click.stop="handleAction">
          {{ actionLabel }}
        </button>
        <div v-if="duration > 0" class="toast-progress" :style="{ animationDuration: `${duration}ms` }"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import IconAlertTriangle from '~/components/icon/IconAlertTriangle.vue';
import IconMail from '~/components/icon/IconMail.vue';

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning', 'message'].includes(value),
  },
  duration: {
    type: Number,
    default: 4000,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  actionLabel: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'action']);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const close = () => {
  visible.value = false;
};

const handleAction = () => {
  emit('action');
  close();
};

let timeout;
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && props.duration > 0) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        close();
      }, props.duration);
    }
  }
);

onUnmounted(() => {
  clearTimeout(timeout);
});
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  width: 480px;
  max-width: calc(100vw - 3rem);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.toast-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

/* Success */
.toast.success {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border-color: rgba(34, 197, 94, 0.2);
}

.toast.success .toast-icon-wrapper {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
}

/* Error */
.toast.error {
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  border-color: rgba(239, 68, 68, 0.2);
}

.toast.error .toast-icon-wrapper {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

/* Info - Blue */
.toast.info {
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  border-color: rgba(59, 130, 246, 0.2);
}

.toast.info .toast-icon-wrapper {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

/* Warning */
.toast.warning {
  background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
  border-color: rgba(245, 158, 11, 0.2);
}

.toast.warning .toast-icon-wrapper {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

/* Message - Golden */
.toast.message {
  background: linear-gradient(135deg, #fefce8 0%, #ffffff 100%);
  border-color: rgba(202, 138, 4, 0.25);
}

.toast.message .toast-icon-wrapper {
  background: linear-gradient(135deg, #fef9c3 0%, #fde047 100%);
  color: #b45309;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.5;
  letter-spacing: -0.01em;
  word-wrap: break-word;
}

.toast-action {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toast.success .toast-action {
  color: #16a34a;
  background: rgba(34, 197, 94, 0.1);
}

.toast.success .toast-action:hover {
  background: rgba(34, 197, 94, 0.2);
}

.toast.error .toast-action {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
}

.toast.error .toast-action:hover {
  background: rgba(239, 68, 68, 0.2);
}

.toast.info .toast-action {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.1);
}

.toast.info .toast-action:hover {
  background: rgba(59, 130, 246, 0.2);
}

.toast.warning .toast-action {
  color: #d97706;
  background: rgba(245, 158, 11, 0.1);
}

.toast.warning .toast-action:hover {
  background: rgba(245, 158, 11, 0.2);
}

.toast.message .toast-action {
  color: #b45309;
  background: rgba(202, 138, 4, 0.1);
}

.toast.message .toast-action:hover {
  background: rgba(202, 138, 4, 0.2);
}

/* Progress bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: progress linear forwards;
}

.toast.success .toast-progress {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.toast.error .toast-progress {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.toast.info .toast-progress {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.toast.warning .toast-progress {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.toast.message .toast-progress {
  background: linear-gradient(90deg, #eab308, #ca8a04);
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transitions */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

@media (max-width: 540px) {
  .toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    width: auto;
    max-width: none;
    padding: 0.75rem 1rem;
  }

  .toast-icon-wrapper {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }

  .toast-message {
    font-size: 0.875rem;
  }
}
</style>
