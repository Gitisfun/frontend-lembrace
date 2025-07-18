<template>
  <div>
    <div v-if="isLoading">Is loading...</div>
    <div v-if="!isLoading" class="hero">
      <div class="images-row">
        <div v-for="(image, index) in pageContent?.data?.collection?.images" :key="index" class="image-container">
          <NuxtImg :src="image?.src?.url" :alt="`L'embrace image ${index + 1}`" width="600" height="400" format="webp" class="image" provider="strapi" />
          <NuxtLink v-if="index === 1" to="/products" class="center-overlay-btn">Shop all</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const elements = document.querySelectorAll('.title, .subtitle, .accent-text, .cta-button, .image, .flourish');
  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'all 0.8s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 * index);
  });
});

const { find } = useStrapi();
const isLoading = ref(true);

const pageContent = await find('homepage', {
  populate: {
    collection: {
      populate: {
        images: {
          populate: '*',
        },
      },
    },
  },
});

console.log(pageContent.data.collection.images);

isLoading.value = false;
</script>

<style scoped>
.hero {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  padding: 0;
  position: relative;
  background-blend-mode: overlay;
  opacity: 0.95;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-gold);
  opacity: 0.2;
}

.images-row {
  display: flex;
  flex-direction: row;
  width: 100vw;
  max-width: 100vw;
  margin: 0;
  padding: 0 3vw;
  gap: 1.5vw;
}

.image-container {
  flex: 1 1 0;
  aspect-ratio: 1/1.1;
  overflow: hidden;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  box-shadow: none;
  transition: none;
  animation: none;
  display: block;
}

.image:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-gold);
}

.ornament {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  opacity: 0.5;
}

.flourish {
  display: flex;
  justify-content: center;
}

.hero-content {
  flex: 1;
  text-align: center;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: fadeInUp 0.8s ease forwards;
}

.title {
  font-family: var(--font-primary);
  font-size: 3rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  opacity: 0;
  line-height: 1.2;
  letter-spacing: 1px;
  position: relative;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 2px;
  background: var(--gradient-gold);
  animation: grow 0.4s ease forwards;
}

.subtitle {
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: var(--color-text-light);
  margin-bottom: 1rem;
  opacity: 0;
  max-width: 80%;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.accent-text {
  font-family: var(--font-accent);
  font-size: 1.8rem;
  color: var(--color-gold);
  opacity: 0;
  letter-spacing: 1px;
  position: relative;
}

.cta-button {
  display: inline-block;
  padding: 1.2rem 2.5rem;
  background: var(--color-text);
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-family: var(--font-body);
  font-weight: 500;
  transition: all 0.3s ease;
  opacity: 0;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--gradient-gold);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-gold);
}

.cta-button:hover::before {
  opacity: 1;
}

.cta-button span {
  position: relative;
  z-index: 2;
}

.center-overlay-btn {
  position: absolute;
  text-decoration: none;
  top: 90%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #fff;
  color: #fff;
  font-size: 1.2rem;
  padding: 0.7em 2.2em;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.03em;
  transition: background 0.2s, color 0.2s;
  z-index: 2;
}
.center-overlay-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

@media (max-width: 1024px) {
  .images-row {
    flex-direction: column;
    gap: 2vw;
    width: 100vw;
    max-width: 100vw;
    padding: 0 2vw;
  }
  .image-container {
    aspect-ratio: 1/1;
    min-height: 200px;
  }
  .center-overlay-btn {
    font-size: 1rem;
    top: 50%;
  }
}
</style>
