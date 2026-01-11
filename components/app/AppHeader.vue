<template>
  <header class="header">
    <div class="header-content">
      <div class="mobile-menu-toggle" @click="toggleMenu">
        <IconMenu :size="24" />
      </div>
      <nav class="nav-left" :class="{ 'mobile-menu-open': isMenuOpen }">
        <!-- Mobile Language Switcher -->
        <div class="mobile-language-switcher mobile-only">
          <UiLanguageSwitcher />
        </div>
        <!-- Mobile Menu Divider -->
        <div class="mobile-menu-divider mobile-only"></div>
        <NuxtLink :to="localePath('/')" class="nav-item" @click="closeMenu" :class="{ active: $route.path === '/' || $route.path === localePath('/') }">
          <IconHome :size="20" class="nav-icon" />
          <span>{{ $t('nav.home') }}</span>
        </NuxtLink>
        <!-- Desktop Products with Dropdown -->
        <div class="nav-item-dropdown desktop-only">
          <NuxtLink :to="localePath('/products')" class="nav-item" :class="{ active: $route.path.includes('/products') }">
            <span>{{ $t('nav.products') }}</span>
            <IconChevronDown :size="14" class="dropdown-chevron" />
          </NuxtLink>
          <div class="dropdown-menu">
            <NuxtLink :to="localePath('/products')" class="dropdown-item" :class="{ active: $route.path.includes('/products') && !$route.query.subcategory }">
              {{ $t('nav.allProducts') }}
            </NuxtLink>
            <div v-for="category in categories" :key="category.id" class="dropdown-category">
              <div class="dropdown-category-title">{{ category.label }}</div>
              <NuxtLink :to="{ path: localePath('/products'), query: { subcategory: `all_${category.id}` } }" class="dropdown-item" :class="{ active: $route.query.subcategory === `all_${category.id}` }">
                {{ $t('nav.allCategory') }}
              </NuxtLink>
              <NuxtLink v-for="subcategory in category.subcategories" :key="subcategory.id" :to="{ path: localePath('/products'), query: { subcategory: subcategory.id } }" class="dropdown-item" :class="{ active: $route.query.subcategory === String(subcategory.id) }">
                {{ subcategory.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
        <!-- Mobile Products with Submenu -->
        <div class="nav-item-with-submenu mobile-only">
          <div class="nav-item" @click="toggleProductsSubmenu" :class="{ active: $route.path.includes('/products') }">
            <IconShoppingBag :size="20" class="nav-icon" />
            <span>{{ $t('nav.products') }}</span>
            <IconChevronDown :size="18" class="submenu-chevron" :class="{ rotated: isProductsSubmenuOpen }" />
          </div>
          <div class="submenu" :class="{ open: isProductsSubmenuOpen }">
            <div class="submenu-items-row">
              <NuxtLink :to="localePath('/products')" class="submenu-item" :class="{ active: $route.path.includes('/products') && !$route.query.subcategory }" @click="closeMenu">
                {{ $t('nav.allProducts') }}
              </NuxtLink>
            </div>
            <div v-for="category in categories" :key="category.id" class="submenu-category">
              <div class="submenu-category-title">{{ category.label }}</div>
              <div class="submenu-items-row">
                <NuxtLink :to="{ path: localePath('/products'), query: { subcategory: `all_${category.id}` } }" class="submenu-item subcategory-item" :class="{ active: $route.query.subcategory === `all_${category.id}` }" @click="closeMenu">
                  {{ $t('nav.allCategory') }}
                </NuxtLink>
                <NuxtLink
                  v-for="subcategory in category.subcategories"
                  :key="subcategory.id"
                  :to="{ path: localePath('/products'), query: { subcategory: subcategory.id } }"
                  class="submenu-item subcategory-item"
                  :class="{ active: $route.query.subcategory === String(subcategory.id) }"
                  @click="closeMenu"
                >
                  {{ subcategory.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        <NuxtLink :to="localePath('/cart')" class="nav-item mobile-only" @click="closeMenu" :class="{ active: $route.path.includes('/cart') }">
          <IconCart :size="20" class="nav-icon" />
          <span>{{ $t('nav.cart') }}</span>
          <span class="mobile-counter" v-if="cartCount > 0">{{ cartCount }}</span>
        </NuxtLink>
        <NuxtLink :to="localePath('/favorites')" class="nav-item mobile-only" @click="closeMenu" :class="{ active: $route.path.includes('/favorites') }">
          <IconHeart :size="20" class="nav-icon" />
          <span>{{ $t('nav.favorites') }}</span>
          <span class="mobile-counter" v-if="favoritesCount > 0">{{ favoritesCount }}</span>
        </NuxtLink>
        <NuxtLink v-if="authStore.isAuthenticated" :to="localePath('/profile')" class="nav-item mobile-only" @click="closeMenu" :class="{ active: $route.path.includes('/profile') }">
          <IconUser :size="20" class="nav-icon" />
          <span>{{ $t('nav.profile') }}</span>
          <span class="mobile-counter unread" v-if="totalUnreadCount > 0">{{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}</span>
        </NuxtLink>
        <NuxtLink v-if="!authStore.isAuthenticated" :to="localePath('/login')" class="nav-item mobile-only" @click="closeMenu" :class="{ active: $route.path.includes('/login') }">
          <IconLogin :size="20" class="nav-icon" />
          <span>{{ $t('nav.login') }}</span>
        </NuxtLink>
        <NuxtLink :to="localePath('/contact')" class="nav-item" @click="closeMenu" :class="{ active: $route.path.includes('/contact') }">
          <IconMail :size="20" class="nav-icon" />
          <span>{{ $t('nav.contact') }}</span>
        </NuxtLink>
        <button v-if="authStore.isAuthenticated" class="nav-item mobile-only logout-btn-mobile" @click="handleLogout">
          <IconLogout :size="20" class="nav-icon" />
          <span>{{ $t('nav.logout') }}</span>
        </button>
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
const { find } = useStrapi();

const isMenuOpen = ref(false);
const isProductsSubmenuOpen = ref(false);
const categories = ref([]);
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const unreadStore = useUnreadMessagesStore();
const { info: toastInfo } = useToast();
const cartCount = computed(() => globalStore.cartItemCount);
const favoritesCount = computed(() => globalStore.favoriteItems.length);
const formattedCartTotal = computed(() => formatPrice(globalStore.cartTotal));

// Fetch categories for submenu
const fetchCategories = async () => {
  try {
    const response = await find('categories', {
      populate: ['subcategories'],
    });
    categories.value = response.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

// Fetch categories on mount
onMounted(() => {
  fetchCategories();
});

// Unread messages count from store
const totalUnreadCount = computed(() => unreadStore.totalUnread);

// Callback for new unread messages
const onNewMessages = (count) => {
  toastInfo(t('orders.chat.newUnreadMessage', { count }), {
    action: {
      label: t('orders.chat.viewMessages'),
      onClick: () => navigateTo(localePath('/orders')),
    },
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

const route = useRoute();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    // Auto-open products submenu if on products page
    if (route.path.includes('/products')) {
      isProductsSubmenuOpen.value = true;
    }
  } else {
    isProductsSubmenuOpen.value = false;
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
  isProductsSubmenuOpen.value = false;
};

const toggleProductsSubmenu = () => {
  isProductsSubmenuOpen.value = !isProductsSubmenuOpen.value;
};

const handleLogout = () => {
  closeMenu();
  authStore.logout();
  navigateTo(localePath('/'));
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

/* Mobile language switcher - hidden on desktop */
.mobile-language-switcher {
  display: none;
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

/* Mobile-only items - hidden on desktop */
.mobile-only {
  display: none;
}

/* Hide nav icons on desktop */
.nav-icon {
  display: none;
}

/* Desktop dropdown */
.nav-item-dropdown {
  position: relative;
}

.nav-item-dropdown .nav-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dropdown-chevron {
  transition: transform 0.2s ease;
}

.nav-item-dropdown:hover .dropdown-chevron {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  padding: 0.75rem 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1000;
  margin-top: 0.5rem;
}

.nav-item-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
}

.dropdown-item {
  display: block;
  padding: 0.6rem 1.25rem;
  color: #333;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.dropdown-item:hover {
  background: rgba(216, 140, 0, 0.08);
  color: #d88c00;
}

.dropdown-item.active {
  background: linear-gradient(to right, rgba(252, 234, 187, 0.4), rgba(248, 181, 0, 0.2));
  color: #b37400;
  font-weight: 500;
}

.dropdown-category {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f0f0f0;
}

.dropdown-category:first-of-type {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.dropdown-category-title {
  padding: 0.4rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
    background-color: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    flex-direction: column;
    padding: 5rem 1.25rem 2rem 1.25rem;
    gap: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateX(-100%);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .nav-left.mobile-menu-open {
    transform: translateX(0);
    opacity: 1;
  }

  /* Show nav icons on mobile */
  .nav-icon {
    display: block;
    flex-shrink: 0;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 12px;
    font-size: 1.1rem;
    background: rgba(0, 0, 0, 0.02);
    border: none;
    width: 100%;
    box-sizing: border-box;
  }

  .nav-item:hover {
    background: rgba(216, 140, 0, 0.08);
  }

  .nav-item.active {
    background: linear-gradient(to right, rgba(252, 234, 187, 0.3), rgba(248, 181, 0, 0.15));
  }

  .nav-item.active::after {
    display: none;
  }

  .nav-item > span:not(.mobile-counter) {
    flex: 1;
  }

  /* Show mobile-only items */
  .mobile-only {
    display: flex;
  }

  .nav-item.mobile-only {
    align-items: center;
    gap: 0.75rem;
  }

  /* Logout button mobile */
  .logout-btn-mobile {
    cursor: pointer;
    font-family: var(--font-primary);
    color: #666;
    border: none;
    margin-top: 0.5rem;
    background: rgba(239, 68, 68, 0.08);
    text-align: left;
  }

  .logout-btn-mobile:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #dc2626;
  }

  .logout-btn-mobile .nav-icon {
    color: #ef4444;
  }

  /* Hide desktop-only items on mobile */
  .desktop-only {
    display: none !important;
  }

  /* Hide desktop language switcher on mobile */
  .language-switcher-desktop {
    display: none;
  }

  /* Mobile language switcher - positioned top right of menu */
  .mobile-language-switcher {
    display: block;
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
  }

  /* Mobile menu golden gradient divider */
  .mobile-menu-divider {
    width: 100%;
    height: 2px;
    background: linear-gradient(to right, #fceabb, #f8b500, #fceabb);
    margin-bottom: 0.5rem;
    border-radius: 1px;
  }

  /* Products submenu */
  .nav-item-with-submenu {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .nav-item-with-submenu .nav-item {
    cursor: pointer;
  }

  .submenu-chevron {
    flex-shrink: 0;
    transition: transform 0.3s ease;
    margin-left: auto;
  }

  .submenu-chevron.rotated {
    transform: rotate(180deg);
  }

  .submenu {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 12px;
    margin-top: 0.5rem;
    padding: 0;
  }

  .submenu.open {
    max-height: 600px;
    padding: 0.75rem;
  }

  .submenu-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.65rem 0.9rem;
    color: #555;
    text-decoration: none;
    font-size: 0.9rem;
    border-radius: 10px;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-sizing: border-box;
  }

  .submenu-item:hover {
    background: rgba(216, 140, 0, 0.15);
    color: #d88c00;
  }

  .submenu-item.active {
    background: linear-gradient(to right, rgba(252, 234, 187, 0.6), rgba(248, 181, 0, 0.35));
    color: #b37400;
    border-color: rgba(248, 181, 0, 0.4);
    font-weight: 500;
  }

  .submenu-category {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .submenu-category:first-of-type {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }

  .submenu-category-title {
    display: block;
    width: 100%;
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
  }

  .submenu-items-row {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .subcategory-item {
    margin-left: 0;
  }

  .mobile-counter {
    background: linear-gradient(to right, #fceabb, #f8b500);
    color: #000;
    border-radius: 12px;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    font-family: Arial, Helvetica, sans-serif;
    padding: 0 6px;
    flex-shrink: 0;
    margin-right: 0;
  }

  .mobile-counter.unread {
    background: #ef4444;
    color: white;
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
