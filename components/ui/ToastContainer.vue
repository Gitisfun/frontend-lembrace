<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast-list">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="[toast.type]" @click="removeToast(toast.id)">
          <div class="toast-icon">
            <IconCheckCircle v-if="toast.type === 'success'" :size="20" />
            <IconXCircle v-else-if="toast.type === 'error'" :size="20" />
            <IconInfo v-else :size="20" />
          </div>
          <p class="toast-message">{{ toast.message }}</p>
          <button class="toast-close" @click.stop="removeToast(toast.id)">
            <IconX :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '~/composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 9999;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
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

.toast-message {
  flex: 1;
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
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-move {
  transition: transform 0.3s ease;
}

@media (max-width: 480px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-width: none;
  }
}
</style>
