<template>
  <div class="stat-card" :class="cardClasses">
    <div class="stat-icon" :class="variant">
      <slot name="icon" />
    </div>
    <div class="stat-info">
      <span class="stat-label">{{ label }}</span>
      <span class="stat-value">{{ value }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  variant: {
    type: String,
    default: 'default',
  },
  highlight: {
    type: Boolean,
    default: false,
  },
  hasAction: {
    type: Boolean,
    default: false,
  },
  hasWarning: {
    type: Boolean,
    default: false,
  },
  hasDanger: {
    type: Boolean,
    default: false,
  },
});

const cardClasses = computed(() => ({
  highlight: props.highlight,
  'has-action': props.hasAction,
  'has-warning': props.hasWarning,
  'has-danger': props.hasDanger,
}));
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--admin-border-hover);
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.1) 0%, rgba(212, 167, 98, 0.05) 100%);
  border-color: rgba(212, 167, 98, 0.3);
}

.stat-card.has-action {
  background: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.3);
}

.stat-card.has-warning {
  background: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.3);
}

.stat-card.has-danger {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Icon Variants */
.stat-icon.revenue {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-icon.today {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.stat-icon.week {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.stat-icon.month {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
}

.stat-icon.average {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.stat-icon.orders {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.stat-icon.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.stat-icon.shipping {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-icon.customers {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.stat-icon.new {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-icon.repeat {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.stat-icon.guest {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

.stat-icon.products {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
}

.stat-icon.low-stock {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.stat-icon.out-of-stock {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.stat-icon.categories {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.stat-icon.messages {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.stat-icon.action {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.stat-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.stat-value {
  font-family: var(--font-primary);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

@media (max-width: 480px) {
  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 1.1rem;
  }
}
</style>
