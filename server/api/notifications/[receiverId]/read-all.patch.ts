export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const receiverId = getRouterParam(event, 'receiverId');

  if (!receiverId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Receiver ID is required',
    });
  }

  try {
    const response = await fetch(`${config.notificationApiUrl}/api/notifications/${receiverId}/read-all`, {
      method: 'PATCH',
      headers: {
        'x-api-key': config.authApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || 500,
      statusMessage: error?.message || 'Failed to mark all as read',
    });
  }
});
