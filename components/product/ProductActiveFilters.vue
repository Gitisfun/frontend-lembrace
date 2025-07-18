<template>
  <!-- Results Count -->
  <div v-if="activeFilterCount > 0" class="active-filters">
    <div v-if="selectedSubcategories.length" class="active-filter-group">
      <span class="active-filter-label">Subcategories:</span>
      <span v-for="subcategoryId in selectedSubcategories" :key="subcategoryId" class="active-filter-tag">
        {{ getSubcategoryName(subcategoryId) }}
        <button @click="removeSubcategory(subcategoryId)" class="remove-filter">×</button>
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
  selectedSubcategories: {
    type: Array,
    required: true,
  },
  showDiscounted: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['remove-subcategory', 'remove-discounted']);

const activeFilterCount = computed(() => {
  return props.selectedSubcategories.length + (props.showDiscounted ? 1 : 0);
});

const getSubcategoryName = (id) => {
  const idStr = String(id);

  // Handle "all" virtual subcategories
  if (idStr.startsWith('all_')) {
    const categoryId = idStr.replace('all_', '');
    const category = props.categories.find((cat) => cat.id == categoryId);
    return category ? `All ${category.label}` : 'All';
  }

  // Handle regular subcategories
  for (const category of props.categories) {
    const subcategory = category.subcategories?.find((s) => s.id == id);
    if (subcategory) {
      return subcategory.label;
    }
  }
  return '';
};

const removeSubcategory = (id) => {
  emit('remove-subcategory', id);
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
