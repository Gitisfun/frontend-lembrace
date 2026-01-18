export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { code, productId, email } = body;

    if (!code || !productId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Code and productId are required',
      });
    }

    const config = useRuntimeConfig();
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337';

    // Build request body - only include email if provided
    const requestBody: { code: string; productId: string; email?: string } = {
      code,
      productId,
    };

    if (email) {
      requestBody.email = email;
    }

    // Call the Strapi promotion code validation endpoint
    const response = await $fetch<{
      success: boolean;
      message: { en: string; nl: string };
      discount?: number;
      code?: string;
      appliedAt?: string;
      appliedToId?: string;
      appliedToName?: string;
    }>(`${strapiUrl}/api/promotion-codes/validate`, {
      method: 'POST',
      body: requestBody,
    });

    return response;
  } catch (error: any) {
    console.error('Promotion code validation error:', error);

    // If the error is from Strapi, pass through the response
    if (error.data) {
      return error.data;
    }

    // Return a generic error
    return {
      success: false,
      message: {
        en: 'Failed to validate promotion code',
        nl: 'Kon promotiecode niet valideren',
      },
    };
  }
});
