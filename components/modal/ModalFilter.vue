<template>
  <div class="filter-modal" :class="{ 'is-open': isOpen }">
    <div class="filter-modal-content">
      <div class="filter-modal-header">
        <h2>Filters</h2>
        <button class="close-modal" @click="$emit('close')">×</button>
      </div>

      <div class="filter-modal-body">
        <div class="filter-group">
          <h3 class="filter-title">
            <span class="title-text">Categories</span>
            <div class="title-decoration"></div>
          </h3>
          <div class="filter-options">
            <label v-for="category in categories" :key="category.id" class="filter-option">
              <input type="checkbox" :value="category.id" v-model="selectedCategories" class="filter-checkbox" />
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
              <input type="checkbox" :value="material.id" v-model="selectedMaterials" class="filter-checkbox" />
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
            <input type="checkbox" v-model="showDiscounted" class="filter-checkbox" />
            <span class="filter-label">Show discounted items only</span>
          </label>
        </div>
      </div>

      <div class="filter-modal-footer">
        <button class="clear-filters" @click="clearFilters">Clear Filters</button>
        <button class="apply-filters" @click="applyFilters">Apply Filters</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
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

const emit = defineEmits(['close', 'apply', 'clear']);

// Local state
const searchQuery = ref(props.initialSearchQuery);
const selectedCategories = ref([...props.initialSelectedCategories]);
const selectedMaterials = ref([...props.initialSelectedMaterials]);
const showDiscounted = ref(props.initialShowDiscounted);

// Methods
const clearFilters = () => {
  searchQuery.value = '';
  selectedCategories.value = [];
  selectedMaterials.value = [];
  showDiscounted.value = false;
  emit('clear');
};

const applyFilters = () => {
  emit('apply', {
    searchQuery: searchQuery.value,
    selectedCategories: selectedCategories.value,
    selectedMaterials: selectedMaterials.value,
    showDiscounted: showDiscounted.value,
  });
};

const handleSearch = () => {
  // Debounce search if needed
  emit('apply', {
    searchQuery: searchQuery.value,
    selectedCategories: selectedCategories.value,
    selectedMaterials: selectedMaterials.value,
    showDiscounted: showDiscounted.value,
  });
};
</script>

<style scoped>
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.filter-modal.is-open {
  display: block;
  opacity: 1;
}

.filter-modal-content {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.filter-modal.is-open .filter-modal-content {
  transform: translateX(0);
}

.filter-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.filter-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 1rem;
}

.filter-modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 1rem;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
}

.search-filter {
  margin-bottom: 2rem;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text);
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
}

.filter-group {
  margin-bottom: 2rem;
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
  gap: 0.8rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.filter-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--color-gold);
  cursor: pointer;
}

.filter-label {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
}

.clear-filters,
.apply-filters {
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  font-family: var(--font-body);
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-filters {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.apply-filters {
  background: var(--color-gold);
  border: none;
  color: white;
}

@media (min-width: 768px) {
  .filter-modal-content {
    width: 400px;
  }
}
</style>
