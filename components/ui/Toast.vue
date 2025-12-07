<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast" :class="[type]" @click="close">
        <div class="toast-icon">
          <IconCheckCircle v-if="type === 'success'" :size="20" />
          <IconXCircle v-else-if="type === 'error'" :size="20" />
          <IconInfo v-else :size="20" />
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ message }}</p>
        </div>
        <button class="toast-close" @click.stop="close">
          <IconX :size="16" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value),
  },
  duration: {
    type: Number,
    default: 4000,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const close = () => {
  visible.value = false;
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
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  max-width: 400px;
  cursor: pointer;
}

.toast.success {
  border-left: 4px solid #48bb78;
}

.toast.success .toast-icon {
  color: #48bb78;
}

.toast.error {
  border-left: 4px solid #e53e3e;
}

.toast.error .toast-icon {
  color: #e53e3e;
}

.toast.info {
  border-left: 4px solid var(--color-gold);
}

.toast.info .toast-icon {
  color: var(--color-gold);
}

.toast.warning {
  border-left: 4px solid #ed8936;
}

.toast.warning .toast-icon {
  color: #ed8936;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-message {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text);
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.toast-close:hover {
  background: #f0f0f0;
  color: var(--color-text);
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 480px) {
  .toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-width: none;
  }
}
</style>
