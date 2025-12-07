<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
      <span v-else-if="showOptional" class="optional-indicator">{{ $t('contact.form.optional') }}</span>
    </label>
    <div class="select-wrapper">
      <select :id="id" :value="modelValue" class="form-select" :class="{ error: error, success: showSuccess && !error && modelValue }" :required="required" :disabled="disabled" @change="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')">
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <IconChevronDown :size="16" class="select-icon" />
    </div>
    <div v-if="error" class="error-message">
      <IconError :size="16" class="error-icon-small" />
      {{ error }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => value.every((item) => 'value' in item && 'label' in item),
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
  showSuccess: {
    type: Boolean,
    default: false,
  },
  showOptional: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:modelValue', 'blur']);
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

.optional-indicator {
  font-size: 0.85rem;
  color: #888;
  font-weight: 400;
  margin-left: 0.5rem;
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  box-sizing: border-box;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
  background: white;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-select.error {
  border-color: #e53e3e;
  background: #fff5f5;
}

.form-select.error:focus {
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.form-select.success {
  border-color: #48bb78;
}

.form-select.success:focus {
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
}

.form-select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
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
</style>
