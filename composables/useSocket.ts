import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const config = useRuntimeConfig();
  const isConnected = ref(false);
  const username = ref('');
  const senderId = ref('');

  const connect = (user: string, id: string) => {
    if (socket?.connected) return;

    username.value = user;
    senderId.value = id;

    const applicationId = config.public.chatAppId;

    socket = io(config.public.chatApiBase || 'http://localhost:3003', {
      autoConnect: true,
    });

    socket.on('connect', () => {
      isConnected.value = true;
      socket?.emit('user:connect', { username: user, senderId: id, applicationId });
    });

    socket.on('disconnect', () => {
      isConnected.value = false;
    });

    return socket;
  };

  const disconnect = () => {
    socket?.disconnect();
    socket = null;
    isConnected.value = false;
  };

  const getSocket = () => socket;

  return {
    socket: getSocket,
    connect,
    disconnect,
    isConnected,
    username,
    senderId,
  };
};
