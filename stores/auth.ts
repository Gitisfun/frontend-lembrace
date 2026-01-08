import { defineStore } from 'pinia';

// Legacy local address format (for backward compatibility)
interface LocalUserAddress {
  street: string;
  houseNumber: string;
  boxNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

// API address format
export interface UserAddress {
  id?: string;
  user_id?: string;
  street: string;
  house: string;
  box: string;
  postalcode: string;
  city: string;
  country: string;
  type: 'billing' | 'shipping' | 'both';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// API contact format
export interface UserContact {
  id?: string;
  user_id?: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// User role format from API
export interface UserRole {
  id: string;
  role_id: string;
  roles: {
    name: string;
  };
}

interface User {
  id: string | number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  status: string;
  phone?: string;
  address?: LocalUserAddress;
  user_roles?: UserRole[];
}

interface AuthState {
  // Customer authentication
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // Admin authentication (separate from customer)
  adminUser: User | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  // Legacy local storage (kept for backward compatibility)
  phone: string;
  address: LocalUserAddress;
  // API-synced data
  addresses: UserAddress[];
  contact: UserContact | null;
}

const defaultAddress: LocalUserAddress = {
  street: '',
  houseNumber: '',
  boxNumber: '',
  postalCode: '',
  city: '',
  country: '',
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    // Customer
    user: null,
    token: null,
    isAuthenticated: false,
    // Admin
    adminUser: null,
    adminToken: null,
    isAdminAuthenticated: false,
    // Legacy
    phone: '',
    address: { ...defaultAddress },
    // API-synced
    addresses: [],
    contact: null,
  }),

  getters: {
    // Customer getters
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
    // Customer role getters
    userRoles: (state) => state.user?.user_roles || [],
    userRoleNames: (state) => (state.user?.user_roles || []).map((r) => r.roles.name.toLowerCase()),
    hasRole: (state) => (roleName: string) => (state.user?.user_roles || []).some((r) => r.roles.name.toLowerCase() === roleName.toLowerCase()),
    // Admin getters
    currentAdminUser: (state) => state.adminUser,
    adminFullName: (state) => {
      if (!state.adminUser) return '';
      return `${state.adminUser.first_name} ${state.adminUser.last_name}`.trim();
    },
    adminInitials: (state) => {
      if (!state.adminUser) return '';
      const first = state.adminUser.first_name?.[0] || '';
      const last = state.adminUser.last_name?.[0] || '';
      return `${first}${last}`.toUpperCase();
    },
    // Legacy getters
    userPhone: (state) => state.contact?.phone || state.phone,
    userAddress: (state) => state.address,
    // API address getters
    userAddresses: (state) => state.addresses || [],
    billingAddresses: (state) => (state.addresses || []).filter((a) => a.type === 'billing' || a.type === 'both'),
    shippingAddresses: (state) => (state.addresses || []).filter((a) => a.type === 'shipping' || a.type === 'both'),
    userContact: (state) => state.contact,
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
      this.addresses = [];
      this.contact = null;
    },

    // Admin authentication actions
    adminLogin(user: User, token: string) {
      this.adminUser = user;
      this.adminToken = token;
      this.isAdminAuthenticated = true;
    },

    adminLogout() {
      this.adminUser = null;
      this.adminToken = null;
      this.isAdminAuthenticated = false;
    },

    updateUser(userData: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userData };
      }
    },

    // Legacy local methods (kept for backward compatibility)
    updatePhone(phone: string) {
      this.phone = phone;
    },

    updateAddress(address: Partial<LocalUserAddress>) {
      this.address = { ...this.address, ...address };
    },

    // API-synced address methods
    setAddresses(addresses: UserAddress[]) {
      this.addresses = addresses || [];
    },

    addAddress(address: UserAddress) {
      if (!this.addresses) {
        this.addresses = [];
      }
      this.addresses.push(address);
    },

    updateAddressInStore(address: UserAddress) {
      if (!this.addresses) {
        this.addresses = [];
        return;
      }
      const index = this.addresses.findIndex((a) => a.id === address.id);
      if (index !== -1) {
        this.addresses[index] = address;
      }
    },

    removeAddress(addressId: string) {
      if (!this.addresses) {
        this.addresses = [];
        return;
      }
      this.addresses = this.addresses.filter((a) => a.id !== addressId);
    },

    // API-synced contact methods
    setContact(contact: UserContact) {
      this.contact = contact;
    },
  },

  persist: {
    storage: process.client ? localStorage : undefined,
  },
});
