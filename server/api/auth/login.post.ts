export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  try {
    const response = await $fetch(`${config.authApiBase}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey,
      },
      body: {
        identifier: body.email,
        password: body.password,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage: error?.data?.message || 'Login failed',
      data: error?.data,
    });
  }
});
