import { ref } from 'vue';

export const useApiError = () => {
  const error = ref<string | null>(null);
  const isError = ref(false);

  const handleError = (err: unknown, fallbackMessage = 'An error occurred') => {
    let message: string;

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    } else {
      message = fallbackMessage;
    }

    error.value = message;
    isError.value = true;

    return message;
  };

  const clearError = () => {
    error.value = null;
    isError.value = false;
  };

  return {
    error,
    isError,
    handleError,
    clearError,
  };
};
