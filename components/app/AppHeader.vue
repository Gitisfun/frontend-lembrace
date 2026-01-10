<template>
  <header class="header">
    <div class="header-content">
      <div class="mobile-menu-toggle" @click="toggleMenu">
        <IconMenu :size="24" />
      </div>
      <nav class="nav-left" :class="{ 'mobile-menu-open': isMenuOpen }">
        <NuxtLink :to="localePath('/')" class="nav-item" @click="closeMenu" :class="{ active: $route.path === '/' || $route.path === localePath('/') }">{{ $t('nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/products')" class="nav-item" @click="closeMenu" :class="{ active: $route.path.includes('/products') }">{{ $t('nav.products') }}</NuxtLink>
        <!--
          <NuxtLink :to="localePath('/about')" class="nav-item" @click="closeMenu" :class="{ active: $route.path.includes('/about') }">{{ $t('nav.about') }}</NuxtLink>
        -->
        <NuxtLink :to="localePath('/contact')" class="nav-item" @click="closeMenu" :class="{ active: $route.path.includes('/contact') }">{{ $t('nav.contact') }}</NuxtLink>
      </nav>
      <NuxtLink to="/" class="logo-link">
        <div class="logo-block">
          <img src="/logo-lembrace.png" alt="L'embrace" class="logo-image" />
        </div>
      </NuxtLink>
      <div class="nav-right">
        <UiLanguageSwitcher class="language-switcher-desktop" />
        <NuxtLink :to="localePath('/favorites')" class="favorites-icon">
          <div class="favorites-icon-wrapper">
            <IconHeart :size="24" />
            <span class="favorites-counter" v-if="favoritesCount > 0">{{ favoritesCount }}</span>
          </div>
        </NuxtLink>
        <NuxtLink :to="localePath('/cart')" class="cart-icon">
          <div class="cart-icon-wrapper">
            <IconCart :size="24" />
            <span class="cart-counter" v-if="cartCount > 0">{{ cartCount }}</span>
          </div>
        </NuxtLink>
        <div v-if="cartCount > 0" class="cart-total">
          {{ formattedCartTotal }}
        </div>
        <!-- Auth: Profile icon or Login button -->
        <NuxtLink v-if="authStore.isAuthenticated" :to="localePath('/profile')" class="profile-icon" :title="authStore.userFullName">
          <div class="profile-icon-wrapper">
            <IconUser :size="24" />
            <span v-if="totalUnreadCount > 0" class="unread-counter">{{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}</span>
          </div>
        </NuxtLink>
        <NuxtLink v-else :to="localePath('/login')" class="login-btn">
          <IconUser :size="20" />
          <span class="login-text">{{ $t('nav.login') }}</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useGlobalStore } from '~/stores/global';
import { useAuthStore } from '~/stores/auth';
import { useUnreadMessagesStore } from '~/stores/unreadMessages';
import { useToast } from '~/composables/useToast';
import { formatPrice } from '~/logic/utils';

const { t } = useI18n();
const localePath = useLocalePath();

const isMenuOpen = ref(false);
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const unreadStore = useUnreadMessagesStore();
const { info: toastInfo } = useToast();
const cartCount = computed(() => globalStore.cartItemCount);
const favoritesCount = computed(() => globalStore.favoriteItems.length);
const formattedCartTotal = computed(() => formatPrice(globalStore.cartTotal));

// Unread messages count from store
const totalUnreadCount = computed(() => unreadStore.totalUnread);

// Callback for new unread messages
const onNewMessages = (count) => {
  toastInfo(t('orders.chat.newUnreadMessage', { count }), {
    action: {
      label: t('orders.chat.viewMessages'),
      onClick: () => navigateTo(localePath('/orders'))
    }
  });
};

// Watch for authentication changes
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth && authStore.user?.id) {
      unreadStore.fetchUnreadCounts(String(authStore.user.id), onNewMessages);
    } else {
      unreadStore.reset();
    }
  },
  { immediate: true }
);

// Refresh unread counts periodically (every 30 seconds)
let unreadInterval;
onMounted(() => {
  if (authStore.isAuthenticated && authStore.user?.id) {
    unreadStore.fetchUnreadCounts(String(authStore.user.id), onNewMessages);
  }
  unreadInterval = setInterval(() => {
    if (authStore.isAuthenticated && authStore.user?.id) {
      unreadStore.fetchUnreadCounts(String(authStore.user.id), onNewMessages);
    }
  }, 30000);
});

onUnmounted(() => {
  if (unreadInterval) {
    clearInterval(unreadInterval);
  }
});

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
  display: grid;
  grid-template-columns: 1fr auto 1fr;
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
  justify-self: start;
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
  justify-self: center;
  min-width: 0;
}

.center-text {
  font-size: 1.3rem;
  font-family: 'Playfair Display', 'Cinzel', serif;
  color: black;
  font-weight: 300;
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

.logo-image {
  height: 50px;
  width: auto;
  object-fit: contain;
  max-width: 200px;
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-right {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.language-switcher-desktop {
  margin-right: 0.5rem;
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

.favorites-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
  position: relative;
}

.favorites-icon:hover {
  color: #e74c3c;
  transform: translateY(-2px);
}

.favorites-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorites-counter {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #e74c3c;
  color: white;
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

.cart-total {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  background: #f8f8f8;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  white-space: nowrap;
}

.profile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
}

.profile-icon:hover {
  color: #d88c00;
  transform: translateY(-2px);
}

.profile-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unread-counter {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  padding: 0 4px;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
  background: rgba(212, 175, 55, 0.05);
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

  .favorites-icon {
    display: none;
  }

  .cart-total {
    display: none;
  }

  .login-btn .login-text {
    display: none;
  }

  .login-btn {
    padding: 0.5rem;
    border: none;
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
