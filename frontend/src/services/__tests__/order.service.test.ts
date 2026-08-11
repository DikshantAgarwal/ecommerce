import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../api/client';
import { createOrder, getOrder, getOrders } from '../order.service';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockOrder = {
  id: 'order-1',
  user: 'user-1',
  status: 'confirmed',
  payment_status: 'paid',
  total: '100.00',
  items: [],
  shipping_address: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('order.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createOrder posts shipping_address_id', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockOrder });
    await createOrder({ shipping_address_id: 'addr-1' });
    expect(apiClient.post).toHaveBeenCalledWith('/orders/', { shipping_address_id: 'addr-1' });
  });

  it('getOrder fetches a single order', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockOrder });
    await getOrder('order-1');
    expect(apiClient.get).toHaveBeenCalledWith('/orders/order-1/');
  });

  it('getOrders fetches the order list', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockOrder] });
    const orders = await getOrders();
    expect(apiClient.get).toHaveBeenCalledWith('/orders/');
    expect(orders).toHaveLength(1);
  });
});
