export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  try {
    const response = await $fetch(`${config.authApiBase}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey,
      },
      body: { token: body.token },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage: error?.data?.message || 'Email verification failed',
      data: error?.data,
    });
  }
});
