export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const userId = getRouterParam(event, 'userId');

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    });
  }

  const applicationId = config.public.chatAppId;

  try {
    const response = await fetch(`${config.chatApiBase}/api/rooms/unread/${encodeURIComponent(userId)}?applicationId=${encodeURIComponent(applicationId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey,
      },
    });

    if (!response.ok) {
      return { success: false, data: [] };
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to fetch unread counts:', error);
    return { success: false, data: [] };
  }
});
