export default defineEventHandler(async (event): Promise<unknown> => {
  const config = useRuntimeConfig(event);
  const userId = getRouterParam(event, 'userId');
  const addressId = getRouterParam(event, 'addressId');
  const authHeader = getHeader(event, 'authorization');

  if (!userId || !addressId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID and Address ID are required',
    });
  }

  try {
    const response: unknown = await $fetch(`${config.authApiBase}/api/users/${userId}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey as string,
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    return response;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number }; statusCode?: number; data?: { message?: string } };
    throw createError({
      statusCode: err?.response?.status || err?.statusCode || 500,
      statusMessage: err?.data?.message || 'Failed to delete address',
      data: err?.data,
    });
  }
});
