<template>
  <section class="notification-section">
    <button class="section-header" @click="toggle" :class="{ collapsed: !isExpanded }">
      <div class="section-title-wrapper">
        <slot name="icon" />
        <h3 class="section-title">{{ title }}</h3>
        <span class="section-badge" :class="badgeClass">{{ count }}</span>
      </div>
      <IconChevronDown class="section-chevron" :class="{ rotated: !isExpanded }" :size="18" />
    </button>
    <div v-show="isExpanded" class="section-content">
      <!-- Empty State -->
      <div v-if="count === 0" class="empty-state-small" :class="{ success: successWhenEmpty }">
        <IconCheck :size="20" />
        <span>{{ emptyText }}</span>
      </div>
      <!-- Content -->
      <slot v-else />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import IconChevronDown from '~/components/icon/IconChevronDown.vue';
import IconCheck from '~/components/icon/IconCheck.vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  emptyText: {
    type: String,
    default: '',
  },
  badgeVariant: {
    type: String,
    default: 'default', // 'default', 'active', 'warning'
  },
  successWhenEmpty: {
    type: Boolean,
    default: false,
  },
  defaultExpanded: {
    type: Boolean,
    default: true,
  },
});

const isExpanded = ref(props.defaultExpanded);

const toggle = () => {
  isExpanded.value = !isExpanded.value;
};

const badgeClass = computed(() => {
  if (props.count === 0) return {};
  return {
    active: props.badgeVariant === 'active',
    warning: props.badgeVariant === 'warning',
  };
});
</script>

<style scoped>
.notification-section {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.25rem;
  background: var(--admin-surface-alt);
  border: none;
  border-bottom: 1px solid var(--admin-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.section-header:hover {
  background: var(--admin-hover-bg);
}

.section-header.collapsed {
  border-bottom-color: transparent;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title-wrapper :deep(svg) {
  color: var(--color-gold);
}

.section-title {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 0.5rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--admin-text-muted);
}

.section-badge.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.section-badge.warning {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.15) 100%);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.section-chevron {
  color: var(--admin-text-muted);
  transition: transform 0.2s ease;
}

.section-chevron.rotated {
  transform: rotate(-90deg);
}

.section-content {
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.08) 100%);
}

/* Empty State Small */
.empty-state-small {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: var(--admin-surface-alt);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
}

.empty-state-small svg {
  color: var(--admin-text-muted);
  opacity: 0.6;
}

.empty-state-small.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(52, 211, 153, 0.08) 100%);
}

.empty-state-small.success svg {
  color: #10b981;
  opacity: 1;
}

@media (max-width: 768px) {
  .section-content {
    padding: 1rem;
  }
}
</style>
