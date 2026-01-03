<template>
  <component
    :is="componentType"
    :to="to"
    :href="href"
    :type="isButton ? type : undefined"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-loading">
      <span class="btn-spinner" />
      <span v-if="loadingText">{{ loadingText }}</span>
    </span>
    <template v-else>
      <span v-if="iconLeft" class="btn-icon btn-icon-left">{{ iconLeft }}</span>
      <slot>{{ text }}</slot>
      <span v-if="iconRight" class="btn-icon btn-icon-right">{{ iconRight }}</span>
      <span v-if="arrow" class="btn-arrow">→</span>
    </template>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Content
  text: {
    type: String,
    default: '',
  },
  loadingText: {
    type: String,
    default: '',
  },
  iconLeft: {
    type: String,
    default: '',
  },
  iconRight: {
    type: String,
    default: '',
  },
  arrow: {
    type: Boolean,
    default: false,
  },

  // Variants
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'outline', 'outline-gold', 'ghost'].includes(value),
  },

  // Size
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },

  // States
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },

  // Link props
  to: {
    type: [String, Object],
    default: null,
  },
  href: {
    type: String,
    default: null,
  },

  // Button type
  type: {
    type: String,
    default: 'button',
  },
});

const emit = defineEmits(['click']);

const isButton = computed(() => !props.to && !props.href);

const componentType = computed(() => {
  if (props.to) return resolveComponent('NuxtLink');
  if (props.href) return 'a';
  return 'button';
});

const buttonClasses = computed(() => [
  'ui-btn',
  `ui-btn--${props.variant}`,
  `ui-btn--${props.size}`,
  {
    'ui-btn--full-width': props.fullWidth,
    'ui-btn--loading': props.loading,
    'ui-btn--disabled': props.disabled,
    'ui-btn--with-arrow': props.arrow,
  },
]);

const handleClick = (event) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit('click', event);
};
</script>

<style scoped>
/* Base Button Styles */
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-family: var(--font-body);
  font-weight: 500;
  letter-spacing: 0.3px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.ui-btn:focus {
  outline: none;
}

.ui-btn:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

/* Sizes */
.ui-btn--sm {
  padding: 0.6rem 1.25rem;
  font-size: 0.85rem;
}

.ui-btn--md {
  padding: 0.85rem 1.5rem;
  font-size: 0.95rem;
}

.ui-btn--lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

/* Full Width */
.ui-btn--full-width {
  width: 100%;
}

/* Primary Variant (Gold) */
.ui-btn--primary {
  background: var(--color-gold);
  color: white;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.25);
}

.ui-btn--primary:hover:not(:disabled) {
  background: #c9a227;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.35);
}

.ui-btn--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.25);
}

/* Secondary Variant (Dark) */
.ui-btn--secondary {
  background: #1f2937;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.ui-btn--secondary:hover:not(:disabled) {
  background: #374151;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

.ui-btn--secondary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* Danger Variant (Red outline) */
.ui-btn--danger {
  background: transparent;
  color: #b91c1c;
  border: 1.5px solid #e5e5e5;
}

.ui-btn--danger:hover:not(:disabled) {
  border-color: #b91c1c;
  background: #fef2f2;
}

.ui-btn--danger:active:not(:disabled) {
  background: #fee2e2;
}

/* Outline Variant (Gray border) */
.ui-btn--outline {
  background: transparent;
  color: var(--color-text);
  border: 1.5px solid #e5e5e5;
}

.ui-btn--outline:hover:not(:disabled) {
  border-color: var(--color-text);
  background: #f5f5f5;
}

.ui-btn--outline:active:not(:disabled) {
  background: #ebebeb;
}

/* Outline Gold Variant */
.ui-btn--outline-gold {
  background: transparent;
  color: var(--color-gold);
  border: 1.5px solid var(--color-gold);
}

.ui-btn--outline-gold:hover:not(:disabled) {
  background: var(--color-gold);
  color: white;
}

.ui-btn--outline-gold:active:not(:disabled) {
  background: #c9a227;
  color: white;
}

/* Ghost Variant */
.ui-btn--ghost {
  background: transparent;
  color: var(--color-text);
  border: none;
}

.ui-btn--ghost:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.ui-btn--ghost:active:not(:disabled) {
  background: rgba(0, 0, 0, 0.08);
}

/* Arrow */
.ui-btn--with-arrow .btn-arrow {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.ui-btn--with-arrow:hover:not(:disabled) .btn-arrow {
  transform: translateX(3px);
}

/* Icons */
.btn-icon {
  font-size: 1.1em;
}

.btn-icon-left {
  margin-right: 0.25rem;
}

.btn-icon-right {
  margin-left: 0.25rem;
}

/* Loading State */
.ui-btn--loading {
  pointer-events: none;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Disabled State */
.ui-btn--disabled,
.ui-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .ui-btn--sm {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .ui-btn--md {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }

  .ui-btn--lg {
    padding: 0.85rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>

