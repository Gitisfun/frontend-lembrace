<template>
  <div class="edit-form address-form">
    <h3 class="form-subtitle">{{ isEditing ? $t('auth.profile.editAddress') : $t('auth.profile.addAddress') }}</h3>

    <div class="form-row">
      <InputField id="street" v-model="form.street" :label="$t('payment.form.street')" type="text" required />
      <div class="form-row-small">
        <InputField id="house" v-model="form.house" :label="$t('payment.form.houseNumber')" type="text" required />
        <InputField id="box" v-model="form.box" :label="$t('payment.form.boxNumberOptional')" type="text" />
      </div>
    </div>
    <div class="form-row">
      <InputField id="postalcode" v-model="form.postalcode" :label="$t('payment.form.postalCode')" type="text" required />
      <InputField id="city" v-model="form.city" :label="$t('payment.form.city')" type="text" required />
    </div>
    <InputSelect id="country" v-model="form.country" :label="$t('payment.form.country')" :options="countryOptions" :placeholder="$t('payment.form.selectCountry')" required />
    <InputSelect id="type" v-model="form.type" :label="$t('auth.profile.addressType.label')" :options="addressTypeOptions" required />

    <div class="form-actions">
      <button @click="$emit('cancel')" class="cancel-btn" :disabled="isSaving">{{ $t('auth.profile.cancel') }}</button>
      <button @click="handleSave" class="save-btn" :disabled="isSaving">
        {{ isSaving ? $t('auth.profile.saving') : $t('auth.profile.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue';

const props = defineProps({
  address: {
    type: Object,
    default: null,
  },
  countryOptions: {
    type: Array,
    required: true,
  },
  addressTypeOptions: {
    type: Array,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'cancel']);

const isEditing = computed(() => !!props.address?.id);

const form = reactive({
  street: '',
  house: '',
  box: '',
  postalcode: '',
  city: '',
  country: '',
  type: 'shipping',
});

const resetForm = () => {
  form.street = '';
  form.house = '';
  form.box = '';
  form.postalcode = '';
  form.city = '';
  form.country = '';
  form.type = 'shipping';
};

const populateForm = (address) => {
  if (address) {
    form.street = address.street || '';
    form.house = address.house || '';
    form.box = address.box || '';
    form.postalcode = address.postalcode || '';
    form.city = address.city || '';
    form.country = address.country || '';
    form.type = address.type || 'shipping';
  } else {
    resetForm();
  }
};

// Watch for address changes to populate form
watch(
  () => props.address,
  (newAddress) => {
    populateForm(newAddress);
  },
  { immediate: true }
);

const handleSave = () => {
  emit('save', {
    id: props.address?.id,
    ...form,
  });
};
</script>

<style scoped>
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
}

.form-subtitle {
  font-family: var(--font-primary);
  font-size: 1rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row-small {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.cancel-btn {
  padding: 0.6rem 1.25rem;
  background: transparent;
  border: 1px solid #ccc;
  color: var(--color-text-light);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
  border-color: #999;
  color: var(--color-text);
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn {
  padding: 0.6rem 1.25rem;
  background: var(--gradient-gold);
  border: none;
  color: white;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-row-small {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
