<template>
  <div v-if="materials && materials.length > 0" class="material-selector">
    <label class="selector-label">{{ $t('product.material.label') }}</label>
    <div class="material-swatches">
      <button v-for="material in materials" :key="material.id" type="button" class="material-swatch" :class="{ selected: selectedMaterial?.id === material.id }" :style="{ '--swatch-color': material.color }" :aria-label="material.name" :title="material.name" @click="selectMaterial(material)">
        <span class="swatch-inner" :style="{ backgroundColor: material.color }">
          <IconCheck v-if="selectedMaterial?.id === material.id" class="check-icon" :size="16" />
        </span>
        <span class="swatch-tooltip">{{ material.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import IconCheck from '~/components/icon/IconCheck.vue';

const props = defineProps({
  materials: {
    type: Array,
    required: true,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const selectedMaterial = computed(() => props.modelValue);

const selectMaterial = (material) => {
  emit('update:modelValue', material);
};

// Auto-select first material if none selected and materials exist
onMounted(() => {
  if (!props.modelValue && props.materials && props.materials.length > 0) {
    emit('update:modelValue', props.materials[0]);
  }
});

// Watch for materials changes and auto-select first if needed
watch(
  () => props.materials,
  (newMaterials) => {
    if (!props.modelValue && newMaterials && newMaterials.length > 0) {
      emit('update:modelValue', newMaterials[0]);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.material-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selector-label {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: 0.02em;
}

.material-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.material-swatch {
  position: relative;
  width: 44px;
  height: 44px;
  padding: 3px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.material-swatch:hover {
  transform: scale(1.1);
}

.material-swatch:focus {
  outline: none;
}

.material-swatch:focus-visible {
  box-shadow: 0 0 0 3px rgba(184, 139, 42, 0.3);
}

.material-swatch.selected {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 2px rgba(184, 139, 42, 0.2);
}

.swatch-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.25s ease;
}

.material-swatch:hover .swatch-inner {
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5), inset 0 -2px 4px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.2);
}

.check-icon {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Dark colors need white check, light colors need dark check */
.material-swatch.selected .swatch-inner[style*='#fff'] .check-icon,
.material-swatch.selected .swatch-inner[style*='#FFF'] .check-icon,
.material-swatch.selected .swatch-inner[style*='rgb(255'] .check-icon,
.material-swatch.selected .swatch-inner[style*='#d5d3d3'] .check-icon,
.material-swatch.selected .swatch-inner[style*='#D5D3D3'] .check-icon {
  color: #333;
  filter: drop-shadow(0 1px 1px rgba(255, 255, 255, 0.5));
}

.swatch-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 0.4rem 0.75rem;
  background: var(--color-text);
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 6px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 10;
}

.swatch-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--color-text);
}

.material-swatch:hover .swatch-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.selected-material-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: #666;
  padding-left: 2px;
}

@media (max-width: 768px) {
  .material-swatch {
    width: 40px;
    height: 40px;
  }

  .material-swatches {
    gap: 0.5rem;
  }

  .swatch-tooltip {
    display: none;
  }
}
</style>
