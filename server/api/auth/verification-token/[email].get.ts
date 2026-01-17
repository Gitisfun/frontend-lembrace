export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const email = getRouterParam(event, 'email');

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required',
    });
  }

  try {
    const response = await $fetch(`${config.authApiBase}/api/auth/verification-token/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage: error?.data?.message || 'Failed to get verification token',
      data: error?.data,
    });
  }
});
