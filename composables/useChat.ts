interface Room {
  _id: string;
  id?: string;
  name: string;
  description: string;
  participants: string[];
  createdAt: string;
}

interface ReadBy {
  oderId: string;
  odername: string;
  readAt: string;
}

interface Message {
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

export const useChat = () => {
  const { socket } = useSocket();

  const rooms = ref<Room[]>([]);
  const currentRoom = ref<Room | null>(null);
  const messages = ref<Message[]>([]);
  const typingUsers = ref<string[]>([]);
  const onlineCount = ref(0);

  const setupListeners = () => {
    const s = socket();
    if (!s) return;

    // Room events
    s.on('rooms:list', (roomList: Room[]) => {
      rooms.value = roomList;
    });

    s.on('rooms:new', (room: Room) => {
      rooms.value.push(room);
    });

    s.on('room:joined', ({ room, messages: msgs }: { room: Room; messages: Message[] }) => {
      currentRoom.value = room;
      messages.value = msgs;
    });

    s.on('room:left', () => {
      currentRoom.value = null;
      messages.value = [];
    });

    s.on('room:created', (room: Room) => {
      joinRoom(room._id || room.id!);
    });

    s.on('room:users', (users: { id: string; username: string }[]) => {
      onlineCount.value = users.length;
    });

    // Message events
    s.on('message:new', (message: Message) => {
      messages.value.push(message);
    });

    // User events
    s.on('user:joined', ({ username, message }: { username: string; message: string }) => {
      messages.value.push({
        roomId: currentRoom.value?._id || '',
        senderId: 'system',
        sender: 'System',
        content: message,
        type: 'system',
        createdAt: new Date().toISOString(),
      });
      socket()?.emit('room:users');
    });

    s.on('user:left', ({ username, message }: { username: string; message: string }) => {
      messages.value.push({
        roomId: currentRoom.value?._id || '',
        senderId: 'system',
        sender: 'System',
        content: message,
        type: 'system',
        createdAt: new Date().toISOString(),
      });
      socket()?.emit('room:users');
    });

    s.on('user:typing', ({ username }: { username: string }) => {
      if (!typingUsers.value.includes(username)) {
        typingUsers.value.push(username);
      }
    });

    s.on('user:stop-typing', ({ username }: { username: string }) => {
      typingUsers.value = typingUsers.value.filter((u) => u !== username);
    });

    s.on('error', ({ message }: { message: string }) => {
      console.error('Socket error:', message);
    });

    // Message read events
    s.on('message:read', ({ messageId, readBy }: { messageId: string; readBy: ReadBy }) => {
      const message = messages.value.find((m) => m._id === messageId || m.id === messageId);
      if (message) {
        if (!message.readBy) {
          message.readBy = [];
        }
        // Only add if not already in readBy array
        const alreadyRead = message.readBy.some((r) => r.oderId === readBy.oderId);
        if (!alreadyRead) {
          message.readBy.push(readBy);
        }
      }
    });
  };

  const joinRoom = (roomId: string) => {
    socket()?.emit('room:join', { roomId });
  };

  const leaveRoom = () => {
    socket()?.emit('room:leave');
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    socket()?.emit('message:send', { content });
  };

  const createRoom = (name: string, description: string = '') => {
    socket()?.emit('room:create', { name, description, isPrivate: false });
  };

  const startTyping = () => {
    socket()?.emit('user:typing');
  };

  const stopTyping = () => {
    socket()?.emit('user:stop-typing');
  };

  const markMessageAsRead = (messageId: string) => {
    socket()?.emit('message:read', { messageId });
  };

  const markMessagesAsRead = (messageIds: string[]) => {
    if (messageIds.length === 0) return;
    socket()?.emit('messages:read', { messageIds });
  };

  const setCurrentRoom = (room: Room | null) => {
    currentRoom.value = room;
  };

  const setMessages = (msgs: Message[]) => {
    messages.value = msgs;
  };

  return {
    rooms,
    currentRoom,
    messages,
    typingUsers,
    onlineCount,
    setupListeners,
    joinRoom,
    leaveRoom,
    sendMessage,
    createRoom,
    startTyping,
    stopTyping,
    markMessageAsRead,
    markMessagesAsRead,
    setCurrentRoom,
    setMessages,
  };
};
