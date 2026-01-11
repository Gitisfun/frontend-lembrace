<template>
  <header class="admin-header">
    <div class="header-left">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    <div class="header-right">
      <slot name="actions" />
      <AdminActionButton :to="localePath('/')" target="_blank">
        <template #icon>
          <IconGlobe :size="16" />
        </template>
        {{ $t('admin.dashboard.viewSite') }}
      </AdminActionButton>
      <AdminActionButton :href="strapiAdminUrl" target="_blank">
        <template #icon>
          <IconCms :size="16" />
        </template>
        {{ $t('admin.nav.strapi') }}
      </AdminActionButton>
    </div>
  </header>
</template>

<script setup>
import AdminActionButton from '~/components/admin/AdminActionButton.vue';
import IconGlobe from '~/components/icon/IconGlobe.vue';
import IconCms from '~/components/icon/IconCms.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
});

const config = useRuntimeConfig();
const localePath = useLocalePath();

// Strapi admin URL
const strapiAdminUrl = computed(() => `${config.public.strapiUrl}/admin`);
</script>

<style scoped>
.admin-header {
  padding: 1.5rem 2rem;
  background: var(--admin-surface-alt);
  border-bottom: 1px solid var(--admin-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--admin-text);
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--admin-text-muted);
  transition: color 0.3s ease;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-right {
    flex-wrap: wrap;
  }
}
</style>
