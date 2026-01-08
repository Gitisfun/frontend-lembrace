<template>
  <div class="details-section history-section" v-if="statusLogs?.length">
    <h4>{{ $t('admin.orders.statusHistory') }}</h4>
    <div class="status-timeline">
      <div v-for="log in statusLogs" :key="log.id" class="timeline-item">
        <div class="timeline-dot" :class="log.currentStatus"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <div class="status-transition">
              <OrderStatusBadge v-if="log.previousStatus" :status="log.previousStatus" variant="previous" size="small" />
              <IconArrowRight v-if="log.previousStatus" class="transition-arrow" :size="14" />
              <OrderStatusBadge :status="log.currentStatus" size="small" />
            </div>
            <span class="timeline-date">{{ formatDateTime(log.createdAt) }}</span>
          </div>
          <p v-if="log.note" class="timeline-note">{{ log.note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import OrderStatusBadge from '~/components/admin/OrderStatusBadge.vue';
import IconArrowRight from '~/components/icon/IconArrowRight.vue';

defineProps({
  statusLogs: {
    type: Array,
    default: () => [],
  },
});

const { locale } = useI18n();

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(locale.value === 'nl' ? 'nl-BE' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.history-section {
  border-top: 1px solid var(--admin-border);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.details-section h4 {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--admin-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
}

.status-timeline {
  position: relative;
  padding-left: 1.5rem;
}

.status-timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--admin-border);
}

.timeline-item {
  position: relative;
  padding-bottom: 1.25rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -1.5rem;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--admin-border);
  border: 2px solid var(--admin-bg);
}

.timeline-dot.pending {
  background: #f59e0b;
}
.timeline-dot.paid {
  background: #10b981;
}
.timeline-dot.processing {
  background: #3b82f6;
}
.timeline-dot.shipped {
  background: #8b5cf6;
}
.timeline-dot.delivered {
  background: #059669;
}
.timeline-dot.cancelled {
  background: #ef4444;
}
.timeline-dot.refunded {
  background: #6b7280;
}

.timeline-content {
  background: var(--admin-surface);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.status-transition {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.transition-arrow {
  color: var(--admin-text-muted);
  flex-shrink: 0;
}

.timeline-date {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.timeline-note {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-secondary);
  margin: 0.5rem 0 0 0;
}
</style>
