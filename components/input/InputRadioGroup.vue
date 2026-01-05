<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    <div class="radio-options" :class="{ horizontal: layout === 'horizontal' }">
      <label v-for="option in options" :key="option.value" class="radio-option" :class="{ selected: modelValue === option.value }">
        <input type="radio" :value="option.value" :checked="modelValue === option.value" :required="required" :disabled="disabled" @change="$emit('update:modelValue', option.value)" />
        <div class="option-content">
          <span class="option-title">{{ option.title }}</span>
          <span v-if="option.details" class="option-details">{{ option.details }}</span>
        </div>
        <span v-if="showValue" class="option-price">{{ formatPrice(option.value) }}</span>
      </label>
    </div>
    <div v-if="error" class="error-message">
      <IconError :size="16" class="error-icon-small" />
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { formatPrice } from '~/logic/utils';

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => value.every((item) => 'value' in item && 'title' in item),
  },
  label: {
    type: String,
    default: '',
  },
  showValue: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  layout: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal'].includes(value),
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
}

.required-indicator {
  color: #e53e3e;
  margin-left: 0.25rem;
}

.radio-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-options.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-option:hover:not(:has(input:disabled)) {
  border-color: var(--color-gold);
}

.radio-option.selected {
  border-color: var(--color-gold);
  background: rgba(212, 175, 55, 0.05);
}

.radio-option input[type='radio'] {
  width: 20px;
  height: 20px;
  accent-color: var(--color-gold);
  cursor: pointer;
}

.radio-option input[type='radio']:disabled {
  cursor: not-allowed;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-title {
  font-weight: 500;
}

.option-details {
  font-size: 0.9rem;
  color: #666;
}

.option-price {
  margin-left: auto;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #e53e3e;
}

.error-icon-small {
  flex-shrink: 0;
  color: #e53e3e;
}

.has-error .form-label {
  color: #e53e3e;
}

.has-error .radio-option {
  border-color: #e53e3e;
}
</style>
