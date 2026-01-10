<template>
  <div class="guest-order-notice">
    <div class="guest-notice-icon">
      <IconUser :size="32" />
    </div>
    <h3 class="guest-notice-title">{{ $t('admin.orders.guestOrder.title') }}</h3>
    <p class="guest-notice-message">{{ $t('admin.orders.guestOrder.message') }}</p>
    <div class="guest-notice-info">
      <IconMail :size="14" />
      <span>{{ email || '-' }}</span>
    </div>
  </div>
</template>

<script setup>
import IconUser from '~/components/icon/IconUser.vue';
import IconMail from '~/components/icon/IconMail.vue';

defineProps({
  email: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.guest-order-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  text-align: center;
}

.guest-notice-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.1) 0%, rgba(212, 167, 98, 0.2) 100%);
  border-radius: 50%;
  margin-bottom: 1.25rem;
  color: var(--color-gold);
}

.guest-notice-title {
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0 0 0.5rem 0;
}

.guest-notice-message {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
  max-width: 280px;
}

.guest-notice-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--admin-surface-alt);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text-secondary);
}

.guest-notice-info svg {
  color: var(--admin-text-muted);
  flex-shrink: 0;
}
</style>
