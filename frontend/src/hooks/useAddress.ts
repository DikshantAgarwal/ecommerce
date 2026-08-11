import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '../services/address.service';
import type { CreateAddressPayload, UpdateAddressPayload } from '../types/address';

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressPayload) => createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAddressPayload }) =>
      updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}