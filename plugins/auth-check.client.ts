import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (!process.client) return;

  const authStore = useAuthStore();

  // Check token validity on app load
  if (authStore.isAuthenticated && authStore.token) {
    try {
      // JWT tokens are base64 encoded with 3 parts: header.payload.signature
      const parts = authStore.token.split('.');
      const payloadPart = parts[1];
      if (parts.length === 3 && payloadPart) {
        // Decode the payload (second part)
        const payload = JSON.parse(atob(payloadPart));

        // Check if exp claim exists and is expired
        if (payload.exp) {
          const expirationTime = payload.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();

          if (currentTime >= expirationTime) {
            console.log('Token expired on app load, logging out user');
            authStore.logout();
          }
        }
      } else {
        // Invalid token format
        console.log('Invalid token format, logging out user');
        authStore.logout();
      }
    } catch (error) {
      // If we can't decode the token, log out
      console.error('Failed to validate token:', error);
      authStore.logout();
    }
  }
});
