import apiClient from '../api/client';
import type { Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories/');
  return data;
}
