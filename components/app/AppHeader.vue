<template>
  <header class="header">
    <div class="header-content">
      <div class="mobile-menu-toggle" @click="toggleMenu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
      <nav class="nav-left" :class="{ 'mobile-menu-open': isMenuOpen }">
        <NuxtLink to="/" class="nav-item" @click="closeMenu" :class="{ active: $route.path === '/' }">Home</NuxtLink>
        <NuxtLink to="/products" class="nav-item" @click="closeMenu" :class="{ active: $route.path === '/products' }">Products</NuxtLink>
        <NuxtLink to="/about" class="nav-item" @click="closeMenu" :class="{ active: $route.path === '/about' }">About</NuxtLink>
      </nav>
      <NuxtLink to="/" class="logo-link">
        <div class="logo-block">
          <div class="center-text">L'EMBRACE</div>
          <div class="logo-line"></div>
          <!--
          <div class="logo-subtitle">Handgemaakte sieraden en accessoires</div>
          -->
        </div>
      </NuxtLink>
      <div class="nav-right">
        <NuxtLink to="/cart" class="cart-icon">
          <div class="cart-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span class="cart-counter" v-if="cartCount > 0">{{ cartCount }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useGlobalStore } from '~/stores/global';

const isMenuOpen = ref(false);
const globalStore = useGlobalStore();
const cartCount = computed(() => globalStore.cartItemCount);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<style scoped>
.header {
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
  height: 70px;
}

.mobile-menu-toggle {
  display: none;
  cursor: pointer;
  z-index: 1001;
}

.nav-left {
  display: flex;
  gap: 2rem;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: var(--font-primary);
  position: relative;
  padding: 0.5rem 0;
}

.nav-item:hover {
  color: #d88c00;
}

.nav-item.active {
  color: #d88c00;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #fceabb, #f8b500);
  border-radius: 2px;
}

.logo-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.center-text {
  font-size: 1.3rem;
  font-family: 'Playfair Display', 'Cinzel', serif;
  color: black;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 0.1em;
  line-height: 1.1;
  white-space: nowrap;
}

.logo-line {
  width: 100%;
  max-width: 120px;
  height: 1px;
  background: #bbb;
  margin: 0.1em 0 0.3em 0;
  opacity: 0.6;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: #aaa;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-align: center;
  margin-top: 0;
  white-space: nowrap;
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  height: 100%;
}

.cart-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
  position: relative;
}

.cart-icon:hover {
  color: #d88c00;
  transform: translateY(-2px);
}

.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-counter {
  position: absolute;
  top: -12px;
  right: -12px;
  background: linear-gradient(to right, #fceabb, #f8b500);
  color: #000;
  border-radius: 50%;
  min-width: 20px;
  font-family: Arial, Helvetica, sans-serif;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .nav-left {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    flex-direction: column;
    padding: 5rem 2rem 0 2rem;
    gap: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateX(-100%);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .nav-left.mobile-menu-open {
    transform: translateX(0);
    opacity: 1;
  }

  .nav-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 1.2rem;
  }

  .nav-item:last-child {
    border-bottom: none;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 1rem;
  }

  .center-text {
    font-size: 1.4rem;
  }
}
</style>
