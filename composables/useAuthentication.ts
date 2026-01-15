import { useToast } from '~/composables/useToast';
import { sendPasswordResetEmail, sendWelcomeVerificationEmail, sendResendVerificationEmail, type EmailLocale } from '~/logic/email';

const API_BASE = 'https://sundrops-api-345f2765b0ea.herokuapp.com/api/auth';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  success: boolean;
  data: any;
  token: string;
  message?: string;
}

export interface VerificationTokenResponse {
  data: {
    email_verification_token: string;
  };
}

export interface PasswordResetTokenResponse {
  data: {
    password_reset_token: string;
  };
}

type AuthErrorHandler = (message: string) => void;

export const useAuthentication = () => {
  const config = useRuntimeConfig();
  const { t, locale } = useI18n();
  const { success: toastSuccess, error: toastError } = useToast();
  const emailLocale = computed(() => (locale.value === 'nl' ? 'nl' : 'en') as EmailLocale);

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
   * Login with email and password
   * Admin users are not allowed to login as customers
   */
  const login = async (data: LoginData, setError?: AuthErrorHandler): Promise<{ success: boolean; data?: any; token?: string; showResendVerification?: boolean }> => {
    try {
      const response = await $fetch<LoginResponse>(`${API_BASE}/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: {
          identifier: data.email,
          password: data.password,
        },
      });

      if (response.success && response.data) {
        // Check if user has admin role - admins cannot login as customers
        if (hasAdminRole(response.data)) {
          const errorMessage = t('auth.login.adminNotAllowed');
          setError?.(errorMessage);
          toastError(errorMessage);
          return { success: false };
        }

        toastSuccess(t('auth.login.success'));
        return { success: true, data: response.data, token: response.token };
      } else {
        throw new Error(response.message || 'Invalid response');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const statusCode = error?.response?.status || error?.data?.statusCode || error?.statusCode;

      if (statusCode === 403) {
        const errorMessage = t('auth.login.notVerified');
        setError?.(errorMessage);
        toastError(errorMessage);
        return { success: false, showResendVerification: true };
      } else {
        const errorMessage = t('auth.login.error');
        setError?.(errorMessage);
        toastError(errorMessage);
        return { success: false };
      }
    }
  };

  /**
   * Register a new user
   */
  const register = async (data: RegisterData, setError?: AuthErrorHandler): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await $fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: {
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          status: 'active',
        },
      });

      // Get verification token and send verification email
      try {
        const tokenResponse = await getVerificationToken(data.email);
        if (tokenResponse?.email_verification_token) {
          await sendWelcomeVerificationEmail(data.email, `${data.firstName} ${data.lastName}`, tokenResponse.email_verification_token, config.public.strapiUrl, emailLocale.value);
        }
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue even if email sending fails - user can resend from verify page
      }

      toastSuccess(t('auth.register.success'));
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error?.data?.message || t('auth.register.error');
      setError?.(errorMessage);
      toastError(errorMessage);
      return { success: false };
    }
  };

  /**
   * Request a password reset token and send reset email
   */
  const requestPasswordReset = async (email: string, setError?: AuthErrorHandler): Promise<{ success: boolean }> => {
    try {
      const tokenResponse = await $fetch<PasswordResetTokenResponse>(`${API_BASE}/password-reset-token`, {
        method: 'POST',
        body: { email },
        headers: getHeaders(),
      });

      if (tokenResponse?.data?.password_reset_token) {
        await sendPasswordResetEmail(email, tokenResponse.data.password_reset_token, config.public.strapiUrl, emailLocale.value);
      }

      toastSuccess(t('auth.forgotPassword.success'));
      return { success: true };
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      const statusCode = error?.response?.status || error?.data?.statusCode || error?.statusCode;

      if (statusCode === 404) {
        const errorMessage = t('auth.forgotPassword.userNotFound');
        setError?.(errorMessage);
        toastError(errorMessage);
        return { success: false };
      }

      // For other errors, still show success to prevent email enumeration
      toastSuccess(t('auth.forgotPassword.success'));
      return { success: true };
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (token: string, newPassword: string, setError?: AuthErrorHandler): Promise<{ success: boolean }> => {
    try {
      await $fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: {
          token,
          new_password: newPassword,
        },
      });

      toastSuccess(t('auth.resetPassword.success'));
      return { success: true };
    } catch (error: any) {
      console.error('Password reset failed:', error);
      const statusCode = error?.response?.status || error?.data?.statusCode || error?.statusCode;

      let errorMessage: string;
      if (statusCode === 410 || statusCode === 400) {
        errorMessage = t('auth.resetPassword.tokenExpired');
      } else {
        errorMessage = error?.data?.message || t('auth.resetPassword.error');
      }

      setError?.(errorMessage);
      toastError(errorMessage);
      return { success: false };
    }
  };

  /**
   * Verify email with token
   */
  const verifyEmail = async (token: string): Promise<{ success: boolean; status: 'success' | 'invalid' | 'expired' | 'error'; message?: string }> => {
    if (!token) {
      return { success: false, status: 'invalid' };
    }

    try {
      const response = await $fetch<{ message?: string }>(`${API_BASE}/verify-email`, {
        method: 'POST',
        headers: getHeaders(),
        body: { token },
      });

      return { success: true, status: 'success', message: response?.message };
    } catch (error: any) {
      console.error('Email verification failed:', error);
      const statusCode = error?.response?.status || error?.data?.statusCode || 500;
      const message = error?.data?.message || '';

      if (statusCode === 400) {
        return { success: false, status: 'invalid', message };
      } else if (statusCode === 410) {
        return { success: false, status: 'expired', message };
      } else {
        return { success: false, status: 'error', message };
      }
    }
  };

  /**
   * Get verification token for an email
   */
  const getVerificationToken = async (email: string): Promise<{ email_verification_token: string } | null> => {
    try {
      const response = await $fetch<VerificationTokenResponse>(`${API_BASE}/verification-token/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      return response?.data || null;
    } catch (error: any) {
      console.error('Failed to get verification token:', error);
      throw error;
    }
  };

  /**
   * Resend verification email
   */
  const resendVerificationEmail = async (email: string, setError?: AuthErrorHandler, setSuccess?: (message: string) => void): Promise<{ success: boolean; alreadyVerified?: boolean }> => {
    try {
      const tokenData = await getVerificationToken(email);

      if (!tokenData?.email_verification_token) {
        throw new Error('Failed to get verification token');
      }

      await sendResendVerificationEmail(email, tokenData.email_verification_token, config.public.strapiUrl, emailLocale.value);

      const successMessage = t('auth.verify.resendSuccess');
      setSuccess?.(successMessage);
      toastSuccess(successMessage);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to resend verification email:', error);
      const statusCode = error?.response?.status || error?.data?.statusCode || error?.statusCode;

      if (statusCode === 409) {
        const message = t('auth.verify.alreadyVerified');
        setSuccess?.(message);
        toastSuccess(message);
        return { success: true, alreadyVerified: true };
      } else {
        const errorMessage = error?.data?.message || t('auth.verify.resendError');
        setError?.(errorMessage);
        toastError(errorMessage);
        return { success: false };
      }
    }
  };

  return {
    login,
    register,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    getVerificationToken,
    resendVerificationEmail,
  };
};
