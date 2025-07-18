import { defineStore } from 'pinia';

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
  image: string | any;
}

export const useGlobalStore = defineStore('global', {
  state: () => ({
    cart: [] as CartItem[],
    test: [] as string[],
    favorites: [] as string[],
  }),
  getters: {
    cartItems: (state) => state.cart,
    testItems: (state) => state.test,
    cartTotal: (state) => state.cart.reduce((total, item) => total + item.calculatedPrice, 0),
    cartItemCount: (state) => state.cart.reduce((count, item) => count + item.amount, 0),
    favoriteItems: (state) => state.favorites,
    isFavorite: (state) => (productId: string | number) => state.favorites.includes(String(productId)),
  },
  actions: {
    addToCart(product: Product, amount = 1) {
      console.log('Adding to cart:', product);
      console.log('Product documentId:', product.documentId);
      console.log('Product id:', product.id);

      const existingItem = this.cart.find((item) => item.id === product.documentId);

      if (existingItem) {
        existingItem.amount += amount;
        // Recalculate the calculatedPrice
        existingItem.calculatedPrice = Math.round((existingItem.price - existingItem.price * (existingItem.discount / 100)) * existingItem.amount * 100) / 100;
      } else {
        // Extract the smallest available image
        let imageUrl = '';
        if (product.image && Array.isArray(product.image) && product.image.length > 0) {
          // If it's an array of images, use the first one
          const firstImage = product.image[0];
          imageUrl = firstImage.formats?.thumbnail?.url || firstImage.formats?.small?.url || firstImage.url || '';
        } else if (product.image && typeof product.image === 'object') {
          // If it's a single image object
          imageUrl = product.image.formats?.thumbnail?.url || product.image.formats?.small?.url || product.image.url || '';
        } else if (typeof product.image === 'string') {
          // If it's already a string URL
          imageUrl = product.image;
        }

        console.log('Image URL:', imageUrl);

        const discount = product.discount || 0;
        const calculatedPrice = Math.round((product.price - product.price * (discount / 100)) * amount * 100) / 100;

        this.cart.push({
          id: product.documentId || product.id,
          name: product.name,
          price: product.price,
          discount,
          amount,
          calculatedPrice,
          image: imageUrl,
        });
      }
    },
    removeFromCart(productId: string | number) {
      this.cart = this.cart.filter((item) => item.id !== productId);
    },
    updateQuantity(productId: string | number, amount: number) {
      const item = this.cart.find((item) => item.id === productId);
      if (item) {
        item.amount = amount;
        // Recalculate the calculatedPrice
        item.calculatedPrice = Math.round((item.price - item.price * (item.discount / 100)) * amount * 100) / 100;
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
    addToTest(item: string) {
      this.test.push(item);
    },
    removeFromTest(item: string) {
      this.test = this.test.filter((item) => item !== item);
    },
    clearTest() {
      this.test = [];
    },
  },
  persist: {
    storage: process.client ? localStorage : undefined,
  },
});
