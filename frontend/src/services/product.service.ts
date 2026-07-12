import apiClient from '../api/client';
import type { Product, ProductsResponse } from '../types';

export async function getProducts(categorySlug?: string | null, searchQuery?: string): Promise<ProductsResponse> {
  const params: Record<string, string> = {};
  if (categorySlug) params.category = categorySlug;
  if (searchQuery) params.search = searchQuery;
  const { data } = await apiClient.get<ProductsResponse>('/products/', { params });
  return data;
}

export async function getProduct(slug: string | undefined): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${slug}/`);
  return data;
}
