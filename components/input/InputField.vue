<template>
  <div class="form-group" :class="{ 'has-error': showValidation && error }">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
      <span v-else-if="showOptional" class="optional-indicator">{{ $t('contact.form.optional') }}</span>
    </label>
    <div class="input-wrapper">
      <textarea
        v-if="type === 'textarea'"
        :id="id"
        :value="modelValue"
        class="form-textarea"
        :class="{ error: showValidation && error, success: showValidation && showSuccess && !error && hasValue }"
        :placeholder="placeholder"
        :rows="rows"
        :required="required"
        :disabled="disabled"
        @input="handleInput"
        @blur="handleBlur"
      />
      <input v-else :id="id" :value="modelValue" :type="type" class="form-input" :class="{ error: showValidation && error, success: showValidation && showSuccess && !error && hasValue }" :placeholder="placeholder" :required="required" :disabled="disabled" @input="handleInput" @blur="handleBlur" />
      <div v-if="showValidation && error" class="status-icon error-icon" :class="{ 'textarea-icon': type === 'textarea' }">
        <IconError :size="20" />
      </div>
      <div v-else-if="showValidation && showSuccess && !error && hasValue" class="status-icon success-icon" :class="{ 'textarea-icon': type === 'textarea' }">
        <IconSuccess :size="20" />
      </div>
    </div>
    <div v-if="showValidation && error" class="error-message">
      <IconError :size="16" class="error-icon-small" />
      {{ error }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
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
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'tel', 'password', 'number', 'textarea'].includes(value),
  },
  placeholder: {
    type: String,
    default: '',
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
  rows: {
    type: [String, Number],
    default: 4,
  },
  forceValidation: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'blur']);

// Track if validation should be shown (hidden while typing, shown after blur or forced)
const touched = ref(false);

// Show validation when touched OR when forced from parent
const showValidation = computed(() => touched.value || props.forceValidation);

const hasValue = computed(() => {
  return props.modelValue && String(props.modelValue).trim().length > 0;
});

const handleInput = (event) => {
  // Hide validation while typing (reset touched state)
  touched.value = false;
  emit('update:modelValue', event.target.value);
};

const handleBlur = () => {
  // Show validation after leaving the field
  touched.value = true;
  emit('blur');
};
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

.input-wrapper {
  position: relative;
}

.form-input,
.form-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.875rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #e53e3e;
  background: #fff5f5;
}

.form-input.error:focus,
.form-textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.form-input.success,
.form-textarea.success {
  border-color: #48bb78;
}

.form-input.success:focus,
.form-textarea.success:focus {
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
}

.form-input:disabled,
.form-textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.status-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.textarea-icon {
  top: 1rem;
  transform: none;
}

.error-icon {
  color: #e53e3e;
}

.success-icon {
  color: #48bb78;
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
}

.has-error .form-label {
  color: #e53e3e;
}
</style>
