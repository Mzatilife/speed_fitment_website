export type UserRole = 'admin' | 'cashier' | 'customer';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  price_label: string;
  category: string;
  features: string[];
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Part {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  sku: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_on_sale: boolean;
  tags: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Logistics {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_id: string | null;
  service_name: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  preferred_date: string | null;
  preferred_time: string;
  notes: string;
  status: BookingStatus;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  type: 'part' | 'logistics';
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled';

export interface Order {
  id: string;
  user_id: string | null;
  cashier_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'cash' | 'mobile_money' | 'card' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Payment {
  id: string;
  booking_id: string | null;
  order_id: string | null;
  user_id: string | null;
  cashier_id: string | null;
  customer_name: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  notes: string;
  created_at: string;
}

export type MessageStatus = 'new' | 'read' | 'replied' | 'archived';

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface BusinessSettings {
  id: number;
  business_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  hours: {
    mon_fri: string;
    sat: string;
    sun: string;
  };
  map_lat: number;
  map_lng: number;
  hero_image: string;
  about: string;
}
