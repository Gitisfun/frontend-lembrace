<template>
  <div class="admin-dashboard" :class="{ 'theme-light': isLight, 'sidebar-collapsed': isCollapsed }">
    <AdminSidebar />
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useAdminTheme } from '~/composables/useAdminTheme';
import { useAdminSidebar } from '~/composables/useAdminSidebar';
import AdminSidebar from '~/components/admin/AdminSidebar.vue';

const { isLight } = useAdminTheme();
const { isCollapsed } = useAdminSidebar();
</script>

<style scoped>
.admin-dashboard {
  /* Dark Theme Variables (default) */
  --admin-bg: #0f1419;
  --admin-surface: rgba(255, 255, 255, 0.03);
  --admin-surface-alt: rgba(255, 255, 255, 0.02);
  --admin-surface-hover: rgba(255, 255, 255, 0.05);
  --admin-border: rgba(255, 255, 255, 0.06);
  --admin-border-light: rgba(255, 255, 255, 0.04);
  --admin-border-strong: rgba(255, 255, 255, 0.1);
  --admin-text: white;
  --admin-text-secondary: rgba(255, 255, 255, 0.8);
  --admin-text-muted: rgba(255, 255, 255, 0.5);
  --admin-text-subtle: rgba(255, 255, 255, 0.4);
  --admin-thumb-border: #1a1f2e;
  --admin-details-bg: rgba(255, 255, 255, 0.015);

  display: flex;
  min-height: 100vh;
  background: var(--admin-bg);
  transition: background 0.3s ease;
}

/* Light Theme Override */
.admin-dashboard.theme-light {
  --admin-bg: #f5f7fa;
  --admin-surface: rgba(255, 255, 255, 0.8);
  --admin-surface-alt: rgba(255, 255, 255, 0.6);
  --admin-surface-hover: rgba(255, 255, 255, 0.95);
  --admin-border: rgba(0, 0, 0, 0.08);
  --admin-border-light: rgba(0, 0, 0, 0.05);
  --admin-border-strong: rgba(0, 0, 0, 0.12);
  --admin-text: #1a1f2e;
  --admin-text-secondary: rgba(0, 0, 0, 0.75);
  --admin-text-muted: rgba(0, 0, 0, 0.5);
  --admin-text-subtle: rgba(0, 0, 0, 0.4);
  --admin-thumb-border: #f5f7fa;
  --admin-details-bg: rgba(0, 0, 0, 0.02);
}

/* Main Content */
.admin-main {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-collapsed .admin-main {
  margin-left: 72px;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-main {
    margin-left: 240px;
  }

  .sidebar-collapsed .admin-main {
    margin-left: 72px;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    flex-direction: column;
  }

  .admin-main {
    margin-left: 0;
  }
}
</style>
