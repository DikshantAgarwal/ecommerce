import apiClient from '../api/client';
import type { Order } from '../types';

export interface CreateOrderPayload {
  shipping_address_id: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>('/orders/', payload);
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}/`);
  return data;
}

export async function getOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>('/orders/');
  return data;
}
