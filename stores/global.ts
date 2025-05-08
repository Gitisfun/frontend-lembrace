import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('global', {
  state: () => ({
    cart: [],
  }),
  getters: {
    cartItems: (state) => state.cart,
    cartTotal: (state) => state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
    cartItemCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
  },
  actions: {
    addToCart(product, quantity = 1, selectedMaterials = []) {
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
    removeFromCart(productId, selectedMaterials = []) {
      this.cart = this.cart.filter((item) => !(item.id === productId && JSON.stringify(item.selectedMaterials) === JSON.stringify(selectedMaterials)));
    },
    updateQuantity(productId, quantity, selectedMaterials = []) {
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
