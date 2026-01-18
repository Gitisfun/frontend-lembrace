<template>
  <span class="promotion-badge" :class="sizeClass">
    <span class="promotion-code">{{ code }}</span>
    <span class="promotion-discount">-{{ discount }}%</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  discount: {
    type: [Number, String],
    required: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
});

const sizeClass = computed(() => `promotion-badge--${props.size}`);
</script>

<style scoped>
.promotion-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.15) 100%);
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.promotion-code {
  color: #1e8449;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.promotion-discount {
  color: #27ae60;
  font-weight: 700;
}

/* Small size - used in PaymentOrderSummary */
.promotion-badge--sm {
  gap: 0.3rem;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.7rem;
}

/* Medium size - used in CartItemMobile */
.promotion-badge--md {
  gap: 0.3rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* Large size - used in CartItem (desktop) */
.promotion-badge--lg {
  gap: 0.4rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
