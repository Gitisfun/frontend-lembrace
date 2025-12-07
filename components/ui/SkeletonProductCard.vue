<template>
  <div class="skeleton-product-card">
    <UiSkeleton variant="rectangular" height="280px" class="image-skeleton" rounded />
    <div class="content">
      <UiSkeleton variant="text" width="70%" height="1.2rem" />
      <UiSkeleton variant="text" width="40%" height="1rem" style="margin-top: 0.5rem" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.image-skeleton {
  aspect-ratio: 1/1.2;
}

.content {
  padding: 1rem;
}
</style>
