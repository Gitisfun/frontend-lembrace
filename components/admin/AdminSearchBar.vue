<template>
  <div class="search-wrapper">
    <IconSearch class="search-icon" :size="16" />
    <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" type="text" class="search-input" :placeholder="placeholder" />
    <button v-if="modelValue" class="clear-search" @click="$emit('update:modelValue', '')">
      <IconX :size="14" />
    </button>
  </div>
</template>

<script setup>
import IconSearch from '~/components/icon/IconSearch.vue';
import IconX from '~/components/icon/IconX.vue';

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Search...',
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--admin-text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.625rem 2.25rem 0.625rem 2.5rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--admin-text);
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--admin-text-muted);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(212, 167, 98, 0.15);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--admin-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search:hover {
  color: var(--admin-text);
  background: var(--admin-hover-bg);
}
</style>
