import apiClient from '../api/client';
import type { Cart, AddToCartPayload, CartItem, UpdateCartItemPayload } from '../types/cart';

export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>('/cart/');
  return data;
}

export async function addToCart(payload: AddToCartPayload): Promise<CartItem> {
  const { data } = await apiClient.post<CartItem>('/cart/items/', { variant_id: payload.variant_id, quantity: payload.quantity });
  return data;
}

export async function updateCartItem(itemId: string, payload: UpdateCartItemPayload): Promise<CartItem> {
  const { data } = await apiClient.patch<CartItem>(`/cart/items/${itemId}/`, payload);
  return data;
}

export async function removeCartItem(itemId: string): Promise<void> {
  await apiClient.delete(`/cart/items/${itemId}/`);
}
