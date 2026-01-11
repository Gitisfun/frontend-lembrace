<template>
  <div class="welcome-card">
    <div class="welcome-icon">
      <slot name="icon">
        <IconLayers :size="32" :stroke-width="1.5" />
      </slot>
    </div>
    <div class="welcome-content">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import IconLayers from '~/components/icon/IconLayers.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
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

@media (max-width: 768px) {
  .welcome-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
