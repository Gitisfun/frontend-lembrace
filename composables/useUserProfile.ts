import { ref } from 'vue';
import { useAuthStore, type UserAddress, type UserContact } from '~/stores/auth';
import { useAuthGuard } from '~/composables/useAuthGuard';

export const useUserProfile = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const { isAuthError, handleAuthError } = useAuthGuard();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'X-API-Key': config.public.authApiKey,
    ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
  });

  const getUserId = () => {
    if (!authStore.currentUser?.id) {
      throw new Error('User not authenticated');
    }
    return authStore.currentUser.id;
  };

  const API_BASE = 'https://sundrops-api-345f2765b0ea.herokuapp.com';

  // ============ ADDRESS API CALLS ============

  const fetchAddresses = async (): Promise<UserAddress[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId();
      const response = await $fetch<{ success: boolean; data: UserAddress[] }>(`${API_BASE}/api/users/${userId}/addresses`, {
        method: 'GET',
        headers: getApiHeaders(),
      });

      if (response.success && response.data) {
        authStore.setAddresses(response.data);
        return response.data;
      }
      return [];
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError();
        return [];
      }
      console.error('Failed to fetch addresses:', err);
      error.value = 'Failed to load addresses';
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const createAddress = async (address: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<UserAddress | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId();
      const response = await $fetch<{ success: boolean; data: UserAddress }>(`${API_BASE}/api/users/${userId}/addresses`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: address,
      });

      if (response.success && response.data) {
        authStore.addAddress(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError();
        return null;
      }
      console.error('Failed to create address:', err);
      error.value = 'Failed to create address';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updateAddress = async (addressId: string, address: Partial<UserAddress>): Promise<UserAddress | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId();
      const response = await $fetch<{ success: boolean; data: UserAddress }>(`${API_BASE}/api/users/${userId}/addresses/${addressId}`, {
        method: 'PATCH',
        headers: getApiHeaders(),
        body: address,
      });

      if (response.success && response.data) {
        authStore.updateAddressInStore(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError();
        return null;
      }
      console.error('Failed to update address:', err);
      error.value = 'Failed to update address';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId();
      await $fetch(`${API_BASE}/api/users/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      });

      authStore.removeAddress(addressId);
      return true;
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError();
        return false;
      }
      console.error('Failed to delete address:', err);
      error.value = 'Failed to delete address';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ============ CONTACT API CALLS ============

  const fetchContact = async (): Promise<UserContact | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId();
      const response = await $fetch<{ success: boolean; data: UserContact }>(`${API_BASE}/api/users/${userId}/contact`, {
        method: 'GET',
        headers: getApiHeaders(),
      });

      if (response.success && response.data) {
        authStore.setContact(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError();
        return null;
      }
      console.error('Failed to fetch contact:', err);
      error.value = 'Failed to load contact info';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const upsertContact = async (contact: { phone: string }): Promise<UserContact | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId();
      const response = await $fetch<{ success: boolean; data: UserContact }>(`${API_BASE}/api/users/${userId}/contact`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: contact,
      });

      if (response.success && response.data) {
        authStore.setContact(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError();
        return null;
      }
      console.error('Failed to save contact:', err);
      error.value = 'Failed to save contact info';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // ============ COMBINED FETCH ============

  const fetchUserProfile = async () => {
    await Promise.all([fetchAddresses(), fetchContact()]);
  };

  return {
    isLoading,
    error,
    // Address methods
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    // Contact methods
    fetchContact,
    upsertContact,
    // Combined
    fetchUserProfile,
  };
};
