import { ref } from 'vue';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'message';
  duration: number;
  action?: ToastAction;
}

interface ToastOptions {
  duration?: number;
  action?: ToastAction;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

export const useToast = () => {
  const addToast = (message: string, type: Toast['type'] = 'info', options: ToastOptions = {}) => {
    const { duration = 4000, action } = options;
    const id = ++toastId;
    toasts.value.push({ id, message, type, duration, action });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message: string, options?: ToastOptions | number) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    return addToast(message, 'success', opts);
  };

  const error = (message: string, options?: ToastOptions | number) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    return addToast(message, 'error', opts);
  };

  const info = (message: string, options?: ToastOptions | number) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    return addToast(message, 'info', opts);
  };

  const warning = (message: string, options?: ToastOptions | number) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    return addToast(message, 'warning', opts);
  };

  const messageToast = (message: string, options?: ToastOptions | number) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    return addToast(message, 'message', opts);
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    message: messageToast,
  };
};
