<template>
  <div class="form-skeleton" :class="{ 'form-skeleton--grid': type === 'fields' }">
    <template v-if="type === 'fields'">
      <div v-for="row in rows" :key="row" class="skeleton-row">
        <div v-for="col in columns" :key="col" class="skeleton-item skeleton-item--field"></div>
      </div>
    </template>
    <template v-else>
      <div v-for="item in count" :key="item" class="skeleton-item skeleton-item--option"></div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Type of skeleton
   * - 'fields': For form input fields (2-column grid)
   * - 'options': For radio/checkbox options (stacked)
   */
  type: {
    type: String,
    default: 'options',
    validator: (value) => ['fields', 'options'].includes(value),
  },
  /**
   * Number of rows (for type='fields')
   */
  rows: {
    type: Number,
    default: 2,
  },
  /**
   * Number of columns per row (for type='fields')
   */
  columns: {
    type: Number,
    default: 2,
  },
  /**
   * Number of items (for type='options')
   */
  count: {
    type: Number,
    default: 2,
  },
});
</script>

<style scoped>
.form-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.skeleton-item {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-item--field {
  height: 56px;
}

.skeleton-item--option {
  height: 72px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .skeleton-row {
    grid-template-columns: 1fr;
  }
}
</style>
