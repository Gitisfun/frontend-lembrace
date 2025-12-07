import { reactive } from 'vue';

type ValidationRule = (value: string) => string;

interface FieldConfig {
  rules: ValidationRule[];
}

export const useFormValidation = <T extends Record<string, string>>(formData: T, fieldConfigs: Partial<Record<keyof T, FieldConfig>>) => {
  const initialErrors: Record<string, string> = {};
  for (const key of Object.keys(formData)) {
    initialErrors[key] = '';
  }
  const errors = reactive(initialErrors);

  const validateField = (fieldName: keyof T): boolean => {
    const key = fieldName as string;
    const value = formData[fieldName]?.trim() ?? '';
    const config = fieldConfigs[fieldName];

    if (!config) {
      errors[key] = '';
      return true;
    }

    for (const rule of config.rules) {
      const error = rule(value);
      if (error) {
        errors[key] = error;
        return false;
      }
    }

    errors[key] = '';
    return true;
  };

  const clearError = (fieldName: keyof T) => {
    errors[fieldName as string] = '';
  };

  const validateAll = (): boolean => {
    let isValid = true;
    for (const fieldName of Object.keys(fieldConfigs)) {
      if (!validateField(fieldName as keyof T)) {
        isValid = false;
      }
    }
    return isValid;
  };

  const resetErrors = () => {
    for (const key of Object.keys(errors)) {
      errors[key] = '';
    }
  };

  return {
    errors,
    validateField,
    clearError,
    validateAll,
    resetErrors,
  };
};

// Pre-built validation rules
export const validators = {
  required:
    (fieldLabel: string): ValidationRule =>
    (value) =>
      value ? '' : `Please enter your ${fieldLabel}`,

  minLength:
    (min: number, fieldLabel: string): ValidationRule =>
    (value) =>
      value.length >= min ? '' : `${fieldLabel} must be at least ${min} characters long`,

  maxLength:
    (max: number, fieldLabel: string): ValidationRule =>
    (value) =>
      value.length <= max ? '' : `${fieldLabel} must be less than ${max} characters`,

  email: (): ValidationRule => (value) => {
    if (!value) return 'Please enter your email address';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address (e.g., user@example.com)';
    }
    if (value.length > 100) return 'Email address is too long';
    return '';
  },

  phone: (): ValidationRule => (value) => {
    if (!value) return ''; // Phone is optional
    if (!/^[\+]?[1-9]\d{7,15}$/.test(value)) {
      return 'Please enter a valid phone number';
    }
    return '';
  },

  name: (): ValidationRule => (value) => {
    if (!value) return 'Please enter your name';
    if (value.length < 2) return 'Name must be at least 2 characters long';
    if (value.length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  },
};
