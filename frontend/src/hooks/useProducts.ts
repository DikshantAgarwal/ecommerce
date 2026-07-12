import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/product.service';

export function useProducts(categorySlug?: string | null) {
  return useQuery({
    queryKey: ['products', categorySlug],
    queryFn: () => getProducts(categorySlug),
  });
}
