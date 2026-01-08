<template>
  <AdminLayout>
    <AdminHeader :title="$t('admin.dashboard.title')" :subtitle="$t('admin.dashboard.subtitle')">
      <template #actions>
        <AdminActionButton :to="localePath('/')" target="_blank">
          <template #icon>
            <IconExternalLink :size="16" />
          </template>
          {{ $t('admin.dashboard.viewSite') }}
        </AdminActionButton>
      </template>
    </AdminHeader>

    <div class="dashboard-content">
      <div class="welcome-card">
        <div class="welcome-icon">
          <IconLayers :size="32" :stroke-width="1.5" />
        </div>
        <div class="welcome-content">
          <h2>{{ $t('admin.dashboard.welcomeTitle', { name: authStore.adminUser?.first_name || 'Admin' }) }}</h2>
          <p>{{ $t('admin.dashboard.welcomeMessage') }}</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon products">
            <IconShoppingBag :size="24" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ $t('admin.dashboard.stats.products') }}</span>
            <span class="stat-value">—</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orders">
            <IconDocument :size="24" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ $t('admin.dashboard.stats.orders') }}</span>
            <span class="stat-value">—</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon customers">
            <IconUsers :size="24" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ $t('admin.dashboard.stats.customers') }}</span>
            <span class="stat-value">—</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue">
            <IconDollarSign :size="24" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ $t('admin.dashboard.stats.revenue') }}</span>
            <span class="stat-value">—</span>
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-icon">
          <IconInfo :size="20" />
        </div>
        <div class="info-content">
          <h3>{{ $t('admin.dashboard.info.title') }}</h3>
          <p>{{ $t('admin.dashboard.info.message') }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import AdminLayout from '~/components/admin/AdminLayout.vue';
import AdminHeader from '~/components/admin/AdminHeader.vue';
import AdminActionButton from '~/components/admin/AdminActionButton.vue';
import IconExternalLink from '~/components/icon/IconExternalLink.vue';
import IconLayers from '~/components/icon/IconLayers.vue';
import IconShoppingBag from '~/components/icon/IconShoppingBag.vue';
import IconDocument from '~/components/icon/IconDocument.vue';
import IconUsers from '~/components/icon/IconUsers.vue';
import IconDollarSign from '~/components/icon/IconDollarSign.vue';
import IconInfo from '~/components/icon/IconInfo.vue';

definePageMeta({
  layout: false,
  middleware: ['admin'],
});

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();

// SEO Meta
useSeoMeta({
  title: () => t('seo.admin.dashboard.title'),
  description: () => t('seo.admin.dashboard.description'),
  robots: 'noindex, nofollow',
});
</script>

<style scoped>
/* Dashboard Content */
.dashboard-content {
  padding: 2rem;
  flex: 1;
}

.welcome-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(212, 167, 98, 0.1) 0%, rgba(212, 167, 98, 0.05) 100%);
  border: 1px solid rgba(212, 167, 98, 0.2);
  border-radius: 16px;
  margin-bottom: 2rem;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.welcome-content h2 {
  font-family: var(--font-primary);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--admin-text);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.welcome-content p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-subtle);
  line-height: 1.5;
  transition: color 0.3s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  background: var(--admin-surface-hover);
  border-color: var(--admin-border-hover);
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

.stat-icon.products {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.stat-icon.orders {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.stat-icon.customers {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.stat-icon.revenue {
  background: rgba(236, 72, 153, 0.15);
  color: #f472b6;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.stat-value {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--admin-text);
  transition: color 0.3s ease;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
}

.info-icon {
  width: 40px;
  height: 40px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #60a5fa;
}

.info-content h3 {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--admin-text);
  margin-bottom: 0.35rem;
  transition: color 0.3s ease;
}

.info-content p {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text-subtle);
  line-height: 1.5;
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .welcome-card {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .dashboard-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
