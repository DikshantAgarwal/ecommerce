import { useInfiniteQuery } from '@tanstack/react-query';
import { getProducts } from '../services/product.service';

export function useProducts(categorySlug?: string | null, searchQuery?: string, section?: string | null) {
  return useInfiniteQuery({
    queryKey: ['products', categorySlug, searchQuery, section],
    queryFn: ({ pageParam }) => getProducts(categorySlug, searchQuery, pageParam, section),
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
