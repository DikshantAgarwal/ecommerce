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

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>('/orders/mine/');
  return data;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/orders/${id}/`, { status });
  return data;
}
