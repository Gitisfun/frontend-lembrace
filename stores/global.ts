import { defineStore } from 'pinia';

interface ImageFormat {
  url: string;
  width?: number;
  height?: number;
}

interface StrapiImage {
  url: string;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
}

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  discount: number;
  amount: number;
  calculatedPrice: number;
  image: string;
}

interface Product {
  id: string | number;
  documentId?: string | number;
  name: string;
  price: number;
  discount?: number;
  amount?: number;
  image: StrapiImage[] | StrapiImage | string;
}

// Helper to extract image URL from various formats
const extractImageUrl = (image: StrapiImage[] | StrapiImage | string): string => {
  if (typeof image === 'string') {
    return image;
  }

  if (Array.isArray(image)) {
    if (image.length === 0) return '';
    const firstImage = image[0];
    return firstImage.formats?.thumbnail?.url || firstImage.formats?.small?.url || firstImage.url || '';
  }

  if (image && typeof image === 'object') {
    return image.formats?.thumbnail?.url || image.formats?.small?.url || image.url || '';
  }

  return '';
};

// Helper to calculate price with discount
const calculatePrice = (price: number, discount: number, amount: number): number => {
  return Math.round((price - price * (discount / 100)) * amount * 100) / 100;
};

export const useGlobalStore = defineStore('global', {
  state: () => ({
    cart: [] as CartItem[],
    favorites: [] as string[],
  }),

  getters: {
    cartItems: (state) => state.cart,
    cartTotal: (state) => state.cart.reduce((total, item) => total + item.calculatedPrice, 0),
    cartItemCount: (state) => state.cart.reduce((count, item) => count + item.amount, 0),
    favoriteItems: (state) => state.favorites,
    isFavorite: (state) => (productId: string | number) => state.favorites.includes(String(productId)),
  },

  actions: {
    addToCart(product: Product, amount = 1): boolean {
      const productId = product.documentId || product.id;
      const existingItem = this.cart.find((item) => item.id === productId);

      // Check stock availability
      const currentInCart = existingItem ? existingItem.amount : 0;
      const availableStock = product.amount || 0;

      if (currentInCart + amount > availableStock) {
        const maxCanAdd = availableStock - currentInCart;
        if (maxCanAdd <= 0) {
          return false;
        }
        amount = maxCanAdd;
      }

      if (existingItem) {
        existingItem.amount += amount;
        existingItem.calculatedPrice = calculatePrice(existingItem.price, existingItem.discount, existingItem.amount);
      } else {
        const discount = product.discount || 0;

        this.cart.push({
          id: productId,
          name: product.name,
          price: product.price,
          discount,
          amount,
          calculatedPrice: calculatePrice(product.price, discount, amount),
          image: extractImageUrl(product.image),
        });
      }

      return true;
    },

    removeFromCart(productId: string | number) {
      this.cart = this.cart.filter((item) => item.id !== productId);
    },

    updateQuantity(productId: string | number, amount: number) {
      const item = this.cart.find((item) => item.id === productId);
      if (item) {
        item.amount = amount;
        item.calculatedPrice = calculatePrice(item.price, item.discount, amount);
      }
    },

    clearCart() {
      this.cart = [];
    },

    toggleFavorite(productId: string | number) {
      const productIdString = String(productId);
      const index = this.favorites.indexOf(productIdString);

      if (index > -1) {
        this.favorites.splice(index, 1);
      } else {
        this.favorites.push(productIdString);
      }
    },

    addToFavorites(productId: string | number) {
      const productIdString = String(productId);
      if (!this.favorites.includes(productIdString)) {
        this.favorites.push(productIdString);
      }
    },

    removeFromFavorites(productId: string | number) {
      const productIdString = String(productId);
      this.favorites = this.favorites.filter((id) => id !== productIdString);
    },

    clearFavorites() {
      this.favorites = [];
    },
  },

  persist: {
    storage: process.client ? localStorage : undefined,
  },
});
