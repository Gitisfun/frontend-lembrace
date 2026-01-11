<template>
  <div class="status-breakdown">
    <h4 class="breakdown-title">{{ title }}</h4>
    <div class="status-grid">
      <div v-for="(count, status) in statuses" :key="status" class="status-item">
        <span class="status-badge" :class="status">{{ $t(`orders.status.${status}`) }}</span>
        <span class="status-count">{{ count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  statuses: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.status-breakdown {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--admin-border);
}

.breakdown-title {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--admin-text);
  margin-bottom: 1rem;
}

.status-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
}

.status-badge {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-badge.paid {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.processing {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.status-badge.shipped {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.status-badge.delivered {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.cancelled {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-badge.refunded {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

.status-count {
  font-family: var(--font-primary);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--admin-text);
}
</style>
