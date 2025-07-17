<template>
  <!-- Results Count -->
  <div v-if="activeFilterCount > 0" class="active-filters">
    <div v-if="selectedCategories.length" class="active-filter-group">
      <span class="active-filter-label">Categories:</span>
      <span v-for="categoryId in selectedCategories" :key="categoryId" class="active-filter-tag">
        {{ getCategoryName(categoryId) }}
        <button @click="removeCategory(categoryId)" class="remove-filter">×</button>
      </span>
    </div>

    <div v-if="showDiscounted" class="active-filter-group">
      <span class="active-filter-label">Others:</span>
      <span class="active-filter-tag">
        On Sale
        <button @click="removeDiscounted" class="remove-filter">×</button>
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  selectedCategories: {
    type: Array,
    required: true,
  },
  showDiscounted: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['remove-category', 'remove-discounted']);

const activeFilterCount = computed(() => {
  return props.selectedCategories.length + (props.showDiscounted ? 1 : 0);
});

const getCategoryName = (id) => {
  return props.categories.find((c) => c.id === id)?.label || '';
};

const removeCategory = (id) => {
  emit('remove-category', id);
};

const removeDiscounted = () => {
  emit('remove-discounted');
};
</script>

<style scoped>
.active-filters {
  display: none;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.active-filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.active-filter-label {
  font-family: var(--font-body);
  color: var(--color-text);
  font-size: 0.9rem;
}

.active-filter-tag {
  background: var(--color-beige);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.remove-filter {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  line-height: 1;
}

@media (max-width: 1024px) {
  .active-filters {
    display: flex;
  }
}
</style>
