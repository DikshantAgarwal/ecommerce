import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrder } from '../services/order.service';

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.setQueryData(['order', order.id], order);
    },
  });
}
