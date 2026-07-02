export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  category: number;
  category_detail: {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    description: string;
  };
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
