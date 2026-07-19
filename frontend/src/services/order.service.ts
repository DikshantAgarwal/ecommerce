import apiClient from '../api/client';
import type { Order } from '../types';

export async function createOrder(): Promise<Order> {
  const { data } = await apiClient.post<Order>('/orders/');
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}/`);
  return data;
}
