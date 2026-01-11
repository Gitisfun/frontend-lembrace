<template>
  <div class="action-banner">
    <div class="action-icon">
      <slot name="icon">
        <IconAlertCircle :size="20" />
      </slot>
    </div>
    <div class="action-content">
      <span class="action-title">{{ title }}</span>
      <span class="action-desc">{{ description }}</span>
    </div>
    <NuxtLink v-if="to" :to="to" class="action-link">
      {{ linkText }}
      <IconChevronRight :size="16" />
    </NuxtLink>
  </div>
</template>

<script setup>
import IconAlertCircle from '~/components/icon/IconAlertCircle.vue';
import IconChevronRight from '~/components/icon/IconChevronRight.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  linkText: {
    type: String,
    default: '',
  },
  to: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.action-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  margin-bottom: 2rem;
}

.action-icon {
  width: 40px;
  height: 40px;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #f59e0b;
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-title {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--admin-text);
}

.action-desc {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-subtle);
}

.action-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  color: #f59e0b;
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-link:hover {
  background: rgba(245, 158, 11, 0.3);
}

@media (max-width: 768px) {
  .action-banner {
    flex-direction: column;
    text-align: center;
  }

  .action-content {
    align-items: center;
  }
}
</style>
