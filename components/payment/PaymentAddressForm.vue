<template>
  <div class="new-address-form">
    <div class="form-grid">
      <InputField
        :id="`${idPrefix}street`"
        :model-value="street"
        :label="$t('payment.form.street')"
        type="text"
        required
        :placeholder="$t('payment.form.street')"
        :error="errors.street"
        :force-validation="forceValidation"
        show-success
        @blur="$emit('validate', 'street')"
        @update:model-value="$emit('update:street', $event)"
      />
      <InputField
        :id="`${idPrefix}houseNumber`"
        :model-value="houseNumber"
        :label="$t('payment.form.houseNumber')"
        type="text"
        required
        :placeholder="$t('payment.form.houseNumber')"
        :error="errors.houseNumber"
        :force-validation="forceValidation"
        show-success
        @blur="$emit('validate', 'houseNumber')"
        @update:model-value="$emit('update:houseNumber', $event)"
      />
      <InputField :id="`${idPrefix}boxNumber`" :model-value="boxNumber" :label="$t('payment.form.boxNumber')" type="text" show-optional :placeholder="$t('payment.form.boxNumberOptional')" @update:model-value="$emit('update:boxNumber', $event)" />
      <InputField
        :id="`${idPrefix}postalCode`"
        :model-value="postalCode"
        :label="$t('payment.form.postalCode')"
        type="text"
        required
        :placeholder="$t('payment.form.postalCode')"
        :error="errors.postalCode"
        :force-validation="forceValidation"
        show-success
        @blur="$emit('validate', 'postalCode')"
        @update:model-value="$emit('update:postalCode', $event)"
      />
      <InputField
        :id="`${idPrefix}city`"
        :model-value="city"
        :label="$t('payment.form.city')"
        type="text"
        required
        :placeholder="$t('payment.form.city')"
        :error="errors.city"
        :force-validation="forceValidation"
        show-success
        @blur="$emit('validate', 'city')"
        @update:model-value="$emit('update:city', $event)"
      />
      <InputSelect
        :id="`${idPrefix}country`"
        :model-value="country"
        :label="$t('payment.form.country')"
        required
        :placeholder="$t('payment.form.selectCountry')"
        :options="countryOptions"
        :error="errors.country"
        show-success
        @blur="$emit('validate', 'country')"
        @update:model-value="$emit('update:country', $event)"
      />
    </div>

    <!-- Save address checkbox for logged-in users -->
    <div v-if="showSaveOption" class="save-address-option">
      <label class="checkbox-label">
        <input type="checkbox" :checked="saveAddress" @change="$emit('update:saveAddress', $event.target.checked)" />
        <span>{{ $t('payment.saveAddress') }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();

defineProps({
  street: {
    type: String,
    default: '',
  },
  houseNumber: {
    type: String,
    default: '',
  },
  boxNumber: {
    type: String,
    default: '',
  },
  postalCode: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  country: {
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
  showSaveOption: {
    type: Boolean,
    default: false,
  },
  saveAddress: {
    type: Boolean,
    default: false,
  },
  idPrefix: {
    type: String,
    default: '',
  },
});

defineEmits(['update:street', 'update:houseNumber', 'update:boxNumber', 'update:postalCode', 'update:city', 'update:country', 'update:saveAddress', 'validate']);

const countryOptions = computed(() => [
  { value: 'Nederland', label: t('payment.form.countries.netherlands') },
  { value: 'België', label: t('payment.form.countries.belgium') },
  { value: 'Duitsland', label: t('payment.form.countries.germany') },
  { value: 'Frankrijk', label: t('payment.form.countries.france') },
  { value: 'Verenigd Koninkrijk', label: t('payment.form.countries.uk') },
  { value: 'andere', label: t('payment.form.countries.other') },
]);
</script>

<style scoped>
.new-address-form {
  margin-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.save-address-option {
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-gold);
  cursor: pointer;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
