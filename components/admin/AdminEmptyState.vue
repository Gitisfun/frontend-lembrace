<template>
  <div class="empty-state">
    <div class="empty-icon">
      <slot name="icon">
        <IconFile :size="64" :stroke-width="1.5" />
      </slot>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import IconFile from '~/components/icon/IconFile.vue';

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
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  color: var(--admin-text-subtle);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-family: var(--font-body);
  font-size: 1.25rem;
  color: var(--admin-text);
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
}

.empty-state p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--admin-text-muted);
  margin: 0;
  transition: color 0.3s ease;
}
</style>
