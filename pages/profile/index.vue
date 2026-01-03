<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Profile Header -->
      <ProfileHeader :initials="authStore.userInitials" :full-name="authStore.userFullName" :email="authStore.currentUser?.email || ''" :status="authStore.currentUser?.status" />

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

      <!-- Contact Information -->
      <ProfileContactSection ref="contactSectionRef" :phone="authStore.userPhone" :is-saving="isSavingContact" @save="saveContact" />

      <UiDivider />

      <!-- Addresses -->
      <ProfileAddressSection ref="addressSectionRef" :addresses="authStore.userAddresses || []" :is-loading="isLoadingProfile" :is-saving="isSavingAddress" @add="addAddress" @update="updateAddress" @delete="confirmDeleteAddress" />

      <UiDivider />

      <!-- Quick Links -->
      <ProfileQuickLinks />

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
import { ref, onMounted } from 'vue';
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

// Component refs
const contactSectionRef = ref(null);
const addressSectionRef = ref(null);

// Saving states
const isSavingContact = ref(false);
const isSavingAddress = ref(false);

// Contact handling
const saveContact = async (phone) => {
  isSavingContact.value = true;
  try {
    const result = await upsertContact({ phone });
    if (result) {
      toastSuccess(t('auth.profile.contactSaved'));
      contactSectionRef.value?.closeEditMode();
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

// Address handling
const addAddress = async (addressData) => {
  isSavingAddress.value = true;
  try {
    const result = await createAddress(addressData);
    if (result) {
      toastSuccess(t('auth.profile.addressSaved'));
      addressSectionRef.value?.closeForm();
    } else {
      toastError(t('common.error'));
    }
  } catch (error) {
    console.error('Failed to add address:', error);
    toastError(t('common.error'));
  } finally {
    isSavingAddress.value = false;
  }
};

const updateAddress = async (addressId, addressData) => {
  isSavingAddress.value = true;
  try {
    const result = await apiUpdateAddress(addressId, addressData);
    if (result) {
      toastSuccess(t('auth.profile.addressSaved'));
      addressSectionRef.value?.closeForm();
    } else {
      toastError(t('common.error'));
    }
  } catch (error) {
    console.error('Failed to update address:', error);
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

.profile-section {
  margin: 0.5rem 0;
}

.section-title {
  font-family: var(--font-primary);
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  font-weight: 600;
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

.profile-actions {
  margin-top: 0.5rem;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #b91c1c;
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.logout-btn:hover {
  border-color: #b91c1c;
  background: #fef2f2;
}

.logout-btn:active {
  background: #fee2e2;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 1rem 0.5rem;
  }

  .profile-container {
    padding: 1.5rem 1rem;
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
