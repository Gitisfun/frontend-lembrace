<template>
  <div>
    <div v-if="isLoading">Is loading...</div>
    <div v-if="!isLoading" class="hero">
      <div class="hero-image">
        <NuxtImg :src="pageContent?.data?.introduction?.image?.url" alt="L'embrace hero image" width="600" height="400" format="webp" class="image" provider="strapi" />
      </div>
      <div class="hero-content">
        <h1 class="title">Welcome to L'embrace</h1>
        <p class="subtitle">Discover our collection of elegant and timeless pieces</p>
        <div>
          <p class="accent-text">handcrafted for you</p>
          <div class="flourish">
            <svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5,10 C20,0 80,20 95,10" stroke="url(#goldGradient)" stroke-width="2" fill="none" />
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#f7c471" />
                  <stop offset="1" stop-color="#e3a439" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <NuxtLink to="/products" class="cta-button">
          <span>Shop Now</span>
        </NuxtLink>
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
    introduction: {
      populate: ['image'],
    },
    collection: {
      populate: {
        images: {
          populate: '*',
        },
      },
    },
  },
});
console.log('pageContent');
console.log(pageContent);

isLoading.value = false;
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rem;
  padding: 4rem 2rem;
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

.hero-image {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 450px;
  align-self: center;
  position: relative;
}

.image {
  width: 100%;
  max-width: 450px;
  height: auto;
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  transition: all 0.5s ease;
  animation: fadeInUp 0.8s ease forwards;
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

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 2rem 1rem;
    gap: 3rem;
  }

  .hero-image {
    width: 100%;
  }

  .title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .accent-text {
    font-size: 1.5rem;
  }
}
</style>
