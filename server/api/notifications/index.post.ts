export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  try {
    const response = await fetch(`${config.notificationApiUrl}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.authApiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || 500,
      statusMessage: error?.message || 'Failed to send notification',
    });
  }
});
