import apiClient from '../api/client';
import type { Product, ProductsResponse } from '../types';

export async function getProducts(categorySlug?: string | null): Promise<ProductsResponse> {
  const { data } = await apiClient.get<ProductsResponse>('/products/', {
    params: categorySlug ? { category: categorySlug } : undefined,
  });
  return data;
}

export async function getProduct(slug: string | undefined): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${slug}/`);
  return data;
}
