<template>
  <div class="profile-section">
    <h2 class="section-title">{{ $t('auth.profile.quickLinks') }}</h2>

    <!-- Unread Messages Banner -->
    <div v-if="totalUnreadCount > 0" class="unread-banner">
      <IconMail :size="18" />
      <span>{{ $t('orders.chat.youHaveUnread', { count: totalUnreadCount }) }}</span>
      <NuxtLink :to="localePath('/orders')" class="view-link">{{ $t('orders.viewDetails') }}</NuxtLink>
    </div>

    <div class="quick-links">
      <NuxtLink :to="localePath('/orders')" class="quick-link" :class="{ 'has-unread': totalUnreadCount > 0 }">
        <IconPackage :size="20" />
        <span>{{ $t('auth.profile.viewOrders') }}</span>
        <span v-if="totalUnreadCount > 0" class="unread-badge">{{ totalUnreadCount }}</span>
      </NuxtLink>
      <NuxtLink :to="localePath('/favorites')" class="quick-link">
        <IconHeart :size="20" />
        <span>{{ $t('auth.profile.viewFavorites') }}</span>
      </NuxtLink>
      <NuxtLink :to="localePath('/cart')" class="quick-link">
        <IconCart :size="20" />
        <span>{{ $t('auth.profile.viewCart') }}</span>
      </NuxtLink>
      <NuxtLink :to="localePath('/products')" class="quick-link">
        <span>{{ $t('auth.profile.browseProducts') }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useUnreadMessagesStore } from '~/stores/unreadMessages';
import IconMail from '~/components/icon/IconMail.vue';

const localePath = useLocalePath();
const authStore = useAuthStore();
const unreadStore = useUnreadMessagesStore();

// Get total unread count from store
const totalUnreadCount = computed(() => unreadStore.totalUnread);

// Fetch unread counts on mount if not already loaded
onMounted(() => {
  if (authStore.user?.id && unreadStore.counts.length === 0) {
    unreadStore.fetchUnreadCounts(String(authStore.user.id));
  }
});
</script>

<style scoped>
.profile-section {
  margin: 0.5rem 0;
}

.section-title {
  font-family: var(--font-primary);
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  font-weight: 600;
}

.unread-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  color: #92400e;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.unread-banner svg {
  flex-shrink: 0;
}

.unread-banner .view-link {
  margin-left: auto;
  color: #92400e;
  font-weight: 600;
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.unread-banner .view-link:hover {
  opacity: 0.8;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #f8f8f8;
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text);
  font-family: var(--font-body);
  font-weight: 500;
  transition: all 0.3s ease;
}

.quick-link:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.quick-link.has-unread {
  background: #fffbeb;
  border: 1px solid #fde68a;
}

.quick-link.has-unread:hover {
  background: #fef3c7;
}

.unread-badge {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: #f59e0b;
  color: white;
  border-radius: 11px;
  font-size: 0.75rem;
  font-weight: 700;
}
</style>
