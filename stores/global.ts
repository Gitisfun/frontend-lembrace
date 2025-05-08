import { defineStore } from 'pinia';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedMaterials: string[];
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
  }),
  getters: {
    cartItems: (state) => state.cart,
    cartTotal: (state) => state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
    cartItemCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
  },
  actions: {
    addToCart(product: Product, quantity = 1, selectedMaterials: string[] = []) {
      const existingItem = this.cart.find((item) => item.id === product.id && JSON.stringify(item.selectedMaterials) === JSON.stringify(selectedMaterials));

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          selectedMaterials,
        });
      }
    },
    removeFromCart(productId: string | number, selectedMaterials: string[] = []) {
      this.cart = this.cart.filter((item) => !(item.id === productId && JSON.stringify(item.selectedMaterials) === JSON.stringify(selectedMaterials)));
    },
    updateQuantity(productId: string | number, quantity: number, selectedMaterials: string[] = []) {
      const item = this.cart.find((item) => item.id === productId && JSON.stringify(item.selectedMaterials) === JSON.stringify(selectedMaterials));
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart() {
      this.cart = [];
    },
  },
});
