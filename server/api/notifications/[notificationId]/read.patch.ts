export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const notificationId = getRouterParam(event, 'notificationId');

  if (!notificationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Notification ID is required',
    });
  }

  try {
    const response = await fetch(`${config.notificationApiUrl}/api/notifications/${notificationId}/read`, {
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
      statusMessage: error?.message || 'Failed to mark as read',
    });
  }
});
