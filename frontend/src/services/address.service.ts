import apiClient from '../api/client';
import type { Address, CreateAddressPayload, UpdateAddressPayload } from '../types/address';

export async function getAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<Address[]>('/addresses/');
  return data;
}

export async function createAddress(payload: CreateAddressPayload): Promise<Address> {
  const { data } = await apiClient.post<Address>('/addresses/', payload);
  return data;
}

export async function updateAddress(id: string, payload: UpdateAddressPayload): Promise<Address> {
  const { data } = await apiClient.put<Address>(`/addresses/${id}/`, payload);
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/addresses/${id}/`);
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const { data } = await apiClient.patch<Address>(`/addresses/${id}/default/`, {});
  return data;
}