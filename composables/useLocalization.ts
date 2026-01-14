import { computed, type MaybeRef, toValue, type ComputedRef } from 'vue';

/**
 * Interface for items that have Strapi localizations
 */
interface LocalizableItem {
  id?: number;
  documentId?: string;
  locale?: string;
  localizations?: LocalizableItem[];
  [key: string]: unknown;
}

/**
 * Mapping from i18n locale codes to Strapi locale codes
 */
const LOCALE_MAP: Record<string, string> = {
  en: 'en',
  nl: 'nl-BE',
};

/**
 * Composable to handle Strapi localization for items with a `localizations` array.
 * Returns the localized version of an item based on the current locale,
 * or falls back to the original item if the locale is not found.
 */
export const useLocalization = () => {
  const { locale } = useI18n();

  /**
   * Get the Strapi locale code from the current i18n locale
   */
  const strapiLocale = computed(() => LOCALE_MAP[locale.value] || locale.value);

  /**
   * Find the localized version of a single item.
   * IMPORTANT: Preserves the original item's `id` and `documentId` since these are used
   * for relations and filtering in Strapi. Only the translatable fields are taken from
   * the localization.
   */
  const getLocalizedItem = <T extends LocalizableItem>(item: T | null | undefined): T | null => {
    if (!item) return null;

    const targetLocale = strapiLocale.value;

    // If the item's locale already matches, return it as-is
    if (item.locale === targetLocale) {
      return item;
    }

    // Try to find the matching localization
    const localization = item.localizations?.find((loc) => loc.locale === targetLocale);

    if (localization) {
      // Return the localized content but preserve the original item's id and documentId
      // This is crucial because relations in Strapi use the original item's id
      return {
        ...item, // Start with original item (preserves id, documentId, etc.)
        ...localization, // Override with localized fields
        id: item.id, // Ensure original id is preserved (for relations/filtering)
        documentId: item.documentId, // Ensure original documentId is preserved
        // Keep the original localizations array for potential future locale switches
        localizations: [item, ...(item.localizations?.filter((loc) => loc.locale !== targetLocale) || [])],
      } as T;
    }

    // Fall back to the original item if no matching localization found
    return item;
  };

  /**
   * Localize a single item (reactive)
   */
  const localizeItem = <T extends LocalizableItem>(item: MaybeRef<T | null | undefined>): ComputedRef<T | null> => {
    return computed(() => getLocalizedItem(toValue(item)));
  };

  /**
   * Localize an array of items (reactive)
   */
  const localizeArray = <T extends LocalizableItem>(items: MaybeRef<T[] | null | undefined>): ComputedRef<T[]> => {
    return computed(() => {
      const arr = toValue(items);
      if (!arr) return [];
      return arr.map((item) => getLocalizedItem(item)).filter((item): item is T => item !== null);
    });
  };

  /**
   * Get a specific field from a localized item
   */
  const getLocalizedField = <T extends LocalizableItem, K extends keyof T>(item: MaybeRef<T | null | undefined>, field: K): ComputedRef<T[K] | undefined> => {
    return computed(() => {
      const localizedItem = getLocalizedItem(toValue(item));
      return localizedItem?.[field];
    });
  };

  return {
    strapiLocale,
    getLocalizedItem,
    localizeItem,
    localizeArray,
    getLocalizedField,
  };
};
