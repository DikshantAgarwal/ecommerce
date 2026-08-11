import apiClient from '../api/client';
import type { Order } from '../types/order';

export interface PaymentInit {
  payment_session_id: string;
  order_id: string;
  payment_status: 'unpaid' | 'pending' | 'paid' | 'failed';
}

export interface PaymentStatus {
  order_id: string;
  payment_status: 'unpaid' | 'pending' | 'paid' | 'failed';
  order_status: Order['status'];
}

export async function initiatePayment(orderId: string, returnUrl: string): Promise<PaymentInit> {
  const { data } = await apiClient.post<PaymentInit>('/payments/initiate/', {
    order_id: orderId,
    return_url: returnUrl,
  });
  return data;
}

export async function getPaymentStatus(orderId: string): Promise<PaymentStatus> {
  const { data } = await apiClient.get<PaymentStatus>(`/payments/orders/${orderId}/status/`);
  return data;
}