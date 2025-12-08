import { validators } from '~/composables/useFormValidation';

export interface PaymentFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Delivery Address
  street: string;
  houseNumber: string;
  boxNumber: string;
  postalCode: string;
  city: string;
  country: string;

  // Delivery Method
  deliveryMethod: string;
}

export const paymentFormSchema = {
  firstName: {
    rules: [validators.name()],
  },
  lastName: {
    rules: [validators.name()],
  },
  email: {
    rules: [validators.email()],
  },
  phone: {
    rules: [validators.phone()],
  },
  street: {
    rules: [validators.required('street address')],
  },
  houseNumber: {
    rules: [validators.required('house number')],
  },
  postalCode: {
    rules: [validators.required('postal code')],
  },
  city: {
    rules: [validators.required('city')],
  },
  country: {
    rules: [validators.required('country')],
  },
};

export const createPaymentFormData = (): PaymentFormData => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  houseNumber: '',
  boxNumber: '',
  postalCode: '',
  city: '',
  country: '',
  deliveryMethod: 'standard',
});
