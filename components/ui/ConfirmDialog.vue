<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="dialogState.isOpen" class="confirm-dialog-overlay" @click.self="handleCancel">
        <Transition name="dialog-scale" appear>
          <div class="confirm-dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId">
            <!-- Icon -->
            <div :class="['confirm-dialog-icon', `confirm-dialog-icon--${dialogState.options.variant}`]">
              <component :is="iconComponent" :size="28" />
            </div>

            <!-- Content -->
            <div class="confirm-dialog-content">
              <h3 v-if="dialogState.options.title" :id="titleId" class="confirm-dialog-title">
                {{ dialogState.options.title }}
              </h3>
              <p class="confirm-dialog-message">{{ dialogState.options.message }}</p>
            </div>

            <!-- Actions -->
            <div class="confirm-dialog-actions">
              <button class="confirm-dialog-button confirm-dialog-button--cancel" @click="handleCancel">
                {{ dialogState.options.cancelText }}
              </button>
              <button :class="['confirm-dialog-button', `confirm-dialog-button--${dialogState.options.variant}`]" @click="handleConfirm">
                {{ dialogState.options.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, useId } from 'vue';
import { useConfirmDialog } from '~/composables/useConfirmDialog';
import IconAlertTriangle from '~/components/icon/IconAlertTriangle.vue';
import IconInfo from '~/components/icon/IconInfo.vue';
import IconCheckCircle from '~/components/icon/IconCheckCircle.vue';
import IconXCircle from '~/components/icon/IconXCircle.vue';
import IconAlertCircle from '~/components/icon/IconAlertCircle.vue';

const { dialogState, handleConfirm, handleCancel } = useConfirmDialog();

const titleId = useId();

// Map icon prop to component
const iconComponent = computed(() => {
  const icons = {
    trash: IconXCircle,
    alert: IconAlertTriangle,
    info: IconInfo,
    check: IconCheckCircle,
    question: IconAlertCircle,
  };
  return icons[dialogState.value.options.icon || 'question'];
});

// Close on escape key
const onKeydown = (e) => {
  if (e.key === 'Escape' && dialogState.value.isOpen) {
    handleCancel();
  }
};

// Add/remove keydown listener
onMounted(() => {
  document.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
/* Overlay */
.confirm-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* Dialog */
.confirm-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: var(--admin-surface, #ffffff);
  border: 1px solid var(--admin-border, #e5e7eb);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  text-align: center;
}

/* Icon Container */
.confirm-dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 1.25rem;
}

.confirm-dialog-icon--danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.15) 100%);
  color: #ef4444;
}

.confirm-dialog-icon--warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%);
  color: #f59e0b;
}

.confirm-dialog-icon--info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%);
  color: #3b82f6;
}

.confirm-dialog-icon--success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(74, 222, 128, 0.15) 100%);
  color: #22c55e;
}

/* Content */
.confirm-dialog-content {
  margin-bottom: 1.5rem;
}

.confirm-dialog-title {
  font-family: var(--font-body);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--admin-text, #1f2937);
  margin: 0 0 0.5rem 0;
}

.confirm-dialog-message {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--admin-text-muted, #6b7280);
  margin: 0;
  line-height: 1.5;
}

/* Actions */
.confirm-dialog-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.confirm-dialog-button {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-dialog-button--cancel {
  background: var(--admin-surface-alt, #f3f4f6);
  color: var(--admin-text, #1f2937);
  border: 1px solid var(--admin-border, #e5e7eb);
}

.confirm-dialog-button--cancel:hover {
  background: var(--admin-border, #e5e7eb);
}

/* Variant Buttons */
.confirm-dialog-button--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.confirm-dialog-button--danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.confirm-dialog-button--warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.confirm-dialog-button--warning:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.confirm-dialog-button--info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.confirm-dialog-button--info:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.confirm-dialog-button--success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.confirm-dialog-button--success:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* Transitions */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-scale-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-scale-leave-active {
  transition: all 0.15s ease-in;
}

.dialog-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 480px) {
  .confirm-dialog {
    padding: 1.5rem;
    max-width: calc(100% - 2rem);
  }

  .confirm-dialog-actions {
    flex-direction: column-reverse;
  }

  .confirm-dialog-button {
    width: 100%;
  }
}

/* Dark mode support */
:root.dark .confirm-dialog {
  background: var(--admin-surface, #1f2937);
  border-color: var(--admin-border, #374151);
}

:root.dark .confirm-dialog-overlay {
  background: rgba(0, 0, 0, 0.7);
}
</style>
