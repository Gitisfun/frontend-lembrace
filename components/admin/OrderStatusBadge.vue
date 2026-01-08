<template>
  <span class="status-badge" :class="[colorVariant, size]">
    {{ $t(`orders.status.${status}`) }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'paid', 'refunded'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  variant: {
    type: String,
    default: null,
    validator: (value) => value === null || ['previous'].includes(value),
  },
});

const colorVariant = computed(() => props.variant || props.status);
</script>

<style scoped>
.status-badge {
  display: inline-block;
  border-radius: 6px;
  font-family: var(--font-body);
  font-weight: 600;
  text-transform: capitalize;
}

/* Size variants */
.status-badge.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
}

.status-badge.medium {
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
}

.status-badge.large {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

/* Status colors */
.status-badge.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.status-badge.processing {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.status-badge.shipped {
  background: rgba(139, 92, 246, 0.15);
  color: #7c3aed;
}

.status-badge.delivered {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.status-badge.cancelled {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.status-badge.paid {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.status-badge.refunded {
  background: rgba(107, 114, 128, 0.15);
  color: #6b7280;
}

.status-badge.previous {
  background: rgba(107, 114, 128, 0.15);
  color: #6b7280;
}
</style>
