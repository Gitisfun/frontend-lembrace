import { defineStore } from 'pinia';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
}

export const useGlobalStore = defineStore('global', {
  state: () => ({
    cart: [] as CartItem[],
    test: [] as string[],
  }),
  getters: {
    cartItems: (state) => state.cart,
    testItems: (state) => state.test,
    cartTotal: (state) => state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
    cartItemCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
  },
  actions: {
    addToCart(product: Product, quantity = 1) {
      const existingItem = this.cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        });
      }
    },
    removeFromCart(productId: string | number) {
      this.cart = this.cart.filter((item) => item.id !== productId);
    },
    updateQuantity(productId: string | number, quantity: number) {
      const item = this.cart.find((item) => item.id === productId);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart() {
      this.cart = [];
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
  persist: true,
});
