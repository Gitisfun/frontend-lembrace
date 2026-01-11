<template>
  <div class="info-banner">
    <slot name="icon">
      <IconInfo :size="14" />
    </slot>
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
import IconInfo from '~/components/icon/IconInfo.vue';

defineProps({
  message: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.info-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(212, 167, 98, 0.08);
  border: 1px solid rgba(212, 167, 98, 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--admin-text-secondary);
}

.info-banner :deep(svg) {
  color: var(--color-gold);
  flex-shrink: 0;
}
</style>
