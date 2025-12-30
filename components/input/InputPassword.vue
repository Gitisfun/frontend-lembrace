<template>
  <div class="form-group" :class="{ 'has-error': showValidation && error }">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    <div class="input-wrapper">
      <input
        :id="id"
        :value="modelValue"
        :type="showPassword ? 'text' : 'password'"
        class="form-input"
        :class="{ error: showValidation && error, success: showValidation && showSuccess && !error && hasValue }"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        @input="handleInput"
        @blur="handleBlur"
      />
      <button type="button" class="toggle-password-btn" :class="{ 'with-status': showValidation && (error || (showSuccess && hasValue)) }" @click="togglePasswordVisibility" :aria-label="showPassword ? 'Hide password' : 'Show password'">
        <IconEyeOff v-if="showPassword" :size="20" />
        <IconEye v-else :size="20" />
      </button>
      <div v-if="showValidation && error" class="status-icon error-icon">
        <IconError :size="20" />
      </div>
      <div v-else-if="showValidation && showSuccess && !error && hasValue" class="status-icon success-icon">
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
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
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
  forceValidation: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'blur']);

// Track password visibility
const showPassword = ref(false);

// Track if validation should be shown
const touched = ref(false);

// Show validation when touched OR when forced from parent
const showValidation = computed(() => touched.value || props.forceValidation);

const hasValue = computed(() => {
  return props.modelValue && String(props.modelValue).trim().length > 0;
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleInput = (event) => {
  // Hide validation while typing
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

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.875rem 1rem;
  padding-right: 5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
  background: #fff5f5;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.form-input.success {
  border-color: #48bb78;
}

.form-input.success:focus {
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
}

.form-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.toggle-password-btn {
  position: absolute;
  right: 2.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.toggle-password-btn:hover {
  color: var(--color-text);
}

.toggle-password-btn:focus {
  outline: none;
  color: var(--color-gold);
}

.toggle-password-btn.with-status {
  right: 2.75rem;
}

.toggle-password-btn:not(.with-status) {
  right: 1rem;
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
