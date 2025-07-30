<template>
  <div class="counter-wrapper">
    <button class="counter-btn" @click="decrement" :disabled="modelValue <= 1">-</button>
    <span class="counter-value">{{ modelValue }}</span>
    <button class="counter-btn" @click="increment" :disabled="availableStock <= 0">+</button>
  </div>
</template>

<script setup>
import { useGlobalStore } from '~/stores/global';

const globalStore = useGlobalStore();

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },
  max: {
    type: Number,
    default: 1,
  },
  productId: {
    type: [String, Number],
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);

// Calculate available stock considering what's already in cart
const availableStock = computed(() => {
  const cartItem = globalStore.cartItems.find((item) => item.id === props.productId);
  const alreadyInCart = cartItem ? cartItem.amount : 0;
  return props.max - alreadyInCart;
});

const decrement = () => {
  if (props.modelValue > 1) emit('update:modelValue', props.modelValue - 1);
};
const increment = () => {
  if (props.modelValue < availableStock.value) {
    // If the increment would exceed available stock, set to max available
    const newValue = Math.min(props.modelValue + 1, availableStock.value);
    emit('update:modelValue', newValue);
  }
};
</script>

<style scoped>
.counter-wrapper {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ece3d0;
  width: fit-content;
  padding: 0.2rem 0.7rem;
  margin-bottom: 2rem;
}
.counter-btn {
  width: 32px;
  height: 32px;
  background: #fff;
  border: none;
  border-radius: 7px;
  font-size: 1.2rem;
  color: #2d2212;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: 'Inter', Arial, sans-serif;
  font-weight: 600;
}
.counter-btn:hover:not(:disabled),
.counter-btn:active:not(:disabled) {
  background: #f8ecd1;
  color: #b88b2a;
}
.counter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #bbb;
}
.counter-value {
  font-size: 1.2rem;
  font-family: 'Inter', Arial, sans-serif;
  font-weight: 600;
  color: #2d2212;
  min-width: 2ch;
  text-align: center;
  background: transparent;
  padding: 0 0.7rem;
}

@media (max-width: 600px) {
  .counter-btn {
    width: 24px;
    height: 24px;
    font-size: 1rem;
    border-radius: 4px;
  }
  .counter-value {
    font-size: 1rem;
    padding: 0 0.3rem;
  }
}
</style>
