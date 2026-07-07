import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../services/product.service';

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    enabled: !!slug,
  });
}
