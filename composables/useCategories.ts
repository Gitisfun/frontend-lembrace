import { ref, computed } from 'vue';
import { useLocalization } from './useLocalization';

interface LocalizableItem {
  id: number;
  documentId: string;
  label: string;
  order?: number;
  locale?: string;
  localizations?: LocalizableItem[];
  [key: string]: unknown;
}

interface Subcategory extends LocalizableItem {
  display_label?: string;
}

interface Category extends LocalizableItem {
  subcategories?: Subcategory[];
}

/**
 * Sort items by order property (smaller numbers first)
 */
const sortByOrder = <T extends { order?: number }>(items: T[]): T[] => {
  return [...items].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
};

// Shared state (singleton pattern for SSR compatibility)
const rawCategories = ref<Category[]>([]);
const rawSubcategories = ref<Subcategory[]>([]);
const isLoading = ref(false);
const error = ref<Error | null>(null);
const hasFetched = ref(false);

/**
 * Composable to fetch and manage categories with localized subcategories.
 * Fetches categories and subcategories separately, then links them together.
 * Uses singleton pattern to share data between components.
 */
export const useCategories = () => {
  const { find } = useStrapi();
  const { localizeArray } = useLocalization();

  // Localized categories and subcategories (reactive to locale changes)
  const localizedCategories = localizeArray(rawCategories);
  const localizedSubcategories = localizeArray(rawSubcategories);

  /**
   * Link subcategories to their parent categories based on display_label.
   * The display_label format is "CategoryLabel - SubcategoryLabel".
   * Both categories and subcategories are sorted by their `order` property.
   */
  const categoriesWithSubcategories = computed<Category[]>(() => {
    const categories = localizedCategories.value;
    const subcategories = localizedSubcategories.value;

    if (!categories.length) return [];

    // Sort categories by order
    const sortedCategories = sortByOrder(categories);

    return sortedCategories.map((category) => {
      // Find subcategories that belong to this category
      // by checking if display_label starts with the category label
      const categorySubcategories = subcategories.filter((sub) => {
        if (!sub.display_label) return false;
        // Match subcategories where display_label starts with "CategoryLabel - "
        return sub.display_label.startsWith(`${category.label} - `);
      });

      return {
        ...category,
        // Sort subcategories by order
        subcategories: sortByOrder(categorySubcategories),
      };
    });
  });

  /**
   * Fetch both categories and subcategories with localizations
   */
  const fetchCategories = async (force = false) => {
    // Skip if already fetched (unless forced)
    if (hasFetched.value && !force) return;

    try {
      isLoading.value = true;
      error.value = null;

      // Fetch both in parallel
      const [categoriesResponse, subcategoriesResponse] = await Promise.all([find<Category>('categories', { populate: 'localizations' as never }), find<Subcategory>('subcategories', { populate: 'localizations' as never })]);

      rawCategories.value = (categoriesResponse.data as Category[]) || [];
      rawSubcategories.value = (subcategoriesResponse.data as Subcategory[]) || [];
      hasFetched.value = true;
    } catch (e) {
      console.error('Failed to fetch categories:', e);
      error.value = e instanceof Error ? e : new Error('Failed to fetch categories');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // Raw data (for advanced use cases)
    rawCategories,
    rawSubcategories,
    // Localized data
    localizedCategories,
    localizedSubcategories,
    // Categories with linked subcategories (main output)
    categories: categoriesWithSubcategories,
    // State
    isLoading,
    error,
    // Actions
    fetchCategories,
  };
};
