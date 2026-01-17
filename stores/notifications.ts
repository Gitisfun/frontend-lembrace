import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  _id: string;
  receiverId: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  appId: string;
  senderId?: string;
  channel?: string;
  createdAt?: string;
}

export interface SendNotificationPayload {
  receiverId: string;
  type: string;
  payload: Record<string, unknown>;
  appId: string;
  senderId?: string;
  channel?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  _socket: Socket | null;
  _receiverId: string | null;
}

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    _socket: null,
    _receiverId: null,
  }),

  getters: {
    unreadNotifications: (state) => state.notifications.filter((n) => !n.read),
    hasUnread: (state) => state.unreadCount > 0,
  },

  actions: {
    _getConfig() {
      const config = useRuntimeConfig();
      return {
        apiUrl: config.public.notificationApiUrl as string,
      };
    },

    // Call once when user logs in (e.g., in App.vue)
    init(receiverId: string) {
      if (this._socket) return; // Already initialized

      const { apiUrl } = this._getConfig();
      this._receiverId = receiverId;
      this._socket = io(apiUrl);

      this._socket.on('connect', () => {
        this.isConnected = true;
        this._socket?.emit('subscribe', receiverId);
        console.log('✅ Connected to notification server');
      });

      this._socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('❌ Disconnected from notification server');
      });

      // Listen for real-time notifications
      this._socket.on('notification', (notification: Notification) => {
        console.log('🔔 New notification:', notification);
        this.notifications.unshift(notification);
        this.unreadCount++;
      });

      // Fetch existing notifications
      this.fetchNotifications();
    },

    async fetchNotifications() {
      try {
        const res = await $fetch<{ notifications: Notification[]; unreadCount: number }>(`/api/notifications/${this._receiverId}`);
        this.notifications = res.notifications;
        this.unreadCount = res.unreadCount;
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    },

    async markAsRead(notificationId: string) {
      try {
        await $fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PATCH',
        });
        const notification = this.notifications.find((n) => n._id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    },

    async markAllAsRead() {
      try {
        await $fetch(`/api/notifications/${this._receiverId}/read-all`, {
          method: 'PATCH',
        });
        this.notifications.forEach((n) => (n.read = true));
        this.unreadCount = 0;
      } catch (error) {
        console.error('Failed to mark all as read:', error);
      }
    },

    async sendNotification(notification: SendNotificationPayload) {
      try {
        const res = await $fetch('/api/notifications', {
          method: 'POST',
          body: notification,
        });
        console.log('📤 Notification sent:', res);
        return res;
      } catch (error) {
        console.error('Failed to send notification:', error);
        throw error;
      }
    },

    // Call when user logs out
    disconnect() {
      if (this._socket) {
        this._socket.emit('unsubscribe', this._receiverId);
        this._socket.disconnect();
        this._socket = null;
        this._receiverId = null;
        this.notifications = [];
        this.unreadCount = 0;
        this.isConnected = false;
      }
    },
  },
});
