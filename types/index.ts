export interface Profile {
  id: string;
  name: string;
  full_name?: string;
  avatar_url?: string | null;
  is_admin: boolean;
  is_artisan?: boolean;
  verification_status?: 'Unverified' | 'Pending' | 'Verified';
  artisan_bio?: string;
  artisan_story?: string;
  specialty_tags?: string[];
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number;
  image: string | null;
  description?: string;
  slug?: string;
  user_id: string;
  category?: string;
  category_id?: string;
  inventory_count?: number;
  status?: 'Active' | 'Draft' | 'Archived';
  is_featured: boolean;
  created_at: string;
  profiles?: Profile;
  reviews?: Review[];
  avg_rating?: number;
  rating?: number;
  specifications?: {
    material?: string;
    origin?: string;
    [key: string]: any;
  };
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  images: string[];
  is_verified: boolean;
  created_at: string;
  profiles?: { name: string; avatar_url: string | null };
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

export interface LoyaltyAccount {
  user_id: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  history: any[];
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status?: string;
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

