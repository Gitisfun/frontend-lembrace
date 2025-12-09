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
          <InputField id="phone" v-model="editForm.phone" :label="$t('payment.form.phone')" type="tel" :placeholder="$t('auth.profile.phonePlaceholder')" />
          <div class="form-actions">
            <button @click="cancelEditingContact" class="cancel-btn">{{ $t('auth.profile.cancel') }}</button>
            <button @click="saveContact" class="save-btn">{{ $t('auth.profile.save') }}</button>
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

      <!-- Address (Editable) -->
      <div class="profile-section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('auth.profile.address') }}</h2>
          <button v-if="!isEditingAddress" @click="startEditingAddress" class="edit-btn">
            {{ $t('auth.profile.edit') }}
          </button>
        </div>

        <div v-if="isEditingAddress" class="edit-form">
          <div class="form-row">
            <InputField id="street" v-model="editForm.address.street" :label="$t('payment.form.street')" type="text" />
            <div class="form-row-small">
              <InputField id="houseNumber" v-model="editForm.address.houseNumber" :label="$t('payment.form.houseNumber')" type="text" />
              <InputField id="boxNumber" v-model="editForm.address.boxNumber" :label="$t('payment.form.boxNumberOptional')" type="text" />
            </div>
          </div>
          <div class="form-row">
            <InputField id="postalCode" v-model="editForm.address.postalCode" :label="$t('payment.form.postalCode')" type="text" />
            <InputField id="city" v-model="editForm.address.city" :label="$t('payment.form.city')" type="text" />
          </div>
          <InputSelect id="country" v-model="editForm.address.country" :label="$t('payment.form.country')" :options="countryOptions" :placeholder="$t('payment.form.selectCountry')" />
          <div class="form-actions">
            <button @click="cancelEditingAddress" class="cancel-btn">{{ $t('auth.profile.cancel') }}</button>
            <button @click="saveAddress" class="save-btn">{{ $t('auth.profile.save') }}</button>
          </div>
        </div>

        <div v-else class="details-grid">
          <div class="detail-item" v-if="hasAddress">
            <span class="detail-label">{{ $t('payment.form.street') }}</span>
            <span class="detail-value">
              {{ authStore.userAddress.street }} {{ authStore.userAddress.houseNumber }}
              <span v-if="authStore.userAddress.boxNumber">, {{ authStore.userAddress.boxNumber }}</span>
            </span>
          </div>
          <div class="detail-item" v-if="hasAddress">
            <span class="detail-label">{{ $t('payment.form.city') }}</span>
            <span class="detail-value">{{ authStore.userAddress.postalCode }} {{ authStore.userAddress.city }}</span>
          </div>
          <div class="detail-item" v-if="authStore.userAddress.country">
            <span class="detail-label">{{ $t('payment.form.country') }}</span>
            <span class="detail-value">{{ getCountryLabel(authStore.userAddress.country) }}</span>
          </div>
          <div class="detail-item full-width" v-if="!hasAddress">
            <span class="detail-value text-muted">{{ $t('auth.profile.noAddress') }}</span>
          </div>
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
import { reactive, ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const { success: toastSuccess } = useToast();

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

// Edit form
const editForm = reactive({
  phone: '',
  address: {
    street: '',
    houseNumber: '',
    boxNumber: '',
    postalCode: '',
    city: '',
    country: '',
  },
});

// Country options
const countryOptions = computed(() => [
  { value: 'netherlands', label: t('payment.form.countries.netherlands') },
  { value: 'belgium', label: t('payment.form.countries.belgium') },
  { value: 'germany', label: t('payment.form.countries.germany') },
  { value: 'france', label: t('payment.form.countries.france') },
  { value: 'uk', label: t('payment.form.countries.uk') },
  { value: 'other', label: t('payment.form.countries.other') },
]);

const getCountryLabel = (value) => {
  const country = countryOptions.value.find((c) => c.value === value);
  return country ? country.label : value;
};

const hasAddress = computed(() => {
  const addr = authStore.userAddress;
  return addr.street || addr.city || addr.postalCode;
});

// Contact editing
const startEditingContact = () => {
  editForm.phone = authStore.userPhone;
  isEditingContact.value = true;
};

const cancelEditingContact = () => {
  isEditingContact.value = false;
};

const saveContact = () => {
  authStore.updatePhone(editForm.phone);
  isEditingContact.value = false;
  toastSuccess(t('auth.profile.saved'));
};

// Address editing
const startEditingAddress = () => {
  editForm.address = { ...authStore.userAddress };
  isEditingAddress.value = true;
};

const cancelEditingAddress = () => {
  isEditingAddress.value = false;
};

const saveAddress = () => {
  authStore.updateAddress(editForm.address);
  isEditingAddress.value = false;
  toastSuccess(t('auth.profile.saved'));
};

// Logout
const handleLogout = () => {
  authStore.logout();
  toastSuccess(t('auth.profile.logoutSuccess'));
  navigateTo(localePath('/'));
};
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

.cancel-btn:hover {
  border-color: #999;
  color: var(--color-text);
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

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
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
