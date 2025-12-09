import { defineStore } from 'pinia';

interface UserAddress {
  street: string;
  houseNumber: string;
  boxNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

interface User {
  id: string | number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  status: string;
  phone?: string;
  address?: UserAddress;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  phone: string;
  address: UserAddress;
}

const defaultAddress: UserAddress = {
  street: '',
  houseNumber: '',
  boxNumber: '',
  postalCode: '',
  city: '',
  country: '',
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    phone: '',
    address: { ...defaultAddress },
  }),

  getters: {
    currentUser: (state) => state.user,
    userFullName: (state) => {
      if (!state.user) return '';
      return `${state.user.first_name} ${state.user.last_name}`.trim();
    },
    userInitials: (state) => {
      if (!state.user) return '';
      const first = state.user.first_name?.[0] || '';
      const last = state.user.last_name?.[0] || '';
      return `${first}${last}`.toUpperCase();
    },
    userPhone: (state) => state.phone,
    userAddress: (state) => state.address,
  },

  actions: {
    setUser(user: User) {
      this.user = user;
      this.isAuthenticated = true;
    },

    setToken(token: string) {
      this.token = token;
    },

    login(user: User, token: string) {
      this.user = user;
      this.token = token;
      this.isAuthenticated = true;
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.phone = '';
      this.address = { ...defaultAddress };
    },

    updateUser(userData: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userData };
      }
    },

    updatePhone(phone: string) {
      this.phone = phone;
    },

    updateAddress(address: Partial<UserAddress>) {
      this.address = { ...this.address, ...address };
    },
  },

  persist: {
    storage: process.client ? localStorage : undefined,
  },
});
