<template>
  <div class="search-filter">
    <div class="search-input-wrapper">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input v-model="searchValue" type="text" :placeholder="placeholder" class="search-input" @input="handleInput" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Search products...',
  },
});

const emit = defineEmits(['update:modelValue', 'search']);

const searchValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== searchValue.value) {
      searchValue.value = newVal;
    }
  }
);

const handleInput = () => {
  emit('update:modelValue', searchValue.value);
  emit('search', searchValue.value);
};
</script>

<style scoped>
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
</style>
