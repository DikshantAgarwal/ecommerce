import type { ProductVariant } from './product';

export interface CartItemVariant extends ProductVariant {
  product_name: string;
  product_slug: string;
  product_image: string;
  display_price: number;
}

export interface CartItem {
  id: string;
  variant: number;
  variant_detail: CartItemVariant;
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
  variant_id: number;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
