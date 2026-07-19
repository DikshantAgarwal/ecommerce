export interface ProductVariant {
  id: number;
  size: string;
  color: string;
  color_code: string;
  sku: string;
  stock_quantity: number;
  price: number | null;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock_quantity: number;
  image: string;
  created_at: string;
  updated_at: string;
  category: number;
  category_detail: {
    id: number;
    name: string;
    slug: string;
    section: 'men' | 'women' | 'unisex';
    is_active: boolean;
    description: string;
  };
  variants: ProductVariant[];
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
