<template>
  <div class="filters-section">
    <InputSearch v-model="searchQuery" @search="handleSearch" />
    <div class="filter-group">
      <h3 class="filter-title">
        <span class="title-text">Categories</span>
        <div class="title-decoration"></div>
      </h3>
      <div class="filter-options">
        <label v-for="category in categories" :key="category.id" class="filter-option">
          <input type="checkbox" :value="category.id" v-model="selectedCategories" @change="handleFilterChange" class="filter-checkbox" />
          <span class="filter-label">{{ category.label }}</span>
        </label>
      </div>
    </div>

    <div class="filter-group">
      <h3 class="filter-title">
        <span class="title-text">Materials</span>
        <div class="title-decoration"></div>
      </h3>
      <div class="filter-options">
        <label v-for="material in materials" :key="material.id" class="filter-option">
          <input type="checkbox" :value="material.id" v-model="selectedMaterials" @change="handleFilterChange" class="filter-checkbox" />
          <span class="filter-label">{{ material.label }}</span>
        </label>
      </div>
    </div>

    <div class="filter-group">
      <h3 class="filter-title">
        <span class="title-text">Other</span>
        <div class="title-decoration"></div>
      </h3>
      <label class="filter-option">
        <input type="checkbox" v-model="showDiscounted" @change="handleFilterChange" class="filter-checkbox" />
        <span class="filter-label">Discount</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import InputSearch from '@/components/input/InputSearch.vue';

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  materials: {
    type: Array,
    required: true,
  },
  initialSearchQuery: {
    type: String,
    default: '',
  },
  initialSelectedCategories: {
    type: Array,
    default: () => [],
  },
  initialSelectedMaterials: {
    type: Array,
    default: () => [],
  },
  initialShowDiscounted: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['filter-change']);

// Local state
const searchQuery = ref(props.initialSearchQuery);
const selectedCategories = ref([...props.initialSelectedCategories]);
const selectedMaterials = ref([...props.initialSelectedMaterials]);
const showDiscounted = ref(props.initialShowDiscounted);

// Watch for prop changes
watch(
  () => props.initialSearchQuery,
  (newVal) => {
    if (newVal !== searchQuery.value) {
      searchQuery.value = newVal;
    }
  }
);

watch(
  () => props.initialSelectedCategories,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(selectedCategories.value)) {
      selectedCategories.value = [...newVal];
    }
  }
);

watch(
  () => props.initialSelectedMaterials,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(selectedMaterials.value)) {
      selectedMaterials.value = [...newVal];
    }
  }
);

watch(
  () => props.initialShowDiscounted,
  (newVal) => {
    if (newVal !== showDiscounted.value) {
      showDiscounted.value = newVal;
    }
  }
);

// Handle search input with debounce
let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleFilterChange();
  }, 300);
};

// Handle filter changes
const handleFilterChange = () => {
  emit('filter-change', {
    searchQuery: searchQuery.value,
    selectedCategories: selectedCategories.value,
    selectedMaterials: selectedMaterials.value,
    showDiscounted: showDiscounted.value,
  });
};
</script>

<style scoped>
.filters-section {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
  height: fit-content;
  position: sticky;
  top: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.search-filter {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.search-input {
  width: 100%;
  max-width: 100%;
  padding: 1rem 1.2rem 1rem 2.8rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #fafafa;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
  background: white;
}

.search-input:focus + .search-icon {
  color: var(--color-gold);
  opacity: 0.8;
}

.filter-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.filter-title {
  font-family: var(--font-primary);
  font-size: 1.1rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-text {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.title-decoration {
  width: 30px;
  height: 2px;
  background: var(--color-gold);
  opacity: 0.7;
  transition: width 0.3s ease;
}

.filter-group:hover .title-decoration {
  width: 50px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.filter-option:hover {
  background: rgba(212, 175, 55, 0.05);
}

.filter-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--color-gold);
  cursor: pointer;
  position: relative;
}

.filter-checkbox::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.filter-checkbox:checked::before {
  border-color: var(--color-gold);
}

.filter-label {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.filter-option:hover .filter-label {
  color: var(--color-gold);
}

@media (max-width: 1024px) {
  .filters-section {
    position: static;
  }
}
</style>
