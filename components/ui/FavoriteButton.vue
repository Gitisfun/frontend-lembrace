<template>
  <button @click.stop.prevent="$emit('toggle')" class="favorite-btn" :class="{ active: isActive }" :aria-label="isActive ? 'Remove from favorites' : 'Add to favorites'">
    <IconHeart :size="20" :filled="isActive" class="heart-icon" :class="{ filled: isActive }" />
  </button>
</template>

<script setup>
defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['toggle']);
</script>

<style scoped>
.favorite-btn {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.heart-icon {
  width: 20px;
  height: 20px;
  color: black;
  transition: all 0.3s ease;
}

.heart-icon.filled {
  color: #e74c3c;
}

.favorite-btn:hover .heart-icon {
  color: #e74c3c;
}

.favorite-btn.active .heart-icon {
  color: #e74c3c;
}
</style>
