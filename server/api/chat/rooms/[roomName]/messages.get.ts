export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const roomName = getRouterParam(event, 'roomName');

  if (!roomName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Room name is required',
    });
  }

  try {
    const response = await fetch(`${config.chatApiBase}/api/rooms/${encodeURIComponent(roomName)}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey,
      },
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to fetch room messages:', error);
    return [];
  }
});
