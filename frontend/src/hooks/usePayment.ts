import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPaymentStatus, initiatePayment } from '../services/payment.service';

export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, returnUrl }: { orderId: string; returnUrl: string }) =>
      initiatePayment(orderId, returnUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

export function usePaymentStatus(orderId: string | undefined, enabled = false) {
  return useQuery({
    queryKey: ['payment-status', orderId],
    queryFn: () => getPaymentStatus(orderId!),
    enabled: !!orderId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.payment_status;
      if (status === 'paid' || status === 'failed') return false;
      return 5000;
    },
  });
}