export interface Category {
  id: number;
  name: string;
  slug: string;
  section: 'men' | 'women' | 'unisex';
  is_active: boolean;
  description: string;
}
