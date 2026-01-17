export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const userId = getRouterParam(event, 'userId');
  const authHeader = getHeader(event, 'authorization');
  const body = await readBody(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    });
  }

  try {
    const response = await $fetch(`${config.authApiBase}/api/users/${userId}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey,
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage: error?.data?.message || 'Failed to create address',
      data: error?.data,
    });
  }
});
