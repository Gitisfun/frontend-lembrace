<template>
  <div class="skeleton-product-detail">
    <div class="gallery-skeleton">
      <UiSkeleton variant="rectangular" height="500px" class="main-image" rounded />
      <div class="thumbnails">
        <UiSkeleton v-for="i in 4" :key="i" variant="rectangular" width="80px" height="80px" rounded />
      </div>
    </div>
    <div class="info-skeleton">
      <UiSkeleton variant="text" width="80%" height="2rem" />
      <UiSkeleton variant="text" width="30%" height="1.5rem" style="margin-top: 1rem" />
      <div class="description-skeleton">
        <UiSkeleton v-for="i in 4" :key="i" variant="text" :width="`${100 - i * 10}%`" height="1rem" style="margin-top: 0.5rem" />
      </div>
      <UiSkeleton variant="rectangular" width="100%" height="48px" rounded style="margin-top: 2rem" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  aspect-ratio: 1;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
}

.info-skeleton {
  padding: 1rem 0;
}

.description-skeleton {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .skeleton-product-detail {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style>
