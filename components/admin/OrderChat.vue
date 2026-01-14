<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="chat-title">
        <IconMail class="chat-icon" />
        <span>{{ $t('admin.orders.chat.title') }}</span>
      </div>
      <div class="chat-status">
        <span class="status-indicator" :class="{ connected: isConnected }"></span>
        <span class="status-text">
          {{ isConnected ? $t('admin.orders.chat.connected') : $t('admin.orders.chat.disconnected') }}
        </span>
      </div>
    </div>

    <div class="chat-room-info" v-if="currentRoom">
      <span class="room-name">{{ currentRoom.description || currentRoom.name }}</span>
      <span class="online-count">
        <IconUsers class="users-icon" />
        {{ onlineCount }} {{ $t('admin.orders.chat.online') }}
      </span>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="!isConnected" class="chat-placeholder">
        <IconMail class="placeholder-icon" />
        <p>{{ $t('admin.orders.chat.connectPrompt') }}</p>
      </div>

      <div v-else-if="messages.length === 0" class="chat-placeholder">
        <IconMail class="placeholder-icon" />
        <p>{{ $t('admin.orders.chat.noMessages') }}</p>
      </div>

      <template v-else>
        <div
          v-for="message in messages"
          :key="message._id || message.id || message.createdAt"
          class="message"
          :class="{
            'message-own': message.sender === username,
            'message-system': message.type === 'system',
          }"
        >
          <div v-if="message.type === 'system'" class="message-system-content">
            {{ message.content }}
          </div>
          <template v-else>
            <div class="message-header">
              <span class="message-sender">{{ getDisplaySender(message.sender) }}</span>
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
            <div v-if="message.sender === username && message.readBy?.length" class="message-read-status">
              <IconCheck class="read-icon" />
              <span>{{ $t('admin.orders.chat.read') }}</span>
            </div>
          </template>
        </div>
      </template>
    </div>

    <div v-if="typingUsers.length > 0" class="typing-indicator">
      <span class="typing-dots"> <span></span><span></span><span></span> </span>
      {{ typingUsers.join(', ') }} {{ typingUsers.length === 1 ? $t('admin.orders.chat.isTyping') : $t('admin.orders.chat.areTyping') }}
    </div>

    <div class="chat-input-container" v-if="isConnected">
      <input v-model="messageInput" type="text" class="chat-input" :placeholder="$t('admin.orders.chat.placeholder')" @keydown.enter="handleSend" @input="handleTyping" @blur="stopTyping" />
      <button class="send-button" @click="handleSend" :disabled="!messageInput.trim()">
        <IconArrowRight class="send-icon" />
        <span class="send-text">{{ $t('admin.orders.chat.send') }}</span>
      </button>
    </div>

    <div class="chat-connect" v-else>
      <button class="connect-button" @click="handleConnect">
        {{ $t('admin.orders.chat.connect') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAdminUnreadMessagesStore } from '~/stores/adminUnreadMessages';
import IconMail from '~/components/icon/IconMail.vue';
import IconUsers from '~/components/icon/IconUsers.vue';
import IconArrowRight from '~/components/icon/IconArrowRight.vue';
import IconCheck from '~/components/icon/IconCheck.vue';

const { t } = useI18n();

const props = defineProps({
  orderId: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
  },
});

const authStore = useAuthStore();
const adminUnreadStore = useAdminUnreadMessagesStore();
const { connect, disconnect, isConnected, username, senderId } = useSocket();
const { messages, currentRoom, typingUsers, onlineCount, setupListeners, joinRoom, leaveRoom, sendMessage, createRoom, startTyping, stopTyping, markMessagesAsRead, setCurrentRoom, setMessages } = useChat();
const { getRoomByName } = useChatApi();

const messageInput = ref('');
const messagesContainer = ref(null);
const typingTimeout = ref(null);

