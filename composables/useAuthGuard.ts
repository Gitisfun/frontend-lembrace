import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';

export const useAuthGuard = () => {
  const authStore = useAuthStore();
  const router = useRouter();
  const localePath = useLocalePath();
  const { error: toastError } = useToast();
  const { t } = useI18n();

  /**
   * Check if an error is an authentication error (401/403)
   */
  const isAuthError = (error: unknown): boolean => {
    if (!error) return false;

    // Check for fetch error with status
    if (typeof error === 'object' && error !== null) {
      const err = error as { status?: number; statusCode?: number; response?: { status?: number } };
      const status = err.status || err.statusCode || err.response?.status;
      return status === 401 || status === 403;
    }

    return false;
  };

  /**
   * Handle authentication error - logout user and redirect to login
   */
  const handleAuthError = (showMessage = true) => {
    authStore.logout();

    if (showMessage) {
      toastError(t('auth.sessionExpired'));
    }

    // Redirect to login page
    router.push(localePath('/login'));
  };

  /**
   * Wrapper for API calls that handles auth errors automatically
   */
  const withAuthCheck = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    try {
      return await apiCall();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
      }
      throw error;
    }
  };

  /**
   * Check if token appears to be expired (basic JWT check)
   * Returns true if token is missing, invalid, or expired
   */
  const isTokenExpired = (): boolean => {
    const token = authStore.token;

    if (!token) return true;

    try {
      // JWT tokens are base64 encoded with 3 parts: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payloadPart = parts[1];
      if (!payloadPart) return true;

      // Decode the payload (second part)
      const payload = JSON.parse(atob(payloadPart));

      // Check if exp claim exists and is expired
      if (payload.exp) {
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const isExpired = currentTime >= expirationTime;

        return isExpired;
      }

      // If no exp claim, consider it valid (some tokens don't expire)
      return false;
    } catch {
      // If we can't decode the token, consider it invalid
      console.error('Failed to decode token');
      return true;
    }
  };

  /**
   * Validate current session - logout if token is expired
   */
  const validateSession = () => {
    if (authStore.isAuthenticated && isTokenExpired()) {
      console.log('Token expired, logging out user');
      handleAuthError();
      return false;
    }
    return true;
  };

  return {
    isAuthError,
    handleAuthError,
    withAuthCheck,
    isTokenExpired,
    validateSession,
  };
};
