<template>
  <div class="contact-form">
    <div class="form-grid">
      <InputField
        id="firstName"
        :model-value="firstName"
        :label="$t('payment.form.firstName')"
        type="text"
        required
        :placeholder="$t('payment.form.firstName')"
        :error="errors.firstName"
        :force-validation="forceValidation"
        show-success
        :disabled="disabled"
        @blur="$emit('validate', 'firstName')"
        @update:model-value="$emit('update:firstName', $event)"
      />
      <InputField
        id="lastName"
        :model-value="lastName"
        :label="$t('payment.form.lastName')"
        type="text"
        required
        :placeholder="$t('payment.form.lastName')"
        :error="errors.lastName"
        :force-validation="forceValidation"
        show-success
        :disabled="disabled"
        @blur="$emit('validate', 'lastName')"
        @update:model-value="$emit('update:lastName', $event)"
      />
      <InputField
        id="email"
        :model-value="email"
        :label="$t('payment.form.email')"
        type="email"
        required
        :placeholder="$t('payment.form.email')"
        :error="errors.email"
        :force-validation="forceValidation"
        show-success
        :disabled="disabled"
        @blur="$emit('validate', 'email')"
        @update:model-value="$emit('update:email', $event)"
      />
      <InputField id="phone" :model-value="phone" :label="$t('payment.form.phone')" type="tel" :placeholder="$t('payment.form.phone')" :error="errors.phone" :force-validation="forceValidation" show-success @blur="$emit('validate', 'phone')" @update:model-value="$emit('update:phone', $event)" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  forceValidation: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:firstName', 'update:lastName', 'update:email', 'update:phone', 'validate']);
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
