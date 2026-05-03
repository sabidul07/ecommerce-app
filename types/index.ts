export interface Profile {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  user_id: string;
  created_at: string;
  category?: string;
  rating?: number;
  inventory_count?: number;
  profiles?: { name: string };
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  products?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
