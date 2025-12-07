<template>
  <div class="search-filter">
    <div class="search-input-wrapper">
      <IconSearch :size="20" class="search-icon" />
      <input v-model="searchValue" type="text" :placeholder="computedPlaceholder" class="search-input" @input="handleInput" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: null,
  },
});

const computedPlaceholder = computed(() => props.placeholder || t('products.search.placeholder'));

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
