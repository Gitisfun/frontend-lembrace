export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const adminUserId = getRouterParam(event, 'adminUserId');

  if (!adminUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Admin User ID is required',
    });
  }

  const applicationId = config.public.chatAppId;

  try {
    const response = await fetch(`${config.chatApiBase}/api/rooms/admin/unread/${encodeURIComponent(adminUserId)}?applicationId=${encodeURIComponent(applicationId)}`, {
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
    console.error('Failed to fetch admin unread counts:', error);
    return { success: false, data: [] };
  }
});
