export default defineEventHandler(async (event): Promise<unknown> => {
  const config = useRuntimeConfig(event);
  const userId = getRouterParam(event, 'userId');
  const authHeader = getHeader(event, 'authorization');

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    });
  }

  try {
    const response = await $fetch(`${config.authApiBase}/api/users/${userId}/addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey,
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage: error?.data?.message || 'Failed to fetch addresses',
      data: error?.data,
    });
  }
});
