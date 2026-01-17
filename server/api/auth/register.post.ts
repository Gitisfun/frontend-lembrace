export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  try {
    const response = await $fetch(`${config.authApiBase}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.authApiKey,
      },
      body: {
        email: body.email,
        password: body.password,
        first_name: body.firstName,
        last_name: body.lastName,
        status: 'active',
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage: error?.data?.message || 'Registration failed',
      data: error?.data,
    });
  }
});
