import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/product.service';

export function useProducts(categorySlug?: string | null, searchQuery?: string) {
  return useQuery({
    queryKey: ['products', categorySlug, searchQuery],
    queryFn: () => getProducts(categorySlug, searchQuery),
  });
}
