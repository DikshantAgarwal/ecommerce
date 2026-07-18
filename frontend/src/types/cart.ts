import type { Product } from './product';

export interface CartItem {
  id: string;
  product: number;
  product_detail: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartPayload {
  product_id: number;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
