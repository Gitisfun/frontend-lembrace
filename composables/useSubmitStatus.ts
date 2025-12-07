import { ref, computed } from 'vue';

type StatusType = 'success' | 'error' | 'info' | 'warning';

interface SubmitStatus {
  type: StatusType;
  message: string;
}

export const useSubmitStatus = () => {
  const isSubmitting = ref(false);
  const status = ref<SubmitStatus | null>(null);

  const hasStatus = computed(() => status.value !== null);

  const setSuccess = (message: string) => {
    status.value = { type: 'success', message };
  };

  const setError = (message: string) => {
    status.value = { type: 'error', message };
  };

  const setInfo = (message: string) => {
    status.value = { type: 'info', message };
  };

  const setWarning = (message: string) => {
    status.value = { type: 'warning', message };
  };

  const clearStatus = () => {
    status.value = null;
  };

  const startSubmitting = () => {
    isSubmitting.value = true;
    status.value = null;
  };

  const stopSubmitting = () => {
    isSubmitting.value = false;
  };

  // Helper to wrap async submit logic
  const withSubmit = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    startSubmitting();
    try {
      const result = await fn();
      return result;
    } finally {
      stopSubmitting();
    }
  };

  return {
    isSubmitting,
    status,
    hasStatus,
    setSuccess,
    setError,
    setInfo,
    setWarning,
    clearStatus,
    startSubmitting,
    stopSubmitting,
    withSubmit,
  };
};
