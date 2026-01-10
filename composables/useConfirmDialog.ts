import { ref, readonly } from 'vue';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  icon?: 'trash' | 'alert' | 'info' | 'check' | 'question';
}

interface DialogState {
  isOpen: boolean;
  options: ConfirmDialogOptions;
  resolve: ((value: boolean) => void) | null;
}

const state = ref<DialogState>({
  isOpen: false,
  options: {
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'info',
    icon: 'question',
  },
  resolve: null,
});

export function useConfirmDialog() {
  /**
   * Show confirmation dialog and wait for user response
   * @param options - Dialog configuration options
   * @returns Promise that resolves to true (confirmed) or false (cancelled)
   */
  const confirm = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        options: {
          title: options.title || '',
          message: options.message,
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          variant: options.variant || 'info',
          icon: options.icon || 'question',
        },
        resolve,
      };
    });
  };

  /**
   * Close the dialog and resolve with the given value
   */
  const close = (confirmed: boolean) => {
    if (state.value.resolve) {
      state.value.resolve(confirmed);
    }
    state.value.isOpen = false;
    state.value.resolve = null;
  };

  /**
   * Confirm and close the dialog
   */
  const handleConfirm = () => close(true);

  /**
   * Cancel and close the dialog
   */
  const handleCancel = () => close(false);

  return {
    // State (readonly to prevent external mutations)
    isOpen: readonly(ref(() => state.value.isOpen)),
    options: readonly(ref(() => state.value.options)),

    // Direct state access for the component
    dialogState: state,

    // Methods
    confirm,
    close,
    handleConfirm,
    handleCancel,
  };
}
