import { defineStore } from 'pinia';
import type { UnreadCount } from '~/composables/useChatApi';

interface UnreadMessagesState {
  counts: UnreadCount[];
  lastFetched: number | null;
  isLoading: boolean;
}

export const useUnreadMessagesStore = defineStore('unreadMessages', {
  state: (): UnreadMessagesState => ({
    counts: [],
    lastFetched: null,
    isLoading: false,
  }),

  getters: {
    // Total unread count across all rooms
    totalUnread: (state) => state.counts.reduce((sum, item) => sum + item.unreadCount, 0),

    // Get unread count for a specific room (by order number/room name)
    getUnreadByRoom: (state) => (roomName: string) => {
      const item = state.counts.find((c) => c.roomName === roomName);
      return item?.unreadCount || 0;
    },

    // Check if there are any unread messages
    hasUnread: (state) => state.counts.some((c) => c.unreadCount > 0),
  },

  actions: {
    // Fetch unread counts from API
    async fetchUnreadCounts(userId: string, onNewMessages?: (count: number) => void) {
      if (!userId) return;

      const previousTotal = this.totalUnread;

      this.isLoading = true;
      try {
        const { getUnreadCounts } = useChatApi();
        const newCounts = await getUnreadCounts(userId);
        const newTotal = newCounts.reduce((sum, item) => sum + item.unreadCount, 0);

        // Notify if there are new unread messages
        if (this.lastFetched !== null && newTotal > previousTotal && onNewMessages) {
          const newMessages = newTotal - previousTotal;
          onNewMessages(newMessages);
        }

        this.counts = newCounts;
        this.lastFetched = Date.now();
      } catch (error) {
        console.error('Failed to fetch unread counts:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // Clear all unread for a specific room (called when user reads all messages in a room)
    clearRoomUnread(roomName: string) {
      const item = this.counts.find((c) => c.roomName === roomName);
      if (item) {
        item.unreadCount = 0;
      }
    },

    // Reset store (called on logout)
    reset() {
      this.counts = [];
      this.lastFetched = null;
      this.isLoading = false;
    },
  },
});
