<template>
  <div class="dropdown-wrapper" ref="dropdownRef">
    <label v-if="label" class="meta-label">{{ label }}</label>
    <div class="dropdown" :class="{ 'is-open': isOpen }">
      <div class="dropdown-header" @click.stop="toggle">
        <span class="selected-text">
          {{ selectedItemLabel || placeholder }}
        </span>
        <IconChevronDown :size="16" class="dropdown-icon" />
      </div>
      <div v-if="isOpen" class="dropdown-content">
        <div class="items-list">
          <div v-for="item in items" :key="item.id" class="item" :class="{ 'is-selected': modelValue === item.id }" @click.stop="selectItem(item.id)">
            <span class="item-name">{{ item.label }}</span>
            <IconCheck v-if="modelValue === item.id" :size="16" class="check-icon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
  modelValue: {
    type: [String, Number, Array],
    default: null,
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Select an item',
  },
});

const emit = defineEmits(['update:modelValue']);

const dropdownRef = ref(null);
const isOpen = ref(false);

const selectedItemLabel = computed(() => {
  if (!props.modelValue || (Array.isArray(props.modelValue) && props.modelValue.length === 0)) {
    return '';
  }
  if (Array.isArray(props.modelValue)) {
    const selectedItem = props.items.find((item) => props.modelValue.includes(item.id));
    return selectedItem ? selectedItem.label : '';
  }
  const selectedItem = props.items.find((item) => item.id === props.modelValue);
  return selectedItem ? selectedItem.label : '';
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const selectItem = (itemId) => {
  if (Array.isArray(props.modelValue)) {
    emit('update:modelValue', [itemId]);
  } else {
    emit('update:modelValue', itemId);
  }
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  if (props.modelValue === null && props.items.length > 0) {
    emit('update:modelValue', props.items[0].id);
  }
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown-wrapper {
  position: relative;
}

.dropdown {
  position: relative;
  border: 1px solid #e8d8b4;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  cursor: pointer;
  user-select: none;
}

.selected-text {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
}

.dropdown-icon {
  transition: transform 0.3s ease;
  color: var(--color-gold);
}

.dropdown.is-open .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e8d8b4;
  border-radius: 8px;
  margin-top: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease;
}

.items-list {
  padding: 0.5rem;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.item:hover {
  background: #fcf8f3;
}

.item.is-selected {
  background: #fcf8f3;
  color: var(--color-gold);
}

.item-name {
  font-family: var(--font-body);
  font-size: 1rem;
}

.check-icon {
  color: var(--color-gold);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
