<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none">
    <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 24,
  },
});
</script>
