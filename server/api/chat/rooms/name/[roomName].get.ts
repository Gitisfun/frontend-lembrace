export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const roomName = getRouterParam(event, 'roomName');

  if (!roomName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Room name is required',
    });
  }

  const applicationId = config.public.chatAppId;

  try {
    const response = await fetch(`${config.chatApiBase}/api/rooms/name/${encodeURIComponent(roomName)}?applicationId=${encodeURIComponent(applicationId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey,
      },
    });

    if (!response.ok) {
      return { success: false, data: null };
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to fetch room:', error);
    return { success: false, data: null };
  }
});
