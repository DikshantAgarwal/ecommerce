import apiClient from '../api/client';
import type { Product, ProductsResponse } from '../types';

export async function getProducts(
  categorySlug?: string | null,
  searchQuery?: string,
  page?: number,
  section?: string | null,
  ordering?: string,
  inStockOnly?: boolean,
): Promise<ProductsResponse> {
  const params: Record<string, string> = {};
  if (categorySlug) params.category = categorySlug;
  if (searchQuery) params.search = searchQuery;
  if (page) params.page = String(page);
  if (section) params.section = section;
  if (ordering) params.ordering = ordering;
  if (inStockOnly) params.in_stock = 'true';
  const { data } = await apiClient.get<ProductsResponse>('/products/', { params });
  return data;
}

export async function getProduct(slug: string | undefined): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${slug}/`);
  return data;
}
