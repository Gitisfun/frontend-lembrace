import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();
  const localePath = useLocalePath();

  // Check if admin is authenticated (separate from customer auth)
  if (!authStore.isAdminAuthenticated) {
    return navigateTo(localePath('/admin/login'));
  }
});
