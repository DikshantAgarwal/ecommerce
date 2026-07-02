import apiClient from '../api/client';
import type { ProductsResponse } from '../types';

export async function getProducts(): Promise<ProductsResponse> {
  const { data } = await apiClient.get<ProductsResponse>('/products/');
  return data;
}
