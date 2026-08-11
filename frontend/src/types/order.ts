export interface OrderItem {
  id: string;
  variant: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  color: string;
  size: string;
}

export interface OrderShippingAddress {
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'pending' | 'paid' | 'failed';
  total: string;
  items: OrderItem[];
  shipping_address: OrderShippingAddress | null;
  created_at: string;
  updated_at: string;
}
