import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrder, getOrders } from '../services/order.service';
import type { CreateOrderPayload } from '../services/order.service';

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.setQueryData(['order', order.id], order);
    },
  });
}
