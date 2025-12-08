import { validators } from '~/composables/useFormValidation';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const contactFormSchema = {
  name: { rules: [validators.name()] },
  email: { rules: [validators.email()] },
  phone: { rules: [validators.phone()] },
  message: {
    rules: [validators.required('message'), validators.minLength(10, 'Message'), validators.maxLength(1000, 'Message')],
  },
};

export const createContactFormData = (): ContactFormData => ({
  name: '',
  email: '',
  phone: '',
  message: '',
});
