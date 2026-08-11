import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../api/client';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../address.service';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockAddress = {
  id: 'addr-1',
  name: 'Aarav Sharma',
  phone: '9876543210',
  address_line1: '42 Park Street',
  address_line2: '',
  city: 'Mumbai',
  state: 'Maharashtra',
  postal_code: '400001',
  country: 'India',
  is_default: true,
};

describe('address.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAddresses fetches address list', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockAddress] });

    const result = await getAddresses();
    expect(apiClient.get).toHaveBeenCalledWith('/addresses/');
    expect(result).toHaveLength(1);
    expect(result[0].city).toBe('Mumbai');
  });

  it('createAddress posts payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockAddress });

    const payload = { ...mockAddress, is_default: true };
    const result = await createAddress(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/addresses/', payload);
    expect(result.id).toBe('addr-1');
  });

  it('updateAddress sends PUT to address id', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { ...mockAddress, city: 'Pune' } });

    const result = await updateAddress('addr-1', { ...mockAddress, city: 'Pune' });
    expect(apiClient.put).toHaveBeenCalledWith('/addresses/addr-1/', { ...mockAddress, city: 'Pune' });
    expect(result.city).toBe('Pune');
  });

  it('deleteAddress sends DELETE', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({});

    await deleteAddress('addr-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/addresses/addr-1/');
  });

  it('setDefaultAddress sends PATCH to default endpoint', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: mockAddress });

    const result = await setDefaultAddress('addr-1');
    expect(apiClient.patch).toHaveBeenCalledWith('/addresses/addr-1/default/', {});
    expect(result.is_default).toBe(true);
  });
});
