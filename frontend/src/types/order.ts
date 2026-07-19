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

export interface Order {
  id: string;
  user: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}
