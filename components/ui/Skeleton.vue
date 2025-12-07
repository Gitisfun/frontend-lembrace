<template>
  <div
    class="skeleton"
    :class="[variant, { rounded }]"
    :style="{
      width: width,
      height: height,
      borderRadius: borderRadius,
    }"
  />
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'rectangular',
    validator: (value) => ['rectangular', 'circular', 'text'].includes(value),
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '1rem',
  },
  borderRadius: {
    type: String,
    default: null,
  },
  rounded: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton.text {
  border-radius: 4px;
}

.skeleton.circular {
  border-radius: 50%;
}

.skeleton.rounded {
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
