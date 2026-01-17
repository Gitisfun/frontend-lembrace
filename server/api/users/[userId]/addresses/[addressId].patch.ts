export default defineEventHandler(async (event): Promise<unknown> => {
  const config = useRuntimeConfig(event);
  const userId = getRouterParam(event, 'userId');
  const addressId = getRouterParam(event, 'addressId');
  const authHeader = getHeader(event, 'authorization');
  const body = await readBody(event);

  if (!userId || !addressId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID and Address ID are required',
    });
  }

  try {
    const response = await $fetch(`${config.authApiBase}/api/users/${userId}/addresses/${addressId}`, {
      method: 'PATCH',
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
      statusMessage: error?.data?.message || 'Failed to update address',
      data: error?.data,
    });
  }
});
