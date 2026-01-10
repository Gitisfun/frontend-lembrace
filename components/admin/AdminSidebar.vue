<template>
  <aside class="admin-sidebar" :class="{ 'theme-light': isLight, collapsed: isCollapsed }">
    <div class="sidebar-header">
      <div class="admin-logo">
        <div class="logo-icon">
          <IconLayers :size="36" :stroke-width="1.5" />
        </div>
        <div class="logo-info">
          <span class="logo-text">L'embrace</span>
          <span class="admin-badge">Admin</span>
        </div>
      </div>
      <button class="collapse-btn" @click="toggleSidebar" :title="isCollapsed ? $t('admin.sidebar.expand') : $t('admin.sidebar.collapse')">
        <IconChevronRight v-if="isCollapsed" :size="14" />
        <IconChevronLeft v-else :size="14" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <span class="nav-section-title">{{ $t('admin.nav.main') }}</span>
        <ul class="nav-list">
          <li>
            <NuxtLink :to="localePath('/admin')" class="nav-link" :class="{ active: isActive('/admin') }" :title="isCollapsed ? $t('admin.nav.dashboard') : undefined">
              <IconDashboard :size="18" />
              <span class="nav-text">{{ $t('admin.nav.dashboard') }}</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/admin/messages')" class="nav-link" :class="{ active: isActive('/admin/messages') }" :title="isCollapsed ? $t('admin.nav.messages') : undefined">
              <div class="nav-icon-wrapper">
                <IconMail :size="18" />
                <span v-if="totalUnread > 0" class="unread-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
              </div>
              <span class="nav-text">{{ $t('admin.nav.messages') }}</span>
              <span v-if="totalUnread > 0 && !isCollapsed" class="unread-count">{{ totalUnread }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <span class="nav-section-title">{{ $t('admin.nav.management') }}</span>
        <ul class="nav-list">
          <li>
            <NuxtLink :to="localePath('/admin/products')" class="nav-link" :class="{ active: isActive('/admin/products') }" :title="isCollapsed ? $t('admin.nav.products') : undefined">
              <IconShoppingBag :size="18" />
              <span class="nav-text">{{ $t('admin.nav.products') }}</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/admin/orders')" class="nav-link" :class="{ active: isActive('/admin/orders') }" :title="isCollapsed ? $t('admin.nav.orders') : undefined">
              <IconDocument :size="18" />
              <span class="nav-text">{{ $t('admin.nav.orders') }}</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/admin/customers')" class="nav-link" :class="{ active: isActive('/admin/customers') }" :title="isCollapsed ? $t('admin.nav.customers') : undefined">
              <IconUsers :size="18" />
              <span class="nav-text">{{ $t('admin.nav.customers') }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <span class="nav-section-title">{{ $t('admin.nav.settings') }}</span>
        <ul class="nav-list">
          <li>
            <button class="nav-link theme-toggle" @click="toggleTheme" :title="isCollapsed ? (isDark ? $t('admin.theme.light') : $t('admin.theme.dark')) : undefined">
              <!-- Moon icon for dark mode (current state) -->
              <IconMoon v-if="isDark" :size="18" />
              <!-- Sun icon for light mode (current state) -->
              <IconSun v-else :size="18" />
              <span class="nav-text">{{ isDark ? $t('admin.theme.light') : $t('admin.theme.dark') }}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          {{ authStore.adminInitials || 'A' }}
        </div>
        <div class="user-details">
          <span class="user-name">{{ authStore.adminFullName || 'Admin' }}</span>
          <span class="user-role">{{ $t('admin.role') }}</span>
        </div>
      </div>
      <button class="logout-btn" @click="handleLogout" :title="$t('auth.profile.logout')">
        <IconLogout :size="18" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useAdminUnreadMessagesStore } from '~/stores/adminUnreadMessages';
import { useToast } from '~/composables/useToast';
import { useAdminTheme } from '~/composables/useAdminTheme';
import { useAdminSidebar } from '~/composables/useAdminSidebar';
import IconLayers from '~/components/icon/IconLayers.vue';
import IconChevronLeft from '~/components/icon/IconChevronLeft.vue';
import IconChevronRight from '~/components/icon/IconChevronRight.vue';
import IconDashboard from '~/components/icon/IconDashboard.vue';
import IconMail from '~/components/icon/IconMail.vue';
import IconShoppingBag from '~/components/icon/IconShoppingBag.vue';
import IconDocument from '~/components/icon/IconDocument.vue';
import IconUsers from '~/components/icon/IconUsers.vue';
import IconMoon from '~/components/icon/IconMoon.vue';
import IconSun from '~/components/icon/IconSun.vue';
import IconLogout from '~/components/icon/IconLogout.vue';

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const authStore = useAuthStore();
const adminUnreadStore = useAdminUnreadMessagesStore();
const { success: toastSuccess, message: toastMessage } = useToast();
const { isLight, isDark, toggleTheme } = useAdminTheme();
const { isCollapsed, toggleSidebar } = useAdminSidebar();

// Computed total unread messages
const totalUnread = computed(() => adminUnreadStore.totalUnread);

// Fetch unread counts on mount and periodically
let unreadInterval = null;

const fetchUnreadCounts = async () => {
  if (authStore.adminUser?.id) {
    await adminUnreadStore.fetchUnreadCounts(String(authStore.adminUser.id), (count) => {
      toastMessage(t('admin.orders.chat.newUnreadMessage', { count }), {
        action: {
          label: t('admin.orders.chat.viewMessages'),
          onClick: () => navigateTo(localePath('/admin/messages'))
        }
      });
    });
  }
};

onMounted(async () => {
  await fetchUnreadCounts();
  // Refresh every 30 seconds
  unreadInterval = setInterval(fetchUnreadCounts, 30000);
});

onUnmounted(() => {
  if (unreadInterval) {
    clearInterval(unreadInterval);
  }
});

// Check if a route is active (exact match for dashboard, starts with for sub-pages)
const isActive = (path) => {
  const currentPath = route.path;
  const localizedPath = localePath(path);

  // For dashboard, we need exact match (excluding locale prefix variations)
  if (path === '/admin') {
    // Match /admin or /nl/admin exactly
    return currentPath === localizedPath || currentPath === '/admin' || currentPath === '/nl/admin';
  }

  // For other pages, check if path starts with the localized path
  return currentPath.startsWith(localizedPath) || currentPath.includes(path);
};

const handleLogout = () => {
  authStore.adminLogout();
  toastSuccess(t('auth.profile.logoutSuccess'));
  navigateTo(localePath('/admin/login'));
};
</script>

<style scoped>
.admin-sidebar {
  --sidebar-bg: linear-gradient(180deg, #1a1f2e 0%, #151922 100%);
  --sidebar-border: rgba(255, 255, 255, 0.06);
  --sidebar-text: rgba(255, 255, 255, 0.7);
  --sidebar-text-muted: rgba(255, 255, 255, 0.4);
  --sidebar-text-active: white;
  --sidebar-hover-bg: rgba(255, 255, 255, 0.05);
  --sidebar-active-bg: rgba(212, 167, 98, 0.15);
  --sidebar-badge-bg: rgba(255, 255, 255, 0.1);
  --sidebar-badge-text: rgba(255, 255, 255, 0.5);
  --sidebar-btn-bg: rgba(255, 255, 255, 0.05);
  --sidebar-btn-border: rgba(255, 255, 255, 0.1);
  --sidebar-btn-text: rgba(255, 255, 255, 0.6);
  --sidebar-width-expanded: 280px;
  --sidebar-width-collapsed: 72px;

  width: var(--sidebar-width-expanded);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
  overflow: hidden;
}

.admin-sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

/* Light Theme Override */
.admin-sidebar.theme-light {
  --sidebar-bg: linear-gradient(180deg, #f8f9fc 0%, #eef1f5 100%);
  --sidebar-border: rgba(0, 0, 0, 0.08);
  --sidebar-text: rgba(0, 0, 0, 0.65);
  --sidebar-text-muted: rgba(0, 0, 0, 0.4);
  --sidebar-text-active: #1a1f2e;
  --sidebar-hover-bg: rgba(0, 0, 0, 0.04);
  --sidebar-active-bg: rgba(212, 167, 98, 0.12);
  --sidebar-badge-bg: rgba(0, 0, 0, 0.06);
  --sidebar-badge-text: rgba(0, 0, 0, 0.45);
  --sidebar-btn-bg: rgba(0, 0, 0, 0.04);
  --sidebar-btn-border: rgba(0, 0, 0, 0.08);
  --sidebar-btn-text: rgba(0, 0, 0, 0.5);
}

.admin-sidebar.theme-light .logo-text {
  color: #1a1f2e;
}

.admin-sidebar.theme-light .user-name {
  color: #1a1f2e;
}

.admin-sidebar.theme-light .user-avatar {
  color: #1a1f2e;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--sidebar-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  transition: padding 0.3s ease, flex-direction 0.3s ease;
}

.collapsed .sidebar-header {
  flex-direction: column;
  padding: 1rem 0.75rem;
  gap: 0.75rem;
}

.admin-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  overflow: hidden;
}

.logo-icon {
  min-width: 36px;
  color: var(--color-gold);
}

.logo-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  opacity: 1;
  transition: opacity 0.2s ease 0.1s, transform 0.2s ease;
  white-space: nowrap;
}

.collapsed .logo-info {
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
  position: absolute;
}

.logo-text {
  font-family: var(--font-accent);
  font-size: 1.5rem;
  color: var(--sidebar-text-active);
  line-height: 1;
  transition: color 0.3s ease;
}

.admin-badge {
  font-family: var(--font-body);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-gold);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.collapse-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sidebar-btn-bg);
  border: 1px solid var(--sidebar-btn-border);
  border-radius: 6px;
  color: var(--sidebar-btn-text);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.collapsed .collapse-btn {
  width: 100%;
  max-width: 40px;
}