// Format time for messages (24-hour format)
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Get display name for sender (show "You" if it's the current user)
const getDisplaySender = (sender) => {
  return sender === username.value ? t('admin.orders.chat.you') : sender;
};

// Scroll to bottom of messages
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Mark unread messages as read (messages from others)
const markUnreadMessagesAsRead = () => {
  if (!isConnected.value) return;

  const currentSenderId = senderId.value;
  const unreadMessageIds = messages.value
    .filter((msg) => {
      // Only mark messages from others as read
      if (msg.senderId === currentSenderId) return false;
      // Skip system messages
      if (msg.type === 'system') return false;
      // Check if already read by current user
      const alreadyRead = msg.readBy?.some((r) => r.oderId === currentSenderId);
      return !alreadyRead;
    })
    .map((msg) => msg._id || msg.id)
    .filter((id) => id); // Filter out undefined

  if (unreadMessageIds.length > 0) {
    markMessagesAsRead(unreadMessageIds);
    // Clear unread count in the admin store for this room
    adminUnreadStore.clearRoomUnread(props.orderNumber);
  }
};

// Watch for new messages and scroll to bottom
watch(
  messages,
  () => {
    scrollToBottom();
    // Auto-mark messages as read when new messages arrive
    markUnreadMessagesAsRead();
  },
  { deep: true }
);

// Handle connect
const handleConnect = async () => {
  // Use generic "Admin" name for privacy
  const adminUserId = String(authStore.adminUser?.id || '');
  connect('Admin', adminUserId);
  setupListeners();

  // Check if room already exists using order number as unique room identifier
  const roomName = props.orderNumber;
  const existingRoom = await getRoomByName(roomName);

  if (existingRoom) {
    // Room exists, set the room data and messages from API response
    setCurrentRoom(existingRoom);
    setMessages(existingRoom.messages || []);
    // Join the room via socket for real-time updates
    joinRoom(existingRoom._id || existingRoom.id);
    // Mark existing unread messages as read
    nextTick(() => {
      markUnreadMessagesAsRead();
    });
  } else {
    // Room doesn't exist, create it
    createRoom(roomName, props.orderNumber);
  }
};

// Handle send message
const handleSend = () => {
  if (!messageInput.value.trim()) return;
  sendMessage(messageInput.value);
  messageInput.value = '';
  stopTyping();
};

// Handle typing indicator
const handleTyping = () => {
  startTyping();

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  typingTimeout.value = setTimeout(() => {
    stopTyping();
  }, 2000);
};

// Cleanup on unmount
onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  leaveRoom();
  disconnect();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--admin-surface-alt);
  border-bottom: 1px solid var(--admin-border);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--admin-text);
}

.chat-icon {
  width: 18px;
  height: 18px;
  color: var(--color-gold);
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  transition: background 0.3s ease;
}

.status-indicator.connected {
  background: #22c55e;
}

.status-text {
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.chat-room-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: var(--admin-details-bg);
  border-bottom: 1px solid var(--admin-border-light);
}

.room-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--admin-text-secondary);
}

.online-count {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.users-icon {
  width: 14px;
  height: 14px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chat-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  color: var(--admin-text-muted);
  text-align: center;
  padding: 2rem;
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  opacity: 0.3;
}

.message {
  max-width: 85%;
  padding: 0.75rem 1rem;
  background: var(--admin-surface-hover);
  border-radius: 12px;
  border-top-left-radius: 4px;
}

.message-own {
  align-self: flex-end;
  background: var(--color-gold);
  color: #1a1f2e;
  border-radius: 12px;
  border-top-right-radius: 4px;
  border-top-left-radius: 12px;
}

.message-own .message-header {
  color: rgba(26, 31, 46, 0.7);
}

.message-own .message-content {
  color: #1a1f2e;
}

.message-system {
  align-self: center;
  max-width: 100%;
  background: transparent;
  padding: 0.5rem;
}

.message-system-content {
  font-size: 0.75rem;
  color: var(--admin-text-muted);
  font-style: italic;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.message-sender {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--admin-text-secondary);
}

.message-time {
  font-size: 0.65rem;
  color: var(--admin-text-muted);
}

.message-content {
  font-size: 0.875rem;
  color: var(--admin-text);
  line-height: 1.4;
  word-break: break-word;
}

.message-read-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.35rem;
  font-size: 0.65rem;
  color: rgba(26, 31, 46, 0.6);
}

.message-own .message-read-status {
  justify-content: flex-end;
}

.read-icon {
  width: 12px;
  height: 12px;
}

.typing-indicator {
  padding: 0.5rem 1.25rem;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--admin-text-muted);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

.chat-input-container {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--admin-surface-alt);
  border-top: 1px solid var(--admin-border);
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  color: var(--admin-text);
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.chat-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

.chat-input::placeholder {
  color: var(--admin-text-muted);
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: var(--color-gold);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: var(--color-gold-dark);
  transform: translateX(2px);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  width: 18px;
  height: 18px;
  color: #1a1f2e;
}

.send-text {
  display: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1f2e;
}

.chat-connect {
  padding: 1rem;
  background: var(--admin-surface-alt);
  border-top: 1px solid var(--admin-border);
}

.connect-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--color-gold);
  border: none;
  border-radius: 8px;
  color: #1a1f2e;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.connect-button:hover {
  background: var(--color-gold-dark);
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--admin-border-strong);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--admin-text-muted);
}

/* Responsive */
@media (max-width: 1200px) {
  .chat-container {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .chat-container {
    min-height: 500px;
  }

  .chat-input-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .send-button {
    width: 100%;
    height: 44px;
  }

  .send-icon {
    display: none;
  }

  .send-text {
    display: inline;
  }
}
</style>
