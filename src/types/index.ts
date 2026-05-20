export type ProductStatus = 'EM ESTOQUE' | 'BAIXO ESTOQUE' | 'ESGOTADO';

export interface Product {
  id: number;
  title: string;
  category: string;
  collection: string;
  price: string;
  ref?: string;
  status?: ProductStatus;
  tag?: string;
  img: string;
  description?: string;
  composition?: string;
  material?: 'Prata' | 'Semi-joia';
  views?: number;
}

export interface Category {
  name: string;
  slug: string;
  active?: boolean;
}

export interface CategoryStat extends Category {
  value: string;
  label: string;
  total: number;
}
