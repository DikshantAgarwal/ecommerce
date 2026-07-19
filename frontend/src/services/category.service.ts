import apiClient from '../api/client';
import type { Category } from '../types';

export async function getCategories(section?: string): Promise<Category[]> {
  const params: Record<string, string> = {};
  if (section) params.section = section;
  const { data } = await apiClient.get<Category[]>('/categories/', { params });
  return data;
}
