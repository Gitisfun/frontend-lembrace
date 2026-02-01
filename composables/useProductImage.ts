/**
 * Composable for handling product images with fallback logic
 * Handles cases where images are too small and only have thumbnail/small formats
 */

export interface StrapiImage {
  url?: string;
  formats?: {
    thumbnail?: { url?: string };
    small?: { url?: string };
    medium?: { url?: string };
    large?: { url?: string };
  };
}

/**
 * Get image URL with fallback chain
 * Tries formats in order: large -> medium -> small -> thumbnail -> original url
 */
export const getProductImageUrl = (image: StrapiImage | null | undefined, preferredFormat: 'large' | 'medium' | 'small' | 'thumbnail' = 'medium'): string | null => {
  if (!image) return null;

  // If preferred format exists, use it
  if (image.formats?.[preferredFormat]?.url) {
    return image.formats[preferredFormat].url;
  }

  // Fallback chain based on preferred format
  if (preferredFormat === 'large') {
    return (
      image.formats?.large?.url ||
      image.formats?.medium?.url ||
      image.formats?.small?.url ||
      image.formats?.thumbnail?.url ||
      image.url ||
      null
    );
  }

  if (preferredFormat === 'medium') {
    return (
      image.formats?.medium?.url ||
      image.formats?.small?.url ||
      image.formats?.thumbnail?.url ||
      image.formats?.large?.url ||
      image.url ||
      null
    );
  }

  if (preferredFormat === 'small') {
    return (
      image.formats?.small?.url ||
      image.formats?.thumbnail?.url ||
      image.formats?.medium?.url ||
      image.formats?.large?.url ||
      image.url ||
      null
    );
  }

  // thumbnail
  return (
    image.formats?.thumbnail?.url ||
    image.formats?.small?.url ||
    image.formats?.medium?.url ||
    image.formats?.large?.url ||
    image.url ||
    null
  );
};

/**
 * Get the best available image format for a product
 * Returns the first image with fallback chain
 */
export const useProductImage = (product: { image?: StrapiImage[] | StrapiImage | null }) => {
  const getMainImage = (format: 'large' | 'medium' | 'small' | 'thumbnail' = 'medium') => {
    if (!product?.image) return null;

    if (Array.isArray(product.image)) {
      return getProductImageUrl(product.image[0] || null, format);
    }

    return getProductImageUrl(product.image as StrapiImage, format);
  };

  const getHoverImage = (format: 'large' | 'medium' | 'small' | 'thumbnail' = 'medium') => {
    if (!product?.image) return null;

    // Try image_background first, then fall back to main image
    const backgroundImage = (product as any).image_background;
    if (backgroundImage) {
      const url = getProductImageUrl(backgroundImage, format);
      if (url) return url;
    }

    // Fall back to main image
    return getMainImage(format);
  };

  const getThumbnailImage = (image: StrapiImage | null | undefined) => {
    return getProductImageUrl(image, 'thumbnail');
  };

  return {
    getMainImage,
    getHoverImage,
    getThumbnailImage,
    getProductImageUrl,
  };
};
