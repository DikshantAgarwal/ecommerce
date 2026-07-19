import { useInfiniteQuery } from '@tanstack/react-query';
import { getProducts } from '../services/product.service';

export function useProducts(
  categorySlug?: string | null,
  searchQuery?: string,
  section?: string | null,
  ordering?: string,
  inStockOnly?: boolean,
) {
  return useInfiniteQuery({
    queryKey: ['products', categorySlug, searchQuery, section, ordering, inStockOnly],
    queryFn: ({ pageParam }) => getProducts(categorySlug, searchQuery, pageParam, section, ordering, inStockOnly),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      try {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get('page');
        return page ? Number(page) : undefined;
      } catch {
        return undefined;
      }
    },
  });
}
