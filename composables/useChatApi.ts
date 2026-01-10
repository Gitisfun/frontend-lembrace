export interface ReadBy {
  oderId: string;
  odername: string;
  readAt: string;
}

export interface Message {
  _id?: string;
  id?: string;
  roomId: string;
  senderId: string;
  sender: string;
  content: string;
  type: 'text' | 'system';
  createdAt: string;
  readBy?: ReadBy[];
}

export interface Room {
  _id: string;
  id?: string;
  name: string;
  description: string;
  participants: string[];
  createdAt: string;
  messages?: Message[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface UnreadCount {
  roomId: string;
  roomName: string;
  unreadCount: number;
}

export const useChatApi = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.chatApiBase || 'http://localhost:3003';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-API-Key': config.public.authApiKey,
  });

  /**
   * Get a room by its name (order number)
   * @param roomName - The room name (e.g., ORD-2601-000044)
   * @returns The room with messages if found, null otherwise
   */
  const getRoomByName = async (roomName: string): Promise<Room | null> => {
    try {
      const response = await fetch(`${baseUrl}/api/rooms/name/${encodeURIComponent(roomName)}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.ok) {
        const result: ApiResponse<Room> = await response.json();
        if (result.success && result.data) {
          return result.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching room:', error);
      return null;
    }
  };

  /**
   * Get messages for a room by room name
   * @param roomName - The room name (e.g., ORD-2601-000044)
   * @returns Array of messages or empty array
   */
  const getRoomMessages = async (roomName: string): Promise<Message[]> => {
    try {
      const response = await fetch(`${baseUrl}/api/rooms/${encodeURIComponent(roomName)}/messages`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.ok) {
        const messages = await response.json();
        return messages;
      }
      return [];
    } catch (error) {
      console.error('Error fetching room messages:', error);
      return [];
    }
  };

  /**
   * Check if a room exists by name
   * @param roomName - The room name to check
   * @returns true if room exists, false otherwise
   */
  const roomExists = async (roomName: string): Promise<boolean> => {
    const room = await getRoomByName(roomName);
    return room !== null;
  };

  /**
   * Get unread message counts for a user across all rooms
   * @param userId - The user ID to get unread counts for
   * @returns Array of unread counts per room
   */
  const getUnreadCounts = async (userId: string): Promise<UnreadCount[]> => {
    try {
      const response = await fetch(`${baseUrl}/api/rooms/unread/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.ok) {
        const result: ApiResponse<UnreadCount[]> = await response.json();
        if (result.success && result.data) {
          return result.data;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      return [];
    }
  };

  /**
   * Get unread message counts for admin across all rooms
   * @param adminUserId - The admin user ID to get unread counts for
   * @returns Array of unread counts per room
   */
  const getAdminUnreadCounts = async (adminUserId: string): Promise<UnreadCount[]> => {
    try {
      const response = await fetch(`${baseUrl}/api/rooms/admin/unread/${encodeURIComponent(adminUserId)}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.ok) {
        const result: ApiResponse<UnreadCount[]> = await response.json();
        if (result.success && result.data) {
          return result.data;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching admin unread counts:', error);
      return [];
    }
  };

  return {
    getRoomByName,
    getRoomMessages,
    roomExists,
    getUnreadCounts,
    getAdminUnreadCounts,
  };
};
