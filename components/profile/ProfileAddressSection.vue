<template>
  <div class="profile-section">
    <div class="section-header">
      <h2 class="section-title">{{ $t('auth.profile.addresses') }}</h2>
      <button v-if="!isEditing" @click="startAdding" class="edit-btn">
        {{ $t('auth.profile.addAddress') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <UiLoadingSpinner />
      <span>{{ $t('auth.profile.loadingProfile') }}</span>
    </div>

    <!-- Address Form (Add/Edit) -->
    <ProfileAddressForm v-else-if="isEditing" :address="editingAddress" :country-options="countryOptions" :address-type-options="addressTypeOptions" :is-saving="isSaving" @save="handleSave" @cancel="cancelEditing" />

    <!-- Address List -->
    <div v-else-if="addresses.length > 0" class="address-list">
      <ProfileAddressCard v-for="address in addresses" :key="address.id" :address="address" :country-options="countryOptions" @edit="startEditing" @delete="handleDelete" />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <span class="detail-value text-muted">{{ $t('auth.profile.noAddresses') }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  addresses: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['add', 'update', 'delete']);

const { t } = useI18n();

const isEditing = ref(false);
const editingAddress = ref(null);

// Country options
const countryOptions = computed(() => [
  { value: 'netherlands', label: t('payment.form.countries.netherlands') },
  { value: 'belgium', label: t('payment.form.countries.belgium') },
  { value: 'germany', label: t('payment.form.countries.germany') },
  { value: 'france', label: t('payment.form.countries.france') },
  { value: 'uk', label: t('payment.form.countries.uk') },
  { value: 'other', label: t('payment.form.countries.other') },
]);

// Address type options
const addressTypeOptions = computed(() => [
  { value: 'billing', label: t('auth.profile.addressType.billing') },
  { value: 'shipping', label: t('auth.profile.addressType.shipping') },
  { value: 'both', label: t('auth.profile.addressType.both') },
]);

const startAdding = () => {
  editingAddress.value = null;
  isEditing.value = true;
};

const startEditing = (address) => {
  editingAddress.value = address;
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  editingAddress.value = null;
};

const handleSave = (addressData) => {
  if (addressData.id) {
    emit('update', addressData.id, addressData);
  } else {
    emit('add', addressData);
  }
};

const handleDelete = (address) => {
  emit('delete', address);
};

// Expose method to close form after successful save
defineExpose({
  closeForm: () => {
    isEditing.value = false;
    editingAddress.value = null;
  },
});
</script>

<style scoped>
.profile-section {
  margin: 0.5rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-title {
  font-family: var(--font-primary);
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  font-weight: 600;
}

.edit-btn {
  padding: 0.4rem 1rem;
  background: transparent;
  border: 1px solid var(--color-gold);
  color: var(--color-gold);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: var(--color-gold);
  color: white;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 1rem 0;
}

.detail-value.text-muted {
  color: var(--color-text-light);
  font-style: italic;
  font-family: var(--font-body);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 0;
  color: var(--color-text-light);
  font-family: var(--font-body);
}

@media (max-width: 480px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
