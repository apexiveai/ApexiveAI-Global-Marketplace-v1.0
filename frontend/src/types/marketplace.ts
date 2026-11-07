
export interface Category {
  id: number;
  name: string;
  slug: string;
  business_type: "ELECTRONICS" | "JEWELRY" | "AUTOMOTIVE";
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  stock: number;
  condition: string;
  status: string;
  business_type: string;
  category: Category;
  images?: {
    id: string;
    image: string;
    is_primary: boolean;
  }[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
