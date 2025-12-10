<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <span class="avatar-initials">{{ authStore.userInitials }}</span>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ authStore.userFullName }}</h1>
          <p class="profile-email">{{ authStore.currentUser?.email }}</p>
          <span class="profile-status" :class="authStore.currentUser?.status">
            {{ authStore.currentUser?.status }}
          </span>
        </div>
      </div>

      <UiDivider />

      <!-- Profile Details (Read-only) -->
      <div class="profile-section">
        <h2 class="section-title">{{ $t('auth.profile.details') }}</h2>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">{{ $t('auth.form.firstName') }}</span>
            <span class="detail-value">{{ authStore.currentUser?.first_name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('auth.form.lastName') }}</span>
            <span class="detail-value">{{ authStore.currentUser?.last_name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('auth.form.email') }}</span>
            <span class="detail-value">{{ authStore.currentUser?.email }}</span>
          </div>
        </div>
      </div>

      <UiDivider />

      <!-- Contact Information (Editable) -->
      <div class="profile-section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('auth.profile.contact') }}</h2>
          <button v-if="!isEditingContact" @click="startEditingContact" class="edit-btn">
            {{ $t('auth.profile.edit') }}
          </button>
        </div>

        <div v-if="isEditingContact" class="edit-form">
          <InputField id="phone" v-model="contactForm.phone" :label="$t('payment.form.phone')" type="tel" :placeholder="$t('auth.profile.phonePlaceholder')" />
          <div class="form-actions">
            <button @click="cancelEditingContact" class="cancel-btn" :disabled="isSavingContact">{{ $t('auth.profile.cancel') }}</button>
            <button @click="saveContact" class="save-btn" :disabled="isSavingContact">
              {{ isSavingContact ? $t('auth.profile.saving') : $t('auth.profile.save') }}
            </button>
          </div>
        </div>

        <div v-else class="details-grid">
          <div class="detail-item full-width">
            <span class="detail-label">{{ $t('payment.form.phone') }}</span>
            <span class="detail-value">{{ authStore.userPhone || $t('auth.profile.notProvided') }}</span>
          </div>
        </div>
      </div>

      <UiDivider />

      <!-- Addresses (Multiple, Editable) -->
      <div class="profile-section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('auth.profile.addresses') }}</h2>
          <button @click="startAddingAddress" class="edit-btn">
            {{ $t('auth.profile.addAddress') }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingProfile" class="loading-state">
          <UiLoadingSpinner />
          <span>{{ $t('auth.profile.loadingProfile') }}</span>
        </div>

        <!-- Address Form (Add/Edit) -->
        <div v-else-if="isEditingAddress" class="edit-form address-form">
          <h3 class="form-subtitle">{{ editingAddressId ? $t('auth.profile.editAddress') : $t('auth.profile.addAddress') }}</h3>

          <div class="form-row">
            <InputField id="street" v-model="addressForm.street" :label="$t('payment.form.street')" type="text" required />
            <div class="form-row-small">
              <InputField id="house" v-model="addressForm.house" :label="$t('payment.form.houseNumber')" type="text" required />
              <InputField id="box" v-model="addressForm.box" :label="$t('payment.form.boxNumberOptional')" type="text" />
            </div>
          </div>
          <div class="form-row">
            <InputField id="postalcode" v-model="addressForm.postalcode" :label="$t('payment.form.postalCode')" type="text" required />
            <InputField id="city" v-model="addressForm.city" :label="$t('payment.form.city')" type="text" required />
          </div>
          <InputSelect id="country" v-model="addressForm.country" :label="$t('payment.form.country')" :options="countryOptions" :placeholder="$t('payment.form.selectCountry')" required />
          <InputSelect id="type" v-model="addressForm.type" :label="$t('auth.profile.addressType.label')" :options="addressTypeOptions" required />

          <div class="form-actions">
            <button @click="cancelEditingAddress" class="cancel-btn" :disabled="isSavingAddress">{{ $t('auth.profile.cancel') }}</button>
            <button @click="saveAddress" class="save-btn" :disabled="isSavingAddress">
              {{ isSavingAddress ? $t('auth.profile.saving') : $t('auth.profile.save') }}
            </button>
          </div>
        </div>

        <!-- Address List -->
        <div v-else-if="authStore.userAddresses?.length > 0" class="address-list">
          <div v-for="address in authStore.userAddresses || []" :key="address.id" class="address-card">
            <div class="address-content">
              <p class="address-line">
                {{ address.street }} {{ address.house }}<span v-if="address.box">, {{ address.box }}</span>
              </p>
              <p class="address-line">{{ address.postalcode }} {{ address.city }}</p>
              <p class="address-line">{{ getCountryLabel(address.country) }}</p>
            </div>
            <div class="address-actions">
              <button @click="startEditingAddress(address)" class="edit-btn-small">{{ $t('auth.profile.edit') }}</button>
              <button @click="confirmDeleteAddress(address)" class="delete-btn-small">{{ $t('auth.profile.deleteAddress') }}</button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <span class="detail-value text-muted">{{ $t('auth.profile.noAddresses') }}</span>
        </div>
      </div>

      <UiDivider />

      <!-- Quick Links -->
      <div class="profile-section">
        <h2 class="section-title">{{ $t('auth.profile.quickLinks') }}</h2>
        <div class="quick-links">
          <NuxtLink :to="localePath('/orders')" class="quick-link">
            <IconPackage :size="20" />
            <span>{{ $t('auth.profile.viewOrders') }}</span>
          </NuxtLink>
          <NuxtLink :to="localePath('/favorites')" class="quick-link">
            <IconHeart :size="20" />
            <span>{{ $t('auth.profile.viewFavorites') }}</span>
          </NuxtLink>
          <NuxtLink :to="localePath('/cart')" class="quick-link">
            <IconCart :size="20" />
            <span>{{ $t('auth.profile.viewCart') }}</span>
          </NuxtLink>
          <NuxtLink :to="localePath('/products')" class="quick-link">
            <span>{{ $t('auth.profile.browseProducts') }}</span>
          </NuxtLink>
        </div>
      </div>

      <UiDivider />

      <!-- Logout -->
      <div class="profile-actions">
        <button @click="handleLogout" class="logout-btn">
          {{ $t('auth.profile.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import { useUserProfile } from '~/composables/useUserProfile';

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const { success: toastSuccess, error: toastError } = useToast();
const { isLoading: isLoadingProfile, fetchUserProfile, createAddress, updateAddress: apiUpdateAddress, deleteAddress: apiDeleteAddress, upsertContact } = useUserProfile();

// SEO Meta
useSeoMeta({
  title: () => t('seo.profile.title'),
  description: () => t('seo.profile.description'),
  robots: 'noindex, nofollow',
});

// Redirect if not logged in
if (!authStore.isAuthenticated) {
  navigateTo(localePath('/login'));
}

// Edit states
const isEditingContact = ref(false);
const isEditingAddress = ref(false);
const editingAddressId = ref(null);
const isSavingContact = ref(false);
const isSavingAddress = ref(false);

// Contact form
const contactForm = reactive({
  phone: '',
});

// Address form
const addressForm = reactive({
  street: '',
  house: '',
  box: '',
  postalcode: '',
  city: '',
  country: '',
  type: 'shipping',
});

const resetAddressForm = () => {
  addressForm.street = '';
  addressForm.house = '';
  addressForm.box = '';
  addressForm.postalcode = '';
  addressForm.city = '';
  addressForm.country = '';
  addressForm.type = 'shipping';
};

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

const getCountryLabel = (value) => {
  const country = countryOptions.value.find((c) => c.value === value);
  return country ? country.label : value;
};

// Contact editing
const startEditingContact = () => {
  contactForm.phone = authStore.userPhone || '';
  isEditingContact.value = true;
};

const cancelEditingContact = () => {
  isEditingContact.value = false;
};

const saveContact = async () => {
  isSavingContact.value = true;
  try {
    const result = await upsertContact({ phone: contactForm.phone });
    if (result) {
      toastSuccess(t('auth.profile.contactSaved'));
      isEditingContact.value = false;
    } else {
      toastError(t('common.error'));
    }
  } catch (error) {
    console.error('Failed to save contact:', error);
    toastError(t('common.error'));
  } finally {
    isSavingContact.value = false;
  }
};

// Address editing
const startAddingAddress = () => {
  resetAddressForm();
  editingAddressId.value = null;
  isEditingAddress.value = true;
};

const startEditingAddress = (address) => {
  addressForm.street = address.street || '';
  addressForm.house = address.house || '';
  addressForm.box = address.box || '';
  addressForm.postalcode = address.postalcode || '';
  addressForm.city = address.city || '';
  addressForm.country = address.country || '';
  addressForm.type = address.type || 'shipping';
  editingAddressId.value = address.id;
  isEditingAddress.value = true;
};

const cancelEditingAddress = () => {
  isEditingAddress.value = false;
  editingAddressId.value = null;
  resetAddressForm();
};

const saveAddress = async () => {
  isSavingAddress.value = true;
  try {
    const addressData = {
      street: addressForm.street,
      house: addressForm.house,
      box: addressForm.box,
      postalcode: addressForm.postalcode,
      city: addressForm.city,
      country: addressForm.country,
      type: addressForm.type,
    };

    let result;
    if (editingAddressId.value) {
      result = await apiUpdateAddress(editingAddressId.value, addressData);
    } else {
      result = await createAddress(addressData);
    }

    if (result) {
      toastSuccess(t('auth.profile.addressSaved'));
      isEditingAddress.value = false;
      editingAddressId.value = null;
      resetAddressForm();
    } else {
      toastError(t('common.error'));
    }
  } catch (error) {
    console.error('Failed to save address:', error);
    toastError(t('common.error'));
  } finally {
    isSavingAddress.value = false;
  }
};

const confirmDeleteAddress = async (address) => {
  if (confirm(t('auth.profile.confirmDeleteAddress'))) {
    try {
      const success = await apiDeleteAddress(address.id);
      if (success) {
        toastSuccess(t('auth.profile.addressDeleted'));
      } else {
        toastError(t('common.error'));
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
      toastError(t('common.error'));
    }
  }
};

// Logout
const handleLogout = () => {
  authStore.logout();
  toastSuccess(t('auth.profile.logoutSuccess'));
  navigateTo(localePath('/'));
};

// Load profile data on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await fetchUserProfile();
  }
});
</script>

<style scoped>
.profile-page {
  background: var(--gradient-gold-vertical);
  min-height: calc(100vh - 70px);
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.profile-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: var(--shadow-soft);
  height: fit-content;
  animation: fadeInUp 0.8s ease forwards;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initials {
  font-family: var(--font-primary);
  font-size: 1.75rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-family: var(--font-primary);
  font-size: 1.75rem;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.profile-email {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-light);
  margin-bottom: 0.5rem;
}

.profile-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.profile-status.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.profile-status.inactive {
  background: #ffebee;
  color: #c62828;
}

.profile-status.pending {
  background: #fff3e0;
  color: #ef6c00;
}

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

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-light);
  font-weight: 500;
}

.detail-value {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
}

.detail-value.text-muted {
  color: var(--color-text-light);
  font-style: italic;
}

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

/* Address List Styles */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1.25rem;
  position: relative;
}

.address-content {
  margin-bottom: 1rem;
}

.address-line {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text);
  margin: 0;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn-small,
.delete-btn-small {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn-small {
  background: transparent;
  border: 1px solid var(--color-gold);
  color: var(--color-gold);
}

.edit-btn-small:hover {
  background: var(--color-gold);
  color: white;
}

.delete-btn-small {
  background: transparent;
  border: 1px solid #e53e3e;
  color: #e53e3e;
}

.delete-btn-small:hover {
  background: #e53e3e;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 1rem 0;
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

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #f8f8f8;
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text);
  font-family: var(--font-body);
  font-weight: 500;
  transition: all 0.3s ease;
}

.quick-link:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.profile-actions {
  margin-top: 0.5rem;
}

.logout-btn {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 2px solid #e53e3e;
  color: #e53e3e;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #e53e3e;
  color: white;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-row-small {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 1rem 0.5rem;
  }

  .profile-container {
    padding: 1.5rem 1rem;
  }

  .profile-avatar {
    width: 70px;
    height: 70px;
  }

  .avatar-initials {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }

  .address-actions {
    flex-direction: column;
  }

  .edit-btn-small,
  .delete-btn-small {
    width: 100%;
    text-align: center;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
