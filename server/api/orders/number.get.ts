export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  try {
    const response = await $fetch<{ order_number: string }>(config.orderNumberApiUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': config.authApiKey,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage: error?.data?.message || 'Failed to generate order number',
      data: error?.data,
    });
  }
});
