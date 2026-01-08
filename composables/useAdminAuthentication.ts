import { useToast } from '~/composables/useToast';

const API_BASE = 'https://sundrops-api-345f2765b0ea.herokuapp.com/api/auth';

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  data: any;
  token: string;
  message?: string;
}

type AuthErrorHandler = (message: string) => void;

export const useAdminAuthentication = () => {
  const config = useRuntimeConfig();
  const { t } = useI18n();
  const { success: toastSuccess, error: toastError } = useToast();

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-API-Key': config.public.authApiKey,
  });

  /**
   * Check if user has admin role
   */
  const hasAdminRole = (userData: any): boolean => {
    if (!userData?.user_roles || !Array.isArray(userData.user_roles)) {
      return false;
    }
    return userData.user_roles.some((role: any) => role.roles?.name?.toLowerCase() === 'admin');
  };

  /**
   * Admin login with email and password
   * Only allows users with admin role to login
   */
  const adminLogin = async (data: AdminLoginData, setError?: AuthErrorHandler): Promise<{ success: boolean; data?: any; token?: string }> => {
    try {
      const response = await $fetch<AdminLoginResponse>(`${API_BASE}/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: {
          identifier: data.email,
          password: data.password,
        },
      });

      if (response.success && response.data) {
        // Check if user has admin role
        if (!hasAdminRole(response.data)) {
          const errorMessage = t('admin.login.noAdminAccess');
          setError?.(errorMessage);
          toastError(errorMessage);
          return { success: false };
        }

        toastSuccess(t('admin.login.success'));
        return { success: true, data: response.data, token: response.token };
      } else {
        throw new Error(response.message || 'Invalid response');
      }
    } catch (error: any) {
      console.error('Admin login failed:', error);
      const statusCode = error?.response?.status || error?.data?.statusCode || error?.statusCode;

      if (statusCode === 403) {
        const errorMessage = t('admin.login.notVerified');
        setError?.(errorMessage);
        toastError(errorMessage);
        return { success: false };
      } else {
        const errorMessage = t('admin.login.error');
        setError?.(errorMessage);
        toastError(errorMessage);
        return { success: false };
      }
    }
  };

  return {
    adminLogin,
    hasAdminRole,
  };
};