.collapse-btn:hover {
  background: var(--sidebar-hover-bg);
  color: var(--sidebar-text-active);
  border-color: var(--sidebar-text-muted);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-section {
  padding: 0 1rem;
  margin-bottom: 1.5rem;
}

.collapsed .nav-section {
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-section-title {
  display: block;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--sidebar-text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 0.75rem;
  padding: 0 0.75rem;
  transition: opacity 0.2s ease, color 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
}

.collapsed .nav-section-title {
  opacity: 0;
  height: 0;
  margin-bottom: 0;
  padding: 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
  width: 100%;
}

.collapsed .nav-list {
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--sidebar-text);
  text-decoration: none;
  transition: all 0.2s ease;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
}

.collapsed .nav-link {
  width: 40px;
  height: 40px;
  padding: 0;
  justify-content: center;
}

.nav-text {
  opacity: 1;
  transition: opacity 0.2s ease 0.1s;
}

.collapsed .nav-text {
  display: none;
}

.nav-link:hover:not(.disabled) {
  background: var(--sidebar-hover-bg);
  color: var(--sidebar-text-active);
}

.nav-link.active {
  background: var(--sidebar-active-bg);
  color: var(--color-gold);
}

.nav-link.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-link.theme-toggle {
  cursor: pointer;
}

.coming-soon {
  margin-left: auto;
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  background: var(--sidebar-badge-bg);
  border-radius: 4px;
  color: var(--sidebar-badge-text);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.collapsed .coming-soon {
  display: none;
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unread-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
}

.unread-count {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.collapsed .unread-count {
  display: none;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--sidebar-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: padding 0.3s ease;
}

.collapsed .sidebar-footer {
  padding: 1rem;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  overflow: hidden;
}

.collapsed .user-info {
  flex: none;
}

.user-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  transition: color 0.3s ease;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  opacity: 1;
  transition: opacity 0.2s ease 0.1s;
  white-space: nowrap;
  overflow: hidden;
}

.collapsed .user-details {
  opacity: 0;
  width: 0;
  height: 0;
  transition: opacity 0.15s ease;
  position: absolute;
}

.user-name {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--sidebar-text-active);
  transition: color 0.3s ease;
}

.user-role {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: var(--sidebar-text-muted);
  transition: color 0.3s ease;
}

.logout-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sidebar-btn-bg);
  border: 1px solid var(--sidebar-btn-border);
  border-radius: 8px;
  color: var(--sidebar-btn-text);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    --sidebar-width-expanded: 240px;
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: relative;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--sidebar-border);
  }

  .admin-sidebar.collapsed {
    width: 100%;
  }

  .sidebar-nav {
    display: none;
  }

  .collapse-btn {
    display: none;
  }

  .collapsed .logo-info,
  .collapsed .user-details {
    opacity: 1;
    width: auto;
    height: auto;
    position: static;
    transform: none;
  }

  .collapsed .sidebar-footer {
    flex-direction: row;
    padding: 1rem 1.5rem;
  }
}
</style>
