<template>
  <div class="profile-section">
    <h2 class="section-title">{{ $t('auth.profile.quickLinks') }}</h2>
    <div class="quick-links">
      <NuxtLink :to="localePath('/orders')" class="quick-link">
        <IconPackage :size="20" />
        <span>{{ $t('auth.profile.viewOrders') }}</span>
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
const localePath = useLocalePath();
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
</style>
