import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../api/client';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../cart.service';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('cart.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCart fetches cart data', async () => {
    const mockCart = {
      data: {
        id: 'cart-1',
        items: [],
        total: '0.00',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockCart);

    const result = await getCart();
    expect(apiClient.get).toHaveBeenCalledWith('/cart/');
    expect(result.id).toBe('cart-1');
    expect(result.total).toBe('0.00');
  });

  it('addToCart sends product_id and quantity', async () => {
    const mockItem = {
      data: {
        id: 'item-1',
        product: 1,
        product_detail: { id: 1, name: 'Test', price: '10.00' },
        quantity: 2,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockItem);

    const result = await addToCart({ product_id: 1, quantity: 2 });
    expect(apiClient.post).toHaveBeenCalledWith('/cart/items/', { product_id: 1, quantity: 2 });
    expect(result.quantity).toBe(2);
  });

  it('updateCartItem sends PATCH with quantity', async () => {
    const mockItem = {
      data: {
        id: 'item-1',
        product: 1,
        product_detail: { id: 1, name: 'Test', price: '10.00' },
        quantity: 5,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    };
    vi.mocked(apiClient.patch).mockResolvedValue(mockItem);

    const result = await updateCartItem('item-1', { quantity: 5 });
    expect(apiClient.patch).toHaveBeenCalledWith('/cart/items/item-1/', { quantity: 5 });
    expect(result.quantity).toBe(5);
  });

  it('removeCartItem sends DELETE', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({});

    await removeCartItem('item-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/cart/items/item-1/');
  });
});
