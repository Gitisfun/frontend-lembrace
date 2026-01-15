// Singleton state for out of stock count
const outOfStockCount = ref(0);
const isLoading = ref(false);

export const useOutOfStockCount = () => {
  const { find } = useStrapi();

  const fetchOutOfStockCount = async () => {
    if (isLoading.value) return;

    try {
      isLoading.value = true;
      const response = await find('products', {
        filters: {
          amount: {
            $eq: 0,
          },
        } as never,
        pagination: {
          page: 1,
          pageSize: 1,
        },
      });
      outOfStockCount.value = response.meta?.pagination?.total || 0;
    } catch (error) {
      console.error('Failed to fetch out of stock count:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // Decrement count when a product is restocked
  const decrementCount = () => {
    outOfStockCount.value = Math.max(0, outOfStockCount.value - 1);
  };

  // Increment count when a product goes out of stock
  const incrementCount = () => {
    outOfStockCount.value++;
  };

  return {
    outOfStockCount: readonly(outOfStockCount),
    isLoading: readonly(isLoading),
    fetchOutOfStockCount,
    decrementCount,
    incrementCount,
  };
};
