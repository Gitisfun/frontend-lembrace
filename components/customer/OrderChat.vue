<template>
  <div class="customer-chat-container" :class="{ expanded: isChatExpanded }">
    <!-- Chat Toggle Button (when collapsed) -->
    <button v-if="!isChatExpanded" class="chat-toggle-button" @click="toggleChat">
      <IconMail class="toggle-icon" />
      <span>{{ $t('orders.chat.startChat') }}</span>
    </button>

    <!-- Chat Panel (when expanded) -->
    <div v-else class="chat-panel">
      <div class="chat-header">
        <div class="chat-title">
          <IconMail class="chat-icon" />
          <span>{{ $t('orders.chat.title') }}</span>
        </div>
        <div class="chat-header-actions">
          <div class="chat-status">
            <span class="status-indicator" :class="{ connected: isConnected }"></span>
            <span class="status-text">
              {{ isConnected ? $t('orders.chat.connected') : $t('orders.chat.disconnected') }}
            </span>
          </div>
          <button class="close-button" @click="toggleChat" :aria-label="$t('orders.chat.close')">
            <IconX class="close-icon" :size="18" />
          </button>
        </div>
      </div>

      <div class="chat-room-info" v-if="currentRoom">
        <span class="room-name">{{ currentRoom.description || currentRoom.name }}</span>
        <span class="online-count">
          <IconUsers class="users-icon" />
          {{ onlineCount }} {{ $t('orders.chat.online') }}
        </span>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div v-if="!isConnected" class="chat-placeholder">
          <IconMail class="placeholder-icon" />
          <p>{{ $t('orders.chat.connectPrompt') }}</p>
          <button class="connect-button" @click="handleConnect">
            {{ $t('orders.chat.connect') }}
          </button>
        </div>

        <div v-else-if="messages.length === 0" class="chat-placeholder">
          <IconMail class="placeholder-icon" />
          <p>{{ $t('orders.chat.noMessages') }}</p>
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
                <span>{{ $t('orders.chat.read') }}</span>
              </div>
            </template>
          </div>
        </template>
      </div>

      <div v-if="typingUsers.length > 0" class="typing-indicator">
        <span class="typing-dots"> <span></span><span></span><span></span> </span>
        {{ typingUsers.join(', ') }}
        {{ typingUsers.length === 1 ? $t('orders.chat.isTyping') : $t('orders.chat.areTyping') }}
      </div>

      <div class="chat-input-container" v-if="isConnected">
        <input v-model="messageInput" type="text" class="chat-input" :placeholder="$t('orders.chat.placeholder')" @keydown.enter="handleSend" @input="handleTyping" @blur="stopTyping" />
        <button class="send-button" @click="handleSend" :disabled="!messageInput.trim()">
          <IconArrowRight class="send-icon" />
          <span class="send-text">{{ $t('orders.chat.send') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useUnreadMessagesStore } from '~/stores/unreadMessages';
import IconMail from '~/components/icon/IconMail.vue';
import IconUsers from '~/components/icon/IconUsers.vue';
import IconArrowRight from '~/components/icon/IconArrowRight.vue';
import IconX from '~/components/icon/IconX.vue';
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
const unreadStore = useUnreadMessagesStore();
const { connect, disconnect, isConnected, username, senderId } = useSocket();
const { messages, currentRoom, typingUsers, onlineCount, setupListeners, joinRoom, leaveRoom, sendMessage, createRoom, startTyping, stopTyping, markMessagesAsRead, setCurrentRoom, setMessages } = useChat();
const { getRoomByName } = useChatApi();

const messageInput = ref('');
const messagesContainer = ref(null);
const typingTimeout = ref(null);
const isChatExpanded = ref(false);

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
  return sender === username.value ? t('orders.chat.you') : sender;
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
    // Clear unread count in the store for this room
    unreadStore.clearRoomUnread(props.orderNumber);
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

// Toggle chat visibility
const toggleChat = () => {
  isChatExpanded.value = !isChatExpanded.value;
};

// Handle connect
const handleConnect = async () => {
  // Get user info from auth store
  const customerName = authStore.user?.firstName ? `${authStore.user.firstName} ${authStore.user.lastName || ''}` : authStore.user?.username || 'Customer';
  const customerId = String(authStore.user?.id || '');

  connect(customerName.trim(), customerId);
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
  if (isConnected.value) {
    leaveRoom();
    disconnect();
  }
});
</script>

<style scoped>
.customer-chat-container {
  margin-top: 2rem;
}

/* Toggle Button */
.chat-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark, #c9a227) 100%);
  border: none;
  border-radius: 12px;
  color: #1a1a1a;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(201, 162, 39, 0.25);
}

.chat-toggle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(201, 162, 39, 0.35);
}

.toggle-icon {
  width: 20px;
  height: 20px;
}

/* Chat Panel */
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 450px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.chat-icon {
  width: 18px;
  height: 18px;
  color: var(--color-gold);
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.close-button:hover {
  background: #eee;
}

.close-icon {
  color: var(--color-text-light);
}

.chat-room-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.room-name {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
}

.online-count {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.users-icon {
  width: 14px;
  height: 14px;
}

/* Messages */
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
  color: var(--color-text-light);
  text-align: center;
  padding: 2rem;
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  opacity: 0.3;
}

.chat-placeholder p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  margin: 0;
}

.connect-button {
  padding: 0.75rem 1.5rem;
  background: var(--color-gold);
  border: none;
  border-radius: 8px;
  color: #1a1a1a;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.connect-button:hover {
  background: var(--color-gold-dark, #c9a227);
}

/* Message Bubbles */
.message {
  max-width: 85%;
  padding: 0.75rem 1rem;
  background: #f0f0f0;
  border-radius: 12px;
  border-top-left-radius: 4px;
}

.message-own {
  align-self: flex-end;
  background: var(--color-gold);
  color: #1a1a1a;
  border-radius: 12px;
  border-top-right-radius: 4px;
  border-top-left-radius: 12px;
}

.message-own .message-header {
  color: rgba(26, 26, 26, 0.7);
}

.message-own .message-content {
  color: #1a1a1a;
}

.message-system {
  align-self: center;
  max-width: 100%;
  background: transparent;
  padding: 0.5rem;
}

.message-system-content {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-light);
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
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.message-time {
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: var(--color-text-light);
}

.message-content {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text);
  line-height: 1.4;
  word-break: break-word;
}

.message-read-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.35rem;
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: var(--color-text-light);
}

.message-own .message-read-status {
  justify-content: flex-end;
  color: rgba(26, 26, 26, 0.6);
}

.read-icon {
  width: 12px;
  height: 12px;
}

/* Typing Indicator */
.typing-indicator {
  padding: 0.5rem 1.25rem;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-light);
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
  background: var(--color-text-light);
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

/* Input */
.chat-input-container {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f8f8;
  border-top: 1px solid #eee;
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.chat-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

.chat-input::placeholder {
  color: var(--color-text-light);
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
  background: var(--color-gold-dark, #c9a227);
  transform: translateX(2px);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  width: 18px;
  height: 18px;
  color: #1a1a1a;
}

.send-text {
  display: none;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-panel {
    height: 500px;
  }

  .chat-header {
    padding: 0.875rem 1rem;
  }

  .chat-header-actions {
    gap: 0.5rem;
  }

  .status-text {
    display: none;
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
